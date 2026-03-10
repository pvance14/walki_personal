# Walki MVP Scope Boundaries

## In Scope
- Responsive web demo with full narrative flow:
  - Landing -> Quiz -> Results -> Interactive Demo -> Waitlist
- Local persona scoring and weighted message generation
- Simulated steps, streak, calendar, freeze, and persona controls
- Lightweight conversion and feedback collection

## Out of Scope
- Native mobile builds and mobile store release work
- Real HealthKit / Google Fit integrations
- Production push notification infrastructure
- Full authentication/account lifecycle
- Long-term retention measurement and growth experiments
- Backend scaling and production SRE concerns

## Scope Guardrails
- Add a feature only if it strengthens one or more primary validation goals.
- Prefer simpler implementation when two options provide similar validation value.
- Defer all legacy compatibility and non-essential extensibility.
