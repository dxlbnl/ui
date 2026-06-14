---
id: B59
title: Accordion sticky-header behaviour
type: feature
priority: high
flags: []
created: 2026-06-14
spec: wiki/specs/B59-accordion-sticky-headers.md
---

## Description

Fold the design system's `StickySections` behaviour into the existing `Accordion`
component: when scrolling through an open accordion, section headers stick to the top of
the scroll container until the next header pushes them out. An opt-in prop on Accordion
(not a new component). Update/extend Accordion's Storybook stories to cover the sticky mode.

## Notes

- Design-system source: `preview/31-components-accordion.html` + `ui_kits/components/StickySections.jsx` (project `019e2ba0-3718-7b29-a57c-74c21ba1f2c1`). Reference only.
- Enhancement to existing `src/lib/components/data/Accordion.svelte` / `AccordionItem.svelte` — do not add a standalone StickySections component (per user direction 2026-06-14).
