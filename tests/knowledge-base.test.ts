import test from "node:test";
import assert from "node:assert/strict";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { createInMemoryKnowledgeBase } from "../src/rag/inMemoryKnowledgeBase.js";
import { createCorpusCatalogTool } from "../src/tools/corpusCatalog.js";
import { createKnowledgeBaseTool } from "../src/tools/knowledgeBase.js";

class KeywordEmbeddings implements EmbeddingsInterface<number[]> {
  private readonly keywords = ["walking", "aging", "motivation", "persona", "dashboard", "safety"];

  async embedDocuments(documents: string[]) {
    return Promise.all(documents.map(async (document) => this.embedQuery(document)));
  }

  async embedQuery(document: string) {
    const normalized = document.toLowerCase();
    return this.keywords.map((keyword) => (normalized.includes(keyword) ? 1 : 0));
  }
}

test("knowledge base tool returns structured grounded matches with source attribution", async () => {
  const embeddings = new KeywordEmbeddings();
  const knowledgeBase = await createInMemoryKnowledgeBase(
    [
      {
        id: "evidence::healthy-aging.txt",
        pageContent:
          "Walking supports healthy aging, cardiovascular health, and better mental well-being in older adults.",
        metadata: {
          sourcePath: "evidence/healthy-aging.txt",
          sourceName: "healthy-aging.txt",
          category: "evidence",
        },
      },
    ],
    embeddings,
  );

  const tool = createKnowledgeBaseTool(knowledgeBase);
  const rawOutput = await tool.invoke({ query: "What does the evidence say about walking and healthy aging?" });
  const output = JSON.parse(rawOutput);

  assert.equal(output.status, "ok");
  assert.equal(output.results.length, 1);
  assert.equal(output.results[0]?.sourceName, "healthy-aging.txt");
  assert.match(output.results[0]?.excerpt, /healthy aging/i);
});

test("knowledge base tool returns a safe no-result payload when nothing relevant is found", async () => {
  const embeddings = new KeywordEmbeddings();
  const knowledgeBase = await createInMemoryKnowledgeBase(
    [
      {
        id: "walki::persona-framework.md",
        pageContent: "The persona framework adapts coaching tone to motivation style.",
        metadata: {
          sourcePath: "walki/persona-framework.md",
          sourceName: "persona-framework.md",
          category: "walki",
        },
      },
    ],
    embeddings,
  );

  const tool = createKnowledgeBaseTool(knowledgeBase);
  const rawOutput = await tool.invoke({ query: "Explain black holes and neutron stars." });
  const output = JSON.parse(rawOutput);

  assert.equal(output.status, "no_results");
  assert.deepEqual(output.results, []);
});

test("knowledge base tool reports when the local corpus is unavailable", async () => {
  const tool = createKnowledgeBaseTool(null);
  const rawOutput = await tool.invoke({ query: "What does Walki say about streaks?" });
  const output = JSON.parse(rawOutput);

  assert.equal(output.status, "unavailable");
  assert.deepEqual(output.results, []);
});

test("corpus catalog tool lists indexed source files by category", async () => {
  const embeddings = new KeywordEmbeddings();
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
      {
        id: "walki::product-overview.md::chunk-1",
        pageContent: "Walki helps people build walking consistency.",
        metadata: {
          sourcePath: "walki/product-overview.md",
          sourceName: "product-overview.md",
          category: "walki",
        },
      },
    ],
    embeddings,
  );

  const tool = createCorpusCatalogTool(knowledgeBase);
  const rawOutput = await tool.invoke({});
  const output = JSON.parse(rawOutput);

  assert.equal(output.status, "ok");
  assert.equal(output.sourceCount, 2);
  assert.equal(output.chunkCount, 2);
  assert.equal(output.categories[0]?.category, "evidence");
  assert.equal(output.categories[1]?.category, "walki");
});
