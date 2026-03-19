import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { InMemoryKnowledgeBase } from "../rag/inMemoryKnowledgeBase.js";

const corpusCatalogInputSchema = z.object({
  category: z.string().optional(),
});

export function createCorpusCatalogTool(knowledgeBase: InMemoryKnowledgeBase | null) {
  return tool(
    async ({ category }) => {
      if (!knowledgeBase) {
        return JSON.stringify({
          status: "unavailable",
          message: "Knowledge base is not available. Check docs loading and embedding configuration.",
          categories: [],
        });
      }

      const metadata = knowledgeBase.corpusMetadata;
      const categories = category
        ? metadata.categories.filter((entry) => entry.category === category)
        : metadata.categories;

      return JSON.stringify({
        status: "ok",
        chunkCount: metadata.chunkCount,
        sourceCount: metadata.sourceCount,
        categories,
      });
    },
    {
      name: "corpus_catalog",
      description:
        "List the local knowledge-base source files by category. Use this when the user asks what local docs, sources, corpus files, or knowledge-base materials are available.",
      schema: corpusCatalogInputSchema,
    },
  );
}
