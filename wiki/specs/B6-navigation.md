# B6: Navigation

## Context

B6 delivers the `Nav` component — the fixed top navigation bar used across all pages of
dexterlabs.nl. It is the most visible branded element of the site: it carries the
wordmark, the section link set, the palette toggle, and on mobile a hamburger menu.

The visual reference is:
- `dexterlabs-design-system/project/preview/12-components-nav.html` — HTML prototype
- `dexterlabs-design-system/project/ui_kits/website/Nav.jsx` — React UI-kit reference

Key observations from the design bundle:
- The brand area contains a green `Led` (ok) dot, the `DEXTERLABS` wordmark in bold
  mono, and a `//` + `~` breadcrumb path inline. The breadcrumb is a separate concern
  descoped from B6 (see Out of scope).
- Nav links are ALL CAPS, mono, 12px, color `var(--ink-dim)` by default. The active
  link changes to `var(--ink)` and gets `border-bottom: 1px solid var(--amber)`.
- The palette toggle glyph: `◐` when the current palette is Phosphor (dark) — clicking
  switches to Paper. `◑` when current palette is Paper — clicking switches back to
  Phosphor. (Mnemonic: the half-filled circle shows which half is bright.)
- The mobile hamburger and drawer are not in the HTML prototype; the spec defines them
  based on backlog R5 requirements.

Related wiki pages:
- [vision.md](../vision.md) — Dexterlabs visual identity and site sections
- [requirements.md](../requirements.md) — R5 (Navigation), R11 (Palette toggle /
  theming), and constraints (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TypeScript,
  `...rest` forwarding)
- [architecture.md](../architecture.md) — component authoring conventions, project
  structure
- [decisions.md](../decisions.md) — D4 (Chakra-style composability), D5 (no global
  utility classes), D1 (tests = Story play functions), D7 (SSR-safe palette persistence)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format, play function rules

### Layer position

`Nav` is a composite component at the navigation layer. It may import:
- `src/lib/components/primitives/Led.svelte` — for the ok-dot in the brand area

No imports from cards or other composite layers.

---

## Props interface

```ts
interface NavLink {
  href: string      // e.g. '/catalogue'
  label: string     // rendered ALL CAPS; e.g. 'CATALOGUE' or 'Catalogue' — uppercased by CSS
  active?: boolean  // if true, renders with amber underline + full-ink color
}

interface Props {
  links?: NavLink[]    // nav links to render; defaults to []
  siteName?: string    // text after '// ' prefix in brand; defaults to 'DEXTERLABS'
  [key: string]: unknown  // ...rest forwarding onto <nav>
}
```

The component uses Svelte 5 `$props()`. No `export let`. The `[key: string]: unknown`
index signature enables `...rest` forwarding. Props do not extend `HTMLNavAttributes`
because `Nav` is not a polymorphic element — it always renders `<nav>`.

---

## HTML structure

```
<nav class="nav">
  <div class="nav-inner">
    <a class="nav-brand" href="/">
      <Led color="ok" aria-hidden="true" />
      <span class="nav-wordmark">{siteName}</span>
    </a>

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

    <div class="nav-actions">
      <button class="nav-palette-toggle" aria-label="Toggle colour palette"
              onclick={handlePaletteToggle}>
        {palette === 'paper' ? '◑' : '◐'}
      </button>

      <button class="nav-hamburger" aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              onclick={handleMenuToggle}>
        {menuOpen ? '×' : '≡'}
      </button>
    </div>
  </div>

  <!-- Mobile drawer: aria-hidden="true" when closed, attribute absent when open -->
  <div id="nav-drawer" class="nav-drawer" aria-hidden={menuOpen ? undefined : 'true'}>
    <ul class="nav-drawer-links">
      {#each links as link}
        <li>
          <a href={link.href}
             class="nav-drawer-link"
             class:active={link.active}
             aria-current={link.active ? 'page' : undefined}>
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
</nav>
```

---

## CSS rules

All styles scoped in `<style>`. No hardcoded hex/rgb — CSS custom properties only.

