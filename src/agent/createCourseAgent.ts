import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, AIMessageChunk } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { COURSE_AGENT_SYSTEM_PROMPT } from "./systemPrompt.js";
import { inferRouteHint } from "./routeHint.js";
import { createCalculatorTool } from "../tools/calculator.js";
import { createCorpusCatalogTool } from "../tools/corpusCatalog.js";
import { createKnowledgeBaseTool } from "../tools/knowledgeBase.js";
import { createWebSearchTool } from "../tools/webSearch.js";
import { InMemorySessionMemory } from "./sessionMemory.js";
import { beginToolTrace, deriveRouteHintFromToolCalls, getTrackedToolCalls, summarizeToolOutput, withToolTrace } from "./toolTrace.js";
import type { InMemoryKnowledgeBase } from "../rag/inMemoryKnowledgeBase.js";
import type { AppConfig } from "../shared/config.js";
import type { ChatResult, Logger, RouteHint, SearchResult, ToolCallRecord, WalkiContext } from "../shared/types.js";

interface AgentLike {
  invoke(input: { messages: Array<{ role: string; content: string }> }): Promise<unknown>;
  stream(
    input: { messages: Array<{ role: string; content: string }> },
    config?: { streamMode?: string | string[] },
  ): Promise<AsyncIterable<unknown>>;
}

export type StreamUpdate =
  | { type: "chunk"; text: string }
  | { type: "meta"; routeHint: RouteHint; toolCalls: ToolCallRecord[] };

export interface AgentRunner {
  run(message: string, context?: WalkiContext, sessionId?: string): Promise<ChatResult>;
  stream(message: string, context?: WalkiContext, sessionId?: string): AsyncGenerator<StreamUpdate, void, void>;
}

interface AgentRunnerOptions {
  sessionMemory?: InMemorySessionMemory;
  createAgent?: (config: AppConfig, knowledgeBase: InMemoryKnowledgeBase | null) => Promise<AgentLike>;
}

const LIVE_WEB_SEARCH_UNAVAILABLE_MESSAGE =
  "Live web search is unavailable right now, so I can't verify a current answer. If you'd like, I can still summarize what our local docs say or help with a non-current walking question.";

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

