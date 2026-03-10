import test from "node:test";
import assert from "node:assert/strict";
import { evaluateExpression } from "../src/tools/calculator.js";

test("evaluateExpression handles arithmetic precedence", () => {
  assert.equal(evaluateExpression("42 * (58 - 10) / 4"), 504);
});

test("evaluateExpression rejects unsupported characters", () => {
  assert.throws(() => evaluateExpression("process.exit(1)"), /unsupported characters/i);
});

test("evaluateExpression rejects non-finite results", () => {
  assert.throws(() => evaluateExpression("1 / 0"), /finite number/i);
});
