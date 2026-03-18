# Walki Course Agent

This repo contains the graduate course AI agent project, presented as the Walki demo experience and now extended with local-doc RAG, session memory, and multi-tool tracing.

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

## Run locally

1. Install dependencies with `npm install`
2. Set required environment variables:
   - `ANTHROPIC_API_KEY` if `MODEL_PROVIDER=anthropic`
   - `OPENAI_API_KEY` if `MODEL_PROVIDER=openai`
   - `OPENAI_API_KEY` if `EMBEDDING_PROVIDER=openai`
   - `TAVILY_API_KEY` for `web_search`
3. Start the app with `npm run dev`
4. Open `http://localhost:3000`

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
