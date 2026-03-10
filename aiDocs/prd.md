# Product Requirements Document
## Phase 1 Course Agent

**Date:** March 10, 2026  
**Status:** Active

## Summary

Build a web-based AI chat agent using Node.js, TypeScript, LangChain, and LangGraph. The agent must intelligently route user questions to the correct tool, starting with calculator and web search. The repository must demonstrate proper software engineering practices because the codebase, workflow, and documentation are part of the grade.

## Problem

The assignment is not to produce a quick proof of concept. The project must show that the agent is designed, documented, tested, and built incrementally like real software.

## Users

- Primary user: course reviewer or instructor testing the repo and chat UI
- Secondary user: the student maintaining and extending the project into Unit 8

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

## Core User Stories

- As a reviewer, I can inspect the docs and understand what the project does and what is planned next.
- As a user, I can ask a math question and get an answer that comes from the calculator tool.
- As a user, I can ask a current-events or factual question and get an answer that uses web search.
- As a user, I can use a browser chat interface instead of the terminal.
- As a reviewer, I can run tests and see structured logs and proper exit behavior.

## Non-Goals For Phase 1

- RAG
- Conversation memory
- Large document ingestion
- Multi-step retrieval chains beyond the required two tools
- Production deployment hardening beyond what is needed to demonstrate the assignment

## Success Criteria

- The repo documents Phase 1 and Phase 2 clearly.
- The calculator and web search tools are implemented and tested.
- The agent routes correctly across representative prompts.
- The chat UI works end-to-end against the backend.
- `scripts/test.sh` is the default validation entrypoint.
- Logs are structured and useful for debugging.

## Technical Direction

- Runtime: Node.js
- Language: TypeScript
- Agent framework: LangChain plus LangGraph-compatible structure
- Model provider: Anthropic by default, OpenAI as fallback
- Web search provider: Tavily
- Validation style: test-log-fix loops with incremental commits