| Selector | Key rules |
|---|---|
| `.nav` | `position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: var(--bg); border-bottom: 1px solid var(--rule); font-family: var(--mono); font-size: var(--t-mono); letter-spacing: 0.08em` |
| `.nav-inner` | `display: flex; align-items: center; gap: 28px; padding: 0 24px; height: 48px; max-width: 1200px; margin: 0 auto` |
| `.nav-brand` | `display: flex; align-items: center; gap: 8px; color: var(--ink); text-decoration: none; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; flex-shrink: 0` |
| `.nav-wordmark` | inline span — inherits from `.nav-brand` |
| `.nav-links` | `display: flex; gap: 20px; list-style: none; margin: 0 0 0 auto; padding: 0; flex-shrink: 0; text-transform: uppercase; font-size: 12px` |
| `.nav-link` | `color: var(--ink-dim); text-decoration: none; padding-bottom: 2px; border-bottom: 1px solid transparent; transition: color var(--transition), border-color var(--transition)` |
| `.nav-link.active` | `color: var(--ink); border-bottom-color: var(--amber)` |
| `.nav-actions` | `display: flex; align-items: center; gap: 12px; flex-shrink: 0` |
| `.nav-palette-toggle` | `background: none; border: none; cursor: pointer; color: var(--ink-faint); font-family: var(--mono); font-size: 16px; line-height: 1; padding: 0` |
| `.nav-hamburger` | `background: none; border: none; cursor: pointer; color: var(--ink-faint); font-family: var(--mono); font-size: 20px; line-height: 1; padding: 0; display: none` |
| `.nav-drawer` | `display: none` (full CSS rule set follows mobile breakpoint below) |

**Mobile breakpoint (`@media (max-width: 767px)`):**

```css
@media (max-width: 767px) {
  .nav-links {
    display: none;
  }
  .nav-hamburger {
    display: block;
  }
  .nav-drawer {
    display: block;
    background: var(--bg);
    border-bottom: 1px solid var(--rule);
    padding: 12px 24px 16px;
  }
  .nav-drawer[aria-hidden="true"] {
    display: none;
  }
  .nav-drawer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.08em;
  }
  .nav-drawer-link {
    color: var(--ink-dim);
    text-decoration: none;
    padding-bottom: 2px;
    border-bottom: 1px solid transparent;
  }
  .nav-drawer-link.active {
    color: var(--ink);
    border-bottom-color: var(--amber);
  }
}
```

The nav height is **48px**. Consumer pages must apply `padding-top: 48px` (or
`padding-top: var(--nav-height, 48px)`) to their `<main>` element so content is not
hidden behind the fixed bar.

---

## State and behaviour

### Palette toggle

```ts
import { browser } from '$app/environment'

const PALETTE_KEY = 'dxlb-palette'
type Palette = 'phosphor' | 'paper'

let palette = $state<Palette>('phosphor')

$effect(() => {
  // On mount: read persisted value and apply to DOM
  if (browser) {
    const stored = localStorage.getItem(PALETTE_KEY) as Palette | null
    if (stored === 'paper' || stored === 'phosphor') {
      palette = stored
    }
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

Rules:
- `palette` initialises to `'phosphor'` (dark, the default).
- The `$effect` fires only in the browser (after hydration); it does not run on the
  server. This is the SSR-safe pattern.
- `document.documentElement.setAttribute(...)` is never called in the render (template)
  path — only inside `$effect` and event handlers.
- `localStorage` is only accessed inside `browser`-guarded blocks.

### Mobile menu

```ts
let menuOpen = $state(false)

