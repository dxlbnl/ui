---
id: B18
title: Toast notifications
type: feature
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B18-toast-notifications.md
---

## Description
Transient notification system: `Toast` component (icon + message, ok/amber/danger variants, auto-dismiss, manual close) rendered in a `ToastRegion` portal. SSR-safe, ARIA `role="status"` / `role="alert"`, stack of up to N toasts.

## Notes
- commit: `eefc8b5`
- Distinct from `Alert` (which is static and inline).
