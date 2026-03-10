import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { createAgent } from "langchain";
import { COURSE_AGENT_SYSTEM_PROMPT } from "./systemPrompt.js";
import { inferRouteHint } from "./routeHint.js";
import { createCalculatorTool } from "../tools/calculator.js";
import { createWebSearchTool } from "../tools/webSearch.js";
import type { AppConfig } from "../shared/config.js";
import type { ChatResult, Logger, ToolCallRecord } from "../shared/types.js";

interface AgentLike {
  invoke(input: { messages: Array<{ role: string; content: string }> }): Promise<unknown>;
  stream(input: { messages: Array<{ role: string; content: string }> }): Promise<AsyncIterable<unknown>>;
}

export interface AgentRunner {
  run(message: string): Promise<ChatResult>;
  stream(message: string): AsyncGenerator<string, void, void>;
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

async function createLangChainAgent(config: AppConfig): Promise<AgentLike> {
  const model = buildModel(config);
  const tools = [createCalculatorTool(), createWebSearchTool(config.tavilyApiKey)];

  return createAgent({
    model,
    tools,
    systemPrompt: COURSE_AGENT_SYSTEM_PROMPT,
  }) as AgentLike;
}

export function createCourseAgentRunner(config: AppConfig, logger: Logger): AgentRunner {
  let cachedAgent: Promise<AgentLike> | null = null;

  const getAgent = () => {
    if (!cachedAgent) {
      cachedAgent = createLangChainAgent(config);
    }
    return cachedAgent;
  };

  const toToolCalls = (routeHint: ChatResult["routeHint"]): ToolCallRecord[] => {
    if (routeHint === "direct") {
      return [];
    }

    return [
      {
        toolName: routeHint === "calculator" ? "calculator" : "web_search",
        input: {},
      },
    ];
  };

  return {
    async run(message) {
      const routeHint = inferRouteHint(message);
      logger.info("chat.request_started", { routeHint });
      const agent = await getAgent();
      const output = await agent.invoke({
        messages: [{ role: "user", content: message }],
      });
      const answer = extractText(output);
      logger.info("chat.request_completed", { routeHint });
      return {
        answer,
        routeHint,
        toolCalls: toToolCalls(routeHint),
      };
    },

    async *stream(message) {
      const routeHint = inferRouteHint(message);
      logger.info("chat.stream_started", { routeHint });
      const agent = await getAgent();
      const stream = await agent.stream({
        messages: [{ role: "user", content: message }],
      });

      for await (const chunk of stream) {
        const text = extractText(chunk);
        if (text) {
          yield text;
        }
      }

      logger.info("chat.stream_completed", { routeHint });
    },
  };
}
