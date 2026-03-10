import type { RouteHint } from "../shared/types.js";

const calculatorRegex = /(^|\b)(calculate|compute|solve|evaluate|what is|what's)\b/i;
const arithmeticRegex = /^[\d\s()+\-*/%.^]+$/;
const searchRegex =
  /\b(search|look up|find|latest|news|today|current|who is|what happened|weather|stock|price)\b/i;

export function inferRouteHint(message: string): RouteHint {
  const normalized = message.trim();

  if (!normalized) {
    return "direct";
  }

  if (arithmeticRegex.test(normalized) || calculatorRegex.test(normalized)) {
    const hasDigit = /\d/.test(normalized);
    const hasOperator = /[+\-*/%^()]/.test(normalized);
    if (hasDigit && hasOperator) {
      return "calculator";
    }
  }

  if (searchRegex.test(normalized)) {
    return "web_search";
  }

  return "direct";
}
