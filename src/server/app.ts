import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { inferRouteHint } from "../agent/routeHint.js";
import type { ChatRequest, Logger } from "../shared/types.js";
import type { AgentRunner } from "../agent/createCourseAgent.js";

interface AppDependencies {
  logger: Logger;
  runner: AgentRunner;
  publicDir: string;
}

export interface StreamEvent {
  type: "meta" | "chunk" | "done";
  routeHint?: string;
  text?: string;
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
    const result = await executeChatRequest(body, dependencies, requestId);

    if (!body.stream) {
      sendJson(response, 200, result);
      return;
    }

    response.writeHead(200, {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });

    for await (const event of streamChatEvents(body.message, dependencies, requestId)) {
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

export async function executeChatRequest(
  body: ChatRequest,
  dependencies: Pick<AppDependencies, "logger" | "runner">,
  requestId = randomUUID(),
) {
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    throw new Error("message is required");
  }

  const routeHint = inferRouteHint(message);
  dependencies.logger.info("http.chat_received", { requestId, routeHint });
  return dependencies.runner.run(message);
}

export async function* streamChatEvents(
  message: string,
  dependencies: Pick<AppDependencies, "logger" | "runner">,
  requestId = randomUUID(),
): AsyncGenerator<StreamEvent, void, void> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("message is required");
  }

  const routeHint = inferRouteHint(trimmed);
  dependencies.logger.info("http.chat_stream_received", { requestId, routeHint });
  yield { type: "meta", routeHint };
  for await (const chunk of dependencies.runner.stream(trimmed)) {
    yield { type: "chunk", text: chunk };
  }
  yield { type: "done" };
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

    if (request.method === "GET") {
      await serveStaticFile(request, response, dependencies.publicDir);
      return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
  });
}
