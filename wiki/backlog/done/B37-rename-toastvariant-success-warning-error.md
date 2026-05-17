---
id: B37
title: Rename ToastVariant to success/warning/error for semantic consistency
type: chore
priority: medium
flags: []
created: 2026-05-17
---

## Description
The current `ToastVariant` values (`ok`, `amber`, `danger`) mix a semantic name, a colour name, and a state name — inconsistent with each other and with the `Alert` component's `ok/amber/danger/info` palette. Rename to `success | warning | error` across `toast.ts`, `Toast.svelte`, `Toast.stories.svelte`, and any callers, so variant names read as user-facing intent rather than design tokens.

## Notes
