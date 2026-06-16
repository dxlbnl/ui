---
id: B66
title: Accordion sticky headers don't stack
type: bug
priority: high
flags: []
created: 2026-06-16
spec: wiki/specs/B66-accordion-sticky-stacking.md
---

## Description
In a sticky `Accordion`, the headers don't stack the way they should. As you scroll
down, the first header pins to the top correctly, but when the second header reaches
the top the first one **un-sticks and scrolls away** instead of staying pinned. The
intended behaviour is that **all** item headers stay visible at all times: each header
sticks to the top as you scroll past its body, and sticks to the bottom as you scroll
back up — so the complete set of headers is always on screen, stacked at the top and
bottom of the scroll viewport. This is the classic stacked-sticky-headers pattern.

## Notes
- Relates to the sticky registry from B59 (`Accordion.svelte` STICKY_CONTEXT_KEY /
  StickyRegistry) and `AccordionItem.svelte` top/bottom offset math.
- Root cause (manager triage): the B59 port wraps each section in a native `<details>`,
  so each sticky `<summary>`'s containing block is its own `<details>` — the header
  un-sticks when that `<details>` scrolls past. The reference (`_design-refs/B59/
  Accordion.jsx`) uses a flat structure where all headers are siblings of the accordion,
  sharing one containing block, so they tile. Offset math is already correct; fix is
  structural. spec-writer to choose mechanism + log decision.
