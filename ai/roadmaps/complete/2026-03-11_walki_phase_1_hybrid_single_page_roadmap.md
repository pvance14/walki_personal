# Walki x Phase 1 Hybrid Single-Page Roadmap

**Date:** March 11, 2026  
**Status:** Completed (March 11, 2026)

## Guardrail Note
This repo is still being graded as a Phase 1 AI agent project. The Walki integration must strengthen the deliverable, not obscure it. Reuse and polish are desirable; extra systems, vague scope creep, or features that dilute the assignment are not.

## Why This Roadmap Exists
The current repo has two legitimate but conflicting identities:

- `aiDocs/context.md` defines the active deliverable as a course Phase 1 LangChain/LangGraph agent project with calculator, web search, a web chat UI, structured logging, and a test workflow.
- The legacy Walki MVP docs define a much richer product story, visual language, and single-page demo concept centered on persona-driven walking motivation.

This roadmap merges those paths into one implementation direction: a Walki-branded single webpage where the graded Phase 1 agent becomes the core interactive proof inside the product demo.

## Objective
Ship one responsive, single-page Walki demo that:

- reads as a Walki product experience first
- preserves the required Phase 1 agent architecture and rubric-visible functionality
- turns the existing chat agent into a walking-focused coach without changing the Phase 1 tool scope
- reuses as much existing Walki quiz/persona/demo logic as is practical from the current repo

## Non-Negotiable Constraints From `aiDocs/context.md`

### Must remain true after implementation
- The deliverable is still a Node.js and TypeScript AI agent project.
- The required Phase 1 tools remain:
  - calculator
  - web search via Tavily
- The repo must still expose a functional web chat interface.
- The repo must still demonstrate:
  - `aiDocs/context.md`
  - brief PRD
  - phased roadmap
  - `scripts/test.sh`
  - structured logging

### Must not happen
- Do not replace the actual agent with a fake or static “demo chatbot.”
- Do not add Phase 2 scope such as RAG or conversation memory.
- Do not let the Walki UI hide whether calculator and web search are genuinely in use.
- Do not reintroduce multi-page complexity if a single-page structure is sufficient.

## Product Direction

### Experience framing
- The webpage should look and feel like a Walki demo first.
- The Phase 1 course requirements should be visible, but mostly later in the page and near the chat experience.
- The chatbot should be reframed as `Walki Coach`, not as a generic “Phase 1 AI Agent.”

### Page shape
- Keep the deliverable to one scrolling webpage with anchored sections.
- Preferred section order:
  1. Hero / concept framing
  2. Motivation quiz
  3. Persona results
  4. Walki dashboard demo
  5. Walki Coach chat
  6. Course-proof strip showing how the page satisfies Phase 1

### Interaction strategy
- The quiz and dashboard should provide genuine Walki value and context.
- The chat should be the strongest proof that the repo meets the course requirements.
- The selected Walki persona should influence chat tone, but not create separate backend agents.

## Current Repo Assets To Reuse

### Already present and useful
- `public/index.html`, `public/app.js`, `public/styles.css`
  - current shipped Phase 1 web UI
- `src/server/app.ts`
  - existing HTTP and streaming chat infrastructure
- `src/agent/createCourseAgent.ts`
  - existing LangChain-based agent wiring
- `src/agent/systemPrompt.ts`
  - current course-agent prompt entrypoint
- `src/data.js`
  - Walki personas, messages, quiz questions, initial demo state
- `src/app.js`
  - Walki demo interaction logic worth porting or adapting

### Reuse principle
- Prefer migrating the legacy Walki client behavior into the shipped `public/` client.
- Avoid preserving two separate frontends with duplicated logic.
- If shared browser-side data becomes large enough, move it into a single reusable static data module rather than copying it in two places.

## Roadmap

### Phase 1: Reframe the Product and Delivery Narrative
Status: `Implemented`

- Update the product framing in the UI from “course agent demo” to “Walki persona-driven walking coach.”
- Keep the assignment identity explicit in supporting copy near the chat and proof sections rather than in the hero.
- Define the final page narrative so the user journey is coherent:
  - understand Walki
  - discover motivation style
  - preview demo value
  - test the real AI coach
- Ensure all visible copy avoids unsupported claims about real step tracking, push notifications, or long-term efficacy.
- Confirm the merged experience still aligns with `aiDocs/context.md` priorities instead of contradicting them.

