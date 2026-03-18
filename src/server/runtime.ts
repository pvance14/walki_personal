import { loadProjectEnv } from "../shared/loadEnv.js";
import { loadConfig } from "../shared/config.js";
import { createLogger } from "../shared/logger.js";
import { createCourseAgentRunner } from "../agent/createCourseAgent.js";
import { InMemorySessionMemory } from "../agent/sessionMemory.js";
import { initializeKnowledgeBase } from "../rag/startup.js";

loadProjectEnv();

const config = loadConfig();
const logger = createLogger({ service: "course-phase-1-agent" });
const sessionMemory = new InMemorySessionMemory();

let cachedRunnerPromise: Promise<ReturnType<typeof createCourseAgentRunner>> | null = null;

export function getSharedLogger() {
  return logger;
}

export function resetSessionMemory(sessionId?: string) {
  return sessionMemory.clear(sessionId);
}

export async function getCourseAgentRunner() {
  if (!cachedRunnerPromise) {
    cachedRunnerPromise = (async () => {
      const knowledgeBase = await initializeKnowledgeBase(config, logger);
      return createCourseAgentRunner(config, logger, knowledgeBase, { sessionMemory });
    })();
  }

  return cachedRunnerPromise;
}
