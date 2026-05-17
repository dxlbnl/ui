---
id: B25
title: Layout primitive gap API
type: feature
priority: high
flags: []
created: 2026-05-17
spec: wiki/specs/B25-layout-gap-api.md
---

## Description
Consistent `gap` API across all three layout primitives. Add `gap` prop to `Spread` (currently hardcodes `var(--u2)`; default `none` so existing callers are unaffected). Fix `md` mapping in `Stack` and `Inline` from `--u2` (16px, duplicate of `sm`) to `--u3` (24px). Update all callers using `style="gap: 24px"` to `gap="md"`.

## Notes
- spec written: `wiki/specs/B25-layout-gap-api.md`
- Gap scale: none=0 / xs=8 / sm=16 / md=24 / lg=32 / xl=40
