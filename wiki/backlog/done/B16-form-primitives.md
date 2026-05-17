---
id: B16
title: Form primitives
type: feature
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B16-form-primitives.md
---

## Description
Boolean and selection controls missing from the form layer. `Checkbox` (checked/indeterminate/disabled, linked label, design-token accent), `Radio` + `RadioGroup` (exclusive selection, keyboard arrow-key nav), `Switch` (toggle boolean, amber when on, SSR-safe). `Field` enhanced with auto-injected `aria-invalid` and `aria-describedby`.

## Notes
- commit: `40229b8`
