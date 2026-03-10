import test from "node:test";
import assert from "node:assert/strict";
import { inferRouteHint } from "../src/agent/routeHint.js";

test("inferRouteHint picks calculator for arithmetic prompts", () => {
  assert.equal(inferRouteHint("What is 42 * 58?"), "calculator");
});

test("inferRouteHint picks web search for current info prompts", () => {
  assert.equal(inferRouteHint("Search the latest NVIDIA stock price"), "web_search");
});

test("inferRouteHint falls back to direct for conversational prompts", () => {
  assert.equal(inferRouteHint("Explain how this app works"), "direct");
});
