# Phase 1 Roadmap: Repo Realignment to LangGraph Agent Project

**Date:** March 10, 2026  
**Status:** Completed (March 10, 2026)

## Guardrail Note
This is a clean-code project. We need to avoid over-engineering, cruft, and legacy-compatibility features unless they are explicitly required for Phase 1 delivery.

## Summary
Convert the current repo from a Walki static MVP baseline into a course-compliant Phase 1 LangGraph project without deleting prior work. Prioritize rubric-visible progress from the Unit 7 assignment: docs first, then TypeScript app scaffolding, then two tested tools with Zod schemas, then agent routing, web chat UI, and finally testing/logging hardening with incremental commits throughout.

## Milestones

### M1. Docs Rebaseline
- Rewrite `aiDocs/context.md` around the LangGraph agent project.
- Rewrite or replace `aiDocs/prd.md` with a short PRD for the Phase 1 chat agent.
- Add or update an `aiDocs` roadmap covering:
  - Phase 1: calculator, web search, agent routing, web UI, testing/logging
  - Phase 2: RAG and conversation memory
- Mark old Walki-specific docs as legacy or non-source-of-truth where needed.
- Make the docs explicit that development is document-driven and that roadmap phases will be checked off as work completes.

### M2. Application Scaffold
- Add `package.json`, `tsconfig.json`, and core scripts for dev, build, and test.
- Install and configure the Unit 7 package baseline:
  - `langchain`
  - `@langchain/anthropic` or `@langchain/openai`
  - `@langchain/langgraph`
  - `@langchain/core`
  - `@langchain/tavily`
  - `zod`
- Establish app structure:
  - `src/agent/`
  - `src/tools/`
  - `src/server/`
  - `src/shared/`
  - `tests/`
  - `scripts/`
- Add environment-based config for model and Tavily keys.
- Ensure `.gitignore` excludes `.env` and local artifacts.
- Set Anthropic as the default provider with OpenAI kept as a documented fallback.

### M3. Calculator Tool
- Implement a calculator tool with a clear name, description, and Zod input schema.
- Support basic arithmetic and parentheses.
- Return structured success/error output.
- Add unit tests for valid and invalid expressions.
- Keep the tool definition usable both directly and from the agent execution loop.

### M4. Web Search Tool
- Implement an async Tavily-backed search tool with a clear name, description, and Zod input schema.
- Normalize search results into a stable internal shape.
- Handle missing API key and upstream failure clearly.
- Add tests with mocked Tavily responses.
- Keep the interface compatible with later Phase 2 RAG and multi-tool expansion.

### M5. LangGraph Agent Routing
- Build the first agent using LangChain's `createAgent` pattern with the two tools, then wrap or organize it so the repo remains compatible with a later LangGraph state-machine expansion.
- Ensure the execution model reflects the taught ReAct loop: think, call tool, observe, respond.
- Keep routing logic inspectable and testable.
- Add structured logs around request lifecycle and tool execution.
- Verify routing for math, search, and simple non-tool prompts.
- Run at least one verbose execution path during development so the tool-selection loop is observable.

### M6. Web Chat UI
- Add a functional chat interface connected to the backend.
- Support message entry, in-session transcript, loading state, and error state.
- Implement streaming responses if feasible in the first pass because the assignment materials call out streaming as the better chatbot UX; if deferred, keep the endpoint contract stream-ready and document the deferral.
- Keep styling minimal and functional.

### M7. Test and Logging Hardening
- Add `scripts/test.sh` as the canonical test entrypoint.
- Ensure proper exit codes on success/failure.
- Standardize structured logging format across backend paths.
- Add endpoint-level integration tests with mocked dependencies.
- Confirm the repo supports a visible test-log-fix workflow.
- Make commit boundaries visible in git history instead of batching the full phase into one large commit.

## Task Checklist
- [x] M1 docs rebaseline complete
- [x] M2 TypeScript scaffold complete
- [x] M3 calculator tool complete
- [x] M4 web search tool complete
- [x] M5 LangGraph routing complete
- [x] M6 chat UI complete
- [x] M7 test/logging hardening complete

## Completion Signal
Phase 1 is complete when the repo contains a working Node.js/TypeScript agent app with documented scope, two tested tools using proper tool metadata and Zod schemas, verified routing, a functional chat UI, and a passing `scripts/test.sh` workflow with structured logging and incremental git history in place.

## Acceptance Checks
- `aiDocs` matches the actual project and grading target.
- The repo contains a working Node.js/TypeScript agent app built on the LangChain/LangGraph stack introduced in Unit 7.
- Calculator and Tavily search both work and are tested.
- Tools expose proper names, descriptions, and Zod schemas.
- Agent routing is demonstrably correct.
- The chat UI is functional.
- `scripts/test.sh` exists and returns proper exit codes.
- Logging is structured rather than ad hoc.
- Git history shows meaningful incremental progress instead of one giant commit.

## Assumptions
- The course prompt is now the operative deliverable target.
- Existing Walki files remain in the repo unless they block implementation.
- Anthropic Claude Haiku 3.5 is the default provider; OpenAI is fallback only.
- Streaming is strongly preferred for the chat UI but may be deferred if it threatens Phase 1 completion.
- Phase 2 will add RAG, in-memory vector search, and conversation memory as introduced for Unit 8.

## Implementation Notes
- Rebaselined `aiDocs/context.md`, `aiDocs/prd.md`, and added `aiDocs/roadmap.md` to match the assignment.
- Added Node.js and TypeScript project scaffolding with LangChain, LangGraph-compatible agent modules, Zod-validated tools, and a static chat frontend in `public/`.
- Implemented structured logging, `scripts/test.sh`, and passing tests for calculator behavior, route hints, chat request handling, and Tavily wrapper behavior.
