---
id: B61
title: Storybook UI crashes — stories import vi from vitest
type: bug
priority: high
flags: []
created: 2026-06-14
---

## Description
The Storybook dev UI (`storybook dev -p 6006`) crashes with `TypeError: Cannot read
properties of undefined (reading 'customEqualityTesters')` when a story's play function
runs. Root cause: three story files do `import { vi } from "vitest"`, which pulls
vitest's chai/expect setup into the bare Storybook browser, where vitest's global state
is absent. `pnpm test` stays green (the vitest runner initialises that state), so the
bug is invisible to the test suite but breaks the interactive Storybook UI.

Fix: use the house pattern — `fn` from `storybook/test` (works in both the vitest runner
and the Storybook UI), as StatusPill/Gauge already do. No story should import from the
bare `vitest` package.

## Notes
- Affected files: `src/lib/components/navigation/Nav.stories.svelte` (pre-existing, B49-era),
  `src/lib/components/feedback/Popover.stories.svelte` (B56), `src/lib/components/forms/SegmentedControl.stories.svelte` (B51).
- Reported by user 2026-06-14 mid-run (B52). Mechanical swap; regression guard = no `from "vitest"` in any story.
