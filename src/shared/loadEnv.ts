import fs from "node:fs";
import path from "node:path";

function parseEnvValue(rawValue: string): string {
  const trimmed = rawValue.trim();

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const normalized = trimmed.startsWith("export ") ? trimmed.slice("export ".length).trim() : trimmed;
  const separatorIndex = normalized.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const key = normalized.slice(0, separatorIndex).trim();
  const value = parseEnvValue(normalized.slice(separatorIndex + 1));

  if (!key) {
    return null;
  }

  return { key, value };
}

function loadEnvFile(filePath: string, env: NodeJS.ProcessEnv): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const parsed = parseEnvLine(line);
    if (!parsed) {
      continue;
    }

    if (typeof env[parsed.key] === "undefined") {
      env[parsed.key] = parsed.value;
    }
  }
}

export function loadProjectEnv(cwd: string = process.cwd(), env: NodeJS.ProcessEnv = process.env): void {
  loadEnvFile(path.join(cwd, ".env.local"), env);
  loadEnvFile(path.join(cwd, ".env"), env);
}
