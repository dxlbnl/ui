---
id: B69
title: Taller sticky accordion demo wrappers (keep tests valid)
type: chore
priority: high
flags: []
created: 2026-06-16
---

## Description
The user increased the scroll-wrapper heights in `Accordion.sticky.stories.svelte`
from 160/200px to **300px** so Storybook shows more of the sticky stacking. Keep the
300px wrappers, but make the suite green again: the `StickyHeadersStackWhileScrolling`
story's `expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight)` sanity check
(line ~287) now fails (`300 not > 300`) because it runs before the open bodies finish
their `interpolate-size` height animation — at 160px the partial content already
overflowed, at 300px it doesn't yet.

## Notes
- Working tree already has the user's uncommitted 300px edits (+ a Prettier reflow) to
  `Accordion.sticky.stories.svelte`. Build on them; do NOT revert the 300px heights.
- Fix = robustness only: wrap the scrollHeight>clientHeight precondition (and anything
  that reads a settled `scrollHeight`, e.g. the scroll-to-bottom at line ~292) in
  `waitFor` so it waits for the open-body height animation to settle. Do NOT weaken the
  actual stacking assertions (AC-1..AC-4, AC-7) — they must still verify the same thing.
- Normalize formatting with the project's Prettier so the committed file is canonical
  (the user's editor reflow differs from the subagent-committed format).
- chore track: implementer → reviewer (no spec, no tests-first).
