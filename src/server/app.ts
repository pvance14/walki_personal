import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { ChatRequest, ChatResetRequest, CorpusMetadata, Logger, WalkiContext } from "../shared/types.js";
import type { AgentRunner } from "../agent/createCourseAgent.js";

interface AppDependencies {
  logger: Logger;
  runner: AgentRunner;
  publicDir: string;
  resetSession: (sessionId?: string) => boolean;
  getCorpusMetadata?: () => CorpusMetadata | Promise<CorpusMetadata | null> | null;
}

export interface StreamEvent {
  type: "meta" | "chunk" | "done";
  routeHint?: string;
  text?: string;
  personaId?: string;
  toolCalls?: import("../shared/types.js").ToolCallRecord[];
}

const contentTypes = new Map<string, string>([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
]);

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

async function handleChatRequest(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: AppDependencies,
) {
  const requestId = randomUUID();
  const logger = dependencies.logger;

  try {
    const rawBody = await readBody(request);
    const body = JSON.parse(rawBody) as ChatRequest;
    if (!body.stream) {
      const result = await executeChatRequest(body, dependencies, requestId);
      sendJson(response, 200, result);
      return;
    }

    response.writeHead(200, {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });

    for await (const event of streamChatEvents(
      body.message,
      dependencies,
      requestId,
      body.walkiContext,
      sanitizeSessionId(body.sessionId),
    )) {
      response.write(`${JSON.stringify(event)}\n`);
    }
    response.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    logger.error("http.chat_failed", { error: message });
    if (!response.headersSent) {
      sendJson(response, 500, { error: message });
      return;
    }
    response.end(`${JSON.stringify({ type: "error", error: message })}\n`);
  }
}

async function handleChatResetRequest(
  request: IncomingMessage,
  response: ServerResponse,
  dependencies: AppDependencies,
) {
  const logger = dependencies.logger;

  try {
    const rawBody = await readBody(request);
    const body = JSON.parse(rawBody) as ChatResetRequest;
    sendJson(response, 200, resetChatSession(body, dependencies));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    logger.error("http.chat_reset_failed", { error: message });
    sendJson(response, 400, { error: message });
  }
}

export async function getCorpusMetadataPayload(dependencies: Pick<AppDependencies, "getCorpusMetadata">) {
  return (await dependencies.getCorpusMetadata?.()) ?? {
    chunkCount: 0,
    sourceCount: 0,
    categories: [],
  };
}

export function resetChatSession(
  body: ChatResetRequest,
  dependencies: Pick<AppDependencies, "logger" | "resetSession">,
) {
  const sessionId = sanitizeSessionId(body.sessionId);

  if (!sessionId) {
    throw new Error("sessionId is required");
  }

  const cleared = dependencies.resetSession(sessionId);
  dependencies.logger.info("http.chat_reset", { sessionId, cleared });
  return { ok: true, cleared };
}

export async function executeChatRequest(
  body: ChatRequest,
  dependencies: Pick<AppDependencies, "logger" | "runner">,
  requestId = randomUUID(),
) {
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    throw new Error("message is required");
  }

  const walkiContext = sanitizeWalkiContext(body.walkiContext);
  dependencies.logger.info("http.chat_received", {
    requestId,
    personaId: walkiContext?.personaId,
    sessionId: sanitizeSessionId(body.sessionId),
  });
  return dependencies.runner.run(message, walkiContext, sanitizeSessionId(body.sessionId));
}

export async function* streamChatEvents(
  message: string,
  dependencies: Pick<AppDependencies, "logger" | "runner">,
  requestId = randomUUID(),
  walkiContext?: WalkiContext,
  sessionId?: string,
): AsyncGenerator<StreamEvent, void, void> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("message is required");
  }

  const sanitizedContext = sanitizeWalkiContext(walkiContext);
  dependencies.logger.info("http.chat_stream_received", {
    requestId,
    personaId: sanitizedContext?.personaId,
    sessionId,
  });
  yield { type: "meta", personaId: sanitizedContext?.personaId };
  for await (const update of dependencies.runner.stream(trimmed, sanitizedContext, sessionId)) {
    if (update.type === "chunk") {
      yield { type: "chunk", text: update.text };
      continue;
    }

    yield {
      type: "meta",
      routeHint: update.routeHint,
      toolCalls: update.toolCalls,
      personaId: sanitizedContext?.personaId,
    };
  }
  yield { type: "done" };
}

export async function* streamChatEventsFromRequest(
  body: ChatRequest,
  dependencies: Pick<AppDependencies, "logger" | "runner">,
  requestId = randomUUID(),
): AsyncGenerator<StreamEvent, void, void> {
  yield* streamChatEvents(body.message, dependencies, requestId, body.walkiContext, sanitizeSessionId(body.sessionId));
}

function sanitizeSessionId(sessionId?: string) {
  return typeof sessionId === "string" && sessionId.trim() ? sessionId.trim() : undefined;
}

function sanitizeWalkiContext(context?: WalkiContext): WalkiContext | undefined {
  if (!context || typeof context !== "object") {
    return undefined;
  }

  const sanitized: WalkiContext = {};

  if (typeof context.personaId === "string" && context.personaId.trim()) {
    sanitized.personaId = context.personaId.trim();
  }
  if (typeof context.personaName === "string" && context.personaName.trim()) {
    sanitized.personaName = context.personaName.trim();
  }
  if (typeof context.todaySteps === "number" && Number.isFinite(context.todaySteps)) {
    sanitized.todaySteps = context.todaySteps;
  }
  if (typeof context.dailyGoal === "number" && Number.isFinite(context.dailyGoal)) {
    sanitized.dailyGoal = context.dailyGoal;
  }
  if (typeof context.streakCurrent === "number" && Number.isFinite(context.streakCurrent)) {
    sanitized.streakCurrent = context.streakCurrent;
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

async function serveStaticFile(
  request: IncomingMessage,
  response: ServerResponse,
  publicDir: string,
) {
  const requestPath = request.url === "/" ? "/index.html" : request.url ?? "/index.html";
  const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  try {
    const content = await readFile(filePath);
    const contentType = contentTypes.get(path.extname(filePath)) ?? "application/octet-stream";
    response.writeHead(200, { "content-type": contentType });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

export function createApp(dependencies: AppDependencies) {
  return createServer(async (request, response) => {
    if (!request.url || !request.method) {
      sendJson(response, 400, { error: "Invalid request." });
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (request.method === "POST" && request.url === "/api/chat") {
      await handleChatRequest(request, response, dependencies);
      return;
    }

    if (request.method === "POST" && request.url === "/api/chat/reset") {
      await handleChatResetRequest(request, response, dependencies);
      return;
    }

    if (request.method === "GET" && request.url === "/api/debug/corpus") {
      sendJson(response, 200, await getCorpusMetadataPayload(dependencies));
      return;
    }

    if (request.method === "GET") {
      await serveStaticFile(request, response, dependencies.publicDir);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
  });
}