function handleMenuToggle() {
  menuOpen = !menuOpen
}
```

- `menuOpen` initialises to `false`.
- No DOM manipulation — visibility is controlled purely via CSS and the `aria-hidden`
  attribute on `.nav-drawer`.

---

## Files produced by this item

| File | Role |
|---|---|
| `src/lib/components/navigation/Nav.svelte` | Nav component |
| `src/lib/components/navigation/Nav.stories.svelte` | Stories + play-function tests |
| `src/lib/components/navigation/index.ts` | Barrel export |
| `src/lib/index.ts` | Updated to re-export `Nav` |

---

## Story specifications

Stories live in `src/lib/components/navigation/Nav.stories.svelte` and follow the
format in `wiki/stories-guide.md`: `<script module lang="ts">`, named `const` play
functions, `component:` in `defineMeta`, props via `args`, children in the slot.

### Story: "Default"

`args`: `links` with six entries (FEED, CATALOGUE active, PROJECTS, NOTES, ABOUT,
CONTACT). No explicit `siteName` (uses default `'DEXTERLABS'`).

Play function asserts:
- A `<nav>` element is present in the canvas.
- The brand link has text content including `'DEXTERLABS'`.
- The nav links list is present.
- The link with label `'CATALOGUE'` is present and has `aria-current="page"`.
- The palette toggle button is present (accessible name "Toggle colour palette").
- The hamburger button is not visible at default (desktop) viewport.

### Story: "No Links"

`args`: `links: []`.

Play function asserts:
- A `<nav>` is present.
- No `<li>` elements exist in the `.nav-links` list.
- The palette toggle button is still present.

### Story: "Custom Site Name"

`args`: `links: []`, `siteName: 'LAB'`.

Play function asserts:
- The brand area text includes `'LAB'`.

### Story: "Palette Toggle"

`args`: same six links as Default.

Play function:
1. Gets the toggle button by accessible name `"Toggle colour palette"`.
2. Reads `document.documentElement.getAttribute('data-palette')` — records initial value.
3. Clicks the button via `userEvent.click(btn)`.
4. Asserts `document.documentElement.getAttribute('data-palette')` has changed to the
   opposite value.
5. Clicks again; asserts the value is restored to the original.

### Story: "Active Link Styling"

`args`: `links` where the NOTES link has `active: true`.

Play function:
1. Gets the NOTES anchor element by text.
2. Asserts `getComputedStyle(anchor).borderBottomColor` matches the amber token value
   (resolved via the probe pattern from `stories-guide.md`).
3. Asserts `anchor.getAttribute('aria-current')` equals `'page'`.

### Story: "Mobile Menu"

`args`: same six links as Default. No viewport parameter — `@storybook/addon-viewport`
is not installed, so the hamburger remains `display:none` at the test viewport.

Play function (native DOM click required since the hamburger is not visually displayed
at the default test viewport, making `userEvent.click` unavailable):
1. Gets the hamburger button via `querySelector('.nav-hamburger')`.
2. Asserts button exists (not null) and its `aria-label` is `"Open menu"`.
3. Gets `#nav-drawer` via `querySelector`.
4. Asserts drawer's `aria-hidden` attribute is present (not null) — starts hidden.
5. Calls `btn.click()` (native DOM click) then `await new Promise(r => setTimeout(r, 0))`
   to flush Svelte's reactive DOM update.
6. Asserts drawer's `aria-hidden` attribute is now absent (`getAttribute` returns `null`).
7. Asserts button `aria-label` is now `"Close menu"`.
8. Clicks again with the same tick flush; asserts drawer is hidden again and label
   restores to `"Open menu"`.

---

## Acceptance criteria

### File existence and exports (AC 1–6)

1. `src/lib/components/navigation/Nav.svelte` exists.
2. `src/lib/components/navigation/Nav.stories.svelte` exists.
3. `src/lib/components/navigation/index.ts` exists and exports `Nav` as a named export.
4. `src/lib/index.ts` re-exports `Nav` (i.e. `import { Nav } from 'dxlb-design'` or
   `from '$lib'` resolves without error).
5. `pnpm check` (SvelteKit type-check) passes with zero errors after B6 is merged.
6. `pnpm test` passes all story play functions (no failures, no a11y violations).

### Component structure (AC 7–12)

7. The component renders a `<nav>` as its root element.
8. The `<nav>` has `position: fixed`, `top: 0`, `left: 0`, `right: 0`, and `z-index`
   of at least `100` (verified via `getComputedStyle`).
9. The `<nav>` has `background: var(--bg)` — computed background color matches the
   `--bg` token in the active palette.
10. The `<nav>` has `border-bottom: 1px solid var(--rule)` — the computed border-bottom
    color matches the `--rule` token.
11. Inside the `<nav>` is a `.nav-inner` wrapper with `display: flex` and `align-items:
    center`; its computed height is `48px`.
