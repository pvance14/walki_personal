# Changelog

This is meant to be a CONCISE list of changes to track as we develop this project. When adding to this file, keep comments short and summarized. Always add references back to the source plan docs for each set of changes.

---

## 2026-03-23
- Added a dedicated stretch-goals sub-plan and roadmap in `ai/roadmaps/` to assess what is already complete, what is only partially claimable, and what remains to earn all extra-credit stretch goals.
- Captured a deployment-aware plan for finishing stretch work on Vercel, especially the need for a true persistent vector backend instead of the current in-memory-only RAG storage.
- Recorded the recommended low-risk path for the 4th custom tool: formalize the existing `corpus_catalog` tool unless it proves too ambiguous to claim.

Source plan docs:
- `ai/roadmaps/2026-03-23_stretch_goals_completion_sub_plan.md`
- `ai/roadmaps/2026-03-23_stretch_goals_completion_roadmap.md`

## 2026-03-19
- Fixed local environment loading for server startup so `.env` values are available during `npm run dev` and standard server boot.
- Corrected chat streaming behavior by switching the LangGraph agent stream path to message-mode output and removing the accidental double-execution of streamed requests.
- Added a frontend log drawer to the chat UI so browser-side request, stream, and error events are visible during debugging.
- Prevented raw tool JSON from leaking into assistant messages, added lightweight markdown rendering in the chat UI, and tightened prompt guidance so unrelated step-goal coaching is less likely to bleed into evidence answers.
- Upgraded the local RAG ingestion pipeline with document chunking, section-aware chunk preservation, and local token normalization to improve retrieval from long evidence files such as `going-afoot-book-on-walking.txt`.
- Hardened current-info behavior so failed live web-search requests now return a deterministic “live web search unavailable” message instead of sounding current without verification.
- Added deterministic `Sources:` line enforcement for grounded knowledge-base and successful web-search answers to make rubric verification easier in the chat transcript itself.
- Added corpus-proof infrastructure: a new `corpus_catalog` tool, shared corpus metadata on the in-memory KB, a read-only `/api/debug/corpus` endpoint, and a visible reviewer-facing corpus panel in the Walki UI.
- Expanded corpus/source routing so “what docs do we have?” style questions bias toward the knowledge-base path instead of a direct model answer.
- Increased knowledge-base retrieval breadth slightly and extended tests to cover chunking, corpus metadata, corpus cataloging, source-line enforcement, and deterministic current-info failure handling.

Source plan docs:
- `aiDocs/context.md`
- `aiDocs/project_requirements.md`
- `aiDocs/prd.md`

## 2026-03-09
- Added full phase planning set in `ai/roadmaps`: 8 sub-plan docs and 8 matching roadmap docs for Phases 0-7 of the high-level MVP plan.
- Ensured each new plan/roadmap doc includes the clean-code guardrail note to avoid over-engineering, cruft, and legacy-compatibility features.
- Kept roadmap task checklists current with `Planned` status and unchecked tasks (implementation has not started yet).
- Fixed `aiDocs/context.md` cross-doc alignment issues (correct changelog path and planning guideline typo).
- Created `ai/roadmaps/complete/` to support the documented workflow for completed plan/roadmap pairs.
- Rewrote `aiDocs/architecture.md` into a more concise architecture spec aligned to roadmap Phases 0-7, with no code examples.

Source plan docs:
- `ai/roadmaps/2026-03-09_high_level_mvp_implementation_plan.md`
- `ai/roadmaps/2026-03-09_phase_0_alignment_and_setup_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_0_alignment_and_setup_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_1_foundations_and_ux_skeleton_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_1_foundations_and_ux_skeleton_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_2_core_validation_flow_delivery_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_2_core_validation_flow_delivery_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_3_interactive_demo_systems_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_3_interactive_demo_systems_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_4_conversion_and_feedback_layer_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_4_conversion_and_feedback_layer_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_5_quality_hardening_for_external_demo_use_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_5_quality_hardening_for_external_demo_use_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_6_validation_launch_and_learning_loop_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_6_validation_launch_and_learning_loop_roadmap.md`
- `ai/roadmaps/2026-03-09_phase_7_post_mvp_transition_planning_sub_plan.md`
- `ai/roadmaps/2026-03-09_phase_7_post_mvp_transition_planning_roadmap.md`

