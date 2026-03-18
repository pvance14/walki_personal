# Rubric Evidence Map

This file maps the assignment rubric to concrete proof in the repo so a reviewer can validate requirements quickly.

## Functional Requirements

### Calculator tool
- Implementation: `src/tools/calculator.ts`
- Tests: `tests/calculator.test.ts`
- Agent wiring: `src/agent/createCourseAgent.ts`

### Web search tool
- Implementation: `src/tools/webSearch.ts`
- Tests: `tests/web-search.test.ts`
- Agent wiring: `src/agent/createCourseAgent.ts`

### RAG tool with source attribution
- Implementation: `src/tools/knowledgeBase.ts`
- RAG loading and retrieval: `src/rag/loadDocuments.ts`, `src/rag/inMemoryKnowledgeBase.ts`, `src/rag/startup.ts`
- Corpus: `docs/evidence/`, `docs/walki/`
- Tests: `tests/knowledge-base.test.ts`, `tests/rag-foundation.test.ts`, `tests/rag-startup.test.ts`

### Conversation memory
- Implementation: `src/agent/sessionMemory.ts`
- API/reset wiring: `src/server/app.ts`
- Tests: `tests/session-memory.test.ts`, `tests/chat-api.test.ts`

### Web UI
- Browser app: `public/index.html`, `public/app.js`, `public/styles.css`
- Server entrypoints: `src/server/app.ts`, `src/server/index.ts`
- API contract tests: `tests/chat-api.test.ts`

### Streaming
- Stream handling: `src/server/app.ts`, `src/agent/createCourseAgent.ts`
- Frontend consumption: `public/app.js`
- Tests: `tests/chat-api.test.ts`

## Repo Requirements

### `context.md`
- File: `aiDocs/context.md`

### PRD
- File: `aiDocs/prd.md`

### Roadmap
- Summary roadmap: `aiDocs/roadmap.md`
- Detailed completed roadmap: `ai/roadmaps/complete/2026-03-11_walki_phase_2_rag_memory_roadmap.md`

### `.gitignore`
- File: `.gitignore`

### Structured logging
- Logger implementation: `src/shared/logger.ts`
- Chat completion logs with tool arguments/results: `src/agent/createCourseAgent.ts`
- Startup/request logs: `src/server/index.ts`, `src/server/app.ts`, `src/rag/startup.ts`
- Logging test coverage: `tests/logging.test.ts`

### Incremental git history
- Verify with: `git log --oneline`
- Current repo state includes far more than the required five meaningful commits.

### README
- File: `README.md`

## Deliverable Support

### Validation command
- File: `scripts/test.sh`

### Demo recording prep
- File: `aiDocs/demo_video_checklist.md`

### Local setup
- File: `.env.example`