12. `...rest` props spread onto the `<nav>` root element — passing `data-testid="main-nav"`
    as a prop causes `<nav data-testid="main-nav">` to appear in the DOM.

### Brand area (AC 13–15)

13. The brand area renders an `<a href="/">` element as the first child of `.nav-inner`.
14. The brand `<a>` contains a `Led` component rendered as the ok-color dot
    (`aria-hidden="true"` on the Led).
15. The brand `<a>` contains a text node with the value of `siteName` (default
    `'DEXTERLABS'`). Passing `siteName="LAB"` causes `"LAB"` to appear in the brand
    area instead.

### Nav links (AC 16–22)

16. When `links` is a non-empty array, the component renders a `<ul class="nav-links">`
    containing one `<li>` per link.
17. Each `<li>` contains an `<a>` whose `href` attribute matches the corresponding
    `link.href` value.
18. Each link label is rendered in ALL CAPS (either via `text-transform: uppercase` in
    CSS or by the component uppercasing the string — CSS-only is preferred to preserve
    accessibility label casing).
19. A link where `active: true` has `aria-current="page"` on its `<a>` element.
20. A link where `active: true` has a computed `border-bottom-color` matching the
    `--amber` CSS custom property (verified via the probe technique).
21. A link where `active: false` (or `active` omitted) does NOT have `aria-current`
    set, and its `border-bottom-color` is `transparent` (or matches a 0-alpha value).
22. When `links` is an empty array (`[]`), the `<ul class="nav-links">` is present but
    contains no `<li>` children.

### Palette toggle (AC 23–28)

23. A `<button>` with accessible name `"Toggle colour palette"` is always present in the
    `<nav>`, regardless of the `links` value.
24. When the current palette is Phosphor (dark, default), the toggle button's text
    content is `'◐'` (half-circle, right-lit).
25. When the current palette is Paper (light), the toggle button's text content is
    `'◑'` (half-circle, left-lit).
26. Clicking the palette toggle sets `document.documentElement`'s `data-palette`
    attribute to `'paper'` if it was previously `'phosphor'`, and to `'phosphor'` if
    it was previously `'paper'`.
27. After a click, `localStorage.getItem('dxlb-palette')` returns the new palette
    value (`'paper'` or `'phosphor'`).
28. No `document` or `localStorage` access occurs in the synchronous component render
    path. All DOM manipulation is inside `$effect` callbacks or event handler functions.
    (Verifiable by SSR-rendering the component in a Node context — no `ReferenceError:
    document is not defined` is thrown.)

### Mobile hamburger (AC 29–34)

29. A `<button>` with accessible name `"Open menu"` exists in the `<nav>` at all
    viewport widths. At desktop widths (above 767px), it is not visually displayed
    (`display: none` via CSS media query, but still in the DOM).
30. At viewport widths of 767px and below, the hamburger button has `display` other than
    `none` (i.e. it is visually present).
31. At viewport widths of 767px and below, the `.nav-links` `<ul>` has `display: none`
    (the desktop link list is hidden).
32. When the hamburger button is clicked, the `#nav-drawer` element no longer has
    `aria-hidden="true"` (it becomes visible), and the button's accessible name changes
    to `"Close menu"`.
33. When the drawer is open, `#nav-drawer` contains a `<ul>` with the same links as
    `.nav-links`, each with the same `href`, label, and `active` state. The `<ul>` may
    be conditionally rendered (only when open) to avoid duplicate query matches in tests.
34. Clicking the hamburger button a second time (when the menu is open) sets
    `aria-hidden="true"` on `#nav-drawer` again and restores the button accessible name
    to `"Open menu"`. The toggle is purely client-side `$state` — no `document`
    manipulation is needed.

### Code quality (AC 35–40)

35. The component uses Svelte 5 runes exclusively: `$props()`, `$state()`, `$derived()`,
    `$effect()`. No `export let`, no `onMount`, no Svelte 4 lifecycle APIs.
36. No hardcoded hex or RGB color values in `Nav.svelte`. All colors reference CSS
    custom properties (e.g. `var(--amber)`, `var(--rule)`).
