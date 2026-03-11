import { OpenAIEmbeddings } from "@langchain/openai";
import type { AppConfig } from "../shared/config.js";
import type { Logger } from "../shared/types.js";
import { createInMemoryKnowledgeBase } from "./inMemoryKnowledgeBase.js";
import { loadKnowledgeDocuments } from "./loadDocuments.js";
import type { InMemoryKnowledgeBase } from "./inMemoryKnowledgeBase.js";

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

  if (!config.openAiApiKey) {
    logger.info("rag.startup_skipped", {
      reason: "missing_openai_api_key",
      docsDir: config.ragDocsDir,
      documentCount: documents.length,
    });
    return null;
  }

  const embeddings = new OpenAIEmbeddings({
    apiKey: config.openAiApiKey,
    model: config.openAiEmbeddingModel,
  });

  const knowledgeBase = await createInMemoryKnowledgeBase(documents, embeddings);
  logger.info("rag.startup_indexed", {
    docsDir: config.ragDocsDir,
    documentCount: knowledgeBase.documentCount,
    embeddingModel: config.openAiEmbeddingModel,
  });

  return knowledgeBase;
}
