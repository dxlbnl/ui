---
id: B35
title: Toast should render an Alert internally
type: feature
priority: medium
flags: [review]
created: 2026-05-17
---

## Description

The Toast component currently renders its own visual chrome independently of the Alert component. Toast should delegate its visual representation to `<Alert>` — each toast item becomes an `<Alert tone={toast.tone}>` with the toast message. This ensures visual consistency (same border, icon, color treatment) across both persistent alerts and transient toasts.

## Scope
- `Toast.svelte` renders `<Alert tone={…}>` for each toast item
- ToastRegion and toast store remain unchanged (behavior is the same)
- Toast-specific chrome (dismiss button, timeout indicator) wraps around or extends Alert
- Stories for ToastRegion should demonstrate working dismiss + auto-dismiss behavior (currently reported as "not very functional")

## Dependencies
- **Alert component does not exist yet** — needs to be built first (add `src/lib/components/feedback/Alert.svelte`) before Toast can use it. Alert should be its own backlog item or built as part of this one.

## Files
- `src/lib/components/feedback/Toast.svelte`
- `src/lib/components/feedback/ToastRegion.svelte`
- `src/lib/components/feedback/toast.ts`
