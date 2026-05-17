---
id: B22
title: Modal story improvements
type: bug
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B22-modal-story-improvements.md
---

## Description
Modal stories rendered with `open: true` caused overlapping modals on the Storybook docs page. Each story now shows a trigger `<Button>` that opens the modal, so the docs page is clean and interaction is realistic. Play functions click the trigger to open first, then test close paths.

## Notes
- commit: `a7f1a03`
- `open` prop default stays `false`; story manages state internally via `$state`.
