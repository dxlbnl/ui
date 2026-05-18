# B28: Nav overhaul — match website design

## Context

The existing `Nav` component was specified and built in B6. It diverges from the
production website Nav (`~/Projects/Web/website/src/lib/ui/Nav.svelte`) in seven
observable ways: the brand area lacks breadcrumb support; the hamburger always renders
even with no links; the mobile menu uses a `$state` boolean + `<Button>` hamburger
rather than native `<details>`/`<summary>`; button and toggle colors are amber/ghost-styled
instead of `--ink-faint`; the mobile breakpoint is 767px instead of 720px; nav link
hover colors are not specified; and the mobile dropdown is not absolutely positioned.

This item realigns the design-system `Nav` with the production reference on all seven
points. The spec was revised because an earlier draft (rejected per D38) replaced
`<Button>` and `<Breadcrumb>` with raw HTML elements. The corrected spec requires:
- `<Breadcrumb>` component for the breadcrumb trail (primitives-first, D38).
- A new `Button` variant (`nav`) for the palette toggle (fix the primitive, don't bypass
  it, D38).
- `<details>`/`<summary>` for the hamburger, which has no primitive equivalent and is an
  acceptable structural exception (see `composition-limits.md` — last table row).

Related wiki pages:
- [vision.md](../vision.md) — Dexterlabs visual identity
- [requirements.md](../requirements.md) — R5 (Navigation), R11 (Palette toggle)
- [architecture.md](../architecture.md) — component conventions, Svelte 5 runes, story format
- [composition-limits.md](../composition-limits.md) — scoped CSS limits; `<summary>` is a genuine
  exception
- [decisions.md](../decisions.md) — D38 (primitives first), D7 (SSR-safe palette), D4
  (Chakra-style composability), D1 (tests = Story play functions)
- [specs/B6-navigation.md](B6-navigation.md) — original Nav spec; ACs that remain valid are
  preserved or extended below

Item card: [wiki/backlog/doing/B28-nav-overhaul.md](../backlog/doing/B28-nav-overhaul.md)

---

## New Button variant required: `nav`

The existing Button variants do not satisfy the palette-toggle visual requirement:
`color: var(--ink-faint)` at rest, `color: var(--ink)` + `border-bottom: 1px solid
var(--amber)` on hover — no amber fill at any time.

- `ghost`: default `color: var(--amber)` — wrong rest color.
- `back`: default `color: var(--ink-faint)` — correct rest color, but hover switches to
  `color: var(--amber)` — wrong hover (amber fill, not amber border-bottom).
- No existing variant matches.

**Decision (pending implementer confirmation):** Add a `'nav'` variant to
`Button.svelte`. Its CSS:

```css
.btn-nav {
  color: var(--ink-faint);
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  font-size: var(--t-body);
  line-height: 1;
  padding: 0 0 2px 0;
  letter-spacing: 0;
}
.btn-nav:hover {
  color: var(--ink);
  border-bottom-color: var(--amber);
}
```

This mirrors the website's `.toggle` CSS exactly. The variant name `'nav'` is chosen
because this visual style is purpose-built for Nav interactive controls. No other
component currently needs it; if another component needs the same look it reuses `'nav'`.

The `ButtonVariant` union type in `Button.svelte` is extended:
```ts
type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'back' | 'del' | 'nav'
```

`Button.stories.svelte` must add a `Nav Variant` story demonstrating the new variant.

---

## Breadcrumb component usage and required style alignment

The `<Breadcrumb>` component (`src/lib/components/navigation/Breadcrumb.svelte`) currently
renders a `<nav aria-label="breadcrumb">` as its root. This is wrong — breadcrumb trails
are not navigation landmarks, they are supplementary location indicators. The implementer
must change Breadcrumb's root element to `<div aria-label="breadcrumb">`. No `as` prop
needed. This is a non-breaking fix; existing standalone usage and all existing tests
must continue to pass after the change.

**Style alignment needed:** The current `Breadcrumb.svelte` separator glyph is `/` (a
plain forward-slash in a `<span class="bc-sep">`). The website Nav uses `//` as the
first separator (before the `~` home crumb) and `/` between subsequent crumbs. When the
`Nav` passes `breadcrumbs` to `<Breadcrumb>`, the separator style must produce:

```
// ~ / NOTES
```

Two approaches are acceptable (implementer chooses):