function extractAssistantStreamText(value: unknown): string {
  const isAssistantMessageLike = (message: unknown) =>
    AIMessage.isInstance(message) ||
    AIMessageChunk.isInstance(message) ||
    (typeof message === "object" &&
      message !== null &&
      ("type" in message ? (message as { type?: unknown }).type === "ai" : false ||
        "role" in message ? (message as { role?: unknown }).role === "assistant" : false));

  if (Array.isArray(value) && value.length > 0) {
    const [message] = value;
    if (isAssistantMessageLike(message)) {
      return extractText((message as { content?: unknown }).content);
    }
    return "";
  }

  if (isAssistantMessageLike(value)) {
    return extractText((value as { content?: unknown }).content);
  }

  return extractText(value);
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
    model: config.modelName || "claude-haiku-4-5-20251001",
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
    createCorpusCatalogTool(knowledgeBase),
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

function summarizeRetrievedSources(toolCalls: ToolCallRecord[]) {
  const sourceNames = new Set<string>();

  toolCalls
    .filter((toolCall) => toolCall.toolName === "knowledge_base" && typeof toolCall.output === "string")
    .forEach((toolCall) => {
      try {
        const output = typeof toolCall.output === "string" ? toolCall.output : "";
        const parsed = JSON.parse(output) as { results?: Array<{ sourceName?: unknown }> };
        if (!Array.isArray(parsed.results)) {
          return;
        }

        parsed.results.forEach((result) => {
          if (typeof result?.sourceName === "string" && result.sourceName.trim()) {
            sourceNames.add(result.sourceName);
          }
        });
      } catch {
        // Keep tracing resilient if a tool output is not JSON.
      }
    });

  return [...sourceNames];
}

function sanitizeToolCallsForLogging(toolCalls: ToolCallRecord[]) {
  return toolCalls.map((toolCall) => ({
    toolName: toolCall.toolName,
    input: toolCall.input,
    output: summarizeToolOutput(toolCall.output),
    error: toolCall.error,
  }));
}

function parseJsonObject<T>(value: unknown): T | null {
  if (typeof value !== "string") {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function parseKnowledgeBaseSourcesFromToolCalls(toolCalls: ToolCallRecord[]) {
  const sourceNames = new Set<string>();

  toolCalls
    .filter((toolCall) => toolCall.toolName === "knowledge_base")
    .forEach((toolCall) => {
      const parsed = parseJsonObject<{ results?: Array<{ sourceName?: unknown }> }>(toolCall.output);
      if (!Array.isArray(parsed?.results)) {
        return;
      }

      for (const result of parsed.results) {
        if (typeof result?.sourceName === "string" && result.sourceName.trim()) {
          sourceNames.add(result.sourceName.trim());
        }
      }
    });

  return [...sourceNames];
}

function parseWebSourcesFromToolCalls(toolCalls: ToolCallRecord[]) {
  const labels: string[] = [];

  toolCalls
    .filter((toolCall) => toolCall.toolName === "web_search")
    .forEach((toolCall) => {
      const parsed = parseJsonObject<{ results?: SearchResult[] }>(toolCall.output);
      if (!Array.isArray(parsed?.results)) {
        return;
      }

      parsed.results.forEach((result) => {
        if (typeof result?.title === "string" && result.title.trim()) {
          labels.push(result.title.trim());
          return;
        }

        if (typeof result?.url === "string" && result.url.trim()) {
          try {
            labels.push(new URL(result.url).hostname.replace(/^www\./, ""));
          } catch {
            labels.push(result.url.trim());
          }
        }
      });
    });

  return [...new Set(labels)].slice(0, 5);
}

function appendSourcesLine(answer: string, sourceLabels: string[]) {
  if (sourceLabels.length === 0) {
    return answer;
  }

  const trimmed = answer.trim();
  if (/^sources:/im.test(trimmed)) {
    return trimmed;
  }

  return `${trimmed}\n\nSources: ${sourceLabels.join(", ")}`;
}

function didCurrentInfoWebSearchFail(
  estimatedRouteHint: RouteHint,
  toolCalls: ToolCallRecord[],
) {
  if (estimatedRouteHint !== "web_search") {
    return false;
  }

  const webSearchCalls = toolCalls.filter((toolCall) => toolCall.toolName === "web_search");
  if (webSearchCalls.length === 0) {
    return false;
  }

  const successfulWebSearch = webSearchCalls.some((toolCall) => {
    if (toolCall.error) {
      return false;
    }

    const parsed = parseJsonObject<{ results?: SearchResult[] }>(toolCall.output);
    return Array.isArray(parsed?.results) && parsed.results.length > 0;
  });

  return !successfulWebSearch;
}

function finalizeAnswer(answer: string, estimatedRouteHint: RouteHint, toolCalls: ToolCallRecord[]) {
  if (didCurrentInfoWebSearchFail(estimatedRouteHint, toolCalls)) {
    return LIVE_WEB_SEARCH_UNAVAILABLE_MESSAGE;
  }

  const knowledgeBaseSources = parseKnowledgeBaseSourcesFromToolCalls(toolCalls);
  if (knowledgeBaseSources.length > 0) {
    return appendSourcesLine(answer, knowledgeBaseSources);
  }

  const webSources = parseWebSourcesFromToolCalls(toolCalls);
  if (webSources.length > 0) {
    return appendSourcesLine(answer, webSources);
  }

  return answer.trim();
}

export function createCourseAgentRunner(
  config: AppConfig,
  logger: Logger,
  knowledgeBase: InMemoryKnowledgeBase | null = null,
  options: AgentRunnerOptions = {},
): AgentRunner {
  const sessionMemory = options.sessionMemory ?? new InMemorySessionMemory();
  const createAgentInstance = options.createAgent ?? createLangChainAgent;
  let cachedAgent: Promise<AgentLike> | null = null;

  const getAgent = () => {
    if (!cachedAgent) {
      cachedAgent = createAgentInstance(config, knowledgeBase);
    }
    return cachedAgent;
  };

  return {
    async run(message, context, sessionId) {
      const estimatedRouteHint = inferRouteHint(message);
      logger.info("chat.request_started", { routeHint: estimatedRouteHint, personaId: context?.personaId, sessionId });
      const agent = await getAgent();
      const userMessage = buildUserMessage(message, context);
      const history = sessionMemory.get(sessionId);
      const { result: output, toolCalls } = await withToolTrace(() =>
        agent.invoke({
          messages: [...history, { role: "user", content: userMessage }],
        }),
      );
      const routeHint = deriveRouteHintFromToolCalls(toolCalls);
      const rawAnswer = extractText(output);
      const answer = finalizeAnswer(rawAnswer, estimatedRouteHint, toolCalls);
      sessionMemory.append(sessionId, [
        { role: "user", content: userMessage },
        { role: "assistant", content: answer },
      ]);
      logger.info("chat.request_completed", {
        routeHint,
        estimatedRouteHint,
        personaId: context?.personaId,
        sessionId,
        toolNames: toolCalls.map((toolCall) => toolCall.toolName),
        toolCallCount: toolCalls.length,
        toolCalls: sanitizeToolCallsForLogging(toolCalls),
        retrievedSources: summarizeRetrievedSources(toolCalls),
      });
      return {
        answer,
        routeHint,
        toolCalls,
      };
    },

    async *stream(message, context, sessionId) {
      const estimatedRouteHint = inferRouteHint(message);
      logger.info("chat.stream_started", { routeHint: estimatedRouteHint, personaId: context?.personaId, sessionId });
      const agent = await getAgent();
      const traceContext = beginToolTrace();
      const userMessage = buildUserMessage(message, context);
      const history = sessionMemory.get(sessionId);
      const stream = await agent.stream({
        messages: [...history, { role: "user", content: userMessage }],
      }, { streamMode: "messages" });
      let streamedAnswer = "";

      for await (const chunk of stream) {
        const text = extractAssistantStreamText(chunk);
        if (text) {
          streamedAnswer += text;
        }
      }

      const toolCalls = getTrackedToolCalls(traceContext);
      const routeHint = deriveRouteHintFromToolCalls(toolCalls);
      const answer = finalizeAnswer(streamedAnswer, estimatedRouteHint, toolCalls);
      sessionMemory.append(sessionId, [
        { role: "user", content: userMessage },
        { role: "assistant", content: answer },
      ]);
      logger.info("chat.stream_completed", {
        routeHint,
        estimatedRouteHint,
        personaId: context?.personaId,
        sessionId,
        toolNames: toolCalls.map((toolCall) => toolCall.toolName),
        toolCallCount: toolCalls.length,
        toolCalls: sanitizeToolCallsForLogging(toolCalls),
        retrievedSources: summarizeRetrievedSources(toolCalls),
      });
      if (answer) {
        yield { type: "chunk", text: answer };
      }
      yield { type: "meta", routeHint, toolCalls };
    },
  };
}
