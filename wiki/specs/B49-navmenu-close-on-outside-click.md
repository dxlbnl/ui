# B49: Nav menu closes on outside click

## Context

The mobile nav menu is a native `<details class="nav-menu">` with a `<summary>`
toggle (see `Nav.svelte` ~lines 122-139). Native `<details>` only closes when the
user re-activates its `<summary>` — it does **not** close when the user clicks
elsewhere on the page. So once the dropdown is open it stays open until the user
finds and clicks the summary again, which feels broken: dismiss-by-clicking-away is
the expected behaviour for any open overlay/dropdown.

This item adds outside-click (and Escape) dismissal to the existing `<details>`-based
menu, without changing its open/close mechanics for in-menu interactions. It is a
behaviour-only bug fix; markup, CSS, breakpoints, and the palette/breadcrumb logic
from B28/B48 are unchanged.

The `<details>` element only renders when `links?.length` is truthy (B28 AC-15/16);
all acceptance criteria below assume `links` is non-empty so the `<details>` exists.

Relevant pages:
- [vision.md](../vision.md), [requirements.md](../requirements.md) — R5 (Navigation)
- [architecture.md](../architecture.md) — SSR-safe constraint, Svelte 5 runes, story-as-test harness
- [composition-limits.md](../composition-limits.md) — `<details>`/`<summary>` is a documented genuine exception
- [decisions.md](../decisions.md) — D7 (SSR-safe via `$effect` + `browser` guard), D16 (native `<details>`), D38 (primitives first), D1 (tests = Story play functions)
- [specs/B28-nav-overhaul.md](B28-nav-overhaul.md) — established the `<details>`-based menu; click-outside was explicitly listed as out of scope there (now this item)
- [specs/B48-nav-controlled-palette.md](B48-nav-controlled-palette.md) — current Nav prop interface
- Item card: [wiki/backlog/doing/B49-navmenu-close-on-outside-click.md](../backlog/doing/B49-navmenu-close-on-outside-click.md)

### Test-harness note

Tests are Storybook play functions run via `@storybook/addon-vitest` (Vitest browser
mode). The menu's *visibility* depends on a `@media (max-width: 720px)` CSS rule and
the Storybook test viewport is wider than that, so `display:none` would make the
`<details>` not visible. **However the `<details>` element and its `open` attribute
exist in the DOM regardless of viewport.** All ACs below target the `open` attribute /
element state and dispatch real DOM events, so they are verifiable without resizing
the viewport or relying on the media query. Open the menu in tests by calling
`details.open = true` (or `setAttribute('open', '')`) and dispatching a `toggle` event
if the implementation relies on it; assert the `open` attribute is removed after the
dismiss interaction.

---

## Acceptance criteria

Assume a Nav rendered with a non-empty `links` array (so `<details class="nav-menu">`
exists in the DOM). Let `details` be that element.

### AC-1 — Outside click closes the open menu

1. When `details` is open (`details.open === true`) and a `pointerdown`/`click`
   occurs on an element **outside** `details` (e.g. `document.body`, the `<nav>`
   brand link, or any element not contained by `details`), the menu closes:
   `details.open` becomes `false` and the `open` attribute is removed.
2. The close is driven by the document-level dismiss handler, not by the user
   re-clicking the summary. (Verifiable: dispatch the outside event on an element
   that is not the summary and assert `details.open === false`.)

### AC-2 — Clicks inside the open menu do NOT close it

3. When `details` is open and a `pointerdown`/`click` occurs on an element **inside**
   `details` other than the summary — e.g. a `.nav-dropdown` area or a
   `.nav-dropdown-link` anchor — the menu stays open: `details.open` remains `true`.
   (A link click that triggers navigation is out of scope for the harness; the test
   may use a non-navigating target inside the dropdown, or assert state synchronously
   before any navigation.)
4. A `pointerdown`/`click` on the `<summary class="nav-summary">` itself does NOT
   trigger the outside-click handler's close path (the summary's native toggle owns
   that interaction — see AC-3).

### AC-3 — Summary still toggles natively

5. Activating the summary when the menu is closed opens it (`details.open` goes
   `false → true`), exactly as before this change.
6. Activating the summary when the menu is open closes it (`details.open` goes
   `true → false`), exactly as before this change. The outside-click logic must not
   double-toggle (i.e. a single summary activation that closes the menu must not also
   leave it re-opened, and a single activation that opens it must not be immediately
   closed by the same event being treated as "outside").

### AC-4 — Escape closes the open menu

7. When `details` is open and a `keydown` with `key === 'Escape'` is dispatched
   (on `document`, or on the focused menu element), the menu closes: `details.open`
   becomes `false`.
