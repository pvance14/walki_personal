import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { InMemoryKnowledgeBase } from "../rag/inMemoryKnowledgeBase.js";

export const knowledgeBaseInputSchema = z.object({
  query: z.string().min(3, "Knowledge-base query is required."),
});

function summarizeExcerpt(content: string, maxLength = 500) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
}

export function createKnowledgeBaseTool(knowledgeBase: InMemoryKnowledgeBase | null) {
  return tool(
    async ({ query }) => {
      if (!knowledgeBase) {
        return JSON.stringify({
          query,
          status: "unavailable",
          message: "Knowledge base is not available. Check docs loading and embedding configuration.",
          results: [],
        });
      }

      const results = await knowledgeBase.search(query, 3, 0.2);
      if (results.length === 0) {
        return JSON.stringify({
          query,
          status: "no_results",
          message: "No relevant documents found in the local knowledge base.",
          results: [],
        });
      }

      return JSON.stringify({
        query,
        status: "ok",
        results: results.map((result) => ({
          sourceName: result.metadata.sourceName,
          sourcePath: result.metadata.sourcePath,
          category: result.metadata.category,
          score: Number(result.score.toFixed(4)),
          excerpt: summarizeExcerpt(result.pageContent),
        })),
      });
    },
    {
      name: "knowledge_base",
      description:
        "Search the local Walki knowledge base and evidence corpus for grounded information from repo docs. " +
        "Use this for walking benefits, motivation references, Walki product details, persona framework questions, " +
        "and other answers that should come from local documentation rather than the open web.",
      schema: knowledgeBaseInputSchema,
    },
  );
}
