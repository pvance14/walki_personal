import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { COURSE_AGENT_SYSTEM_PROMPT } from "./systemPrompt.js";
import { inferRouteHint } from "./routeHint.js";
import { createCalculatorTool } from "../tools/calculator.js";
import { createKnowledgeBaseTool } from "../tools/knowledgeBase.js";
import { createWebSearchTool } from "../tools/webSearch.js";
import { beginToolTrace, deriveRouteHintFromToolCalls, getTrackedToolCalls, withToolTrace } from "./toolTrace.js";
import type { InMemoryKnowledgeBase } from "../rag/inMemoryKnowledgeBase.js";
import type { AppConfig } from "../shared/config.js";
import type { ChatResult, Logger, RouteHint, ToolCallRecord, WalkiContext } from "../shared/types.js";

interface AgentLike {
  invoke(input: { messages: Array<{ role: string; content: string }> }): Promise<unknown>;
  stream(input: { messages: Array<{ role: string; content: string }> }): Promise<AsyncIterable<unknown>>;
}

export type StreamUpdate =
  | { type: "chunk"; text: string }
  | { type: "meta"; routeHint: RouteHint; toolCalls: ToolCallRecord[] };

export interface AgentRunner {
  run(message: string, context?: WalkiContext): Promise<ChatResult>;
  stream(message: string, context?: WalkiContext): AsyncGenerator<StreamUpdate, void, void>;
}

function extractText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractText).join("");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.text === "string") {
      return record.text;
    }
    if (typeof record.output_text === "string") {
      return record.output_text;
    }
    if ("content" in record) {
      return extractText(record.content);
    }
    if ("messages" in record) {
      return extractText(record.messages);
    }
  }

  return "";
}

function buildModel(config: AppConfig) {
  if (config.modelProvider === "openai") {
    if (!config.openAiApiKey) {
      throw new Error("OPENAI_API_KEY is required when MODEL_PROVIDER=openai.");
    }

    return new ChatOpenAI({
      apiKey: config.openAiApiKey,
      model: config.modelName || "gpt-4o-mini",
      temperature: 0,
    });
  }

  if (!config.anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY is required when MODEL_PROVIDER=anthropic.");
  }

  return new ChatAnthropic({
    apiKey: config.anthropicApiKey,
    model: config.modelName || "claude-3-5-haiku-latest",
    temperature: 0,
  });
}

async function createLangChainAgent(
  config: AppConfig,
  knowledgeBase: InMemoryKnowledgeBase | null,
): Promise<AgentLike> {
  const model = buildModel(config);
  const tools = [
    createCalculatorTool(),
    createWebSearchTool(config.tavilyApiKey),
    createKnowledgeBaseTool(knowledgeBase),
  ];

  return createAgent({
    model,
    tools,
    systemPrompt: COURSE_AGENT_SYSTEM_PROMPT,
  }) as AgentLike;
}

function buildWalkiContextBlock(context?: WalkiContext): string {
  if (!context) {
    return "";
  }

  const lines: string[] = [];

  if (context.personaId || context.personaName) {
    lines.push(
      `Preferred persona: ${context.personaName || context.personaId || "unknown"} (${context.personaId || "unspecified"})`,
    );
  }
  if (typeof context.todaySteps === "number") {
    lines.push(`Today's steps: ${context.todaySteps}`);
  }
  if (typeof context.dailyGoal === "number") {
    lines.push(`Daily goal: ${context.dailyGoal}`);
  }
  if (typeof context.streakCurrent === "number") {
    lines.push(`Current streak: ${context.streakCurrent} days`);
  }

  if (lines.length === 0) {
    return "";
  }

  return `Walki context:\n${lines.join("\n")}`;
}

function buildUserMessage(message: string, context?: WalkiContext): string {
  const contextBlock = buildWalkiContextBlock(context);
  if (!contextBlock) {
    return message;
  }

  return `${contextBlock}\n\nUser request: ${message}`;
}

export function createCourseAgentRunner(
  config: AppConfig,
  logger: Logger,
  knowledgeBase: InMemoryKnowledgeBase | null = null,
): AgentRunner {
  let cachedAgent: Promise<AgentLike> | null = null;

  const getAgent = () => {
    if (!cachedAgent) {
      cachedAgent = createLangChainAgent(config, knowledgeBase);
    }
    return cachedAgent;
  };

  return {
    async run(message, context) {
      const estimatedRouteHint = inferRouteHint(message);
      logger.info("chat.request_started", { routeHint: estimatedRouteHint, personaId: context?.personaId });
      const agent = await getAgent();
      const { result: output, toolCalls } = await withToolTrace(() =>
        agent.invoke({
          messages: [{ role: "user", content: buildUserMessage(message, context) }],
        }),
      );
      const routeHint = deriveRouteHintFromToolCalls(toolCalls);
      const answer = extractText(output);
      logger.info("chat.request_completed", {
        routeHint,
        estimatedRouteHint,
        personaId: context?.personaId,
        toolNames: toolCalls.map((toolCall) => toolCall.toolName),
        toolCallCount: toolCalls.length,
      });
      return {
        answer,
        routeHint,
        toolCalls,
      };
    },

    async *stream(message, context) {
      const estimatedRouteHint = inferRouteHint(message);
      logger.info("chat.stream_started", { routeHint: estimatedRouteHint, personaId: context?.personaId });
      const agent = await getAgent();
      const traceContext = beginToolTrace();
      const stream = await agent.stream({
        messages: [{ role: "user", content: buildUserMessage(message, context) }],
      });

      for await (const chunk of stream) {
        const text = extractText(chunk);
        if (text) {
          yield { type: "chunk", text };
        }
      }

      const toolCalls = getTrackedToolCalls(traceContext);
      const routeHint = deriveRouteHintFromToolCalls(toolCalls);
      logger.info("chat.stream_completed", {
        routeHint,
        estimatedRouteHint,
        personaId: context?.personaId,
        toolNames: toolCalls.map((toolCall) => toolCall.toolName),
        toolCallCount: toolCalls.length,
      });
      yield { type: "meta", routeHint, toolCalls };
    },
  };
}
