import test from "node:test";
import assert from "node:assert/strict";
import { createCourseAgentRunner } from "../src/agent/createCourseAgent.js";
import { InMemorySessionMemory } from "../src/agent/sessionMemory.js";
import { createLogger } from "../src/shared/logger.js";
import type { AppConfig } from "../src/shared/config.js";

const mockConfig: AppConfig = {
  port: 3000,
  modelProvider: "anthropic",
  modelName: "fake",
  ragDocsDir: "docs",
  openAiEmbeddingModel: "text-embedding-3-small",
};

test("session memory sends prior conversation turns on later requests in the same session", async () => {
  const invocations: Array<Array<{ role: string; content: string }>> = [];
  const sessionMemory = new InMemorySessionMemory();
  const runner = createCourseAgentRunner(mockConfig, createLogger({ test: "session-memory" }), null, {
    sessionMemory,
    async createAgent() {
      return {
        async invoke(input) {
          invocations.push(input.messages);
          return `assistant:${input.messages.length}`;
        },
        async stream() {
          throw new Error("not used");
        },
      };
    },
  });

  await runner.run("First question", undefined, "tab-1");
  await runner.run("Follow-up question", undefined, "tab-1");

  assert.equal(invocations.length, 2);
  assert.deepEqual(invocations[0], [{ role: "user", content: "First question" }]);
  assert.equal(invocations[1]?.length, 3);
  assert.equal(invocations[1]?.[0]?.role, "user");
  assert.equal(invocations[1]?.[0]?.content, "First question");
  assert.equal(invocations[1]?.[1]?.role, "assistant");
  assert.equal(invocations[1]?.[2]?.content, "Follow-up question");
});

test("session memory can be cleared without affecting other sessions", () => {
  const sessionMemory = new InMemorySessionMemory();
  sessionMemory.append("tab-1", [{ role: "user", content: "hello" }]);
  sessionMemory.append("tab-2", [{ role: "user", content: "other" }]);

  const cleared = sessionMemory.clear("tab-1");

  assert.equal(cleared, true);
  assert.deepEqual(sessionMemory.get("tab-1"), []);
  assert.deepEqual(sessionMemory.get("tab-2"), [{ role: "user", content: "other" }]);
});
