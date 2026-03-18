import { executeChatRequest, streamChatEventsFromRequest } from "../src/server/app.js";
import { getCourseAgentRunner, getSharedLogger } from "../src/server/runtime.js";
import type { ChatRequest } from "../src/shared/types.js";

export const maxDuration = 60;

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

async function readChatRequest(request: Request): Promise<ChatRequest> {
  try {
    return (await request.json()) as ChatRequest;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

export async function POST(request: Request) {
  const logger = getSharedLogger();

  try {
    const body = await readChatRequest(request);
    const runner = await getCourseAgentRunner();

    if (!body.stream) {
      const result = await executeChatRequest(body, { logger, runner });
      return jsonResponse(result, { status: 200 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const event of streamChatEventsFromRequest(body, { logger, runner })) {
            controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unexpected server error.";
          logger.error("http.chat_failed", { error: message });
          controller.enqueue(encoder.encode(`${JSON.stringify({ type: "error", error: message })}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-cache",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    logger.error("http.chat_failed", { error: message });
    return jsonResponse({ error: message }, { status: 500 });
  }
}
