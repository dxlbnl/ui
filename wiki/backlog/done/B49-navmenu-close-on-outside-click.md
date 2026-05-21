---
id: B49
title: Navmenu should close when clicking outside of it
type: bug
priority: high
flags: []
created: 2026-05-21
spec: wiki/specs/B49-navmenu-close-on-outside-click.md
---

## Description
When the nav menu is open, clicking anywhere outside the menu should close it.
Currently the menu stays open until the toggle (or another in-menu control) is used,
which feels broken — dismissing by clicking away is expected behavior.

## Notes

### test-writer (2026-05-21)
Added 4 new `<Story>` play functions to `src/lib/components/navigation/Nav.stories.svelte`
(no existing stories modified, satisfying AC-12):
- `Dismiss On Outside Click` — AC-1 regression test. RED today.
- `Keep Open On Inside Click` — AC-2. Passes today (native `<details>` already keeps
  open on inside clicks); a guard against the fix over-closing.
- `Summary Native Toggle` — AC-3. Passes today (native summary toggle); a guard against
  double-toggle regression.
- `Dismiss On Escape` — AC-4. RED today.

Strategy: open the menu via `details.open = true` + a dispatched `toggle` event
(viewport-independent per spec harness note), then dispatch real DOM events
(`PointerEvent`/`MouseEvent` for outside click — both, per OQ-2; `KeyboardEvent` for
Escape) on `document.body`/`document`, asserting end state `details.open`. AC-5
(listener lifecycle / SSR-safety / no leaks) is a code-inspection criterion for the
reviewer, not script-testable here. Test command: `pnpm test`. `pnpm check` is clean.
