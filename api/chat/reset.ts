import { resetChatSession } from "../../src/server/app.js";
import { getSharedLogger, resetSessionMemory } from "../../src/server/runtime.js";
import type { ChatResetRequest } from "../../src/shared/types.js";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  });
}

export async function POST(request: Request) {
  const logger = getSharedLogger();

  try {
    const body = (await request.json()) as ChatResetRequest;
    const payload = resetChatSession(body, {
      logger,
      resetSession: resetSessionMemory,
    });
    return jsonResponse(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    logger.error("http.chat_reset_failed", { error: message });
    return jsonResponse({ error: message }, { status: 400 });
  }
}
