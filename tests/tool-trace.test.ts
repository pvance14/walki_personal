import test from "node:test";
import assert from "node:assert/strict";
import { deriveRouteHintFromToolCalls, withToolTrace } from "../src/agent/toolTrace.js";
import { createCalculatorTool } from "../src/tools/calculator.js";
import { createKnowledgeBaseTool } from "../src/tools/knowledgeBase.js";

test("withToolTrace captures actual calculator execution details", async () => {
  const calculator = createCalculatorTool();
  const { toolCalls } = await withToolTrace(() => calculator.invoke({ expression: "2 + 3 * 4" }));

  assert.equal(toolCalls.length, 1);
  assert.equal(toolCalls[0]?.toolName, "calculator");
  assert.deepEqual(toolCalls[0]?.input, { expression: "2 + 3 * 4" });
  assert.match(String(toolCalls[0]?.output), /14/);
});

test("deriveRouteHintFromToolCalls returns multi_tool for chained executions", () => {
  const routeHint = deriveRouteHintFromToolCalls([
    { toolName: "knowledge_base", input: { query: "walking benefits" } },
    { toolName: "calculator", input: { expression: "7000 - 6247" } },
  ]);

  assert.equal(routeHint, "multi_tool");
});

test("withToolTrace records safe unavailable knowledge base calls as real tool executions", async () => {
  const knowledgeBaseTool = createKnowledgeBaseTool(null);
  const { toolCalls } = await withToolTrace(() =>
    knowledgeBaseTool.invoke({ query: "What does Walki say about streak recovery?" }),
  );

  assert.equal(toolCalls.length, 1);
  assert.equal(toolCalls[0]?.toolName, "knowledge_base");
  assert.equal(toolCalls[0]?.error, undefined);
});
