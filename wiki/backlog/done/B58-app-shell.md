---
id: B58
title: AppShell component
type: feature
priority: high
flags: []
created: 2026-06-14
spec: wiki/specs/B58-app-shell.md
---

## Description
Port the new `AppShell` component from the design system into `@dxlbnl/ui`. A full
application layout frame (header / sidebar / main content regions) that other content
slots into. Architecturally significant — composes layout primitives and Nav. Mirror the
design-system reference and ship Storybook stories.

## Notes
- Design-system source: `preview/32-components-app-shell.html`, `ui_kits/components/AppShell.jsx`, `ui_kits/app/index.html` (project `019e2ba0-3718-7b29-a57c-74c21ba1f2c1`). Reference only — library is canonical.
