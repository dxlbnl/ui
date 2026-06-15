# Navigation

Navigation components handle site-level wayfinding with keyboard accessibility and palette switching built in.

## Nav

Fixed top navigation bar with site branding, link list, palette toggle, and a mobile hamburger drawer. Height is always 48px.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `links` | `{ href: string; label: string; active?: boolean }[]` | `[]` | Navigation links. Each item with `active: true` receives an amber underline. |
| `siteName` | `string` | `'DEXTERLABS'` | Wordmark displayed in the top-left brand area. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root `<nav>` element. |

### Usage

```svelte
<script>
  import { Nav } from '@dxlbnl/ui'

  const links = [
    { href: '/', label: 'Home', active: true },
    { href: '/shop', label: 'Shop' },
    { href: '/projects', label: 'Projects' },
    { href: '/notes', label: 'Notes' },
  ]
</script>

<Nav {links} siteName="DEXTERLABS" />
```

### Notable behaviour

- `position: fixed; top: 0; z-index: 100` — the nav bar overlays page content. Add `padding-top: 48px` to the page body to prevent content being hidden behind it.
- Active links receive `border-bottom: 1px solid var(--amber)` and `aria-current="page"`.
- The palette toggle button reads `localStorage` key `'dxlb-palette'` on mount (inside `$effect`) and applies the stored value. It sets `data-palette` on `document.documentElement` and writes back to `localStorage` on each toggle.
- The hamburger menu is hidden above 767px viewport width. Below 767px, the link list is hidden and the hamburger button and drawer become visible.
- The mobile drawer renders the same links as the desktop list. It is conditionally rendered (`{#if menuOpen}`) so it is absent from the DOM when closed.
- The hamburger menu closes automatically when the user clicks or taps outside it, or presses Escape. The outside-click / Escape listeners are registered in an `$effect` (client-only, SSR-safe) and torn down on unmount.
- **SSR caveat:** `$effect` does not run on the server. The palette initialises to `'phosphor'` on the server; any stored Paper preference is applied after hydration, causing a brief flash for Paper users on first load.
- The brand link always points to `href="/"`.

---

## Breadcrumb

Renders a `<nav aria-label="breadcrumb">` with an ordered list of links. The last crumb receives `aria-current="page"` and is visually non-interactive. Separators are `aria-hidden`.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `crumbs` | `{ label: string; href: string }[]` | — | Ordered array of breadcrumb items. The last item is treated as the current page. |

### Usage

```svelte
<script>
  import { Breadcrumb } from '@dxlbnl/ui'

  const crumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'VCO', href: '/shop/dxlb-vco' },
  ]
</script>

<Breadcrumb {crumbs} />
```

### Notable behaviour

- The last crumb (`i === crumbs.length - 1`) receives `aria-current="page"` and `pointer-events: none` — it is a link element but is visually styled as non-clickable (colour `--ink`, no hover effect).
- Separators (`/`) are rendered as `<span aria-hidden="true">` between items, not between elements in the `<ol>`.
- Purely presentational — no internal state, no click handlers.
- Uses `--mono` font, 11px, `letter-spacing: 0.08em`.
- Non-current crumb links are `--ink-dim` and turn `--ink` on hover.

---

## Pager

A compact previous / label / next stepper rendered as a `<nav>` landmark. The two arrow buttons are native `<button>`s; the centred label is an `aria-live="polite"` region so its changes are announced.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | The centred page label, rendered uppercase mono (e.g. `"Page 2 of 8"`). |
| `onPrev` | `() => void` | `undefined` | Called when the prev (‹) button is clicked and not disabled. |
| `onNext` | `() => void` | `undefined` | Called when the next (›) button is clicked and not disabled. |
| `prevDisabled` | `boolean` | `false` | Disables the prev button (native `disabled`). |
| `nextDisabled` | `boolean` | `false` | Disables the next button (native `disabled`). |
| `minWidth` | `number` | `132` | Min width of the label span, in px (prevents reflow as the label changes). |
| `prevLabel` | `string` | `'Previous'` | Accessible name (`aria-label`) for the prev button. |
| `nextLabel` | `string` | `'Next'` | Accessible name (`aria-label`) for the next button. |
| `as` | `string` | `'nav'` | Polymorphic root element. |
| `...rest` | `HTMLAttributes<HTMLElement>` | — | All native HTML attributes forwarded to the root. `aria-label` defaults to `'Pagination'`. |

