import type { EmbeddingsInterface } from "@langchain/core/embeddings";
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

  async search(query: string, limit = 3, minScore = 0.2): Promise<SearchMatch[]> {
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
