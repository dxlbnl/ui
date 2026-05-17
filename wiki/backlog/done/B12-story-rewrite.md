---
id: B12
title: Story rewrite
type: chore
priority: medium
flags: []
created: 2026-05-16
spec: wiki/specs/B12-story-rewrite.md
---

## Description
Rewrite all `.stories.svelte` files to match the updated stories-guide pattern: `component:` in `defineMeta`, props via story `args`, slot for children only, inline play functions, accessible queries over `getByTestId`.

## Notes
- commit: `8158dff`
- Affects: B2 token stories, B3 layout stories, B4 primitive stories, B5 card stories.
