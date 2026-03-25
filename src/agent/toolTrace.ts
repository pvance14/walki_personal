import { AsyncLocalStorage } from "node:async_hooks";
import type { RouteHint, ToolCallRecord } from "../shared/types.js";

interface ToolTraceContext {
  toolCalls: ToolCallRecord[];
}

const toolTraceStorage = new AsyncLocalStorage<ToolTraceContext>();

export function summarizeToolOutput(output: unknown) {
  if (typeof output !== "string") {
    return output;
  }

  return output.length <= 600 ? output : `${output.slice(0, 597)}...`;
}

export async function withToolTrace<T>(callback: () => Promise<T>) {
  const context: ToolTraceContext = { toolCalls: [] };
  const result = await toolTraceStorage.run(context, callback);
  return {
    result,
    toolCalls: context.toolCalls,
  };
}

export function beginToolTrace() {
  const context: ToolTraceContext = { toolCalls: [] };
  toolTraceStorage.enterWith(context);
  return context;
}

export function getTrackedToolCalls(context: ToolTraceContext) {
  return [...context.toolCalls];
}

export async function traceToolExecution<TInput extends Record<string, unknown>, TOutput>(
  toolName: string,
  input: TInput,
  callback: () => Promise<TOutput>,
) {
  const context = toolTraceStorage.getStore();

  try {
    const output = await callback();
    context?.toolCalls.push({
      toolName,
      input,
      output,
    });
    return output;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown tool error.";
    context?.toolCalls.push({
      toolName,
      input,
      error: message,
    });
    throw error;
  }
}

export function deriveRouteHintFromToolCalls(toolCalls: ToolCallRecord[]): RouteHint {
  const uniqueTools = Array.from(new Set(toolCalls.map((toolCall) => toolCall.toolName)));
  if (uniqueTools.length === 0) {
    return "direct";
  }

  if (uniqueTools.length > 1) {
    return "multi_tool";
  }

  const [toolName] = uniqueTools;
  if (toolName === "calculator" || toolName === "web_search" || toolName === "knowledge_base") {
    return toolName;
  }

  return "direct";
}
