# Course Project Roadmap

## Current Status

- Phase 1 course-agent foundation: completed
- Phase 2 RAG, memory, tracing, and citation work: completed
- Current focus: rubric-alignment polish, deliverable clarity, and demo readiness

## Authoritative Completion Roadmap

- Latest completed execution roadmap: [../ai/roadmaps/complete/2026-03-11_walki_phase_2_rag_memory_roadmap.md](../ai/roadmaps/complete/2026-03-11_walki_phase_2_rag_memory_roadmap.md)

## Phase 1
- Rebaseline docs and repo structure around the course assignment.
- Build and test calculator and web search tools.
- Build the first agent with proper tool routing.
- Ship a functional web chat UI.
- Reframe the shipped UI as a Walki-branded single-page experience with quiz, persona results, dashboard demo, and embedded agent chat.
- Pass optional Walki context into the agent without expanding the Phase 1 tool set.
- Add structured logging and `scripts/test.sh`.

## Phase 2
- Add a RAG tool over a documentation set.
- Add conversation memory.
- Replace heuristic-only tool reporting with actual executed tool traces.
- Surface visible citations for retrieved sources in the web UI.
- Expand evaluation coverage and polish final deliverables.

## Remaining Polish Work

- Keep repo-facing docs aligned with the shipped implementation state.
- Make rubric evidence explicit so reviewers can verify requirements quickly.
- Keep demo-prep notes current for the required screen-recording submission.
- Preserve clean validation through `scripts/test.sh`.

## Execution Rule
- Use the completed roadmap in `ai/roadmaps/complete` for milestone-level implementation history, and use this document for the current high-level status summary.
