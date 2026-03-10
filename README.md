# Phase 1 AI Agent

This repo now contains the Phase 1 graduate course AI agent project.

## What is here

- Node.js and TypeScript backend
- LangChain and LangGraph-compatible agent structure
- Calculator tool
- Tavily-backed web search tool
- Streaming web chat UI
- `aiDocs/` source-of-truth docs
- `scripts/test.sh` for validation

## Run locally

1. Install dependencies with `npm install`
2. Set required environment variables:
   - `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
   - `TAVILY_API_KEY`
3. Start the app with `npm run dev`
4. Open `http://localhost:3000`

## Validate

Run `scripts/test.sh`
