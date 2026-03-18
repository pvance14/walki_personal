# Walki Course Agent

This repo contains a graduate course multi-tool AI agent project presented as the Walki demo experience. The shipped app combines a Walki-branded single-page walking coach UI with a real LangChain-based agent that can use calculator, web search, and local-document RAG tools, keep session-scoped chat memory, stream responses, and surface grounded citations.

## What problem this solves

The assignment is graded on both functionality and repo quality. This project is designed so an instructor can verify the required capabilities quickly:

- a working multi-tool agent
- a web UI instead of a terminal-only demo
- RAG over real documents with source attribution
- multi-turn memory
- structured logging
- clear project docs and validation steps

## What is here

- Node.js and TypeScript backend
- LangChain and LangGraph-compatible agent structure
- Calculator tool
- Tavily-backed web search tool
- Local-doc knowledge base tool
- Session-scoped chat memory and reset support
- Streaming web chat UI
- `aiDocs/` source-of-truth docs
- `scripts/test.sh` for validation

## How the agent behaves

- `calculator` handles arithmetic, step math, percentages, and other precision-sensitive expressions.
- `web_search` uses Tavily for current information and external factual lookup.
- `knowledge_base` searches the local `docs/` corpus and returns source-attributed evidence from Walki docs and walking-related materials.
- Session memory is scoped to one browser tab. Follow-up questions work until the user resets chat memory or restarts the server.
- The UI shows tool usage metadata and visible source chips when the knowledge base contributes to an answer.
- The underlying LangChain agent uses tool calls to decide when to act directly, use one tool, or chain multiple tools.

## Run locally

1. Install dependencies with `npm install`
2. Set required environment variables:
   - `ANTHROPIC_API_KEY` if `MODEL_PROVIDER=anthropic`
   - `OPENAI_API_KEY` if `MODEL_PROVIDER=openai`
   - `OPENAI_API_KEY` if `EMBEDDING_PROVIDER=openai`
   - `TAVILY_API_KEY` for `web_search`
3. Start the app with `npm run dev`
4. Open `http://localhost:3000`

### Environment notes

- `ANTHROPIC_API_KEY` is enough for the default chat setup when `EMBEDDING_PROVIDER=local`.
- `TAVILY_API_KEY` is required if you want the real web-search tool to execute successfully.
- `OPENAI_API_KEY` is only required when `MODEL_PROVIDER=openai` or `EMBEDDING_PROVIDER=openai`.

### Recommended Anthropic-first setup

If you want the app to run with only an Anthropic key:

- `MODEL_PROVIDER=anthropic`
- `EMBEDDING_PROVIDER=local`
- set `ANTHROPIC_API_KEY`

This keeps Claude as the chat model and uses local in-memory embeddings for the RAG corpus.

### Optional OpenAI switch

If you want to switch the chat model or embeddings to OpenAI later:

- set `MODEL_PROVIDER=openai` to use OpenAI for chat
- set `EMBEDDING_PROVIDER=openai` to use OpenAI embeddings for RAG
- set `OPENAI_API_KEY`

## Validate

Run `scripts/test.sh`

This builds the TypeScript project and runs the Node test suite. The current test coverage includes calculator behavior, web search normalization and failure handling, RAG document loading, knowledge-base output, session memory, tool tracing, and the chat API contract.

## RAG corpus and citations

- The local corpus lives under `docs/`.
- Supported source formats are `.md` and `.txt`.
- The shipped repo includes both `docs/evidence/` and `docs/walki/` content, which puts the project above the minimum five-document rubric threshold.
- When the `knowledge_base` tool contributes to an answer, the UI surfaces citation labels derived from source metadata.

## Structured logging

- Logs are newline-delimited JSON written to stdout/stderr.
- Completion events include route hints, session/persona metadata, and traced tool calls with arguments and summarized results.
- RAG startup logs also capture corpus and embedding initialization details.

## Rubric coverage

- Project context: [`aiDocs/context.md`](aiDocs/context.md)
- Product framing and requirements: [`aiDocs/prd.md`](aiDocs/prd.md)
- High-level status and roadmap: [`aiDocs/roadmap.md`](aiDocs/roadmap.md)
- Rubric-to-repo evidence map: [`aiDocs/rubric_evidence.md`](aiDocs/rubric_evidence.md)
- Demo recording checklist: [`aiDocs/demo_video_checklist.md`](aiDocs/demo_video_checklist.md)
- Validation command: [`scripts/test.sh`](scripts/test.sh)
