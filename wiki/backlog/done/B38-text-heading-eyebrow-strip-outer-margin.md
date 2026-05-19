---
id: B38
title: Strip outer margins from all components (consumer owns spacing)
type: bug
priority: medium
flags: []
created: 2026-05-19
spec: wiki/specs/B38-strip-outer-margins.md
---

## Description

Primitive and pattern components should never apply their own outer margins —
outer spacing belongs to the consumer (the layout primitive's `gap`, or the
calling page). Surfaced when the `Text` eyebrow variant's `margin-bottom`
forced vertical spacing onto the consumer; on inspection this is likely not
the only offender.

Audit **every component** (`primitives/`, `cards/`, `navigation/`, `forms/`,
`feedback/`, `patterns/`, `data/`) for outer-margin offenders — any
`margin`, `margin-top`, `margin-bottom`, `margin-left`, `margin-right`, or
shorthand on the root element of a component. Strip them. Restore intended
spacing at call sites via `Stack`/`Inline`/`Spread` `gap`, or via the parent
pattern's own layout.

In-scope margin sources to grep:

- Component `<style>` blocks (root selector and any rule that lands on the root)
- Global typography classes (`typography.css`) that are applied to component roots
- Token-driven margins propagated via custom properties

Out of scope: internal padding/margin between a component's *own* children (e.g.
`Card.Body` padding, list-item gaps). The rule is strictly about the **outermost
box** the component renders.

## Notes

- Surfaced during the `/order/cancel/` regression migration where the eyebrow's
  `margin-bottom: 16px` conflicted with the target `12px` set by the parent layout.
- Principle: primitives have no outer spacing; only inner padding when structural.
- Spec-writer should produce a per-component checklist (before/after) so the
  test-writer can assert `getComputedStyle(root).marginTop/right/bottom/left === '0px'`
  for each component in its existing stories.
