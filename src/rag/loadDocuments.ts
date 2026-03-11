import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { KnowledgeDocument } from "./types.js";

const SUPPORTED_EXTENSIONS = new Set([".md", ".txt"]);

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

export async function loadKnowledgeDocuments(docsDir: string): Promise<KnowledgeDocument[]> {
  const absoluteDocsDir = path.resolve(docsDir);
  const files = (await walkFiles(absoluteDocsDir))
    .filter((filePath) => SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .sort();

  const documents = await Promise.all(
    files.map(async (filePath) => {
      const pageContent = (await readFile(filePath, "utf8")).trim();
      const relativePath = path.relative(absoluteDocsDir, filePath);

      return {
        id: createDocumentId(relativePath),
        pageContent,
        metadata: {
          sourcePath: relativePath,
          sourceName: path.basename(filePath),
          category: inferCategory(absoluteDocsDir, filePath),
        },
      } satisfies KnowledgeDocument;
    }),
  );

  return documents.filter((document) => document.pageContent.length > 0);
}

export function getSupportedKnowledgeFileExtensions() {
  return Array.from(SUPPORTED_EXTENSIONS.values()).sort();
}
