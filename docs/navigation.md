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
  import { Nav } from 'dxlb-design'

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
  import { Breadcrumb } from 'dxlb-design'

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
