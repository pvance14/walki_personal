import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { initializeKnowledgeBase } from "../src/rag/startup.js";
import type { AppConfig } from "../src/shared/config.js";
import type { Logger } from "../src/shared/types.js";

async function createDocsDir() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "walki-rag-startup-"));
  await mkdir(path.join(tempDir, "evidence"), { recursive: true });
  await writeFile(
    path.join(tempDir, "evidence", "walking-benefits.md"),
    "# Walking Benefits\nWalking supports mood, stamina, and long-term health.",
  );
  return tempDir;
}

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

test("initializeKnowledgeBase indexes local docs with local embeddings by default", async () => {
  const docsDir = await createDocsDir();
  const { logger, entries } = createLoggerSpy();
  const config: AppConfig = {
    port: 3000,
    modelProvider: "anthropic",
    modelName: "claude-haiku-4-5-20251001",
    embeddingProvider: "local",
    anthropicApiKey: "test-anthropic-key",
    ragDocsDir: docsDir,
    openAiEmbeddingModel: "text-embedding-3-small",
  };

  const knowledgeBase = await initializeKnowledgeBase(config, logger);

  assert.ok(knowledgeBase);
  assert.equal(knowledgeBase.documentCount, 1);
  assert.equal(entries.at(-1)?.event, "rag.startup_indexed");
  assert.equal(entries.at(-1)?.metadata.embeddingProvider, "local");
  assert.equal(entries.at(-1)?.metadata.embeddingModel, "local-hash-embeddings");
});

test("initializeKnowledgeBase falls back to local embeddings when openai embeddings are requested without a key", async () => {
  const docsDir = await createDocsDir();
  const { logger, entries } = createLoggerSpy();
  const config: AppConfig = {
    port: 3000,
    modelProvider: "anthropic",
    modelName: "claude-haiku-4-5-20251001",
    embeddingProvider: "openai",
    anthropicApiKey: "test-anthropic-key",
    ragDocsDir: docsDir,
    openAiEmbeddingModel: "text-embedding-3-small",
  };

  const knowledgeBase = await initializeKnowledgeBase(config, logger);

  assert.ok(knowledgeBase);
  assert.equal(knowledgeBase.documentCount, 1);
  assert.equal(entries[0]?.event, "rag.embedding_fallback");
  assert.equal(entries[0]?.metadata.requestedProvider, "openai");
  assert.equal(entries[0]?.metadata.fallbackProvider, "local");
  assert.equal(entries.at(-1)?.event, "rag.startup_indexed");
  assert.equal(entries.at(-1)?.metadata.embeddingProvider, "local");
});
