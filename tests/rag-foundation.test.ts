import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import { createInMemoryKnowledgeBase } from "../src/rag/inMemoryKnowledgeBase.js";
import { getSupportedKnowledgeFileExtensions, loadKnowledgeDocuments } from "../src/rag/loadDocuments.js";
import { LocalEmbeddings } from "../src/rag/localEmbeddings.js";

class KeywordEmbeddings implements EmbeddingsInterface<number[]> {
  private readonly keywords = ["walki", "streak", "persona", "safety", "dashboard", "motivation", "heel", "toe", "form", "posture"];

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

test("loadKnowledgeDocuments chunks long files into multiple retrievable documents", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "walki-rag-chunks-"));
  await mkdir(path.join(tempDir, "evidence"), { recursive: true });

  const longSections = Array.from({ length: 8 }, (_, index) =>
    `Section ${index + 1}\n${"walking form and posture guidance ".repeat(40)}`,
  ).join("\n\n");

  await writeFile(path.join(tempDir, "evidence", "walking-form.txt"), longSections);

  const documents = await loadKnowledgeDocuments(tempDir);

  assert.ok(documents.length > 1);
  assert.ok(documents.every((document) => document.metadata.sourceName === "walking-form.txt"));
  assert.ok(documents.every((document) => document.pageContent.length <= 1200));
  assert.match(documents[0]?.id ?? "", /walking-form\.txt::chunk-1$/);
});

test("loadKnowledgeDocuments preserves section headings inside chunk text", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "walki-rag-headings-"));
  await mkdir(path.join(tempDir, "evidence"), { recursive: true });

  await writeFile(
    path.join(tempDir, "evidence", "walking-form.txt"),
    ["INTRODUCTION", "Walking is good.", "", "HOW TO WALK", "Keep your arms swinging naturally and your toes straight ahead."].join("\n"),
  );

  const documents = await loadKnowledgeDocuments(tempDir);

  assert.ok(documents.some((document) => document.pageContent.startsWith("HOW TO WALK")));
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

test("chunked documents make focused sections retrievable from long source files", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "walki-rag-retrieval-"));
  await mkdir(path.join(tempDir, "evidence"), { recursive: true });

  const longDocument = [
    "Overview\nWalking supports long-term health and consistency.",
    "How To Walk\nKeep your toes pointed straight ahead, let your arms swing naturally, and maintain an erect posture.",
    "Foot Action\nUse a fair heel and toe walk with a long, free stride.",
    "Clothing\nChoose comfortable shoes and light clothing.",
  ]
    .map((section) => `${section}\n${section.repeat(30)}`)
    .join("\n\n");

  await writeFile(path.join(tempDir, "evidence", "walking-form.txt"), longDocument);

  const documents = await loadKnowledgeDocuments(tempDir);
  const knowledgeBase = await createInMemoryKnowledgeBase(documents, new KeywordEmbeddings());
  const matches = await knowledgeBase.search("What do our docs say about heel and toe walking form?", 5, 0);

  assert.ok(matches.some((match) => match.metadata.sourceName === "walking-form.txt"));
  assert.ok(matches.some((match) => /heel and toe walk/i.test(match.pageContent)));
});

test("hybrid retrieval boosts walking-form chunks for broad good-form questions", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "walki-rag-hybrid-"));
  await mkdir(path.join(tempDir, "evidence"), { recursive: true });

  await writeFile(
    path.join(tempDir, "evidence", "walking-benefits.txt"),
    "Walking improves cardiovascular health and healthy aging.".repeat(80),
  );
  await writeFile(
    path.join(tempDir, "evidence", "walking-form.txt"),
    [
      "HOW TO WALK",
      "Maintain an erect posture, let your arms swing naturally, keep your toes straight ahead, and use a fair heel and toe walk with a long free stride.",
    ]
      .join("\n")
      .repeat(20),
  );

  const documents = await loadKnowledgeDocuments(tempDir);
  const knowledgeBase = await createInMemoryKnowledgeBase(documents, new LocalEmbeddings());
  const matches = await knowledgeBase.search("How should I walk with good form?", 3, 0);

  assert.equal(matches[0]?.metadata.sourceName, "walking-form.txt");
  assert.match(matches[0]?.pageContent ?? "", /heel and toe|posture|arms swing/i);
});
