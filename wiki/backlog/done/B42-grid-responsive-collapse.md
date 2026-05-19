---
id: B42
title: "Regression — Grid has no responsive collapse"
type: bug
priority: high
flags: []
created: 2026-05-19
spec: wiki/specs/B42-grid-responsive-collapse.md
---

## Description

`<Grid cols={2}>` (or 3 / 4) keeps its column count at every viewport size.
On narrow viewports — phones, sidebars, narrow containers — a two-column
layout of body text becomes unreadable: each column ends up ~150–180px wide.

Production for the equivalent surface (`/about/`) used a container query to
collapse the grid:

```css
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  @container (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
```

Container queries work because `<Container>` already sets
`container-type: inline-size` on its wrapper. So an `@container` rule
inside `<Grid>` is the right vehicle for this collapse — it tracks the
parent Container, not the viewport, which is exactly what we want for
nested layouts.

## Notes

- Approach: move `grid-template-columns` off inline style into `--grid-cols` CSS custom property; add `data-cols` attribute; add `@container` collapse rules (900px: 3/4→2; 720px: 2/3/4→1). Full 18-AC spec in spec file.
- Asymmetric grids (`60px 1fr`, etc.) are explicitly out of scope — separate primitives.
- Collapse stories go in `Grid.collapse.stories.svelte` (no `component:` in `defineMeta`).
- Spec: wiki/specs/B42-grid-responsive-collapse.md