## 2026-03-10
- Phase 0 implemented and completed: alignment artifacts created for success criteria, scope boundaries, and delivery workflow.
- Updated Phase 0 roadmap checklist to completed and moved the Phase 0 plan/roadmap pair to `ai/complete`.
- Phase 1 implemented and completed: app shell, route skeleton, responsive baseline, accessibility baseline, and shared persona/quiz seed structures.
- Updated Phase 1 roadmap checklist to completed and moved the Phase 1 plan/roadmap pair to `ai/complete`.
- Phase 2 implemented and completed: full quiz flow, persona score calculation, results rendering, and results-to-demo transition.
- Updated Phase 2 roadmap checklist to completed and moved the Phase 2 plan/roadmap pair to `ai/complete`.
- Phase 3 implemented and completed: interactive demo dashboard, weighted motivation generation, calendar/freeze simulation, and persona mix controls.
- Updated Phase 3 roadmap checklist to completed and moved the Phase 3 plan/roadmap pair to `ai/complete`.
- Phase 4 implemented and completed: waitlist capture, privacy/trust conversion support, quick feedback prompts, and results sharing action.
- Updated Phase 4 roadmap checklist to completed and moved the Phase 4 plan/roadmap pair to `ai/complete`.
- Phase 5 implemented and completed: state persistence/fallback hardening, responsiveness/accessibility improvements, and quality report documentation.
- Updated Phase 5 roadmap checklist to completed and moved the Phase 5 plan/roadmap pair to `ai/complete`.
- Phase 6 implemented and completed: deploy configs (Netlify/Vercel/GitHub Pages), validation runbook/findings log, and local static hosting smoke checks.
- Updated Phase 6 roadmap checklist to completed and moved the Phase 6 plan/roadmap pair to `ai/complete`.
- Phase 7 implemented and completed: post-MVP transition assessment, go/no-go framework, and prioritized follow-on planning docs.
- Updated Phase 7 roadmap checklist to completed and moved the Phase 7 plan/roadmap pair to `ai/complete`.
- Added a focused dashboard UI refresh roadmap to bring the interactive demo closer to the MVP spec and improve visual hierarchy, spacing rhythm, persona expression, and responsive polish.
- Implemented the dashboard UI refresh in the demo: hero streak module, richer motivation feed, improved calendar/legend/details, persona control polish, in-app step entry modal, and stronger visual hierarchy across the dashboard.
- Updated the dashboard UI refresh roadmap checklist to implemented.
- Rebaselined the repo for the Unit 7 course assignment: rewrote `aiDocs/context.md`, replaced `aiDocs/prd.md`, and added `aiDocs/roadmap.md` focused on the Phase 1 agent deliverable.
- Added a new Node.js and TypeScript project scaffold with `package.json`, `tsconfig.json`, environment-driven config, and Node build/test scripts.
- Implemented Phase 1 agent modules in `src/agent`, `src/tools`, `src/server`, and `src/shared`, including the calculator tool, Tavily search wrapper, route hints, structured logger, and server entrypoint.
- Replaced the old static app entrypoint with a course-oriented chat UI in `public/` and the root `index.html`.
- Added `scripts/test.sh` plus tests for calculator behavior, route hinting, chat request handling, and web search normalization/error paths.
- Updated the Phase 1 repo realignment roadmap to completed after `npm install` and a passing `scripts/test.sh` run.

