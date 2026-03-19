export type RouteHint = "calculator" | "web_search" | "knowledge_base" | "multi_tool" | "direct";

export interface CorpusSource {
  sourceName: string;
  sourcePath: string;
  category: string;
}

export interface CorpusMetadata {
  chunkCount: number;
  sourceCount: number;
  categories: Array<{
    category: string;
    sources: CorpusSource[];
  }>;
}

export interface WalkiContext {
  personaId?: string;
  personaName?: string;
  todaySteps?: number;
  dailyGoal?: number;
  streakCurrent?: number;
}

export interface ChatRequest {
  message: string;
  stream?: boolean;
  sessionId?: string;
  walkiContext?: WalkiContext;
}

export interface ChatResetRequest {
  sessionId?: string;
}

export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
  output?: unknown;
  error?: string;
}

export interface ChatResult {
  answer: string;
  routeHint: RouteHint;
  toolCalls: ToolCallRecord[];
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface Logger {
  info(event: string, metadata?: Record<string, unknown>): void;
  error(event: string, metadata?: Record<string, unknown>): void;
}
