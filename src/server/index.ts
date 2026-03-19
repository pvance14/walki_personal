import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { getCorpusMetadata, getCourseAgentRunner, getSharedLogger, resetSessionMemory } from "./runtime.js";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(currentDir, "../../public");
const logger = getSharedLogger();
const runner = await getCourseAgentRunner();

const server = createApp({
  logger,
  runner,
  publicDir,
  resetSession: resetSessionMemory,
  getCorpusMetadata,
});

server.listen(process.env.PORT ? Number(process.env.PORT) : 3000, () => {
  logger.info("server.started", { port: process.env.PORT ? Number(process.env.PORT) : 3000 });
});
