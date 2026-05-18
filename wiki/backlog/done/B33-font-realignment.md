---
id: B33
title: Typography realignment with OG design system
type: bug
priority: high
flags: [review]
created: 2026-05-17
spec: wiki/specs/B33-font-realignment.md
---

## Description

Fonts appear to have been corrupted/shifted during the B26 typography fixes. The Modal is one reported breakage. The design system must be realigned with the reference at `~/Projects/Web/dxlb-design/dexterlabs-design-system/project/colors_and_type.css`.

## Scope of review
- Compare `src/lib/tokens.css` (and any font-stack / `--t-*` variable definitions) against `dexterlabs-design-system/project/colors_and_type.css`
- Check Modal specifically — heading size, body size, line-height, letter-spacing
- Check Text / Heading primitive `size` prop output vs expected token values
- Identify any font-size, line-height, letter-spacing, or font-family regressions introduced in B26

## Reference
- `~/Projects/Web/dxlb-design/dexterlabs-design-system/project/colors_and_type.css`
- `src/lib/tokens.css`
- `src/lib/components/feedback/Modal.svelte` (reported breakage)

## Notes
This item requires a research/audit pass first — spawn a researcher to diff the two token files and enumerate all mismatches, then implement fixes.
