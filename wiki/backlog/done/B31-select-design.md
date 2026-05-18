---
id: B31
title: Select design overhaul — remove amber option boxes
type: bug
priority: high
flags: []
created: 2026-05-17
spec: wiki/specs/B31-select-design.md
---

## Description

The Select component does not match the design. The options dropdown has amber/orange boxes around each option, which is incorrect. Select styling should follow the same ink/rule pattern as other form controls — plain background, ink text, `var(--rule)` borders, `var(--bg-dim)` hover, amber underline on active/selected only.

## Expected behavior
- Options dropdown: `background: var(--bg)`, `border: 1px solid var(--rule)`
- Option hover state: `background: var(--bg-dim)` (no amber fill)
- Selected option: text `color: var(--ink)` with amber indicator (border-left or text color accent), not amber background box
- Overall chrome matches Input appearance (mono font, same padding, same border)

## Files
- `src/lib/components/forms/Select.svelte`
- `src/lib/components/forms/Select.stories.svelte`
