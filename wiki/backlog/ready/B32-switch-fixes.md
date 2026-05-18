---
id: B32
title: Switch — dark mode invisible when off + label click doesn't toggle
type: bug
priority: medium
flags: []
created: 2026-05-17
---

## Description

Two bugs in the Switch component:

1. **Invisible in dark mode (off state)** — When the switch is off and dark mode (phosphor palette) is active, the switch track/thumb is not visible. The off-state track needs a visible `border` or `background` that contrasts against dark backgrounds (use `var(--rule)` or `var(--ink-faint)` rather than a solid color that disappears on dark).

2. **Label click doesn't toggle** — Clicking the label text next to the switch does not toggle the switch state. The `<label>` wrapping or `for`/`id` association must be correct so click events on the label activate the underlying `<input type="checkbox">`.

## Files
- `src/lib/components/forms/Switch.svelte`
