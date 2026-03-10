import test from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "../src/shared/logger.js";
import { executeChatRequest, streamChatEvents } from "../src/server/app.js";
import type { AgentRunner } from "../src/agent/createCourseAgent.js";

class MockRunner implements AgentRunner {
  async run(message: string) {
    return {
      answer: `echo:${message}`,
      routeHint: "direct" as const,
      toolCalls: [],
    };
  }

  async *stream(message: string) {
    yield `echo:${message}`;
  }
}

test("executeChatRequest returns JSON-compatible chat output", async () => {
  const result = await executeChatRequest(
    {
      message: "hello",
      stream: false,
    },
    {
      logger: createLogger({ test: "chat-api" }),
      runner: new MockRunner(),
    },
  );

  assert.equal(result.answer, "echo:hello");
});

test("streamChatEvents emits route metadata and response chunks", async () => {
  const events = [];
  for await (const event of streamChatEvents("What is 2 + 2?", {
    logger: createLogger({ test: "chat-api" }),
    runner: new MockRunner(),
  })) {
    events.push(event);
  }

  assert.equal(events[0]?.type, "meta");
  assert.equal(events[0]?.routeHint, "calculator");
  assert.equal(events[1]?.type, "chunk");
  assert.equal(events[2]?.type, "done");
});