37. No global CSS is produced by `Nav.svelte` — all rules are scoped inside the
    component's `<style>` block (Svelte's default scoping).
38. Strict TypeScript: the Props interface uses the `[key: string]: unknown` index
    signature for `...rest` forwarding. No `any`, no `@ts-ignore` in `Nav.svelte` or
    `index.ts`.
39. SSR-safe: no `localStorage` or `document` access occurs in the synchronous render
    path. In Svelte 5, `$effect` is inherently client-only and event handlers never run
    on the server, so no explicit `browser` guard from `$app/environment` is required.
40. WCAG 2.1 AA: the `@storybook/addon-a11y` audit reports zero violations for every
    Nav story in Storybook. Both palette states (Phosphor and Paper) pass contrast
    requirements for nav link text and the toggle button.

### Story play functions (AC 41–45)

41. The "Default" story play function passes: `<nav>` is present, the active link has
    `aria-current="page"`, the palette toggle button is visible.
42. The "No Links" story play function passes: `<nav>` is present, no `<li>` children
    in the nav links list.
43. The "Palette Toggle" story play function passes: clicking the toggle changes
    `document.documentElement`'s `data-palette` attribute, and clicking again restores
    it.
44. The "Active Link Styling" story play function passes: the active link's computed
    `border-bottom-color` matches the `--amber` token.
45. The "Mobile Menu" story play function passes: clicking the hamburger button (queried
    by `.nav-hamburger` class selector since it is `display:none` at the test viewport)
    removes `aria-hidden` from the drawer entirely (attribute absent), accessible name
    changes to "Close menu"; clicking again restores `aria-hidden="true"` and "Open menu".

---

## Out of scope

- **Breadcrumb path display** — the design bundle shows `// ~ / SECTION / ITEM` inline
  in the brand area. This is a non-trivial composite that depends on route context.
  Deferred to a future backlog item (e.g. B6b or B11).
- **SvelteKit `$page` store integration** — the `Nav` component does not consume
  `$page.url` or any SvelteKit store. Active state is set externally via the `active`
  prop on each link. This keeps the component usable in Storybook and in non-SvelteKit
  contexts.
- **Slide animation on the mobile drawer** — the drawer shows/hides via CSS `display`
  toggle (no transition). A slide-in animation is a future enhancement.
- **Keyboard trap / focus management in the mobile drawer** — the drawer is accessible
  via standard tab order. Full focus-trap behaviour (trapping focus inside the drawer
  while open) is deferred.
- **`as` polymorphic prop** — `Nav` is always a `<nav>`; no polymorphism is needed.
- **Sub-navigation / dropdown menus** — flat link list only for B6.
- **`Led` live status dot colour variants** — the `Led` in the brand area is always
  `color="ok"` (green). Dynamic status indication is out of scope.
- **Logo/SVG brand asset** — the brand area renders the `siteName` text only; an SVG
  logo image is not part of the `Nav` component in B6.

---

## Open questions

None blocking implementation. The following are noted for future reference:

- **Breadcrumb slot API** — when the breadcrumb feature is added (post-B6), should it
  be a Svelte snippet prop on `Nav` or a separate `Breadcrumb` component composed
  alongside `Nav`? Decision can wait.
- **Nav height token** — the `48px` height is hardcoded in the spec. If more components
  need to know the nav height (e.g. scroll offset, sticky behaviour), a CSS custom
  property `--nav-height: 48px` could be declared on `:root` in `tokens.css`. For B6,
  the implementer may use the variable internally without declaring it globally.
- **Palette initialisation flash** — on a hard reload, the server renders
  `data-palette="phosphor"` (default), and the browser then reads `localStorage` and
  may switch to `paper` in `$effect`. This causes a brief flash. Mitigation (inline
  script in `<head>`) is a SvelteKit layout concern, not a Nav component concern, and
  is out of scope for B6.
- **`aria-controls` and drawer ID** — AC 32 references `id="nav-drawer"`. If multiple
  `Nav` instances appear on one page (e.g. in Storybook composition), the `id` would
  collide. For now one `Nav` per page is assumed; uniqueness is not required in B6.
