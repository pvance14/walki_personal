# Stretch Goals Sub Plan: Completion Strategy

**Date:** March 23, 2026  
**Phase:** Stretch Goals Completion  
**Parent Context:** `aiDocs/context.md`

## Guardrail Note

This is still a clean-code course project. We should only add stretch-goal work that clearly improves rubric coverage or extra-credit evidence, and avoid production-scale complexity unless the stretch goal truly requires it.

## Objective

Close the remaining extra-credit gaps in the most efficient order, while protecting the current working app and keeping the Vercel deployment viable.

## Stretch Goal Status Snapshot

### 1. Streaming in the web UI

Status: `Already implemented`

Evidence already present:

- streaming backend path in `src/agent/createCourseAgent.ts`
- streaming HTTP contract in `src/server/app.ts`
- streaming frontend consumption in `public/app.js`
- tests in `tests/chat-api.test.ts` and `tests/logging.test.ts`

Remaining work:

- make the extra-credit claim explicit in repo docs and demo flow

### 2. 4th custom tool

Status: `Partially satisfied, but not yet presentation-safe`

Relevant current implementation:

- `src/tools/corpusCatalog.ts` defines a `corpus_catalog` tool
- the system prompt references it
- tests cover corpus metadata/catalog behavior
- the UI already exposes corpus-proof data via `/api/debug/corpus`

Why this is only partial:

- the repo does not currently present `corpus_catalog` as an intentional extra-credit feature
- the README focuses on the three required tools, not a fourth custom one
- the demo flow does not currently showcase it as a standalone capability

Decision point:

- Conservative path: formalize `corpus_catalog` as the 4th custom tool through docs, tests, and demo evidence
- Safer but larger path: add a new Walki-specific tool with a clearly user-facing purpose if we want zero ambiguity

### 3. Persistent vector store

Status: `Not implemented`

Current blocker:

- the knowledge base is explicitly in-memory in `src/rag/inMemoryKnowledgeBase.ts`
- Vercel serverless instances are ephemeral, so current RAG indexing does not meet the "survive restarts" stretch-goal bar

What this means:

- this stretch goal requires real architecture work, not just documentation

### 4. Agent proposal (~1 page)

Status: `Not implemented`

Current blocker:

- there is no dedicated proposal doc for the extra-credit writeup

## Recommended Strategy

### Recommended interpretation of "all stretch goals"

To claim all available stretch goals cleanly, we should finish:

- explicit streaming evidence
- explicit 4th-tool evidence
- true persistent vector storage
- a completed agent proposal document

### Recommended sequence

1. Lock in the easiest wins first:
  - formalize streaming as already completed
  - formalize `corpus_catalog` as the 4th tool, unless we decide it is too ambiguous
2. Complete the only meaningful engineering addition:
  - persistent vector storage compatible with Vercel
3. Finish with the written extra-credit deliverable:
  - one-page agent proposal

## Key Constraints

- The shipped app must keep working on Vercel.
- We should avoid replacing the current good-enough app architecture with something much larger unless persistence forces it.
- The current tests should keep passing throughout.
- Secrets must remain env-driven.
- Stretch work should be incrementally shippable and easy to demonstrate.

## Recommended Technical Direction

### For the 4th custom tool

Preferred approach:

- keep `corpus_catalog` and elevate it into a clearly intentional feature

Why:

- it already exists in code and tests
- it is genuinely custom to this project's RAG corpus
- it avoids unnecessary new agent/tool complexity late in the project

Fallback if needed:

- add a more visibly user-facing Walki-specific tool, such as a walking-plan generator or pace/goal estimator

### For persistent vector storage on Vercel

Preferred approach:

- move retrieval storage from in-memory vectors to an external persistent vector backend or persistent pgvector-compatible store

Why:

- Vercel cannot be relied on for local durable storage across restarts
- an external persistent store cleanly satisfies the survival-across-restarts requirement

Avoid if possible:

- fake persistence through ephemeral local files or runtime-only caches
- large infra additions unrelated to the assignment

### For the proposal doc

Preferred approach:

- write a concise, rubric-aligned one-page proposal focused on a specific future Walki feature that benefits from an agent pattern

Best fit topic:

- a walking adherence coach that combines user context, walking evidence retrieval, and planning/check-in behavior

## Exit Criteria

- The repo and demo explicitly show streaming as an implemented extra-credit feature.
- A 4th custom tool is clearly documented, tested, and demoable.
- The RAG corpus uses a persistent vector backend that survives restarts and redeploys.
- A polished one-page agent proposal exists in the repo.
- The roadmap, changelog, and key docs reflect the new stretch-goal state.

