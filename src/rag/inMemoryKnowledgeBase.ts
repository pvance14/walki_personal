import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import type { CorpusMetadata, CorpusSource } from "../shared/types.js";
import type { KnowledgeDocument, SearchMatch } from "./types.js";

interface IndexedDocument {
  document: KnowledgeDocument;
  vector: number[];
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
    const matches = this.entries
      .map(({ document, vector }) => ({
        ...document,
        score: cosineSimilarity(queryVector, vector),
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
