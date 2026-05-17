---
id: B14
title: Typography primitives
type: feature
priority: medium
flags: []
created: 2026-05-16
spec: wiki/specs/B14-typography-primitives.md
---

## Description
`Text` (variant: body/lede/mono/eyebrow, color prop maps to design tokens, polymorphic `as` prop) and `Heading` (level: 1–6, variant: display/hero/h1/h2/h3, same color prop). Zero-CSS components wrapping existing global typography classes.

## Notes
- commit: `3396103`
- Enables higher-order components to eliminate their scoped typography CSS entirely.
