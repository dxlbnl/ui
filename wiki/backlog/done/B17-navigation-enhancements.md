---
id: B17
title: Navigation enhancements
type: feature
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B17-navigation-enhancements.md
---

## Description
Two deferred navigation features. `Breadcrumb`: `<nav aria-label="breadcrumb">` with `aria-current="page"` on the last item. `AnimatedAccordion`: smooth height transition using CSS `interpolate-size: allow-keywords` with `@starting-style` fallback, gated behind `@supports`.

## Notes
- commit: `180790d`