a. **Prefix `//` at Nav level:** Nav renders `<span class="nav-sep">//</span>` before
   `<Breadcrumb>`, and `Breadcrumb` renders its own `/` separators between items. The
   `<Breadcrumb>` crumb data passed in does not include the `~` home crumb; Nav handles
   that as a standalone `<a class="nav-sep-home">` link.

b. **Pass all crumbs to `<Breadcrumb>`:** Nav passes the full crumb array including `~`
   as the first entry, and adds a `prefix="// "` prop or similar to `Breadcrumb`. This
   requires adding a `prefix` or `separator` prop to `Breadcrumb.svelte`.

Either approach is valid; approach (a) is simpler and does not require modifying
`Breadcrumb`'s existing public API beyond the `as` prop fix above.

The `bc-link` color in `Breadcrumb.svelte` must be `color: var(--amber)` for all crumbs
— this matches the website reference (`.crumb { color: var(--amber) }`). All crumb links
must be clickable; `pointer-events: none` on the current-page crumb is incorrect and
must not be applied. The `//` sep and `/` seps remain `--ink-faint`.

---

## Props interface (revised)

```ts
interface BreadcrumbItem {
  label: string   // rendered as-is; uppercasing is the caller's responsibility
  href: string
}

interface NavLink {
  href: string
  label: string
  active?: boolean
}

interface Props {
  links?: NavLink[]              // nav links; defaults to []
  siteName?: string              // wordmark text; defaults to 'DEXTERLABS'
  breadcrumbs?: BreadcrumbItem[] // optional breadcrumb trail; defaults to []
  [key: string]: unknown         // ...rest forwarded onto <nav>
}
```

The `breadcrumbs` prop is new. The `links` and `siteName` props are unchanged from B6.

---

## HTML structure (revised)

The exact markup is intentionally flexible — the implementer resolves the `<Breadcrumb>`
nesting approach (above). The logical structure must satisfy:

```
<nav class="nav" {...rest}>
  <div class="nav-inner">

    <!-- Brand area -->
    <a class="nav-brand" href="/">
      <Led color="ok" aria-hidden="true" />
      <span class="nav-wordmark">{siteName}</span>
    </a>

    <!-- Breadcrumb trail — rendered only when breadcrumbs is non-empty.
         Must use <Breadcrumb> component (D38); landmark nesting must not
         create an a11y violation (see "Breadcrumb component usage" above). -->
    {#if breadcrumbs?.length}
      <div class="nav-path">
        <span class="nav-sep">//</span>
        <Breadcrumb crumbs={breadcrumbs} as="div" />
      </div>
    {/if}

    <!-- Right-hand group: desktop links + palette toggle + hamburger details -->
    <div class="nav-right">

      {#if links?.length}
        <ul class="nav-links">
          {#each links as link}
            <li>
              <a href={link.href}
                 class="nav-link"
                 class:active={link.active}
                 aria-current={link.active ? 'page' : undefined}>
                {link.label}
              </a>
            </li>
          {/each}
        </ul>
      {/if}

      <!-- Palette toggle: MUST use <Button variant="nav"> (D38) -->
      <Button variant="nav"
              aria-label="Toggle colour palette"
              onclick={handlePaletteToggle}>
        {palette === 'paper' ? '◑' : '◐'}
      </Button>

      <!-- Hamburger: <details>/<summary> — acceptable structural exception (D38);
           no primitive exists for native disclosure. Hidden on desktop via CSS.
           Only rendered when links is non-empty. -->
      {#if links?.length}
        <details class="nav-menu" bind:this={menuEl}>
          <summary class="nav-summary">
            <span class="nav-icon-open">≡</span>
            <span class="nav-icon-close">×</span>
          </summary>
          <div class="nav-dropdown">
            {#each links as link}
              <a href={link.href}
                 class="nav-dropdown-link"
                 class:active={link.active}
                 aria-current={link.active ? 'page' : undefined}>
                {link.label}
              </a>
            {/each}
          </div>
        </details>
      {/if}

    </div>
  </div>
</nav>
```

Notes:
- `<Button variant="nav">` renders as a `<button class="btn btn-nav">`. Nav's scoped CSS
  cannot directly style the Button's root element; no `:global()` override is needed
  because the `btn-nav` styles live in `Button.svelte`.
- `<details>` and `<summary>` have no primitive; this use is a documented exception in
  `composition-limits.md`.
