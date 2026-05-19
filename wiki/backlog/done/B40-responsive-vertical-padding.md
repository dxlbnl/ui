---
id: B40
title: "Regression — PageHero and Container have no mobile-responsive vertical padding"
type: bug
priority: medium
flags: []
created: 2026-05-19
spec: wiki/specs/B40-responsive-vertical-padding.md
---

## Description

Affects every page that uses `<PageHero>` or `<Container>`. The horizontal
side padding on Container is already responsive (32px → 16px at ≤720px),
but vertical padding on both components is fixed at all viewport sizes.

On a mobile viewport that's tight: 80px of top padding on PageHero plus
80px of bottom padding on `Container size="lg"` eats ~160px of vertical
real estate before any content shows.

Production for the equivalent surfaces uses lighter vertical padding on
mobile (e.g. `/legal/` dropped its bottom wrap padding from 80px to 56px
at ≤720px; the heading had no top padding because the nav abutted it).

## Notes

- Approach: add `@media (max-width: 720px)` padding overrides to PageHero.svelte and Container.svelte. Full fix values in spec.
- D42 applies — visual-only CSS; test-writer skipped.
- Spec: wiki/specs/B40-responsive-vertical-padding.md
