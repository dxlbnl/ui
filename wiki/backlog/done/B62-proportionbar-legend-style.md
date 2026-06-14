---
id: B62
title: ProportionBar legend — broken gap token + missing mono label styling
type: bug
priority: high
flags: []
created: 2026-06-14
---

## Description
The ProportionBar legend doesn't match the design (reported by user 2026-06-14 from the
live Storybook). Two CSS defects in `src/lib/components/patterns/ProportionBar.svelte`:

1. `.legend li { gap: var(--u1) }` uses `--u1`, which **does not exist** (the scale is
   `--u`=8px, `--u2`=16px, …). The invalid declaration collapses the gap to 0, so the
   swatch, label, and value caption sit flush together with no space.
2. The legend text (`.legend-label`, `.value-label`) sets no `font-size`/`letter-spacing`,
   so it renders in the ~16px body font instead of the design's 11px mono micro-label.

Fix to match the house mono-micro-label convention (see `StatusPill.svelte`: `var(--mono)`,
`font-size: 11px`, `letter-spacing: 0.08em`) and the vendored reference
`wiki/specs/_design-refs/B53/ProportionBar.jsx` (swatch↔label↔value gap, uppercase label).

Visual-only (D42) — no play-fn assertions; the existing ProportionBar suite must stay green.

## Acceptance criteria
- AC1: `.legend li` gap uses a valid token (`var(--u)` = 8px), restoring visible space
  between swatch, label, and value caption.
- AC2: `.legend-label` and `.value-label` use `font-size: 11px` (matching StatusPill);
  `.legend-label` keeps uppercase + `var(--mono)` and gains `letter-spacing: 0.08em`.
- AC3: No `var(--u1)` (or any undefined token) remains in the file.
- AC4: `pnpm test` stays green (335/335 for the ProportionBar-inclusive suite) and
  `pnpm check` 0 errors. No other component changed.

## Notes
- Visual regression from B53. Root cause: `--u1` typo + missing label typography.
