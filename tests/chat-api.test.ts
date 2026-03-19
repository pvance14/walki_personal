import test from "node:test";
import assert from "node:assert/strict";
import { createLogger } from "../src/shared/logger.js";
import { executeChatRequest, getCorpusMetadataPayload, resetChatSession, streamChatEvents, streamChatEventsFromRequest } from "../src/server/app.js";
import type { AgentRunner, StreamUpdate } from "../src/agent/createCourseAgent.js";

class MockRunner implements AgentRunner {
  async run(message: string) {
    return {
      answer: `echo:${message}`,
      routeHint: "direct" as const,
      toolCalls: [],
    };
  }

  async *stream(message: string) {
    yield { type: "chunk", text: `echo:${message}` } satisfies StreamUpdate;
    yield {
      type: "meta",
      routeHint: "direct",
      toolCalls: [],
    } satisfies StreamUpdate;
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
  assert.equal(events[1]?.type, "chunk");
  assert.equal(events[2]?.type, "meta");
  assert.equal(events[2]?.routeHint, "direct");
  assert.equal(events[3]?.type, "done");
});

test("streamChatEventsFromRequest passes through session ids and tool metadata for the frontend contract", async () => {
  const sessionIds: string[] = [];
  const events: Array<{ type?: string; routeHint?: string; toolCalls?: Array<{ toolName: string }> }> = [];

  const runner = {
    async run() {
      throw new Error("not used");
    },
    async *stream(_message, _context, sessionId) {
      sessionIds.push(sessionId ?? "");
      yield {
        type: "chunk",
        text: "grounded reply",
      } satisfies StreamUpdate;
      yield {
        type: "meta",
        routeHint: "knowledge_base",
        toolCalls: [
          {
            toolName: "knowledge_base",
            input: { query: "healthy aging" },
            output: JSON.stringify({
              status: "ok",
              results: [
                {
                  sourceName: "healthy-aging.txt",
                  sourcePath: "evidence/healthy-aging.txt",
                  category: "evidence",
                },
              ],
            }),
          },
        ],
      } satisfies StreamUpdate;
    },
  } satisfies AgentRunner;

  for await (const event of streamChatEventsFromRequest(
    {
      message: "Use the local docs",
      stream: true,
      sessionId: "tab-frontend",
    },
    {
      logger: createLogger({ test: "chat-api" }),
      runner,
    },
  )) {
    events.push(event);
  }

  assert.deepEqual(sessionIds, ["tab-frontend"]);
  assert.equal(events[2]?.type, "meta");
  assert.equal(events[2]?.routeHint, "knowledge_base");
  assert.equal(events[2]?.toolCalls?.[0]?.toolName, "knowledge_base");
});

test("executeChatRequest accepts optional Walki context", async () => {
  const result = await executeChatRequest(
    {
      message: "Give me a push",
      stream: false,
      walkiContext: {
        personaId: "challenger",
        personaName: "Rico",
        todaySteps: 6247,
        dailyGoal: 7000,
        streakCurrent: 18,
      },
    },
    {
      logger: createLogger({ test: "chat-api" }),
      runner: new MockRunner(),
    },
  );

  assert.equal(result.answer, "echo:Give me a push");
});

test("resetChatSession clears a provided session id", () => {
  let resetSessionId = "";
  const payload = resetChatSession(
    { sessionId: "tab-reset" },
    {
      logger: createLogger({ test: "chat-api" }),
      resetSession(sessionId) {
        resetSessionId = sessionId ?? "";
        return true;
      },
    },
  );

  assert.equal(payload.ok, true);
  assert.equal(resetSessionId, "tab-reset");
});

test("resetChatSession rejects a missing session id", () => {
  assert.throws(
    () =>
      resetChatSession(
        {},
        {
          logger: createLogger({ test: "chat-api" }),
          resetSession() {
            return false;
          },
        },
      ),
    /sessionId is required/i,
  );
});

test("getCorpusMetadataPayload returns debug corpus metadata", () => {
  const payload = getCorpusMetadataPayload({
    getCorpusMetadata() {
      return {
        chunkCount: 17,
        sourceCount: 4,
        categories: [
          {
            category: "evidence",
            sources: [
              {
                sourceName: "healthy-aging.txt",
                sourcePath: "evidence/healthy-aging.txt",
                category: "evidence",
              },
            ],
          },
        ],
      };
    },
  });

  assert.equal(payload.chunkCount, 17);
  assert.equal(payload.sourceCount, 4);
  assert.equal(payload.categories[0]?.category, "evidence");
  assert.equal(payload.categories[0]?.sources[0]?.sourceName, "healthy-aging.txt");
});
