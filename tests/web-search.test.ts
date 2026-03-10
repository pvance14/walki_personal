import test from "node:test";
import assert from "node:assert/strict";
import { createWebSearchTool, normalizeSearchResults } from "../src/tools/webSearch.js";

test("normalizeSearchResults accepts Tavily-style result envelopes", () => {
  const results = normalizeSearchResults({
    results: [
      {
        title: "Example",
        url: "https://example.com",
        content: "Summary",
      },
    ],
  });

  assert.deepEqual(results, [
    {
      title: "Example",
      url: "https://example.com",
      content: "Summary",
    },
  ]);
});

test("web search tool rejects execution without a configured client or API key", async () => {
  const searchTool = createWebSearchTool();
  await assert.rejects(() => searchTool.invoke({ query: "latest ai news" }), /TAVILY_API_KEY/i);
});

test("web search tool uses an injected client and returns normalized results", async () => {
  const searchTool = createWebSearchTool(undefined, {
    async invoke() {
      return {
        results: [
          {
            title: "Release",
            url: "https://example.com/release",
            content: "Details",
          },
        ],
      };
    },
  });

  const output = await searchTool.invoke({ query: "release notes" });
  assert.match(output, /release notes/i);
  assert.match(output, /https:\/\/example\.com\/release/i);
});
