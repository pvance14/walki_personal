export type RouteHint = "calculator" | "web_search" | "direct";

export interface ChatRequest {
  message: string;
  stream?: boolean;
}

export interface ToolCallRecord {
  toolName: string;
  input: Record<string, unknown>;
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
