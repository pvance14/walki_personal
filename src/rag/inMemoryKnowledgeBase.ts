import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import type { CorpusMetadata, CorpusSource } from "../shared/types.js";
import type { KnowledgeDocument, SearchMatch } from "./types.js";
import { tokenizeText } from "./localEmbeddings.js";

interface IndexedDocument {
  document: KnowledgeDocument;
  vector: number[];
}

const QUERY_EXPANSIONS = new Map<string, string[]>([
  ["form", ["posture", "technique", "stride", "heel", "toe", "arm", "swing", "alignment", "gait", "erect"]],
  ["posture", ["form", "alignment", "upright", "erect", "stride"]],
  ["walk", ["gait", "stride", "heel", "toe", "posture", "arm", "swing"]],
  ["gait", ["walk", "stride", "posture", "heel", "toe", "form"]],
  ["technique", ["form", "posture", "stride", "heel", "toe", "arm", "swing"]],
]);
const WALKING_FORM_QUERY_REGEX =
  /\b(good form|walking form|walking posture|walking technique|how should i walk|walk with good form)\b/i;
const WALKING_FORM_CONTENT_REGEX =
  /\b(how to walk|posture|gait|heel and toe|heel-to-toe|stride|arms? swing|toes? straight|erect)\b/i;

function buildQueryWeights(query: string) {
  const weights = new Map<string, number>();

  for (const token of tokenizeText(query)) {
    weights.set(token, Math.max(weights.get(token) ?? 0, 1));

    for (const expanded of QUERY_EXPANSIONS.get(token) ?? []) {
      weights.set(expanded, Math.max(weights.get(expanded) ?? 0, 0.7));
    }
  }

  return weights;
}

function tokenCoverageScore(queryWeights: Map<string, number>, tokens: string[]) {
  if (queryWeights.size === 0) {
    return 0;
  }

  const tokenSet = new Set(tokens);
  let matchedWeight = 0;
  let totalWeight = 0;

  for (const [token, weight] of queryWeights.entries()) {
    totalWeight += weight;
    if (tokenSet.has(token)) {
      matchedWeight += weight;
    }
  }

  return totalWeight === 0 ? 0 : matchedWeight / totalWeight;
}

function headingTokens(pageContent: string) {
  const lines = pageContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  return tokenizeText(lines.join(" "));
}

function techniquePhraseBoost(query: string, pageContent: string) {
  if (!WALKING_FORM_QUERY_REGEX.test(query)) {
    return 0;
  }

  return WALKING_FORM_CONTENT_REGEX.test(pageContent) ? 0.2 : 0;
}

function blendedScore(query: string, queryWeights: Map<string, number>, pageContent: string, semanticScore: number) {
  const lexicalScore = tokenCoverageScore(queryWeights, tokenizeText(pageContent));
  const headingScore = tokenCoverageScore(queryWeights, headingTokens(pageContent));
  return semanticScore * 0.35 + lexicalScore * 0.45 + headingScore * 0.2 + techniquePhraseBoost(query, pageContent);
}

function magnitude(vector: number[]) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

function cosineSimilarity(left: number[], right: number[]) {
  const leftMagnitude = magnitude(left);
  const rightMagnitude = magnitude(right);

  if (leftMagnitude === 0 || rightMagnitude === 0) {
    return 0;
  }

  const length = Math.min(left.length, right.length);
  let dotProduct = 0;
  for (let index = 0; index < length; index += 1) {
    dotProduct += left[index]! * right[index]!;
  }

  return dotProduct / (leftMagnitude * rightMagnitude);
}

export class InMemoryKnowledgeBase {
  constructor(
    private readonly entries: IndexedDocument[],
    private readonly embeddings: EmbeddingsInterface<number[]>,
  ) {}

  get documentCount() {
    return this.entries.length;
  }

  get corpusMetadata(): CorpusMetadata {
    const sourcesByPath = new Map<string, CorpusSource>();
    const sourcesByCategory = new Map<string, CorpusSource[]>();

    for (const entry of this.entries) {
      const { sourcePath, sourceName, category } = entry.document.metadata;
      if (!sourcesByPath.has(sourcePath)) {
        const source = { sourceName, sourcePath, category };
        sourcesByPath.set(sourcePath, source);
        const current = sourcesByCategory.get(category) ?? [];
        current.push(source);
        sourcesByCategory.set(category, current);
      }
    }

    const categories = Array.from(sourcesByCategory.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, sources]) => ({
        category,
        sources: sources.sort((left, right) => left.sourceName.localeCompare(right.sourceName)),
      }));

    return {
      chunkCount: this.entries.length,
      sourceCount: sourcesByPath.size,
      categories,
    };
  }

  async search(query: string, limit = 6, minScore = 0.15): Promise<SearchMatch[]> {
    const queryVector = await this.embeddings.embedQuery(query);
    const queryWeights = buildQueryWeights(query);
    const matches = this.entries
      .map(({ document, vector }) => ({
        ...document,
        score: blendedScore(query, queryWeights, document.pageContent, cosineSimilarity(queryVector, vector)),
      }))
      .filter((match) => match.score >= minScore)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    return matches;
  }
}

export async function createInMemoryKnowledgeBase(
  documents: KnowledgeDocument[],
  embeddings: EmbeddingsInterface<number[]>,
) {
  const vectors = await embeddings.embedDocuments(documents.map((document) => document.pageContent));
  const entries = documents.map((document, index) => ({
    document,
    vector: vectors[index] ?? [],
  }));

  return new InMemoryKnowledgeBase(entries, embeddings);
}
