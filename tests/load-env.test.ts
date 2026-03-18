import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { loadProjectEnv } from "../src/shared/loadEnv.js";

test("loadProjectEnv reads .env files without overwriting existing process values", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "walki-env-"));

  fs.writeFileSync(
    path.join(tempDir, ".env.local"),
    ["ANTHROPIC_API_KEY=local-key", "MODEL_PROVIDER=anthropic"].join("\n"),
  );
  fs.writeFileSync(
    path.join(tempDir, ".env"),
    ['ANTHROPIC_API_KEY="env-key"', "TAVILY_API_KEY=tavily-key"].join("\n"),
  );

  const env: NodeJS.ProcessEnv = {
    MODEL_PROVIDER: "openai",
  };

  loadProjectEnv(tempDir, env);

  assert.equal(env.MODEL_PROVIDER, "openai");
  assert.equal(env.ANTHROPIC_API_KEY, "local-key");
  assert.equal(env.TAVILY_API_KEY, "tavily-key");

  fs.rmSync(tempDir, { recursive: true, force: true });
});
