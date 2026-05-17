---
id: B13
title: Composition refactor
type: chore
priority: medium
flags: []
created: 2026-05-16
spec: wiki/specs/B13-composition-refactor.md
---

## Description
Replace all raw flex/grid layout CSS in higher-order components with Stack, Inline, Spread layout primitives. Replace all raw `<button>` elements with the Button primitive (ARIA attributes forward via `{...rest}`).

## Notes
- commit: `038ed7e`
- Affects all pattern, card, nav, feedback, form, and data components.
- Exceptions: AccordionItem (`<summary>` semantic), Table (semantic table HTML), Card.svelte (base card primitive).
