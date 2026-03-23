import { getCorpusMetadataPayload } from "../../src/server/app.js";
import { getCorpusMetadata, getSharedLogger } from "../../src/server/runtime.js";

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

export async function GET() {
  const logger = getSharedLogger();

  try {
    const payload = await getCorpusMetadataPayload({ getCorpusMetadata });
    return jsonResponse(payload, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected server error.";
    logger.error("http.corpus_debug_failed", { error: message });
    return jsonResponse({ error: message }, { status: 500 });
  }
}