- The `menuOpen` `$state` and `handleMenuToggle` function are removed. The `<details>`
  element owns open/close state natively.
- `let menuEl: HTMLDetailsElement | undefined = $state()` may be retained for potential
  click-outside behaviour but is not required.
- The `Inline` wrapper around nav-actions (present in the B6/B27 implementation) is
  removed if the palette toggle and `<details>` sit directly in `.nav-right`. If the
  implementer retains an `<Inline>` wrapper inside `.nav-right`, that is also acceptable
  (D38 prefers primitives). The `No Inline Flex Shrink Style` B27 regression story must
  be updated or removed accordingly.

---

## CSS rules (revised)

All rules scoped inside `<style>`. No hardcoded hex or RGB values.

### Changed from B6

| Selector | Key rules | Change from B6 |
|---|---|---|
| `@media` breakpoint | `max-width: 720px` | Was `767px` — must be updated |
| `.nav-link:hover` | `color: var(--ink); border-bottom-color: var(--amber)` | Hover rule was absent in B6 |
| `.nav-link.active` | `color: var(--ink); border-bottom-color: var(--amber)` | Unchanged from B6 |

### New selectors required

| Selector | Key rules |
|---|---|
| `.nav-path` | `display: flex; align-items: center; gap: 6px; overflow: hidden; min-width: 0` |
| `.nav-sep` | `color: var(--ink-faint); flex-shrink: 0` |
| `.nav-menu` (`<details>`) | `display: none` at desktop; inside `@media (max-width: 720px)`: `display: block; margin-left: auto; flex-shrink: 0` |
| `.nav-icon-close` | `display: none` by default |
| `details[open] .nav-icon-open` | `display: none` |
| `details[open] .nav-icon-close` | `display: inline` |
| `.nav-summary` | `list-style: none; cursor: pointer; color: var(--ink-dim); user-select: none` hover: `color: var(--ink)` |
| `.nav-summary::-webkit-details-marker` | `display: none` (suppress default triangle marker) |
| `.nav-dropdown` | `position: absolute; top: 100%; left: 0; right: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--rule); display: flex; flex-direction: column; padding: 4px 16px 8px; text-transform: uppercase` |
| `.nav-dropdown-link` | `padding: 10px 0; border-bottom: 1px solid var(--rule); color: var(--ink-dim); text-decoration: none` |
| `.nav-dropdown-link.active` | `color: var(--amber)` (matches website reference) |
| `.nav-dropdown > :last-child` | `border-bottom: none` |

### Selectors to remove

`#nav-drawer`, `.nav-drawer`, `.nav-drawer-links`, `.nav-drawer-link`, `.hamburger-wrap`,
`.nav-hamburger` — all replaced by the `<details>`-based structure.

---

## State and behaviour (revised)

### Removed

- `let menuOpen = $state(false)` — removed; `<details>` owns open/close state natively.
- `handleMenuToggle` function — removed.
- The old `nav-drawer` `<div>` structure.

### Retained (unchanged from B6)

```ts
import { browser } from '$app/environment'
const PALETTE_KEY = 'dxlb-palette'
type Palette = 'phosphor' | 'paper'
let palette = $state<Palette>('phosphor')

$effect(() => {
  if (browser) {
    const stored = localStorage.getItem(PALETTE_KEY) as Palette | null
    if (stored === 'paper' || stored === 'phosphor') palette = stored
    document.documentElement.setAttribute('data-palette', palette)
  }
})

function handlePaletteToggle() {
  palette = palette === 'paper' ? 'phosphor' : 'paper'
  if (browser) {
    document.documentElement.setAttribute('data-palette', palette)
    localStorage.setItem(PALETTE_KEY, palette)
  }
}
```

---

## Acceptance criteria

Criteria are numbered to follow on from B6's AC set. Stories marked "(DOM-query)" use
native DOM queries because the element may be `display:none` at the default test viewport.

### AC-B28-1 — New Button variant `nav` exists in `Button.svelte`

1. `ButtonVariant` in `Button.svelte` includes `'nav'` as a valid value.
2. `<Button variant="nav">` renders an element with class `btn-nav`.
3. A `btn-nav` element has computed `color` matching `--ink-faint` in its default state
   (verified via `resolveTokenFgColor('--ink-faint')`).
