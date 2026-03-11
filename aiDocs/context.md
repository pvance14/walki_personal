# Course Agent Context

This file is the default orientation doc for any agent working in this repository.
The repo is still a graduate course Phase 1 AI agent assignment, but the shipped UI now uses Walki as the product wrapper and domain-specific experience.

## Source of Truth

- Near-term implementation scope: [roadmap.md](./roadmap.md)
- Product requirements: [prd.md](./prd.md)
- Active execution roadmap: [../ai/roadmaps/complete/2026-03-11_walki_phase_1_hybrid_single_page_roadmap.md](../ai/roadmaps/complete/2026-03-11_walki_phase_1_hybrid_single_page_roadmap.md)
- Change tracking: [../ai/changelog.md](../ai/changelog.md)

If docs conflict, follow the active roadmap for execution and `prd.md` for deliverable intent.

## Project Snapshot

- Deliverable: a Node.js and TypeScript AI agent project for a graduate-level course, presented as a Walki single-page walking-coach demo
- Framework stack: LangChain plus LangGraph
- Primary model: Anthropic Claude Haiku 3.5
- Fallback model: OpenAI GPT-4o mini
- Required tools in Phase 1:
  - Calculator
  - Web search via Tavily
- Required UI: functional web chat interface embedded in a Walki-branded single-page web experience
- Required engineering artifacts:
  - `aiDocs/context.md`
  - brief PRD
  - phased roadmap
  - `scripts/test.sh`
  - structured logging

## Phase Split

### Phase 1
- Repo and infrastructure setup
- Calculator tool
- Web search tool
- Tool-routing agent
- Web chat UI
- Structured logging and test workflow

### Phase 2
- RAG tool over a documentation set
- Conversation memory
- Final deliverable hardening and extension

## What Matters Most Right Now

The repo itself is graded, not just whether the chatbot appears to work.

Priority order:

1. Keep docs aligned with the actual assignment.
2. Build the two required tools with clear schemas and tests.
3. Build an agent that routes correctly across calculator, web search, or direct response.
4. Expose the agent through a functional chat UI that still makes calculator, web search, and direct routing legible.
5. Show disciplined engineering through structured logging, test scripts, and incremental roadmap-driven progress.

## Current Product Shape

- The shipped webpage is Walki-first, not course-first, in presentation.
- The real agent is framed as `Walki Coach`.
- The page combines:
  - motivation quiz
  - persona results
  - local-state walking dashboard demo
  - real streaming chat agent
- Walki context may influence response tone, but Phase 1 tool scope remains unchanged:
  - calculator
  - web search

## Tooling Expectations

- Use environment variables for all secrets.
- Do not commit `.env` files or API keys.
- Prefer explicit interfaces and typed modules over ad hoc glue code.
- Web and future RAG tools should use async interfaces.
- Tool definitions should have:
  - clear names
  - useful descriptions
  - Zod schemas

## Legacy Repo Note

This repo previously contained a Walki static MVP demo. That legacy work is now partially reactivated as the UI and product framing for the graded Phase 1 deliverable. The course requirements still govern scope and grading.

## Working Rules

- Keep roadmap checklists current as implementation progresses.
- Update `ai/changelog.md` whenever roadmap work lands.
- Avoid over-engineering, cruft, and legacy-compatibility features unless the assignment requires them.
- Prefer simple, reviewable slices that can be committed incrementally.
