---
id: B65
title: AccordionItem actions snippet
type: feature
priority: medium
flags: []
created: 2026-06-16
spec: wiki/specs/B65-accordionitem-actions-snippet.md
---

## Description
Add an optional `actions?: Snippet` prop to `AccordionItem` so a row can render inline
controls (e.g. buttons) in its summary header, laid out as `title … [actions] ›`. The
title hugs the left, the actions sit next to the chevron on the right. Clicking inside
the actions area must **not** toggle the accordion, and keyboard activation of a control
inside it must not toggle either. Sticky measurement is unchanged — the actions are just
extra content inside the same `<summary>` the ResizeObserver already measures.

## Notes
- Native `<summary>` toggles on click; `stopPropagation` alone won't prevent it. The
  actions wrapper needs `onclick={(e) => e.preventDefault()}` to cancel the default
  toggle. Detail belongs in the spec page.