4. A `btn-nav` element has `background-color` that is transparent (not `--amber` and not
   `--bg` filled) in its default state.
5. `pnpm check` passes with zero TypeScript errors after the `ButtonVariant` union is
   extended.
6. `Button.stories.svelte` contains a `Nav Variant` story that renders `<Button
   variant="nav">` and its play function asserts the `btn-nav` class and the
   `--ink-faint` default color.

### AC-B28-2 — Breadcrumb prop: rendering (using `<Breadcrumb>` component)

7. When `breadcrumbs` is omitted or `[]`, no `.nav-path` element is rendered in the DOM.
8. When `breadcrumbs` is `[{ label: '~', href: '/' }]`, a `.nav-path` element is
   present; it contains the Breadcrumb component output, which includes an anchor with
   `href="/"` and text content `~`.
9. When `breadcrumbs` is
   `[{ label: '~', href: '/' }, { label: 'NOTES', href: '/notes/' }]`,
   the rendered breadcrumb trail contains two anchors in order: `~` linking to `/`, then
   `NOTES` linking to `/notes/`.
10. The `.nav-path` element contains a `.nav-sep` span with text content `//` (the first
    separator before the breadcrumb trail).
11. All breadcrumb links have computed `color` matching `--amber`. All crumb links are
    clickable (no `pointer-events: none`).
12. The `.nav-sep` `//` span has computed `color` matching `--ink-faint`.
13. The `<Breadcrumb>` component is used (the `<Breadcrumb>` tag appears in `Nav.svelte`
    source). No raw breadcrumb-link markup (`<a class="nav-crumb">` or similar) is used
    instead. (Code-inspection criterion.)
14. No nested `<nav>` landmark inside the outer `<nav>` is flagged as an a11y violation
    by the `@storybook/addon-a11y` audit. (The implementer must use `as="div"` or
    equivalent to prevent the `Breadcrumb` from emitting a nested `<nav>`.)

### AC-B28-3 — No hamburger when links is empty

15. When `links` is omitted or `[]`, no `<details>` element exists in the rendered DOM.
16. When `links` has at least one entry, a `<details class="nav-menu">` element is present.
17. The palette toggle button (`<Button variant="nav">`) is always present regardless of
    whether `links` is empty or non-empty.

### AC-B28-4 — `<details>`-based mobile menu

18. No `<button class="nav-hamburger">`, no `.hamburger-wrap`, and no `#nav-drawer`
    element exists in the rendered DOM after B28.
19. No `menuOpen` reactive variable is declared in `Nav.svelte`. (Code-inspection
    criterion — confirmed by reviewer.)
20. When `links` is non-empty, a `<details class="nav-menu">` is present containing a
    `<summary class="nav-summary">`.
21. The `<summary>` contains `<span class="nav-icon-open">` with text `≡` and
    `<span class="nav-icon-close">` with text `×`.
22. `.nav-icon-close` has `display: none` when the `<details>` does not have the `open`
    attribute (verifiable via `getComputedStyle` after querying the closed state).
23. When `details.setAttribute('open', '')` is set programmatically, `.nav-icon-open`
    has `display: none` and `.nav-icon-close` has `display` other than `none`. (DOM-query
    — set the attribute directly, then assert computed styles.)
24. Inside `<details>`, a `.nav-dropdown` element exists containing one `.nav-dropdown-link`
    anchor per link, each with the correct `href` and label text.
25. A `.nav-dropdown-link` corresponding to a link with `active: true` has
    `aria-current="page"`.

### AC-B28-5 — Palette toggle uses `<Button variant="nav">` (D38)

26. The palette toggle in `Nav.svelte` uses `<Button variant="nav">` (code-inspection
    criterion — no raw `<button class="nav-toggle">` in source).
27. The rendered palette toggle element has both `btn` and `btn-nav` CSS classes on it.
28. The palette toggle element does NOT have `btn-ghost` as a class.
29. The palette toggle element has computed `color` matching `--ink-faint` at rest
    (verified via `resolveTokenFgColor`).
30. The palette toggle element does NOT have a non-transparent `background-color`
    matching `--amber` at any point in its default rendered state.
31. The palette toggle has accessible name `"Toggle colour palette"` (via `aria-label`).

### AC-B28-6 — Breakpoint 720px

32. The `<style>` block in `Nav.svelte` contains a `@media (max-width: 720px)` rule.
    There is no `max-width: 767px` media query in `Nav.svelte`. (Code-inspection
    criterion — confirmed by reviewer and/or by searching the file.)