### Usage

```svelte
<script>
  import { Pager } from '@dxlbnl/ui'

  let page = $state(1)
  const total = 8
</script>

<Pager
  label={`Page ${page} of ${total}`}
  prevDisabled={page === 1}
  nextDisabled={page === total}
  onPrev={() => (page -= 1)}
  onNext={() => (page += 1)}
/>
```

### Notable behaviour

- The root `<nav>` carries `aria-label="Pagination"` by default (override via `...rest`); it is a landmark, so use one per pagination context.
- The label span is `aria-live="polite"` — screen readers announce the new label after navigation. Its `min-width` (default 132px) keeps the arrows from shifting as the text changes.
- Disabled arrows use the native `disabled` attribute (no `onPrev`/`onNext` fired) and render in `--rule-strong` with `cursor: not-allowed`.

---

## AppShell

A responsive application frame. Above 760px it shows a desktop sidebar **rail**; below 760px the rail is replaced by a **bottom tab bar**. Includes a sticky top bar (`topLeft` / `topRight` slots), an optional rail `footer`, a `brand` block, and a controlled nav (`nav` + `current` + `onNavigate`). The layout switch is driven by CSS container queries — no `matchMedia`, no JS breakpoint for layout.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `nav` | `NavItem[]` | `[]` | Navigation items, rendered in both the rail and the tab bar. |
| `current` | `string` | — | `id` of the currently-active nav item. |
| `onNavigate` | `(id: string) => void` | — | Called with the item id when a nav item is activated. |
| `children` | `Snippet` | — | Required main content. |
| `brand` | `string \| Snippet` | `undefined` | Brand block at the top of the rail (desktop). |
| `topLeft` | `string \| Snippet` | `undefined` | Left side of the sticky top bar. |
| `topRight` | `string \| Snippet` | `undefined` | Right side of the sticky top bar. |
| `footer` | `string \| Snippet` | `undefined` | Optional rail footer (desktop only). |
| `as` | `string` | `'div'` | Polymorphic root element. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

`NavItem` shape: `{ id: string; label: string; badge?: number | string }`. Slot props that accept `string | Snippet` render the string directly or invoke the snippet (D43).

### Usage

```svelte
<script>
  import { AppShell, Led } from '@dxlbnl/ui'

  const nav = [
    { id: 'home', label: 'Home' },
    { id: 'rails', label: 'Rails', badge: 3 },
    { id: 'orders', label: 'Orders' },
  ]
  let current = $state('rails')
</script>

<div style="height: 100vh">
  <AppShell {nav} {current} onNavigate={(id) => (current = id)} topRight="v3.0">
    {#snippet brand()}
      <Led color="amber" /> DEXTERLABS
    {/snippet}

    <h1>Main content goes here</h1>
  </AppShell>
</div>
```

### Notable behaviour

- The rail (≥760px) and the bottom tab bar (<760px) are exact complements via a `@container (min-width: 760px)` query. The query is consumed by an inner `.app-shell-layout` wrapper — **not** the root — because an element cannot match an `@container` query against its own `container-type` (D74).
- Exactly one nav is exposed to assistive tech at a time: an `$effect` with a `ResizeObserver` on the root mirrors the CSS-decided visibility onto `aria-hidden` on the rail vs tab nav (using the same 760px breakpoint). SSR-safe (client-only); does not restructure layout.
- The active rail item gets an amber left border + `aria-current="page"`; the active tab item gets a centred amber indicator, a lit `Led`, and an amber label.
- `badge` renders as a rounded amber count pill in the rail and a small glowing amber dot in the tab bar.
- The top bar is `position: sticky` (48px tall); the main content area scrolls independently. The host must give `AppShell` a bounded height (e.g. `height: 100vh` on a wrapper) since the root is `height: 100%`.
- `brand`, `topLeft`, `topRight`, and `footer` each accept a plain string or a snippet.
