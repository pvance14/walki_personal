# Walki Context

This file is the default orientation doc for any agent working in this repository.
Use it to understand what Walki is, what we are validating right now, and how to prioritize decisions.
For full details, refer to the source specs in `aiDocs/prd.md` and `aiDocs/mvp.md`.

## Source of Truth
- Product strategy and long-term direction: [prd.md](./prd.md)
- Current build scope and implementation detail: [mvp.md](./mvp.md)
- If this file conflicts with those docs, follow `mvp.md` for near-term execution and `prd.md` for strategic intent.

## Project Snapshot
- Product: Walki, a privacy-first walking companion centered on motivational AI personas.
- Immediate target: web-based interactive MVP demo (responsive, shareable, fast to iterate).
- Future target: cross-platform mobile app (React Native) after concept validation.
- Primary audience: women 25-49 who want walking consistency without aggressive fitness culture.
- Core differentiators:
  - Persona-driven motivation (not generic reminders)
  - Emotional variety to reduce notification fatigue
  - Privacy-first positioning (no selling/sharing user data)

## Current Objective (What Matters Most Right Now)
Validate product-market signal for the persona concept before investing in full native app development.

Primary validation goals:
- Persona appeal: users find personas motivating and memorable
- Quiz effectiveness: results feel accurate and personal
- Concept clarity: value proposition is obvious quickly
- Emotional response: demo messages feel useful/fun, not robotic
- Shareability: users want to share results or favorite messages

Out of scope for the MVP:
- Real step-tracking accuracy
- Long-term retention measurement
- Native mobile UX validation
- Backend scalability concerns

## MVP User Journey
Landing page -> motivation quiz -> results/persona showcase -> interactive app demo -> waitlist CTA.

Agents should optimize for this end-to-end narrative:
- Explain the problem quickly
- Demonstrate personalization clearly
- Let users feel persona value in under a few minutes
- End with a strong waitlist/conversion moment

## Persona System (Core Product Mechanic)
The six personas are the center of the experience:
- Companion: supportive friend energy
- Educator: fact-driven, science-backed motivation
- Cheerleader: high-energy hype and celebration
- Challenger: direct, competitive push
- Sage: calm, mindful guidance
- Pessimist: dark humor and reverse psychology

Important product behavior:
- Quiz determines weighted persona mix
- Messaging should feel varied and contextual, not repetitive
- Persona tone must stay distinct and recognizable

## Product Principles for All Work
- Privacy-first language and product assumptions
- Motivation over perfection (streak recovery/freeze mindset, not punishment)
- Low-friction UX over feature complexity
- Personality and emotional resonance over sterile fitness analytics
- Fast iteration and stakeholder shareability over production-hardening

## Experience and Brand Direction
- Tone: encouraging, human, and lightly playful; avoid harsh fitness-culture language.
- Messaging should be clear enough for first-time users in under 30 seconds.
- The demo should feel modern, intentional, and personality-rich, not generic SaaS.
- Keep accessibility and readability strong across desktop and mobile layouts.

## Decision Rules for Agents
When making tradeoffs, prioritize in this order:
1. Preserve core validation flow (quiz -> persona result -> demo experience).
2. Strengthen differentiation (persona clarity + privacy positioning).
3. Improve speed of iteration and demo reliability.
4. Avoid adding features that dilute validation learning.

Before introducing major scope changes:
- Check whether the change improves validation of the primary goals.
- If not, defer to post-MVP backlog unless requested by the user.

## Working Expectations in This Repo
- Keep docs and implementation aligned; update docs when behavior/scope changes.
- Prefer explicit assumptions over implicit behavior.
- Make changes easy for non-engineering stakeholders to review (clear naming, readable structure, obvious flow).
- When uncertain, default to simpler implementation that still demonstrates the concept well.

## Quick Start for Any Agent
1. Read this file.
2. Read `aiDocs/mvp.md` sections related to the current task.
3. Confirm your output supports at least one primary validation goal.
4. Implement the smallest high-quality change that improves the demo.