33. Inside the 720px media query: `.nav-links` has `display: none` and `.nav-menu` (the
    `<details>`) has `display: block`. (CSS-only — not viewport-resized in tests;
    confirmed by code inspection.)

### AC-B28-7 — Nav link hover and active colors

34. A `.nav-link.active` anchor has computed `color` matching `--ink` (full ink, not
    dim) — verified via `resolveTokenFgColor('--ink')`.
35. A `.nav-link.active` anchor has computed `border-bottom-color` matching `--amber` —
    verified via `resolveTokenFgColor('--amber')`.
36. A `.nav-link` without `active` has computed `color` matching `--ink-dim` —
    verified via `resolveTokenFgColor('--ink-dim')`.
37. A `.nav-link` without `active` has computed `border-bottom-color` that is transparent
    (zero alpha: `rgba(0, 0, 0, 0)` or equivalent).
38. The CSS rule `.nav-link:hover` sets `color: var(--ink)` and
    `border-bottom-color: var(--amber)`. (Code-inspection criterion — hover cannot be
    triggered by play functions; noted as visual-only for story purposes.)

### AC-B28-8 — Mobile dropdown styling

39. The `.nav-dropdown` element has `position: absolute` (verified via
    `getComputedStyle`).
40. The `.nav-dropdown` element has `background-color` matching `--bg` — verified via
    `resolveTokenColor('--bg')`.
41. The `.nav-dropdown` element has computed `border-bottom-color` matching `--rule` —
    verified via `resolveTokenColor('--rule')`.
42. Each `.nav-dropdown-link` has `padding-top` and `padding-bottom` each equal to
    `10px` (verified via `getComputedStyle`).
43. Each `.nav-dropdown-link` except the last has `border-bottom` computed as `1px solid`
    with `border-bottom-color` matching `--rule`. The last child's `border-bottom` is
    `none` or zero-width (CSS `:last-child` rule). (Code-inspection criterion for the
    last-child rule; other assertions via `getComputedStyle` on non-last items.)

### AC-B28-9 — Preserved from B6 (unchanged)

44. The component renders a `<nav>` as its root element.
45. The `<nav>` has `position: fixed; top: 0; left: 0; right: 0; z-index >= 100`
    (verified via `getComputedStyle`).
46. The `<nav>` has `background-color` matching `--bg` and `border-bottom-color` matching
    `--rule`.
47. `.nav-inner` has `display: flex; align-items: center` and computed height `48px`.
48. `...rest` props spread onto the `<nav>` — passing `data-testid="main-nav"` produces
    `<nav data-testid="main-nav">` in the DOM.
49. The brand area renders `<a href="/">` containing a `Led` (`aria-hidden="true"`) and
    the `siteName` text (default `'DEXTERLABS'`).
50. Passing `siteName="LAB"` causes `"LAB"` to appear in the brand area text.
51. When `links` is non-empty, the component renders a `<ul class="nav-links">` with one
    `<li>` per link, each containing an `<a>` with the correct `href`.
52. Link labels are rendered via `text-transform: uppercase` in CSS, not JS string
    manipulation, so the accessible text casing is preserved.
53. Clicking the palette toggle sets `document.documentElement`'s `data-palette`
    attribute to the opposite value; `localStorage.getItem('dxlb-palette')` reflects the
    new value.
54. SSR-safe: no `localStorage` or `document` access occurs in the synchronous render
    path. All DOM writes are inside `$effect` or event handler functions (per D7).
55. `pnpm check` passes with zero TypeScript errors after B28.
56. `pnpm test` passes all story play functions with no failures and no a11y violations.
57. Svelte 5 runes exclusively: `$props`, `$state`, `$derived`, `$effect`. No `export
    let`, no `onMount`, no Svelte 4 lifecycle APIs.
58. No hardcoded hex or RGB color values in `Nav.svelte`.

---

## Stories required

All stories live in `src/lib/components/navigation/Nav.stories.svelte`. The following
replaces / updates the B6 story set:

