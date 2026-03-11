import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { createInMemoryKnowledgeBase } from "../src/rag/inMemoryKnowledgeBase.js";
import { getSupportedKnowledgeFileExtensions, loadKnowledgeDocuments } from "../src/rag/loadDocuments.js";

class KeywordEmbeddings implements EmbeddingsInterface<number[]> {
  private readonly keywords = ["walki", "streak", "persona", "safety", "dashboard", "motivation"];

  async embedDocuments(documents: string[]) {
    return Promise.all(documents.map(async (document) => this.embedQuery(document)));
  }

  async embedQuery(document: string) {
    const normalized = document.toLowerCase();
    return this.keywords.map((keyword) => (normalized.includes(keyword) ? 1 : 0));
  }
}

test("loadKnowledgeDocuments recursively loads supported files and infers metadata", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "walki-rag-docs-"));
  await mkdir(path.join(tempDir, "evidence"), { recursive: true });
  await mkdir(path.join(tempDir, "walki", "nested"), { recursive: true });

  await writeFile(path.join(tempDir, "evidence", "walking-benefits.md"), "# Walking benefits\nWalking improves mood.");
  await writeFile(path.join(tempDir, "walki", "nested", "persona-guide.txt"), "The challenger persona likes a firm tone.");
  await writeFile(path.join(tempDir, "walki", "ignored.pdf"), "not supported");

  const documents = await loadKnowledgeDocuments(tempDir);

  assert.equal(documents.length, 2);
  assert.deepEqual(
    documents.map((document) => document.metadata.sourcePath),
    ["evidence/walking-benefits.md", "walki/nested/persona-guide.txt"],
  );
  assert.equal(documents[0]?.metadata.category, "evidence");
  assert.equal(documents[1]?.metadata.category, "walki");
});

test("getSupportedKnowledgeFileExtensions returns the allowed corpus formats", () => {
  assert.deepEqual(getSupportedKnowledgeFileExtensions(), [".md", ".txt"]);
});

test("createInMemoryKnowledgeBase returns relevant matches and empty results for no-match queries", async () => {
  const embeddings = new KeywordEmbeddings();
  const knowledgeBase = await createInMemoryKnowledgeBase(
    [
      {
        id: "walki::coach-boundaries.md",
        pageContent: "Walki safety guidance should avoid medical claims and keep advice modest.",
        metadata: {
          sourcePath: "walki/coach-boundaries.md",
          sourceName: "coach-boundaries.md",
          category: "walki",
        },
      },
      {
        id: "walki::dashboard-metrics.md",
        pageContent: "The dashboard highlights streak and motivation trends for the user.",
        metadata: {
          sourcePath: "walki/dashboard-metrics.md",
          sourceName: "dashboard-metrics.md",
          category: "walki",
        },
      },
    ],
    embeddings,
  );

  const matches = await knowledgeBase.search("What safety guidance should Walki follow?");
  const noMatches = await knowledgeBase.search("Tell me about quantum tunneling.", 3, 0.2);

  assert.equal(matches.length, 1);
  assert.equal(matches[0]?.metadata.sourceName, "coach-boundaries.md");
  assert.equal(noMatches.length, 0);
});
