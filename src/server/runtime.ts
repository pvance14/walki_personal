import { loadProjectEnv } from "../shared/loadEnv.js";
import { loadConfig } from "../shared/config.js";
import { createLogger } from "../shared/logger.js";
import { createCourseAgentRunner } from "../agent/createCourseAgent.js";
import { InMemorySessionMemory } from "../agent/sessionMemory.js";
import { initializeKnowledgeBase } from "../rag/startup.js";
import type { CorpusMetadata } from "../shared/types.js";

loadProjectEnv();

const config = loadConfig();
const logger = createLogger({ service: "course-phase-1-agent" });
const sessionMemory = new InMemorySessionMemory();

let cachedRunnerPromise: Promise<ReturnType<typeof createCourseAgentRunner>> | null = null;
let cachedCorpusMetadata: CorpusMetadata | null = null;

export function getSharedLogger() {
  return logger;
}

export function resetSessionMemory(sessionId?: string) {
  return sessionMemory.clear(sessionId);
}

export async function getCorpusMetadata() {
  if (!cachedCorpusMetadata) {
    await getCourseAgentRunner();
  }

  return cachedCorpusMetadata;
}

export async function getCourseAgentRunner() {
  if (!cachedRunnerPromise) {
    cachedRunnerPromise = (async () => {
      const knowledgeBase = await initializeKnowledgeBase(config, logger);
      cachedCorpusMetadata = knowledgeBase?.corpusMetadata ?? {
        chunkCount: 0,
        sourceCount: 0,
        categories: [],
      };
      return createCourseAgentRunner(config, logger, knowledgeBase, { sessionMemory });
    })();
  }

  return cachedRunnerPromise;
}
