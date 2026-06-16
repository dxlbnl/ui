---
id: B67
title: Accordion smart scroll-to-content on header click
type: feature
priority: medium
flags: []
created: 2026-06-16
spec: wiki/specs/B67-accordion-scroll-to-content.md
---

## Description
In a sticky `Accordion`, clicking a section header should smart-scroll that section's
content into view when the content isn't (fully) visible — instead of just toggling.
This is the natural companion to the sticky stacking (B66): with tall sections in a
scroll container, opening a section often leaves its body below the fold or behind the
pinned header stack. Clicking the header should bring the content to a readable position,
landing the header in its top-stack slot with the body revealed below it.

Default behaviour **in sticky mode only** (no new prop); non-sticky mode is unchanged.

Interaction model (manager + user decision 2026-06-16):
- **Closed** → open, then scroll content into view (offset by the cumulative sticky
  top-offset so the header sits in its pinned slot, body below).
- **Open but content not fully visible** → scroll to it; do **not** close (overrides the
  native `<details>` close-on-click toggle for this case).
- **Open and content already fully visible** → native close (so sections can still be
  collapsed once you're looking at them).

## Notes
- Overrides native `<details>` disclosure toggle conditionally → touches D16. spec-writer
  MUST log an ADR and fully address keyboard activation (Enter/Space) + screen-reader
  expanded/collapsed semantics; reviewer MUST confirm WCAG 2.1 AA / a11y addon zero
  violations.
- Builds on B66 sticky registry/offsets (`Accordion.svelte` StickyRegistry top offsets)
  and `AccordionItem.svelte`. Scroll target offset = cumulative top-offset of headers
  above (already available via the registry). Find the scroll ancestor at runtime
  (SSR-safe, inside `$effect`/event handler per D52 — no `$app/environment`).
- "Fully visible" + the smooth-vs-instant scroll behaviour are spec-writer's to define
  (respect `prefers-reduced-motion`).
</content>
