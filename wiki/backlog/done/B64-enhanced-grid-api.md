---
id: B64
title: Enhanced Grid API — template, stackBelow, align
type: feature
priority: medium
flags: [review]
created: 2026-06-15
spec: wiki/specs/B64-enhanced-grid-api.md
---

## Description
Today's `Grid` only does symmetric `cols={1|2|3|4|'auto'}`. Downstream apps need
asymmetric track lists (e.g. `minmax(min-content, 0.9fr) minmax(0, 1.1fr)`), a way to
collapse *any* layout to one column at a breakpoint, and `align-items` control. Add these
as a backward-compatible superset so existing `cols` / `gap` / `minColWidth` usage is
untouched, then promote upstream into the lib.

## Notes
- Direction #1 (constrained Grid + labelled escape hatch). Intent primitives (Split/Sidebar) parked.
- `stackBelow` MUST be container-query-native + tokenized — not viewport `useMediaQuery`
  (that regresses B42's container-query model and adds JS + an SSR layout flash). Design analysis in chat 2026-06-15.
- Also fix the latent gap bug: `gapMap.md` duplicates `sm` (both `--u2`); `md` should be `--u3` (the B25 fix never reached Grid).
- Backward-compatible: every existing B42 AC + the `Grid.collapse.stories.svelte` tests must still pass.
- Spec: wiki/specs/B64-enhanced-grid-api.md
