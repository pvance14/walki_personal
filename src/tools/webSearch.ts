import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import { traceToolExecution } from "../agent/toolTrace.js";
import type { SearchResult } from "../shared/types.js";

export const webSearchInputSchema = z.object({
  query: z.string().min(2, "Search query is required."),
});

type RawSearchResult = {
  title?: unknown;
  url?: unknown;
  content?: unknown;
};

export interface SearchClient {
  invoke(input: { query: string }): Promise<unknown>;
}

function normalizeSearchResults(raw: unknown): SearchResult[] {
  const candidates = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { results?: unknown }).results)
      ? ((raw as { results: unknown[] }).results)
      : [];

  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates.flatMap((entry) => {
    const result = entry as RawSearchResult;
    if (typeof result.title !== "string" || typeof result.url !== "string") {
      return [];
    }

    return [
      {
        title: result.title,
        url: result.url,
        content: typeof result.content === "string" ? result.content : "",
      },
    ];
  });
}

export function createWebSearchTool(
  tavilyApiKey?: string,
  client?: SearchClient,
) {
  return tool(
    async ({ query }) => {
      return traceToolExecution("web_search", { query }, async () => {
        const searchClient =
          client ??
          (tavilyApiKey
            ? new TavilySearch({
                tavilyApiKey,
                maxResults: 5,
                topic: "general",
              })
            : null);

        if (!searchClient) {
          throw new Error("TAVILY_API_KEY is required for web_search.");
        }

        const rawResults = await searchClient.invoke({ query });
        const results = normalizeSearchResults(rawResults);

        return JSON.stringify({
          query,
          results,
        });
      });
    },
    {
      name: "web_search",
      description: "Search the web for current events, factual lookup, and recent information.",
      schema: webSearchInputSchema,
    },
  );
}

export { normalizeSearchResults };