Source plan docs:
- `ai/complete/2026-03-09_phase_0_alignment_and_setup_sub_plan.md`
- `ai/complete/2026-03-09_phase_0_alignment_and_setup_roadmap.md`
- `ai/complete/2026-03-09_phase_1_foundations_and_ux_skeleton_sub_plan.md`
- `ai/complete/2026-03-09_phase_1_foundations_and_ux_skeleton_roadmap.md`
- `ai/complete/2026-03-09_phase_2_core_validation_flow_delivery_sub_plan.md`
- `ai/complete/2026-03-09_phase_2_core_validation_flow_delivery_roadmap.md`
- `ai/complete/2026-03-09_phase_3_interactive_demo_systems_sub_plan.md`
- `ai/complete/2026-03-09_phase_3_interactive_demo_systems_roadmap.md`
- `ai/complete/2026-03-09_phase_4_conversion_and_feedback_layer_sub_plan.md`
- `ai/complete/2026-03-09_phase_4_conversion_and_feedback_layer_roadmap.md`
- `ai/complete/2026-03-09_phase_5_quality_hardening_for_external_demo_use_sub_plan.md`
- `ai/complete/2026-03-09_phase_5_quality_hardening_for_external_demo_use_roadmap.md`
- `ai/complete/2026-03-09_phase_6_validation_launch_and_learning_loop_sub_plan.md`
- `ai/complete/2026-03-09_phase_6_validation_launch_and_learning_loop_roadmap.md`
- `ai/complete/2026-03-09_phase_7_post_mvp_transition_planning_sub_plan.md`
- `ai/complete/2026-03-09_phase_7_post_mvp_transition_planning_roadmap.md`
- `ai/roadmaps/2026-03-10_dashboard_ui_refresh_roadmap.md`
- `ai/roadmaps/2026-03-10_phase_1_repo_realignment_langgraph_agent_roadmap.md`

## 2026-03-11
- Added a detailed hybrid implementation roadmap for merging the Walki MVP with the Phase 1 course agent into one shipped webpage.
- Replaced the minimal course-only frontend in `public/` with a Walki-first single-page experience covering hero, quiz, results, dashboard demo, and the real chat agent.
- Added `public/walki-data.js` to consolidate shipped browser-side Walki persona, quiz, and demo seed data.
- Extended the chat request contract with optional Walki context and passed persona/progress context into the agent without changing the required Phase 1 tool set.
- Reframed the system prompt and routing heuristics so the agent behaves as Walki Coach while preserving calculator, web search, direct-response routing, and streaming chat behavior.
- Added tests for the optional Walki chat context and walking-math route inference.
- Verified the implementation with a passing `scripts/test.sh`.
- Drafted the active Phase 2 roadmap focused on local `docs/` ingestion, in-memory RAG, session memory, citations, and actual tool tracing.
- Implemented Phase 2 Slice 1: added the `docs/` corpus contract, startup knowledge-base loading, a typed in-memory retrieval foundation, and tests for document loading plus no-match retrieval behavior.
- Normalized the evidence corpus filenames and trimmed noisy front matter from long source texts so future RAG retrieval and visible citations start from cleaner content.
- Implemented Phase 2 Slice 2: added the real `knowledge_base` tool, wired it into the LangChain agent, grounded tool results with source attribution, and added tests for match, no-result, and unavailable-corpus behavior.
- Implemented Phase 2 Slice 3: replaced heuristic-only backend tool reporting with actual per-request tool tracing, added multi-tool route summaries, extended streaming metadata to carry executed tool records, and added tracing-focused tests.
- Implemented Phase 2 Slice 4: added bounded in-memory session history keyed by browser-tab `sessionId`, threaded prior turns into agent invocations, added a reset endpoint, and added session continuity/reset tests.
- Implemented Phase 2 Slice 5: updated the shipped Walki chat UI to send browser-tab session ids, added chat reset UX, rendered actual tool usage and grounded source chips, and added frontend-contract coverage for streamed tool metadata.
- Implemented Phase 2 Slice 6: tightened logging with retrieved source summaries, updated `aiDocs/context.md` to the real Phase 2 project state, and marked the active Phase 2 roadmap completed after a passing `scripts/test.sh`.
- Reworked provider configuration so Anthropic can run the full app without an OpenAI key by default: added explicit embedding-provider config, a local deterministic embedding fallback for RAG, startup fallback logging, updated setup docs, and tests covering Anthropic-first startup behavior plus OpenAI embedding fallback.

Source plan docs:
- `ai/roadmaps/2026-03-11_walki_phase_1_hybrid_single_page_roadmap.md`
- `ai/roadmaps/2026-03-11_walki_phase_2_rag_memory_roadmap.md`
