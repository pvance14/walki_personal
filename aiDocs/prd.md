# Product Requirements Document
## Walki Course Agent

**Date:** March 18, 2026  
**Status:** Active shipped state with rubric-hardening polish

## Summary

Build a multi-tool chatbot agent for the graduate course assignment using Node.js, TypeScript, LangChain, and LangGraph-oriented patterns, then present it inside a Walki-branded single-page walking coach experience. The shipped repo must make the assignment easy to grade by clearly showing the required tools, ReAct-style tool use, conversation memory, grounded RAG citations, structured logging, and disciplined project documentation.

## Problem

The project is graded as a software repo, not just as a chatbot demo. That means the implementation has to work, but the repo also needs to explain itself well enough that an instructor can quickly verify the rubric: three tools, multi-turn memory, a web UI, source attribution for RAG answers, structured logs, and evidence of incremental engineering work.

## Users

- Primary user: course reviewer or instructor validating the assignment rubric
- Secondary user: a peer or stakeholder exploring the Walki walking-coach demo
- Tertiary user: the student extending the project beyond the assignment baseline

## Required Product Capabilities

- Calculator tool for precise arithmetic and walking-related math
- Tavily-backed web search tool for current or external information
- RAG knowledge-base tool over local repo documents with visible source attribution
- Session-scoped conversation memory so follow-up questions work in one browser tab
- Functional web chat UI embedded inside the Walki single-page experience
- Streaming chat responses in the browser
- Structured logging that captures tool calls, arguments, and results

## Core User Stories

- As a reviewer, I can inspect the docs and quickly understand what the project does, how it is structured, and how it maps to the rubric.
- As a user, I can ask a math question and receive an answer that uses the calculator tool.
- As a user, I can ask a current-info question and receive an answer that uses web search.
- As a user, I can ask a question about walking evidence or Walki docs and receive a grounded answer with visible sources.
- As a user, I can ask a follow-up question in the same chat session without repeating prior context.
- As a user, I can use the agent in a browser instead of the terminal.
- As a reviewer, I can confirm the Walki presentation is backed by a real multi-tool agent rather than a static scripted demo.
- As a reviewer, I can run one validation script and inspect structured logs that show what tools actually ran.

## Non-Goals

- Production deployment hardening beyond what the assignment and demo require
- Persistent user accounts, wearable integrations, or durable user memory
- Persistent vector databases for the RAG corpus
- Broad product expansion beyond the course agent plus Walki demo framing

## Success Criteria

- The repo clearly documents the project state, rubric coverage, and validation path.
- The three required tools are implemented with clear descriptions, Zod schemas, and tests.
- The agent can route directly, use a single tool, or chain multiple tools as needed.
- The web UI works end-to-end and surfaces tool usage, citations, and chat reset behavior.
- RAG answers are grounded in a local corpus of at least five real documents and expose source labels.
- Session memory works for follow-up questions until reset or server restart.
- `scripts/test.sh` is the canonical verification command and passes cleanly.
- Structured logs are useful for debugging and explicitly include tool calls, arguments, and results.

## Technical Direction

- Runtime: Node.js
- Language: TypeScript
- Agent framework: LangChain with LangGraph-oriented structure
- Primary chat model: Anthropic Claude Haiku 3.5
- Fallback chat model: OpenAI GPT-4o mini
- Web search provider: Tavily
- RAG corpus: local `.md` and `.txt` files under `docs/`
- Memory model: bounded in-memory session history keyed by browser-tab session id
- Validation style: build-and-test via `scripts/test.sh`, plus repo docs that make rubric verification straightforward
