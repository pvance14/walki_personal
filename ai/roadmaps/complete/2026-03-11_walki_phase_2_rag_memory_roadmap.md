# Walki Phase 2 RAG, Memory, and Multi-Tool Verification Roadmap

**Date:** March 11, 2026  
**Status:** Completed (March 18, 2026)

## Guardrail Note
This repo is still being graded as a course AI agent project. Phase 2 should deepen the agent with knowledge retrieval and memory while keeping the implementation reviewable, in-memory, and clearly aligned to the Unit 8 deliverables.

## Why This Roadmap Exists
Phase 1 established a working Walki-branded single-page agent experience with calculator and web search tools. Unit 8 adds the next required layer:

- a RAG tool over a real document set
- conversation memory across turns
- multi-tool behavior that can chain tools and prove what actually ran

The goal is to add those capabilities without turning the project into a production architecture exercise or diluting the existing Walki framing.

## Objective
Ship a Phase 2 extension that:

- adds a real `knowledge_base` tool over a local document corpus
- preserves the existing calculator and web search tools
- supports multi-turn memory for one browser-tab session until reset or server restart
- exposes actual executed tool usage and visible source citations in the web UI
- keeps docs, tests, and repository structure aligned with `aiDocs/context.md`

## Non-Negotiable Constraints From `aiDocs/context.md`

### Must remain true after implementation
- The deliverable remains a Node.js and TypeScript AI agent project.
- The app continues to use LangChain plus LangGraph-oriented agent patterns already established in the repo.
- The repo still exposes a functional web chat interface.
- Structured logging remains part of the implementation.
- `scripts/test.sh` remains the canonical verification path.
- The roadmap and changelog remain current as implementation progresses.

### Phase 2 decisions already agreed
- Vector storage stays in-memory.
- The RAG corpus will be local project files supplied by the user.
- Supported source formats for Phase 2 are `.txt` and `.md`.
- Chat memory is scoped to one browser tab session and does not need to survive restarts.
- Persona state remains separate from chat memory.
- When RAG is used, the UI should visibly cite retrieved sources.
- Tool reporting should reflect actual executed tools, not route heuristics alone.

### Must not happen
- Do not replace the existing Walki single-page experience with a new multi-page app.
- Do not add persistent vector databases or production infra unless a blocker forces it.
- Do not rely on heuristic route labels as the only proof of tool usage once RAG is added.
- Do not treat generic model knowledge as equivalent to grounded RAG answers.
- Do not let memory growth become unbounded within a session.

## Product Direction

### Experience framing
- Walki should still read as a walking coach product demo first.
- The new knowledge and memory features should strengthen the demo rather than shift it back to a generic classroom chatbot.
- The RAG corpus should support both:
  - evidence-backed walking and motivation answers
  - internal Walki-specific product and persona knowledge

### User-visible outcomes
- Users can ask factual walking or motivation questions and see grounded answers with source citations.
- Users can ask follow-up questions without restating the prior turn.
- Users can trigger answers that use one tool or multiple tools in sequence.
- Users can reset the chat session without losing the broader Walki quiz/persona/dashboard state.

## Phase 2 Scope

### In scope
- Local document ingestion from a repo `docs/` directory
- In-memory embeddings and vector search
- `knowledge_base` tool with source attribution
- Session-based conversation memory on the backend
- Actual tool execution tracing in responses and logs
- UI support for citations, session reset, and more accurate tool display
- Tests covering RAG, memory, and multi-tool behavior

### Out of scope
- Persistent vector stores such as Chroma, Pinecone, Weaviate, or pgvector
- PDF ingestion
- Multiple concurrent chat threads in the UI
- Authentication or saved user accounts
- README and demo-video polishing work beyond roadmap-aware notes

## Roadmap

### Phase 1: Define the Knowledge Corpus Contract
Status: `Implemented`

- Create a `docs/` directory as the canonical RAG source location.
- Use a predictable folder structure, likely:
  - `docs/evidence/`
  - `docs/walki/`
- Support only `.txt` and `.md` files in Phase 2.
- Establish file naming conventions that make source citations readable in the UI and demo.
- Decide what metadata should be inferred at load time, such as:
  - source path
  - source name
  - category

### Phase 2: Build Document Loading and In-Memory Retrieval
Status: `Implemented`

