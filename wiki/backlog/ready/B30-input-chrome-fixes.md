---
id: B30
title: Input chrome fixes — number arrows, clearable color, icon color
type: bug
priority: medium
flags: []
created: 2026-05-17
---

## Description

Three visual issues in Input and its composition examples:

1. **Number input white arrow buttons** — `<input type="number">` shows browser-native spin buttons that are white (visible against dark backgrounds). Should be hidden with `::-webkit-inner-spin-button, ::-webkit-outer-spin-button { display: none }` or styled to use ink colors.

2. **Clearable ×-button is amber** — The clear button icon/color currently uses `var(--amber)`. It should use `var(--ink-dim)` (or similar ink token) to match the input chrome style.

3. **Composition icon is black** — The leading icon in Input.composition stories renders black. Should use `var(--ink-dim)` or `color: inherit` so it follows the ink color in both palettes.

## Files
- `src/lib/components/forms/Input.svelte`
- `src/lib/components/forms/Input.stories.svelte` (composition story)
