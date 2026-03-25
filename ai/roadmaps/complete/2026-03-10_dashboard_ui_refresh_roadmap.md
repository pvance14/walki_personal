# Dashboard UI Refresh Roadmap

**Date:** March 10, 2026  
**Project:** Walki Web MVP Demo

## Guardrail Note
This is a clean-code project. We need to avoid over-engineering, cruft, and legacy-compatibility features unless they are explicitly required for MVP validation.

## Objective
Improve the interactive demo dashboard so it feels modern, intentional, and personality-rich while better supporting the MVP validation goals of concept clarity, persona appeal, emotional response, and waitlist conversion.

## Why This Matters
- The current dashboard is functional, but the primary metric and CTA hierarchy are weak.
- The present UI does not yet match the stronger dashboard intent described in `aiDocs/mvp.md`.
- Improving the demo screen should increase perceived product quality and make the persona concept easier to understand quickly.

## Constraints
- Keep the work inside the existing MVP narrative: landing -> quiz -> results -> demo -> waitlist.
- Prioritize visual clarity, readability, and demo polish over new feature breadth.
- Reuse the current single-page architecture in `src/app.js` and `src/styles.css` unless refactoring clearly reduces complexity.
- Do not introduce production-only systems, theme engines, or component abstractions that are unnecessary for this demo.

## Current Gaps To Address
- The streak/status card does not read as a clear hero section.
- The page lacks a strong scan path from status -> action -> recent motivation -> deeper exploration.
- The header navigation is visually louder than the demo content.
- Card heights and spacing feel inconsistent; some areas are sparse while others are dense.
- The motivation feed is list-heavy and does not reinforce persona personality visually.
- The calendar legend is weak and the calendar presentation feels utilitarian rather than rewarding.
- The current dashboard styling underuses modern surface treatment, type scale, and accent color discipline.
- Parts of the Phase 3 demo spec are only partially represented in the current implementation.

## Roadmap

### Phase 1: Establish Stronger Dashboard Hierarchy
Status: `Implemented`

- [x] Convert the streak card into a true hero module with larger streak value, supporting subtext, and explicit progress emphasis.
- [x] Add a visual progress treatment for daily steps such as an animated bar or circular indicator.
- [x] Reframe supporting metrics so `steps remaining`, `goal progress`, and `last updated` are scannable at a glance.
- [x] Reduce the number of equally weighted actions shown at once; keep one dominant CTA and quiet secondary actions.
- [x] Rebalance the two-column layout so the primary status area leads and supporting modules do not compete for attention.

### Phase 2: Improve Visual System and Spacing Rhythm
Status: `Implemented`

- [x] Tighten the overall spacing system in `src/styles.css` so cards, headings, controls, and metadata follow a consistent rhythm.
- [x] Refine typography scale and weight so page titles, card titles, metrics, body text, and metadata are more clearly separated.
- [x] Update card surfaces with lighter visual treatment, softer borders, and subtle depth where useful.
- [x] Reduce header/nav prominence so the dashboard body carries the main emphasis.
- [x] Standardize button sizing, radii, padding, and emphasis levels across primary and secondary actions.

### Phase 3: Make Persona Content Feel More Alive
Status: `Implemented`

- [x] Redesign the recent motivation section from a plain bullet list into compact message cards or feed rows.
- [x] Add persona signifiers to feed items such as avatar chips, color accents, or persona labels.
- [x] Quiet timestamps and metadata so the message content remains primary.
- [x] Limit visible feed items to the most useful recent messages and make density feel intentional.
- [x] Improve the empty and first-use states so the feed still demonstrates value before multiple clicks.

### Phase 4: Upgrade Supporting Modules For Clarity and Delight
Status: `Implemented`

- [x] Redesign the calendar module so status states feel more legible and rewarding.
- [x] Replace the plain-text legend with visual chips or keyed labels that match the calendar states.
- [x] Add the lightweight streak stats context described in the MVP spec if it can fit without clutter.
- [x] Review the Persona Mix and Quick Feedback modules for visual consistency with the refreshed dashboard.
- [x] Ensure lower-priority modules do not dilute the primary walkthrough goal of understanding the motivation concept quickly.

### Phase 5: Align Interaction Details With MVP Demo Expectations
Status: `Implemented`

- [x] Add a more polished `Get Motivation` interaction state so the action feels intentional rather than instantaneous text insertion.
- [x] Replace browser-prompt step entry with an in-app modal or panel if the implementation cost stays low.
- [x] Review microcopy across the dashboard for warmth, clarity, and fit with the Walki tone.
- [x] Make progress, freeze usage, and feedback states feel coherent across modules.
- [x] Preserve rapid iteration by keeping interaction logic simple and data-driven.

### Phase 6: Responsive and Accessibility Hardening
Status: `Implemented`

- [x] Rework mobile stacking so the hero card, feed, calendar, and controls keep a clear order on small screens.
- [x] Check that text contrast, focus states, target sizes, and semantic structure remain strong after the visual refresh.
- [x] Verify that denser UI changes do not reduce readability for first-time viewers.
- [x] Run a quick pass on desktop and mobile breakpoints to ensure the refreshed design remains stakeholder-demo friendly.

## Implementation Order
1. Refresh hierarchy and spacing first.
2. Upgrade the feed and calendar presentation.
3. Improve interaction details only after the visual structure is working.
4. Finish with responsive/accessibility hardening and a final narrative pass from results -> demo -> waitlist.

## Primary Files Expected To Change
- `src/app.js`
- `src/styles.css`
- `index.html` if route-level heading or nav semantics need adjustment

## Success Criteria
- A first-time viewer can identify the main status, current progress, and primary action within a few seconds.
- The dashboard feels visibly more modern and intentional without losing simplicity.
- The persona concept is reinforced by the demo UI, not just by text content.
- The refreshed screen better matches the Phase 3 interactive demo intent in `aiDocs/mvp.md`.
- The updated dashboard improves the handoff into waitlist conversion by increasing confidence in the product concept.

## Verification Note
Implementation is complete in code. A live browser visual QA pass is still recommended to confirm final spacing, motion feel, and small-screen behavior end to end.
