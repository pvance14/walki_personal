import { OpenAIEmbeddings } from "@langchain/openai";
import type { AppConfig } from "../shared/config.js";
import type { Logger } from "../shared/types.js";
import { createInMemoryKnowledgeBase } from "./inMemoryKnowledgeBase.js";
import { loadKnowledgeDocuments } from "./loadDocuments.js";
import type { InMemoryKnowledgeBase } from "./inMemoryKnowledgeBase.js";
import { LocalEmbeddings } from "./localEmbeddings.js";

function createEmbeddings(config: AppConfig, logger: Logger) {
  if (config.embeddingProvider === "openai") {
    if (config.openAiApiKey) {
      return {
        embeddings: new OpenAIEmbeddings({
          apiKey: config.openAiApiKey,
          model: config.openAiEmbeddingModel,
        }),
        provider: "openai" as const,
        model: config.openAiEmbeddingModel,
      };
    }

    logger.info("rag.embedding_fallback", {
      requestedProvider: "openai",
      fallbackProvider: "local",
      reason: "missing_openai_api_key",
    });
  }

  return {
    embeddings: new LocalEmbeddings(),
    provider: "local" as const,
    model: "local-hash-embeddings",
  };
}

export async function initializeKnowledgeBase(
  config: AppConfig,
  logger: Logger,
): Promise<InMemoryKnowledgeBase | null> {
  const documents = await loadKnowledgeDocuments(config.ragDocsDir);

  if (documents.length === 0) {
    logger.info("rag.startup_skipped", {
      reason: "no_documents",
      docsDir: config.ragDocsDir,
    });
    return null;
  }

  const { embeddings, provider, model } = createEmbeddings(config, logger);
  const knowledgeBase = await createInMemoryKnowledgeBase(documents, embeddings);
  logger.info("rag.startup_indexed", {
    docsDir: config.ragDocsDir,
    documentCount: knowledgeBase.documentCount,
    embeddingProvider: provider,
    embeddingModel: model,
  });

  return knowledgeBase;
}
