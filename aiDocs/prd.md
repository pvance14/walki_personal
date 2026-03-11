# Product Requirements Document
## Walki Coach Phase 1 Agent

**Date:** March 10, 2026  
**Status:** Active

## Summary

Build a web-based AI chat agent using Node.js, TypeScript, LangChain, and LangGraph, then present it as a Walki-branded single-page walking coach demo. The agent must intelligently route user questions to the correct tool, starting with calculator and web search, while the page also demonstrates the Walki MVP concepts of persona matching, motivational tone, and a shareable product story. The repository must still demonstrate proper software engineering practices because the codebase, workflow, and documentation are part of the grade.

## Problem

The assignment is not to produce a quick proof of concept. The project must show that the agent is designed, documented, tested, and built incrementally like real software. The current product framing challenge is to combine the course requirements with the earlier Walki MVP in one coherent webpage instead of leaving them as competing repo identities.

## Users

- Primary user: course reviewer or instructor testing the repo, UI, and tool-routed chat experience
- Secondary user: a stakeholder or peer reviewing the Walki concept through the single-page demo
- Tertiary user: the student maintaining and extending the project into Unit 8

## Phase 1 Requirements

- Clean repo structure
- `aiDocs/context.md`
- Brief PRD
- Phased roadmap
- Environment-based secret management
- Calculator tool
- Web search tool using Tavily or equivalent
- Agent that routes to the correct tool
- Functional web chat interface
- `scripts/test.sh`
- Structured logging
- Walki-branded single-page product presentation that still makes the Phase 1 requirements legible

## Core User Stories

- As a reviewer, I can inspect the docs and understand what the project does and what is planned next.
- As a user, I can ask a math question and get an answer that comes from the calculator tool.
- As a user, I can ask a current-events or factual question and get an answer that uses web search.
- As a user, I can take a short motivation quiz and see a persona-driven framing of the Walki concept.
- As a user, I can use a browser chat interface instead of the terminal.
- As a reviewer, I can tell that the Walki product framing is backed by a real agent rather than a static demo bot.
- As a reviewer, I can run tests and see structured logs and proper exit behavior.

## Non-Goals For Phase 1

- RAG
- Conversation memory
- Large document ingestion
- Multi-step retrieval chains beyond the required two tools
- Production deployment hardening beyond what is needed to demonstrate the assignment
- Real wearable integration or persistent user accounts

## Success Criteria

- The repo documents Phase 1 and Phase 2 clearly.
- The calculator and web search tools are implemented and tested.
- The agent routes correctly across representative prompts.
- The chat UI works end-to-end against the backend.
- The single-page UI reads as Walki first while still exposing the real agent and tool-routing behavior.
- `scripts/test.sh` is the default validation entrypoint.
- Logs are structured and useful for debugging.

## Technical Direction

- Runtime: Node.js
- Language: TypeScript
- Agent framework: LangChain plus LangGraph-compatible structure
- Model provider: Anthropic by default, OpenAI as fallback
- Web search provider: Tavily
- Validation style: test-log-fix loops with incremental commits
