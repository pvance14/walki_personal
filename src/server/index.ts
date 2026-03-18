import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../shared/config.js";
import { createLogger } from "../shared/logger.js";
import { createCourseAgentRunner } from "../agent/createCourseAgent.js";
import { InMemorySessionMemory } from "../agent/sessionMemory.js";
import { initializeKnowledgeBase } from "../rag/startup.js";
import { createApp } from "./app.js";

const config = loadConfig();
const logger = createLogger({ service: "course-phase-1-agent" });
const knowledgeBase = await initializeKnowledgeBase(config, logger);
const sessionMemory = new InMemorySessionMemory();
const runner = createCourseAgentRunner(config, logger, knowledgeBase, { sessionMemory });

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(currentDir, "../../public");

const server = createApp({
  logger,
  runner,
  publicDir,
  resetSession: (sessionId) => sessionMemory.clear(sessionId),
});

server.listen(config.port, () => {
  logger.info("server.started", { port: config.port });
});