| Story name | Key play function assertions |
|---|---|
| `Default` | `<nav>` present; brand contains `DEXTERLABS`; CATALOGUE link has `aria-current="page"`; palette toggle (role=button, name="Toggle colour palette") visible; no `.nav-hamburger` in DOM; no `#nav-drawer` in DOM |
| `No Links` | `<nav>` present; no `<details>` element in DOM; no `<ul class="nav-links">`; palette toggle present |
| `With Breadcrumbs` | `.nav-path` present; crumb anchors have correct `href` values and `color` matching `--amber`; `.nav-sep` `//` span has `color` matching `--ink-faint` |
| `Breadcrumbs Only No Links` | `breadcrumbs` non-empty and `links=[]`: `.nav-path` present AND no `<details>` in DOM |
| `Custom Site Name` | brand area contains `"LAB"` when `siteName="LAB"` |
| `Palette Toggle` | two clicks restore original `data-palette`; `localStorage` updated after each click |
| `Active Link Styling` | active link has `aria-current="page"`; `border-bottom-color` matches `--amber`; `color` matches `--ink` |
| `Mobile Menu Details` | `<details>` present; `.nav-icon-close` has `display:none` initially; after `details.setAttribute('open','')`, `.nav-icon-open` has `display:none`; dropdown links have correct `href` values |

Additionally, in `Button.stories.svelte`:

| Story name | Key play function assertions |
|---|---|
| `Nav Variant` | element has class `btn-nav`; computed `color` matches `--ink-faint`; `background-color` is transparent |

### Stories to remove or update from the B6 set

- `Mobile Menu` (old) — queries `.nav-hamburger`; must be replaced by `Mobile Menu
  Details` which queries `<details class="nav-menu">`.
- `No Inline Flex Shrink Style` (B27 regression guard) — the `Inline` wrapper around
  nav-actions may be removed by this item. If `.nav-actions` no longer exists in the
  DOM, this story must be removed. If the implementer retains the `Inline` wrapper, the
  story may be retained unchanged.

---

## Out of scope

- **Click-outside-to-close** — the website Nav closes `<details>` on outside click. This
  is a UX enhancement; it is not an acceptance criterion for B28 (implementer may add it
  as an improvement).
- **Route-change auto-close** — the website Nav clears `<details open>` on `$page`
  change. The design-system Nav does not consume `$page`; out of scope.
- **Breadcrumb auto-derivation from `$page`** — explicitly excluded by the item card.
  Callers pass `breadcrumbs` directly.
- **Mobile breakpoint CSS validation at runtime** — tests do not resize the Storybook
  viewport; the 720px breakpoint is verified by code inspection (AC-32/33).
- **Hover-only CSS assertions** — `:hover` pseudo-state cannot be triggered in play
  functions; hover color assertions are code-inspection criteria only.
- **Slide animation** — `<details>` opens/closes without animation; animation is future
  work.
- **`siteName` brand link customisation** — the brand `<a>` always points to `/`. A
  `brandHref` prop is out of scope.
- **Sub-navigation / dropdown menus from links** — flat link list only.

---

## Open questions

### OQ-1 (resolved): Breadcrumb root element

Resolved: `Breadcrumb.svelte` root changes from `<nav>` to `<div>` by default (see
"Breadcrumb component usage" section above). No `as` prop needed. Not blocking.

### OQ-2 (non-blocking): `<summary>` accessible name for screen readers

The `<summary>` renders `≡` and `×` glyphs. Screen readers may announce these as Unicode
character names rather than meaningful text. The website Nav does not set an `aria-label`
on `<summary>`. For B28, the a11y addon result is the arbiter — if no violation is
flagged, no action is needed. If flagged, the implementer should add
`aria-label="Open menu"` (static; the `open`-state change to `"Close menu"` requires
mirroring the `<details>` open state in a `$state` variable, adding complexity).

### OQ-3 (non-blocking): B27 regression story retention

The `No Inline Flex Shrink Style` story was added in B27 as a regression guard for
removing an inline `style=` from the `Inline`/`nav-actions` wrapper. If B28 removes
the `Inline` wrapper entirely, this story becomes stale (it queries `.nav-actions` which
no longer exists). The test-writer must either remove this story or update it to target
whatever structural element replaces it. No correctness risk either way.

### OQ-4 (non-blocking): `btn-nav` naming across components

The `nav` Button variant name is purpose-built for Nav controls. If a future component
needs the same "ink-faint default, ink hover, amber border-bottom hover" visual style,
it should reuse `variant="nav"` rather than introduce a new variant. This is a naming
convention note — not a blocking question for B28.
