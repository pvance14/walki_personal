# Changelog

This is meant to be a CONCISE list of changes to track as we develop this project. When adding to this file, keep comments short and summarized. Always add references back to the source plan docs for each set of changes.

---

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
