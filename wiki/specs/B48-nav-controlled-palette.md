# B48: Nav controlled palette mode + layout escape hatches

## Context

The library `Nav` currently owns palette state internally: it reads/writes
`localStorage` under `dxlb-palette` and mutates `data-palette` on `<html>`.
That works for simple consumers but breaks the dexterlabs.nl website, which runs
a richer SSR palette system (`hooks.server.ts` reads a cookie to set `data-palette`
during SSR; `theme.svelte.ts` writes both localStorage and the cookie). Using the
library Nav there causes a desync between its internal `$state` and the app's
`getPalette()` rune, and it loses the no-flash SSR guarantee.

This item adds a **controlled mode**: when the consumer supplies both `palette`
and `onPaletteToggle`, Nav renders the toggle but does not own state — it just
reflects and calls back. When neither is provided, the existing uncontrolled
behaviour is unchanged.

Two layout escape hatches are also added: `sticky` (controls `position: fixed` vs
in-flow) and `maxWidth` (overrides the hardcoded `1200px` inner row constraint).

Relevant pages:
- [vision.md](../vision.md), [requirements.md](../requirements.md) R5, R11
- [architecture.md](../architecture.md) — SSR-safe constraint, Svelte 5 runes
- [decisions.md](../decisions.md) — D7 (SSR-safe palette persistence), D38 (primitives first), D42 (no play-fn for visual-only), D45 (native CSS nesting)
- Item card: [wiki/backlog/doing/B48-nav-controlled-palette.md](../backlog/doing/B48-nav-controlled-palette.md)

---

## Acceptance criteria

### Prop interface

**AC-1.** `Nav.svelte` exports an updated `Props` interface that includes:

```ts
palette?: 'phosphor' | 'paper'
onPaletteToggle?: () => void
sticky?: boolean
maxWidth?: string
```

All four props are optional. Existing props (`links`, `siteName`, `breadcrumbs`,
`...rest`) are unchanged and continue to work.

---

### Controlled palette mode (both `palette` and `onPaletteToggle` provided)

**AC-2.** When `palette="phosphor"` and `onPaletteToggle` are both provided, the
toggle button renders the glyph `◐` (light-mode icon, meaning "currently dark").

**AC-3.** When `palette="paper"` and `onPaletteToggle` are both provided, the
toggle button renders the glyph `◑` (dark-mode icon, meaning "currently light").

**AC-4.** Clicking the toggle button in controlled mode calls `onPaletteToggle`
exactly once per click.

**AC-5.** Clicking the toggle button in controlled mode does NOT write to
`localStorage` (i.e. `localStorage.getItem('dxlb-palette')` is unchanged after the
click).

**AC-6.** Clicking the toggle button in controlled mode does NOT mutate
`document.documentElement.getAttribute('data-palette')` directly (i.e. the value
is unchanged immediately after the click, before any parent-driven re-render).

**AC-7.** The glyph updates reactively when the `palette` prop changes from the
outside without any click — e.g. changing `palette` from `'phosphor'` to `'paper'`
causes the button to switch from `◐` to `◑`.

---

### Uncontrolled palette mode (neither `palette` nor `onPaletteToggle` provided)

**AC-8.** When neither `palette` nor `onPaletteToggle` is provided, the existing
Storybook "Palette Toggle" story continues to pass without modification:
- Before a click, `document.documentElement.getAttribute('data-palette')` is some
  value.
- After one click it changes to the opposite value.
- `localStorage.getItem('dxlb-palette')` matches the new `data-palette` value.
- After a second click both are restored to the original.

**AC-9.** When neither `palette` nor `onPaletteToggle` is provided, the initial
`$effect` in Nav still reads `localStorage` on mount and initialises the internal
palette state and `data-palette` attribute (D7 behaviour unchanged).

---

### Mixed mode (only one of the two props provided)

