import test from "node:test";
import assert from "node:assert/strict";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { createCourseAgentRunner } from "../src/agent/createCourseAgent.js";
import { createCalculatorTool } from "../src/tools/calculator.js";
import { createKnowledgeBaseTool } from "../src/tools/knowledgeBase.js";
import { createInMemoryKnowledgeBase } from "../src/rag/inMemoryKnowledgeBase.js";
import { createWebSearchTool } from "../src/tools/webSearch.js";
import type { AppConfig } from "../src/shared/config.js";
import type { Logger } from "../src/shared/types.js";

const mockConfig: AppConfig = {
  port: 3000,
  modelProvider: "anthropic",
  modelName: "fake",
  embeddingProvider: "local",
  ragDocsDir: "docs",
  openAiEmbeddingModel: "text-embedding-3-small",
};

function createLoggerSpy() {
  const entries: Array<{ level: "info" | "error"; event: string; metadata: Record<string, unknown> }> = [];
  const logger: Logger = {
    info(event, metadata = {}) {
      entries.push({ level: "info", event, metadata });
    },
    error(event, metadata = {}) {
      entries.push({ level: "error", event, metadata });
    },
  };

  return { logger, entries };
}

class KeywordEmbeddings implements EmbeddingsInterface<number[]> {
  async embedDocuments(documents: string[]) {
    return Promise.all(documents.map(async (document) => this.embedQuery(document)));
  }

  async embedQuery(document: string) {
    const normalized = document.toLowerCase();
    return ["walking", "healthy", "aging", "current", "guidance"].map((keyword) =>
      normalized.includes(keyword) ? 1 : 0,
    );
  }
}

test("chat.request_completed logs tool arguments and summarized results", async () => {
  const { logger, entries } = createLoggerSpy();
  const runner = createCourseAgentRunner(mockConfig, logger, null, {
    async createAgent() {
      const calculator = createCalculatorTool();
      return {
        async invoke() {
          return calculator.invoke({ expression: "2 + 3 * 4" });
        },
        async stream() {
          throw new Error("not used");
        },
      };
    },
  });

  const result = await runner.run("What is 2 + 3 * 4?");

  assert.equal(result.routeHint, "calculator");
  const completedEntry = entries.find((entry) => entry.event === "chat.request_completed");
  assert.ok(completedEntry);
  assert.deepEqual(completedEntry.metadata.toolCalls, [
    {
      toolName: "calculator",
      input: { expression: "2 + 3 * 4" },
      output: JSON.stringify({ expression: "2 + 3 * 4", result: 14 }),
      error: undefined,
    },
  ]);
});

test("chat.stream_completed logs tool arguments and errors for traced executions", async () => {
  const { logger, entries } = createLoggerSpy();
  let streamConfig: { streamMode?: string | string[] } | undefined;
  const runner = createCourseAgentRunner(mockConfig, logger, null, {
    async createAgent() {
      const knowledgeBaseTool = createKnowledgeBaseTool(null);
      return {
        async invoke() {
          throw new Error("not used");
        },
        async stream(_input, config) {
          streamConfig = config;
          await knowledgeBaseTool.invoke({ query: "walking streak recovery" });
          return (async function* () {
            yield [{ type: "ai", content: "Grounded reply" }, { langgraph_node: "model" }];
          })();
        },
      };
    },
  });

  const chunks: string[] = [];
  for await (const update of runner.stream("Use local docs")) {
    if (update.type === "chunk") {
      chunks.push(update.text);
    }
  }

  assert.deepEqual(chunks, ["Grounded reply"]);
  assert.equal(streamConfig?.streamMode, "messages");
  const completedEntry = entries.find((entry) => entry.event === "chat.stream_completed");
  assert.ok(completedEntry);
  assert.deepEqual(completedEntry.metadata.toolCalls, [
    {
      toolName: "knowledge_base",
      input: { query: "walking streak recovery" },
      output: JSON.stringify({
        query: "walking streak recovery",
        status: "unavailable",
        message: "Knowledge base is not available. Check docs loading and embedding configuration.",
        results: [],
      }),
      error: undefined,
    },
  ]);
});

