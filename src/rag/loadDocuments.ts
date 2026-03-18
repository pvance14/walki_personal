import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeDocument } from "./types.js";

const SUPPORTED_EXTENSIONS = new Set([".md", ".txt"]);
const MAX_CHUNK_LENGTH = 1200;
const CHUNK_OVERLAP = 200;

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(entryPath);
      }
      return [entryPath];
    }),
  );

  return files.flat();
}

function inferCategory(docsDir: string, filePath: string): string {
  const relativePath = path.relative(docsDir, filePath);
  const [category] = relativePath.split(path.sep);
  return category || "uncategorized";
}

function createDocumentId(relativePath: string): string {
  return relativePath.replaceAll(path.sep, "::");
}

function splitIntoParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function createChunks(content: string) {
  const normalized = content.trim();
  if (!normalized) {
    return [];
  }

  if (normalized.length <= MAX_CHUNK_LENGTH) {
    return [normalized];
  }

  const paragraphs = splitIntoParagraphs(normalized);
  if (paragraphs.length === 0) {
    return [normalized];
  }

  const chunks: string[] = [];
  let currentChunk = "";

  const pushCurrentChunk = () => {
    if (!currentChunk.trim()) {
      return;
    }

    chunks.push(currentChunk.trim());
    const overlap = currentChunk.slice(-CHUNK_OVERLAP).trim();
    currentChunk = overlap;
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK_LENGTH) {
      if (currentChunk.trim()) {
        pushCurrentChunk();
      }

      let startIndex = 0;
      while (startIndex < paragraph.length) {
        const nextChunk = paragraph.slice(startIndex, startIndex + MAX_CHUNK_LENGTH).trim();
        if (nextChunk) {
          chunks.push(nextChunk);
        }
        if (startIndex + MAX_CHUNK_LENGTH >= paragraph.length) {
          currentChunk = paragraph
            .slice(Math.max(paragraph.length - CHUNK_OVERLAP, 0))
            .trim();
          break;
        }
        startIndex += MAX_CHUNK_LENGTH - CHUNK_OVERLAP;
      }
      continue;
    }

    const candidate = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
    if (candidate.length <= MAX_CHUNK_LENGTH) {
      currentChunk = candidate;
      continue;
    }

    pushCurrentChunk();
    currentChunk = paragraph;
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export async function loadKnowledgeDocuments(docsDir: string): Promise<KnowledgeDocument[]> {
  const absoluteDocsDir = path.resolve(docsDir);
  const files = (await walkFiles(absoluteDocsDir))
    .filter((filePath) => SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .sort();

  const documents = await Promise.all(
    files.map(async (filePath) => {
      const pageContent = (await readFile(filePath, "utf8")).trim();
      const relativePath = path.relative(absoluteDocsDir, filePath);
      const chunks = createChunks(pageContent);

      return chunks.map((chunk, index) => ({
        id: `${createDocumentId(relativePath)}::chunk-${index + 1}`,
        pageContent: chunk,
        metadata: {
          sourcePath: relativePath,
          sourceName: path.basename(filePath),
          category: inferCategory(absoluteDocsDir, filePath),
        },
      }) satisfies KnowledgeDocument);
    }),
  );

  return documents.flat().filter((document) => document.pageContent.length > 0);
}

export function getSupportedKnowledgeFileExtensions() {
  return Array.from(SUPPORTED_EXTENSIONS.values()).sort();
}
