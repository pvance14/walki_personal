# Walki Architecture

This document defines the target architecture for the Walki web MVP and how it supports the phase plan in `ai/roadmaps`.
It is intentionally concise and execution-focused.

## Scope

### In Scope (Current MVP)
- Responsive web demo for the full validation journey:
  - Landing -> Quiz -> Results -> Interactive Demo -> Waitlist
- Local persona scoring and motivation generation
- Simulated step, streak, calendar, and freeze behaviors
- Static-host deployment with minimal backend dependency

### Out of Scope (Current MVP)
- Real health integrations
- Production push orchestration
- Full account/auth stack
- Scalability optimization beyond demo needs

## Architecture Principles
- Validation-first: optimize for proving core product hypotheses quickly.
- Frontend-first: keep the MVP mostly client-side and easy to iterate.
- Deterministic behavior: ensure demos are stable and reproducible.
- Privacy-first defaults: no unnecessary tracking or data sharing.
- Clean boundaries: isolate domain logic from UI for future reuse.
- Simplicity guardrail: avoid over-engineering, cruft, and legacy-compatibility features.

## System Design

### Runtime Model
- Primary runtime: static web app
- Hosting target: Vercel, Netlify, or GitHub Pages
- Optional backend touchpoint: waitlist submission endpoint/provider

### Layered Structure
1. UI Layer
- Screens, navigation, responsive layout, accessibility surfaces

2. Feature Layer
- Landing and quiz flow
- Results/persona showcase
- Interactive demo views (home, calendar, personas, settings)
- Waitlist and feedback entry points

3. Domain Layer
- Quiz scoring and persona weighting
- Motivation selection and message rendering rules
- Streak/freeze state transitions
- Milestone and progress logic

4. Data Layer
- Static content (quiz, personas, message library)
- Demo seed state
- Client persistence adapter (session/local storage)

## Core Data Contracts
- Persona Profile: persona identifiers, tone metadata, computed weights
- Quiz State: responses, scoring map, normalized output
- Demo State: step progress, streak counters, calendar day statuses, message history
- Conversion State: waitlist and feedback capture metadata

## Non-Functional Requirements
- Fast first load and responsive interactions on desktop/mobile browsers
- Reliable behavior with degraded/no network (except optional waitlist submit)
- Accessibility baseline for navigation, forms, and progress feedback
- Clear separation between demo state and any externally submitted user data

## Roadmap-to-Architecture Alignment

### Phase 0: Alignment and Setup
- Lock source-of-truth hierarchy and architecture constraints.
- Define architecture acceptance criteria tied to validation goals.

### Phase 1: Foundations and UX Skeleton
- Establish app shell, route structure, and shared content/data scaffolding.

### Phase 2: Core Validation Flow Delivery
- Implement landing, quiz, results, and demo handoff on top of the core layer split.

### Phase 3: Interactive Demo Systems
- Implement domain-driven demo mechanics (motivation, streak, calendar, persona controls).

### Phase 4: Conversion and Feedback Layer
- Add waitlist and feedback pathways without expanding core architecture complexity.

### Phase 5: Quality Hardening
- Harden state resilience, accessibility, responsiveness, and cross-browser behavior.

### Phase 6: Validation Launch and Learning Loop
- Deploy, collect findings, and iterate within existing architecture boundaries.

### Phase 7: Post-MVP Transition Planning
- Evaluate reusable domain modules and identify what must change for mobile production.

## Delivery Governance
- Active planning artifacts stay in `ai/roadmaps`.
- Completed plan/roadmap pairs move to `ai/roadmaps/complete` when execution is done.
- Change tracking updates go to `ai/changelog.md`.

## Migration Direction (Post-MVP)
- Reuse domain logic for React Native implementation where possible.
- Replace web storage and simulated mechanisms with production mobile integrations.
- Introduce backend services only when validation outcomes justify added complexity.
