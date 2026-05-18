---
id: B29
title: Checkbox shifts down on toggle
type: bug
priority: low
flags: []
created: 2026-05-17
---

## Description

Two visual issues with the Checkbox component:

1. **Layout shift on toggle** — The checkbox widget moves slightly downward when toggled (checked ↔ unchecked). Likely caused by the checked indicator changing the element's height or the outer wrapper's alignment shifting between states.

2. **Checkmark barely legible** — The checkmark (✓) inside the checked state is hard to read. Needs sufficient contrast against the checked background — either a thicker/bolder mark, a higher-contrast color, or an SVG checkmark instead of a unicode character.

## Acceptance criteria
- Checkbox occupies identical bounding box in checked and unchecked state.
- No visible layout shift when toggling.
- Checkmark is clearly legible at all supported sizes in both phosphor and paper palettes.