- Load the local corpus at server startup using a folder-based loader approach.
- Convert documents into embeddings and add them to an in-memory vector store.
- Keep startup failure behavior explicit and reviewable:
  - log missing docs clearly
  - fail fast if the configured corpus cannot load when RAG is required
- Keep retrieval async and typed.
- If document chunking is needed, implement a simple deterministic chunking strategy instead of adding unnecessary complexity.

### Phase 3: Add the `knowledge_base` Tool
Status: `Implemented`

- Add a third tool named `knowledge_base`.
- Give it a precise description so the agent uses it for:
  - local walking and motivation evidence
  - Walki-specific docs and FAQs
  - persona framework or product-specific knowledge
- Ensure tool output includes:
  - retrieved excerpts
  - source attribution metadata
  - safe “no relevant documents found” behavior
- Preserve the existing calculator and web search tools unchanged unless small wording updates are needed to sharpen routing boundaries.

### Phase 4: Support Real Multi-Tool Tracing
Status: `Implemented`

- Replace or augment current heuristic route reporting with actual executed tool records from agent execution.
- Support more than one tool per answer so chained reasoning can be represented honestly.
- Keep a lightweight top-level summary in the UI, but preserve detailed tool traces in logs for debugging.
- Continue using heuristics only where useful as hints, not as the authoritative record of execution.

### Phase 5: Add Session-Scoped Conversation Memory
Status: `Implemented`

- Extend the chat contract with a browser-tab `sessionId`.
- Store bounded message history per session on the server.
- Pass prior conversation turns into each new agent invocation.
- Preserve persona and Walki dashboard context separately from the message history so chat reset does not wipe app state.
- Add a clear chat reset path that:
  - clears only the conversation memory for that session
  - leaves the Walki page state intact
- Bound memory growth by keeping only a recent window of messages or turns.

### Phase 6: Ground RAG Answers and Surface Citations in the UI
Status: `Implemented`

- Update prompts and/or tool instructions so RAG-backed factual claims are grounded in retrieved material.
- Surface visible citations in the chat UI when `knowledge_base` contributes to an answer.
- Prefer readable source labels derived from file metadata over raw internal paths where possible.
- Ensure answers degrade gracefully when retrieval finds nothing relevant.
- Keep the chat experience understandable when answers combine:
  - `knowledge_base`
  - `calculator`
  - direct synthesis

### Phase 7: Update the Frontend Session Model
Status: `Implemented`

- Generate and persist a browser-tab session identifier for chat requests.
- Continue sending optional Walki persona/progress context separately from session memory.
- Add a reset control for the chat thread.
- Update the tool/citation UI so it can render:
  - one tool
  - multiple tools
  - source citations
- Keep streaming behavior intact if practical within the updated contract.

### Phase 8: Logging, Evaluation, and Testing
Status: `Implemented`

- Extend structured logs to capture:
  - loaded document counts
  - session identifiers where appropriate
  - actual tool calls
  - retrieval source metadata summaries
- Add tests for:
  - document loading
  - empty-corpus or no-match behavior
  - `knowledge_base` tool formatting and attribution
  - memory continuity across turns
  - session reset behavior
  - multi-tool execution shape
  - citation rendering contract in API or UI logic
- Keep `scripts/test.sh` passing as the main validation command.

### Phase 9: Doc Alignment for the New Active Phase
Status: `Implemented`

- Update roadmap references so Phase 2 has a clear active execution document.
- Update `ai/changelog.md` as implementation lands.
- Recheck `aiDocs/context.md`, `aiDocs/roadmap.md`, and selected supporting docs after implementation so they describe the actual project state accurately.
- Defer README and demo-video deliverables until the code changes are complete, but keep them in mind as acceptance targets.

## Suggested Implementation Order
1. Define `docs/` structure and document-loading contract.
2. Implement startup ingestion, embeddings, and in-memory retrieval.
3. Add the `knowledge_base` tool and sharpen tool descriptions.
4. Add actual tool tracing support to the agent/server contract.
5. Add session-scoped memory and chat reset behavior.
6. Update the UI for citations, multi-tool display, and session handling.
7. Add tests and logging coverage.
8. Align docs and changelog after the code lands.

## Recommended Implementation Slices

These slices are intentionally smaller than the roadmap phases. The goal is to keep the repo in a working, testable state after each slice so retrieval, tracing, memory, and UI issues can be isolated instead of debugged all at once.