### Phase 2: Unify Frontend Architecture Around One Shipped Page
Status: `Implemented`

- Replace the current minimal `public/index.html` shell with a richer single-page Walki layout.
- Merge the most useful Walki flows into the shipped frontend:
  - hero
  - quiz
  - results
  - dashboard
  - chat
- Use section anchors and in-page CTA jumps instead of route simulation unless route state is required for a specific UX reason.
- Consolidate browser-side state into one client controller in `public/app.js`.
- Reuse or port quiz scoring, persona weighting, and message-generation logic from `src/app.js` and `src/data.js`.
- Keep the frontend implementation simple enough that future reviewers can still understand the repo quickly.

### Phase 3: Build the Walki-Branded Visual System
Status: `Implemented`

- Replace the current plain course-agent styling with a Walki-first visual language consistent with the earlier MVP direction.
- Use a clear visual hierarchy:
  - strong hero
  - expressive persona system
  - dashboard metrics that scan fast
  - chat panel that still feels central and trustworthy
- Keep styling responsive across desktop and mobile.
- Preserve accessibility basics:
  - keyboard access
  - visible focus states
  - readable contrast
  - clear semantic structure
- Keep the page intentional rather than decorative; avoid adding ornamental complexity that does not clarify the product story.

### Phase 4: Port and Refine the Walki Quiz and Results Flow
Status: `Implemented`

- Implement the 10-question motivation quiz in the shipped frontend.
- Preserve the current scoring model so persona weights are deterministic and testable.
- Compute and display persona percentages that total 100.
- Present top persona and top three personas prominently.
- Show enough persona detail to make the product concept legible without recreating the entire original long-form results doc.
- Support retake/reset behavior without breaking the rest of the page state.
- Optionally retain share/copy behavior if it remains low-cost and coherent in the merged page.

### Phase 5: Reintroduce the Walki Demo Dashboard as Product Proof
Status: `Implemented`

- Add a dashboard section that demonstrates:
  - current streak
  - daily goal progress
  - recent motivation feed
  - quick actions
- Use local demo state only; do not imply real wearable or background tracking.
- Keep the dashboard interactive enough to validate the Walki concept:
  - generate motivation
  - update visible feed state
  - surface persona mix
- Ensure the dashboard hands off naturally into the AI coach chat rather than competing with it.

### Phase 6: Reframe the Agent as Walki Coach Without Breaking Phase 1
Status: `Implemented`

- Update the system prompt so the assistant behaves as a walking-focused coach.
- Encode tone adaptation based on Walki persona context while preserving existing tool behavior.
- Keep tool usage rules explicit:
  - `calculator` for precise step, distance, duration, or other walking-related calculations
  - `web_search` for current recommendations, recent walking facts, weather-like current context, and other up-to-date information
  - direct response for encouragement, explanations, and persona-style coaching
- Avoid hidden prompt complexity. One agent instance with contextual inputs is preferred over separate persona-specific agents.
- Preserve streaming behavior in the existing chat UX.

### Phase 7: Extend the Chat Contract With Optional Walki Context
Status: `Implemented`

- Extend `POST /api/chat` to accept optional Walki state fields, likely:
  - `personaId`
  - `personaName`
  - `todaySteps`
  - `dailyGoal`
  - `streakCurrent`
- Keep the endpoint backward-compatible so current tests and clients can be updated incrementally.
- Ensure missing Walki context falls back to sensible generic coaching behavior.
- Surface route/tool visibility in the frontend so users can tell whether the reply was direct, calculator-driven, or web-search-driven.
- If needed, include route hint in both streaming metadata and non-stream response payloads for consistent client rendering.

### Phase 8: Make the Required Tool Usage Legible in the UI
Status: `Implemented`

- Add chat prompt suggestions tied to the Walki use case:
  - a calculator-style walking math prompt
  - a web-search-style current-information prompt
  - a direct-response motivation prompt
- Show lightweight response metadata such as `Used: calculator`, `Used: web_search`, or `Used: direct`.
- Add a compact “How Walki Coach works” or “Phase 1 proof” section that maps visible behavior to the course requirements:
  - LangChain/LangGraph-style agent routing
  - calculator tool
  - web search tool
  - web UI
  - structured logging and test script at repo level
- Keep this proof area concise so it supports the grading story without turning the whole page back into a class project splash screen.

### Phase 9: Backend and Prompt Hardening
Status: `Implemented`

