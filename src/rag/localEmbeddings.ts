import type { EmbeddingsInterface } from "@langchain/core/embeddings";

const DEFAULT_DIMENSIONS = 256;
const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "do",
  "does",
  "for",
  "from",
  "good",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "local",
  "my",
  "of",
  "on",
  "or",
  "our",
  "say",
  "should",
  "that",
  "the",
  "their",
  "to",
  "what",
  "with",
  "you",
  "your",
  "docs",
]);

function normalizeToken(token: string) {
  let normalized = token.toLowerCase();

  if (normalized.length > 5 && normalized.endsWith("ing")) {
    normalized = normalized.slice(0, -3);
  } else if (normalized.length > 4 && normalized.endsWith("ed")) {
    normalized = normalized.slice(0, -2);
  } else if (normalized.length > 3 && normalized.endsWith("s")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function tokenize(text: string) {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .map((token) => normalizeToken(token))
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function hashToken(token: string, dimensions: number) {
  let hash = 0;

  for (let index = 0; index < token.length; index += 1) {
    hash = (hash * 31 + token.charCodeAt(index)) >>> 0;
  }

  return hash % dimensions;
}

function normalize(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}

export class LocalEmbeddings implements EmbeddingsInterface<number[]> {
  constructor(private readonly dimensions = DEFAULT_DIMENSIONS) {}

  async embedDocuments(documents: string[]) {
    return Promise.all(documents.map(async (document) => this.embedQuery(document)));
  }

  async embedQuery(text: string) {
    const vector = new Array<number>(this.dimensions).fill(0);

    tokenize(text).forEach((token) => {
      const index = hashToken(token, this.dimensions);
      vector[index] = (vector[index] ?? 0) + 1;
    });

    return normalize(vector);
  }
}