### Slice 1: Corpus Contract and Retrieval Foundation
Status: `Implemented`

- Create the `docs/` layout and file conventions for `docs/evidence/` and `docs/walki/`.
- Implement startup loading for `.txt` and `.md` files only.
- Build the in-memory embeddings and vector store setup.
- Add focused tests for document loading and no-match retrieval behavior.

Why this slice comes first:
- If the corpus cannot load reliably, every later RAG feature becomes harder to evaluate.
- It isolates ingestion and retrieval quality before the agent prompt and UI introduce more variables.

### Slice 2: `knowledge_base` Tool Integration
Status: `Implemented`

- Add the `knowledge_base` tool to the existing agent.
- Return retrieved excerpts with source attribution metadata.
- Tighten tool descriptions so routing boundaries between `knowledge_base`, `calculator`, and `web_search` are clearer.
- Add tests for tool output shape and grounded no-result behavior.

Why this slice is separate:
- It proves the third tool works before changing session state, streaming behavior, or the frontend contract.
- It lets us validate whether the agent can use the tool at all before we care about polished display.

### Slice 3: Actual Tool Execution Tracing
Status: `Implemented`

- Replace heuristic-only route reporting with actual executed tool records where possible.
- Update API contracts to support multiple tools in a single response.
- Extend logs so tool execution is inspectable and honest.
- Add tests for multi-tool execution shape.

Why this slice should happen early:
- Once three tools exist, honest observability becomes a requirement, not a nice-to-have.
- This reduces the risk of building UI around guessed behavior that later turns out to be wrong.

### Slice 4: Session-Scoped Conversation Memory
Status: `Implemented`

- Add browser-tab `sessionId` support.
- Store bounded session history on the server.
- Pass prior turns into new agent invocations.
- Add reset behavior that clears chat memory without clearing Walki persona/dashboard state.
- Add tests for follow-up continuity and reset behavior.

Why memory follows tracing:
- Memory changes the request contract and debugging surface.
- It is easier to evaluate multi-turn behavior once tool usage and retrieval are already visible.

### Slice 5: Frontend Contract and Citation UX
Status: `Implemented`

- Update the frontend to send `sessionId`.
- Render multiple executed tools cleanly.
- Render visible source citations when RAG contributes to an answer.
- Add a clear chat reset control.
- Keep streaming intact if the updated backend contract allows it cleanly.

Why UI changes wait until here:
- The frontend should reflect stable backend behavior, not guess at retrieval or tool execution details.
- This avoids reworking the UI twice while the backend contract is still moving.

### Slice 6: Hardening and Doc Alignment
Status: `Implemented`

- Expand logging coverage and verification paths.
- Run and stabilize `scripts/test.sh`.
- Update `ai/changelog.md` as slices land.
- Recheck `aiDocs/context.md`, `aiDocs/roadmap.md`, and any other touched docs for alignment with the implemented state.
- Defer README and demo script polish until after code behavior is stable.

Why this is last:
- Hardening is more valuable once the core contract is settled.
- It keeps the repo clean without slowing down the early implementation slices.

## Execution Guidance
- Implement slice by slice, not all at once.
- Keep each slice independently reviewable and testable.
- Prefer merging a clean backend slice before starting the matching UI slice.
- If a slice forces contract changes in both backend and frontend, stabilize the backend shape first and then update the UI against that settled contract.

## Primary Files Expected To Change
- `src/agent/createCourseAgent.ts`
- `src/agent/systemPrompt.ts`
- `src/server/app.ts`
- `src/shared/types.ts`
- `public/app.js`
- `public/index.html`
- `src/shared/logger.ts`
- new RAG support modules under `src/`
- new local corpus under `docs/`
- relevant tests under `tests/`
- `aiDocs/roadmap.md`
- `ai/changelog.md`

## Acceptance Criteria
- The repo contains a visible local `docs/` corpus with at least 5 meaningful documents.
- The agent can answer local-knowledge questions through a real `knowledge_base` tool.
- RAG-backed answers visibly cite retrieved sources in the web UI.
- The agent preserves conversational context across turns within one browser-tab session.
- A user can reset the chat thread without resetting Walki persona/dashboard state.
- The app can represent answers that used multiple tools in one turn.
- Structured logs and tests make RAG, memory, and tool execution behavior reviewable.
- The repo remains legible as a course project and aligned with `aiDocs/context.md`.
