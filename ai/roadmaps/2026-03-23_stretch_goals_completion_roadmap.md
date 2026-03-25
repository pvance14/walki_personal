# Stretch Goals Completion Roadmap

**Date:** March 23, 2026  
**Status:** Planned  
**Linked Sub Plan:** `2026-03-23_stretch_goals_completion_sub_plan.md`

## Guardrail Note
This is still a clean-code course project. Stretch-goal work should be reviewable, incremental, and clearly attributable to the extra-credit rubric rather than turning into a broad platform rebuild.

## Why This Roadmap Exists
The core assignment requirements are already in strong shape, but the stretch goals are only partially complete. Streaming appears done already, while the 4th custom tool is present in code but not yet formalized, and the persistent vector store plus agent proposal remain unfinished.

Because the app is deployed on Vercel, the persistence work needs a deployment-aware plan rather than a local-only shortcut.

## Stretch Goal Status Matrix

- Streaming in web UI: `Implemented`, needs explicit evidence/documentation
- 4th custom tool: `Implemented in code, not yet safe to claim without clearer evidence`
- Persistent vector store: `Not implemented`
- Agent proposal: `Not implemented`

## Milestones

- M1. Streaming is explicitly documented and demoable as extra credit.
- M2. The 4th custom tool is explicit, test-backed, and reviewer-visible.
- M3. RAG retrieval uses persistent storage that survives restarts on Vercel.
- M4. The agent proposal writeup is complete and submission-ready.

## Phase 1: Lock In The Already-Built Stretch Value
Status: `Planned`

- Update `README.md` to explicitly call out streaming as an implemented extra-credit feature.
- Add one short proof path pointing to:
  - `src/agent/createCourseAgent.ts`
  - `src/server/app.ts`
  - `public/app.js`
  - `tests/chat-api.test.ts`
- Update the demo checklist so streaming is intentionally shown in the recording.

Why this phase matters:
- Streaming is probably already credit-worthy, but right now the repo relies on the grader noticing it rather than the project clearly claiming it.

## Phase 2: Formalize The 4th Custom Tool
Status: `Planned`

### Preferred path
- Treat `corpus_catalog` as the 4th custom tool.

### Required work
- Update `README.md` to list `corpus_catalog` as an optional/custom tool beyond the required three.
- Add a short explanation of what problem it solves:
  - lets users or graders inspect what local corpus materials are actually indexed
  - makes the RAG system more transparent and reviewable
- Add at least one demo prompt and expected behavior example.
- Confirm the tool remains wired into the agent prompt and tool list.
- If current coverage feels too indirect, add one focused test proving the agent can expose or route to `corpus_catalog`.

### Decision gate
- If, after documentation review, `corpus_catalog` still feels too hidden or grader-dependent, replace this plan with a new clearly user-facing custom tool instead of forcing a weak claim.

Why this phase matters:
- This is the cheapest path to the 4th-tool stretch goal because the implementation mostly exists already.

## Phase 3: Add Persistent Vector Storage
Status: `Planned`

### Objective
- Replace or augment the current in-memory vector store so the document index survives restarts and redeploys.

### Recommended architecture
- Introduce a persistence abstraction for the knowledge base backend.
- Keep the current retrieval API stable where possible.
- Back the persistent mode with an external durable vector store or pgvector-compatible service that works from Vercel.

### Required implementation work
- Add config for persistent vector backend selection and credentials.
- Create a persistence-aware RAG startup path.
- Add idempotent corpus indexing so deploys do not duplicate records.
- Persist source metadata with embeddings so citations and corpus browsing still work.
- Keep a local/in-memory fallback for development or missing credentials if needed, but do not confuse that fallback with the stretch-goal path.

### Vercel-specific concerns
- Do not rely on writing local vector data at runtime.
- Keep startup work bounded so serverless cold starts stay acceptable.
- Prefer explicit sync/bootstrap flows over hidden long-running indexing behavior.

### Validation work
- Add tests around the new persistence abstraction.
- Add one manual verification checklist proving data remains available after restart/redeploy.
- Document required env vars and setup steps in `README.md`.

Why this phase matters:
- This is the only stretch goal that the current app definitely does not satisfy.

## Phase 4: Write The Agent Proposal
Status: `Planned`

- Create a one-page proposal doc in the repo.
- Frame it around a future Walki capability that benefits from agent behavior.
- Include:
  - the problem to solve
  - why an agent pattern fits better than a fixed workflow
  - what tools/context the agent would need
  - expected user value
  - risks and guardrails

Recommended output file:
- `aiDocs/agent_proposal.md`

Why this phase matters:
- It is a discrete extra-credit deliverable and should be easy to finish once the engineering work is settled.

## Suggested Implementation Order

1. Update docs to explicitly claim streaming.
2. Formalize `corpus_catalog` as the 4th tool, or decide to replace it.
3. Introduce persistent vector storage behind a new backend abstraction.
4. Update tests, setup docs, and demo prompts.
5. Write the one-page agent proposal.

## Task Checklist

- [ ] Add explicit streaming extra-credit evidence to `README.md`
- [ ] Add streaming proof/demo guidance to the demo checklist
- [ ] Decide whether `corpus_catalog` is strong enough to claim as the 4th tool
- [ ] If yes, document and demo `corpus_catalog`
- [ ] If no, implement a different clearly custom 4th tool
- [ ] Add a persistent vector backend abstraction
- [ ] Integrate a durable vector store compatible with Vercel
- [ ] Add idempotent indexing and source-metadata persistence
- [ ] Add tests for persistent retrieval behavior
- [ ] Document persistent-store setup in `README.md`
- [ ] Add a manual verification checklist for restart survival
- [ ] Write `aiDocs/agent_proposal.md`
- [ ] Update `ai/changelog.md` when implementation lands

## Tradeoffs And Rejected Shortcuts

- Rejected shortcut: claiming the in-memory store is "persistent enough" on Vercel.
  Reason: serverless memory does not satisfy the spirit of surviving restarts.

- Rejected shortcut: adding a brand-new flashy 4th tool immediately.
  Reason: `corpus_catalog` already exists and may be sufficient with much less risk.

- Rejected shortcut: bundling local vector data files and calling that done without a real persistence story.
  Reason: it creates ambiguity and may not satisfy the extra-credit intent cleanly.

## Completion Signal

This roadmap is complete when the repo can honestly claim all stretch goals with low grader ambiguity:
- streaming is clearly documented and demonstrable
- the 4th custom tool is obvious and test-backed
- persistent vector retrieval survives restarts on Vercel
- the proposal writeup is present and polished
