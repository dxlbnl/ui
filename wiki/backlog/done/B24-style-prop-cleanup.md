---
id: B24
title: Style prop cleanup
type: chore
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B24-style-prop-cleanup.md
---

## Description
Eliminate excessive inline `style=` props introduced during B13–B14. Two classes of fix: (1) use correct Heading `variant` so typography overrides collapse to one prop; (2) replace multi-prop `style=` on layout primitives acting as containers with scoped HTML elements + scoped CSS. No `:global()` introduced.

## Notes
- commit: `eee6862`