test("streaming only emits assistant text and ignores tool payload message chunks", async () => {
  const { logger } = createLoggerSpy();
  const runner = createCourseAgentRunner(mockConfig, logger, null, {
    async createAgent() {
      return {
        async invoke() {
          throw new Error("not used");
        },
        async stream() {
          return (async function* () {
            yield [{ type: "tool", content: "{\"query\":\"walking benefits\"}" }, { langgraph_node: "tools" }];
            yield [{ type: "ai", content: "Clean answer" }, { langgraph_node: "model" }];
          })();
        },
      };
    },
  });

  const chunks: string[] = [];
  for await (const update of runner.stream("Use local docs")) {
    if (update.type === "chunk") {
      chunks.push(update.text);
    }
  }

  assert.deepEqual(chunks, ["Clean answer"]);
});

test("current-info requests return an unavailable message when live web search fails", async () => {
  const { logger } = createLoggerSpy();
  const runner = createCourseAgentRunner(mockConfig, logger, null, {
    async createAgent() {
      const webSearchTool = createWebSearchTool(undefined);
      return {
        async invoke() {
          await webSearchTool.invoke({ query: "current walking guidance" }).catch(() => undefined);
          return "Here is the current guidance.";
        },
        async stream() {
          throw new Error("not used");
        },
      };
    },
  });

  const result = await runner.run("What are the current recommendations for walking?");

  assert.match(result.answer, /Live web search is unavailable/i);
});

test("streamed current-info requests also return an unavailable message when live web search fails", async () => {
  const { logger } = createLoggerSpy();
  const runner = createCourseAgentRunner(mockConfig, logger, null, {
    async createAgent() {
      const webSearchTool = createWebSearchTool(undefined);
      return {
        async invoke() {
          throw new Error("not used");
        },
        async stream() {
          await webSearchTool.invoke({ query: "current walking guidance" }).catch(() => undefined);
          return (async function* () {
            yield [{ type: "ai", content: "Maybe this is current guidance." }, { langgraph_node: "model" }];
          })();
        },
      };
    },
  });

  const chunks: string[] = [];
  for await (const update of runner.stream("What are the current recommendations for walking?")) {
    if (update.type === "chunk") {
      chunks.push(update.text);
    }
  }

  assert.deepEqual(chunks, [
    "Live web search is unavailable right now, so I can't verify a current answer. If you'd like, I can still summarize what our local docs say or help with a non-current walking question.",
  ]);
});

test("knowledge-base answers append a deterministic Sources line", async () => {
  const { logger } = createLoggerSpy();
  const knowledgeBase = await createInMemoryKnowledgeBase(
    [
      {
        id: "evidence::healthy-aging.txt::chunk-1",
        pageContent: "Walking supports healthy aging.",
        metadata: {
          sourcePath: "evidence/healthy-aging.txt",
          sourceName: "healthy-aging.txt",
          category: "evidence",
        },
      },
    ],
    new KeywordEmbeddings(),
  );
  const runner = createCourseAgentRunner(mockConfig, logger, null, {
    async createAgent() {
      const knowledgeBaseTool = createKnowledgeBaseTool(knowledgeBase);
      return {
        async invoke() {
          await knowledgeBaseTool.invoke({ query: "healthy aging" });
          return "Walking supports healthy aging in older adults.";
        },
        async stream() {
          throw new Error("not used");
        },
      };
    },
  });

  const result = await runner.run("What do our docs say about healthy aging?");

  assert.match(result.answer, /Sources: healthy-aging\.txt/);
});

test("web-search answers append a deterministic Sources line from search results", async () => {
  const { logger } = createLoggerSpy();
  const runner = createCourseAgentRunner(
    {
      ...mockConfig,
      tavilyApiKey: "test-tavily-key",
    },
    logger,
    null,
    {
      async createAgent() {
        const webSearchTool = createWebSearchTool("test-tavily-key", {
          async invoke() {
            return {
              results: [
                {
                  title: "CDC walking guidance",
                  url: "https://www.cdc.gov/walking-guidance",
                  content: "Current walking guidance",
                },
              ],
            };
          },
        });
        return {
          async invoke() {
            await webSearchTool.invoke({ query: "current walking guidance" });
            return "Adults should get regular moderate activity.";
          },
          async stream() {
            throw new Error("not used");
          },
        };
      },
    },
  );

  const result = await runner.run("What are the current recommendations for walking?");

  assert.match(result.answer, /Sources: CDC walking guidance/);
});
