---
id: B56
title: Popover component
type: feature
priority: high
flags: []
created: 2026-06-14
spec: wiki/specs/B56-popover.md
---

## Description
Port the new `Popover` component from the design system into `@dxlbnl/ui`. A floating
panel anchored to a trigger, dismissible on outside click / Escape (reuse the existing
outside-click pattern from Nav/B49 where sensible). Mirror the design-system variant
matrix and ship Storybook stories.

## Notes
- Design-system source: `preview/23-components-popover.html` + `ui_kits/components/Popover.jsx` (project `019e2ba0-3718-7b29-a57c-74c21ba1f2c1`). Reference only — library is canonical.
