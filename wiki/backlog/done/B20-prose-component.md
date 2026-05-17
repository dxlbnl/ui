---
id: B20
title: Prose component
type: feature
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B20-prose-component.md
---

## Description
`Prose` wrapper that applies design-system typography to raw HTML rendered by mdsvex or any markdown processor. Targets dynamically inserted children via `.prose :global(element)`. Polymorphic `as` prop (default `article`). All styles use design tokens — both palettes work automatically.

## Notes
- commit: `fe54444`
- Styles: h1–h4, p, a, ul/ol/li, code, pre, blockquote, table, img, hr. Max prose width ~72ch.