**AC-10.** When only `palette` is provided (no `onPaletteToggle`), Nav behaves as
uncontrolled: clicking the toggle writes localStorage and mutates `data-palette`
exactly as in uncontrolled mode. The `palette` prop value is ignored as a control
signal.

**AC-11.** When only `onPaletteToggle` is provided (no `palette`), Nav behaves as
uncontrolled: clicking the toggle writes localStorage and mutates `data-palette`,
and `onPaletteToggle` is NOT called. The partial prop is ignored.

---

### `sticky` prop

**AC-12.** When `sticky` is not provided, `Nav` defaults to `sticky={true}`.
The rendered `<nav>` element has `position: fixed` (current default behaviour
is preserved). The existing "Default" story assertion `getComputedStyle(nav).position === 'fixed'` continues to pass.

**AC-13.** When `sticky={false}` is passed, the rendered `<nav>` element has
`position: relative` (or `static`) — it is rendered in normal document flow, not
fixed.

**AC-14.** When `sticky={true}` is passed explicitly, the rendered `<nav>` element
has `position: fixed`, identical to the default.

---

### `maxWidth` prop

**AC-15.** When `maxWidth` is not provided, the `.nav-inner` element has
`max-width: 1200px` (current default behaviour is preserved). The existing
"Default" story continues to pass.

**AC-16.** When `maxWidth="none"` is passed, the `.nav-inner` element has
`max-width: none` (the inner row spans the full container width).

**AC-17.** When an arbitrary CSS length string is passed, e.g. `maxWidth="960px"`,
the `.nav-inner` element has `max-width: 960px`.

**AC-18.** The `maxWidth` prop is applied via a CSS custom property or inline
`style` on `.nav-inner` — it must not be hardcoded in the scoped `<style>` block in
a way that would prevent runtime overrides.

---

### Existing stories regression

**AC-19.** All pre-existing stories in `Nav.stories.svelte` ("Default", "No Links",
"With Breadcrumbs", "Breadcrumbs Only No Links", "Custom Site Name", "Palette
Toggle", "Active Link Styling", "Mobile Menu Details") continue to pass without
modification to their `play` functions.

---

### New Storybook stories required

**AC-20.** A new story "Controlled Palette Phosphor" passes `palette="phosphor"` and
an `onPaletteToggle` spy. Its `play` function asserts:
- The toggle button shows `◐`.
- Clicking the button calls the spy once.
- `localStorage.getItem('dxlb-palette')` is unchanged after the click.
- `document.documentElement.getAttribute('data-palette')` is unchanged immediately
  after the click.

**AC-21.** A new story "Controlled Palette Paper" passes `palette="paper"` and an
`onPaletteToggle` spy. Its `play` function asserts:
- The toggle button shows `◑`.
- Clicking the button calls the spy once.

**AC-22.** A new story "In-flow Nav" passes `sticky={false}` and `maxWidth="none"`.
Its `play` function asserts:
- The `<nav>` element has `position` that is NOT `fixed` (i.e. `relative` or
  `static`).
- The `.nav-inner` element has `max-width` of `none` or no finite max-width
  constraint (i.e. `max-width === 'none'` or `getComputedStyle(.nav-inner).maxWidth` is
  a very large value or `'none'`).

---

### Type-safety

**AC-23.** `pnpm check` (Svelte type-check) passes with no new errors after the
change.

---

## Out of scope

- Cookie persistence — the consumer's `onPaletteToggle` may write a cookie; that is
  the app's concern, not the library's.
- Breadcrumb auto-generation from the URL.
- Any SSR flash mitigation in the library component itself (SSR sets `data-palette`
  via the app's `hooks.server.ts`; this item only ensures Nav does not fight it).
- Replacing the app's custom `src/lib/ui/Nav.svelte` — that is a website-level task
  that follows this item landing, not part of this spec.
- Removing the uncontrolled mode or the `dxlb-palette` localStorage key — backward
  compatibility is required.

---

## Open questions

None blocking. The controlled/uncontrolled decision boundary (both props required)
is stated explicitly by the item card and is unambiguous.