8. When `details` is closed, an Escape `keydown` is a no-op (does not throw, does not
   open the menu).

> Escape-to-close is included because it is idiomatic for dismissible overlays and is
> cheap to implement alongside the same `$effect`-managed listener. If the implementer
> finds Escape materially complicates the listener lifecycle, see OQ-1 — but the
> default expectation is that it is in scope.

### AC-5 — SSR-safe listener lifecycle

9. Any `document`/`window` event listener used for outside-click or Escape dismissal
   is attached and detached **inside an `$effect`** (and/or guarded by the `browser`
   flag from `$app/environment`). No `document`/`window` access occurs in the
   synchronous render path (per D7).
10. The `$effect` returns a cleanup function that removes every listener it added, so
    the listeners are detached when the component unmounts. (Code-inspection criterion;
    the reviewer confirms a teardown returns from the `$effect`.)
11. There is no listener leak across open/close cycles: opening, closing, and
    re-opening the menu repeatedly does not accumulate handlers that each fire (e.g.
    a single outside click after multiple open/close cycles still results in exactly
    one close, with no errors). The implementer may either (a) keep one always-on
    document listener that early-returns when the menu is closed, or (b) attach the
    listener only while open and detach on close — either is acceptable provided no
    duplicate handlers persist.

### AC-6 — No regressions

12. All pre-existing `Nav.stories.svelte` stories continue to pass without
    modification to their `play` functions (Default, No Links, With Breadcrumbs,
    Breadcrumbs Only No Links, Custom Site Name, Palette Toggle, Active Link Styling,
    Mobile Menu Details, Controlled Palette Phosphor/Paper/Glyphs, In-flow Nav, Custom
    MaxWidth, Mixed Mode Palette Only, Mixed Mode Callback Only).
13. The "No Links" case is unaffected: when `links` is empty no `<details>` exists, and
    the dismiss `$effect` must not throw (it must tolerate the menu element being
    absent — e.g. guard on the bound element being defined).
14. The palette toggle, breadcrumb, and `sticky`/`maxWidth` behaviour are unchanged.
15. `pnpm check` passes with zero TypeScript errors.
16. `pnpm test` passes all story play functions with no failures and no a11y
    violations.
17. Svelte 5 runes exclusively (`$props`, `$state`, `$derived`, `$effect`). No
    `export let`, no `onMount`, no Svelte 4 lifecycle APIs. No hardcoded hex/RGB color
    values introduced.

---

## Implementation notes (non-binding)

These guide the implementer; the ACs above are the contract.

- Bind the element: `let menuEl = $state<HTMLDetailsElement>()` with
  `<details bind:this={menuEl}>`.
- In an `$effect`, when `browser` is true, attach `pointerdown` (or `click`) and
  `keydown` listeners on `document`. The handler checks `menuEl?.open` and, for
  pointer events, `!menuEl.contains(event.target as Node)` before setting
  `menuEl.open = false`. Return a cleanup that removes both listeners.
- Using `pointerdown` rather than `click` gives a snappier dismiss and avoids
  ordering issues with the summary's own click toggle; either satisfies the ACs as
  long as a summary activation does not get treated as an outside click (it is inside
  `details`, so `contains` returns true).

---

## Out of scope

- **Route-change auto-close** — closing the menu on navigation/`$page` change. The
  design-system Nav does not consume `$page` (consistent with B28); out of scope.
- **Focus management / focus trap** — moving focus into the dropdown on open or
  restoring it on close. Not part of this bug.
- **Open/close animation** — the `<details>` opens/closes without animation (B28).
- **Closing on link click** — a dropdown link click that navigates will unmount the
  Nav anyway in real usage; explicit "close on link click" is not required here.
- **Viewport/media-query validation** — tests do not resize the Storybook viewport;
  ACs target the `open` attribute and DOM events, not the 720px display rule.
- **Changes to markup, CSS, breakpoints, palette, or breadcrumb logic** — purely
  additive dismiss behaviour.

---

## Open questions

### OQ-1 (non-blocking): Escape-to-close inclusion

Escape dismissal (AC-4) is included as the default expectation because it shares the
same `$effect`-managed listener lifecycle and is idiomatic. It is not strictly part of
the literal bug report ("clicking outside"). If the implementer or reviewer judges it
should be deferred, drop AC-4 and AC-7/8 — but this is not expected to be necessary.
Not blocking.

### OQ-2 (non-blocking): pointerdown vs click

Whether the outside-dismiss listens on `pointerdown` or `click` is left to the
implementer (see Implementation notes). The ACs are written to accept either. Not
blocking.

No blocking open questions.
