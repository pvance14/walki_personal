# Walki Architecture

This document defines the technical architecture for the Walki MVP demo and the intended migration path to the production mobile app.
It translates product requirements from `aiDocs/prd.md` and `aiDocs/mvp.md` into system design decisions.

## Scope and Goals

### In Scope (Current)
- Responsive web MVP that demonstrates:
  - Landing -> Quiz -> Results -> Demo -> Waitlist flow
  - Persona-weighted motivation generation
  - Streak and calendar simulation
  - Step logging simulation and milestone feedback
- Static hosting compatibility
- Fast iteration with low operational overhead

### Out of Scope (Current)
- Real health API integrations
- Production push delivery
- Multi-user backend scale concerns
- Full authentication and account lifecycle

## Architectural Principles
- Frontend-first: prioritize client-rendered experience and demo speed.
- Deterministic demo behavior: keep flows reproducible for stakeholders.
- Progressive realism: simulate production behavior now, replace internals later.
- Privacy-by-default: no third-party tracking dependencies in core flows.
- Clean boundaries: isolate logic so web demo modules can map to mobile modules later.

## System Overview

### Context Diagram
1. User opens web app on desktop/mobile browser.
2. App runs quiz and computes persona weights locally.
3. App uses local message library + context variables to generate motivation content.
4. App stores session/demo state in local client storage.
5. App optionally sends waitlist submission to external form/email provider (if configured).

### Deployment Model
- Runtime: static web app
- Hosting target: Vercel, Netlify, or GitHub Pages
- Backend dependency: optional lightweight endpoint only for waitlist capture

## Proposed MVP Application Architecture

Use a layered frontend architecture:

1. `UI Layer`
- Pages, components, animation, responsive layout, accessibility hooks.

2. `Feature Layer`
- Quiz engine
- Persona results and profile composition
- Demo dashboard logic (steps, streak, calendar, activity feed)
- Motivation trigger flow

3. `Domain Layer`
- Pure business logic and state transitions:
  - Persona scoring and normalization
  - Notification weighting and selection
  - Streak evaluation and freeze application
  - Milestone detection

4. `Data Layer`
- Static assets and seed data:
  - Quiz question definitions
  - Persona definitions
  - Message template library
- Client persistence adapter (local/session storage)

This separation allows direct reuse of the domain layer in a future React Native app.

## Core Domain Model

### Persona
- `id`: stable key (`companion`, `educator`, `cheerleader`, `challenger`, `sage`, `pessimist`)
- `name`
- `tone`
- `weight` (computed from quiz)
- `muted` (optional user override)

### Quiz
- `questionId`
- `prompt`
- `answers[]` with persona point mappings
- `response`
- `scoreCard` (persona -> points)

### User Profile (Demo Session)
- `personaWeights` (percent distribution totaling 100)
- `dailyStepGoal`
- `notificationWindowPrefs`
- `demoFlags` (milestone shown, tutorial seen, etc.)

### Activity State
- `todaySteps`
- `streakCurrent`
- `streakLongest`
- `calendarByDate` (met/partial/missed/freeze)
- `freezeAvailable`
- `messageHistory[]` (with persona and timestamp)

### Message Template
- `id`
- `personaId`
- `template`
- `tags`
- `contextRequired[]`

## Key Flows and Logic

### Quiz Scoring Flow
1. User answers 10 scenario-based questions.
2. Each answer contributes points to one or more personas.
3. Aggregate points are normalized to percentages.
4. Top personas are used for results and message weighting.

### Motivation Generation Flow
1. User triggers "Get Motivation" (or simulated schedule event).
2. App picks persona via weighted random selection.
3. App selects unused/recently unseen template for that persona.
4. App injects context values (streak, steps remaining, time/day).
5. App writes generated message to activity history.

### Streak and Freeze Flow
1. Daily completion state computed from `todaySteps` and goal.
2. If day missed and freeze available, user can apply freeze.
3. Freeze preserves streak and marks date with freeze status.
4. Without freeze, streak resets and new streak begins next completion day.

## Data and State Strategy

### Storage (MVP)
- In-memory state for immediate UI interactions.
- Client persistence for continuity between refreshes:
  - Session storage for ephemeral demo data, or
  - Local storage for persisted demo preferences.

### Seed Data Sources
- Persona catalog (metadata + style text)
- Quiz question bank and scoring map
- Message template library by persona
- Demo timeline defaults (example streak/calendar/activity)

### Versioning
- Include lightweight schema version key in persisted state.
- On schema mismatch, reset to safe defaults for demo reliability.

## Interface Contracts (Internal)

### Quiz Engine
- Input: question definitions + responses
- Output: normalized persona weights + scoring breakdown

### Message Service
- Input: persona weights + context + history
- Output: selected persona + rendered message + metadata

### Streak Service
- Input: prior streak state + today completion + freeze action
- Output: updated streak counters + calendar status

### Persistence Adapter
- Input: domain state snapshot
- Output: serialized storage record (and restore method)

## Non-Functional Requirements

### Performance
- First load optimized for static-hosted experience.
- Instant feedback on quiz navigation and demo interactions.
- Message generation path should be sub-second.

### Reliability
- Demo must function without network (except optional waitlist submit).
- Resilient handling for missing/invalid local state.

### Privacy and Compliance Posture
- No analytics SDK required for core demo flows.
- No sensitive health data collection in MVP.
- Clearly separate optional waitlist data capture from in-app demo state.

### Accessibility
- Keyboard navigable quiz and controls.
- Sufficient text contrast and readable typography.
- Clear labels for progress, state icons, and actions.

## Future Production Migration (React Native)

### Reusable Components
- Domain logic and scoring engine
- Persona/message selection rules
- Streak computation rules
- Data model contracts

### Components to Replace
- Web storage adapter -> mobile local DB/storage
- Simulated notifications -> native notification scheduler
- Demo step logging -> HealthKit/Google Fit ingestion
- Static content updates -> managed content pipeline

### Backend Evolution Path
Phase 1 (MVP): none/minimal backend  
Phase 2: authenticated user profiles + optional encrypted sync  
Phase 3: configurable messaging pipeline and experimentation framework

## Risks and Mitigations
- Risk: Persona messages feel repetitive in longer sessions.
  - Mitigation: no-repeat window + template tag diversity.
- Risk: Quiz results feel inaccurate for some users.
  - Mitigation: allow persona mix adjustment in Personas screen.
- Risk: Demo complexity grows before validation.
  - Mitigation: gate new features by direct validation impact.

## Decisions Log (Initial)
- Decision: Build frontend-first static web MVP before native app.
  - Reason: fastest path to validate persona concept and share externally.
- Decision: Keep message generation local with template library.
  - Reason: reduces infra complexity while demonstrating personalization.
- Decision: Architect domain logic as framework-agnostic services.
  - Reason: enables smooth reuse in React Native implementation.
