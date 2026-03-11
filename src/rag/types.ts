export interface KnowledgeDocumentMetadata {
  sourcePath: string;
  sourceName: string;
  category: string;
}

export interface KnowledgeDocument {
  id: string;
  pageContent: string;
  metadata: KnowledgeDocumentMetadata;
}

export interface SearchMatch extends KnowledgeDocument {
  score: number;
}
