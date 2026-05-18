---
id: B34
title: Modal close button not in top-right corner
type: bug
priority: medium
flags: [review]
created: 2026-05-17
---

## Description

The Modal close (×) button is not positioned in the top-right corner of the modal. It should sit in the modal header, flush right, regardless of the modal's title content.

## Expected behavior
- Modal header: `display: flex; align-items: center; justify-content: space-between` (or equivalent)
- Title text: takes remaining space (`flex: 1`)
- Close button: `flex-shrink: 0`, visually in the top-right corner of the dialog

## Files
- `src/lib/components/feedback/Modal.svelte`
