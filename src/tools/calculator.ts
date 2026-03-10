import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorInputSchema = z.object({
  expression: z.string().min(1, "Expression is required."),
});

const allowedCharactersRegex = /^[0-9+\-*/%().\s]+$/;

export function evaluateExpression(expression: string): number {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error("Expression is required.");
  }

  if (!allowedCharactersRegex.test(trimmed)) {
    throw new Error("Expression contains unsupported characters.");
  }

  const result = Function(`"use strict"; return (${trimmed});`)();
  if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error("Expression did not resolve to a finite number.");
  }

  return result;
}

export function createCalculatorTool() {
  return tool(
    async ({ expression }) => {
      const result = evaluateExpression(expression);
      return JSON.stringify({
        expression,
        result,
      });
    },
    {
      name: "calculator",
      description: "Evaluate arithmetic expressions with operators and parentheses.",
      schema: calculatorInputSchema,
    },
  );
}
