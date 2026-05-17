---
id: B15
title: Keyboard navigation
type: feature
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B15-keyboard-navigation.md
---

## Description
Full ARIA keyboard patterns for the two interactive widgets that currently lack them. `Select`: ARIA listbox pattern (WAI-ARIA 1.2). `Tabs`: WAI-ARIA tabpanel pattern. Both are WCAG 2.1 AA requirements.

## Notes
- commit: `64bbe74`
- Select: arrow keys cycle options, Home/End jump to first/last, Escape closes, Enter confirms.
- Tabs: left/right arrow moves focus and activates panel, Home/End jump to first/last.