- Review `src/agent/systemPrompt.ts` for contradictions between course phrasing and Walki phrasing.
- Review route-hint logic for walking-specific prompts to ensure the hint still generally matches likely tool usage.
- Keep structured logging intact and, if needed, enrich logs with lightweight context fields that are useful for debugging without becoming noisy.
- Ensure tool failure cases still degrade safely in a product-branded UI.
- Preserve the existing no-secrets, env-based configuration model.

### Phase 10: Verification, Tests, and Doc Alignment
Status: `Implemented`

- Update or add frontend/backend tests to cover the merged experience where practical.
- Preserve and rerun the existing backend test suite and `scripts/test.sh`.
- Add focused checks for:
  - quiz scoring totals
  - persona selection and reset flow
  - chat payload compatibility with optional Walki fields
  - route/tool hint rendering in the UI
  - calculator routing for walking math prompts
  - web search routing for current-information prompts
  - direct-response routing for motivation prompts
- Review `aiDocs/context.md`, `aiDocs/prd.md`, and `aiDocs/roadmap.md` after implementation so docs no longer imply the Walki material is only irrelevant legacy content.
- Update `ai/changelog.md` as milestones land.

## Suggested Implementation Order
1. Reframe UI/product copy and define final page structure.
2. Merge the shipped frontend into a single Walki-first page skeleton.
3. Port quiz/results logic and verify scoring behavior.
4. Add dashboard/demo state and interactions.
5. Update chat UX and payloads to send Walki context.
6. Rework the backend prompt and request handling for Walki Coach behavior.
7. Add route/tool visibility and course-proof strip.
8. Run test, QA, and doc-alignment passes.

## Primary Files Expected To Change
- `public/index.html`
- `public/app.js`
- `public/styles.css`
- `src/server/app.ts`
- `src/agent/systemPrompt.ts`
- `src/agent/createCourseAgent.ts`
- `src/shared/types.ts`
- `src/data.js` or a migrated shared data module if browser data is consolidated
- relevant tests under `tests/`
- selected docs in `aiDocs/`
- `ai/changelog.md`

## Acceptance Criteria
- The page reads as Walki first within the first screenful.
- The page still contains a real Phase 1 chat interface backed by the existing agent stack.
- Calculator and web search remain the only required tools and are still genuinely in use.
- The quiz influences persona presentation and chat tone in a visible way.
- The dashboard demonstrates the Walki value proposition without claiming production tracking features.
- Users can infer when the agent used direct response versus a tool.
- The repo remains understandable as a course project and still satisfies the Phase 1 expectations in `aiDocs/context.md`.
- `scripts/test.sh` remains the canonical validation path.

## Risks and Mitigations

### Risk: product polish overwhelms assignment clarity
- Mitigation: keep a dedicated proof strip near the chat and preserve route/tool visibility.

### Risk: two frontend codepaths remain in the repo and drift
- Mitigation: consolidate behavior into the shipped `public/` client and treat old Walki app code as source material, not a second app.

### Risk: prompt personalization causes tool misuse
- Mitigation: keep tool descriptions and system instructions explicit about when to use calculator, web search, or neither.

### Risk: scope balloons into a full product rebuild
- Mitigation: use existing data models and interactions where possible; avoid new backend domains, accounts, persistence, or mobile-only features.

## Assumptions
- The single-page hybrid is the intended deliverable shape for the next implementation cycle.
- Walki remains a demo with local state, not a production habit-tracking system.
- Persona adaptation can be handled through prompt context and frontend state rather than persistent memory.
- The current backend architecture is sufficient and does not need a deeper LangGraph refactor for this milestone.
- The roadmap became active after user review and is now complete.

## Implementation Notes
- Replaced the minimal course-only `public/` UI with a Walki-first single-page experience covering hero, quiz, persona results, dashboard demo, and embedded streaming chat.
- Added `public/walki-data.js` to consolidate shipped Walki personas, quiz prompts, and demo-state seeds.
- Extended the chat request contract with optional Walki context and passed persona/progress state through the server into the agent runner.
- Reframed the prompt and route heuristics so the agent behaves as Walki Coach while still using the required Phase 1 tools and keeping tool choice legible in the UI.
- Updated `aiDocs/context.md`, `aiDocs/prd.md`, and `aiDocs/roadmap.md` so the repo docs match the shipped hybrid deliverable.

## Verification Note
- Verified with a passing `scripts/test.sh` on March 11, 2026.
