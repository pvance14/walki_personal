import { z } from "zod";

const configSchema = z.object({
  PORT: z.coerce.number().default(3000),
  MODEL_PROVIDER: z.enum(["anthropic", "openai"]).default("anthropic"),
  MODEL_NAME: z.string().default("claude-3-5-haiku-latest"),
  EMBEDDING_PROVIDER: z.enum(["local", "openai"]).default("local"),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  RAG_DOCS_DIR: z.string().default("docs"),
  OPENAI_EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
});

export type AppConfig = {
  port: number;
  modelProvider: "anthropic" | "openai";
  modelName: string;
  embeddingProvider: "local" | "openai";
  anthropicApiKey?: string;
  openAiApiKey?: string;
  tavilyApiKey?: string;
  ragDocsDir: string;
  openAiEmbeddingModel: string;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = configSchema.parse(env);
  return {
    port: parsed.PORT,
    modelProvider: parsed.MODEL_PROVIDER,
    modelName: parsed.MODEL_NAME,
    embeddingProvider: parsed.EMBEDDING_PROVIDER,
    anthropicApiKey: parsed.ANTHROPIC_API_KEY,
    openAiApiKey: parsed.OPENAI_API_KEY,
    tavilyApiKey: parsed.TAVILY_API_KEY,
    ragDocsDir: parsed.RAG_DOCS_DIR,
    openAiEmbeddingModel: parsed.OPENAI_EMBEDDING_MODEL,
  };
}
