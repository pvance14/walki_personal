import type { Logger } from "./types.js";

type Level = "info" | "error";

function emit(level: Level, event: string, metadata: Record<string, unknown> = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...metadata,
  };

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
    return;
  }

  console.log(line);
}

export function createLogger(baseMetadata: Record<string, unknown> = {}): Logger {
  return {
    info(event, metadata = {}) {
      emit("info", event, { ...baseMetadata, ...metadata });
    },
    error(event, metadata = {}) {
      emit("error", event, { ...baseMetadata, ...metadata });
    },
  };
}
