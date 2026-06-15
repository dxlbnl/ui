# Cards

Card components are opinionated content containers built on the base `Card` primitive. All card variants use a diagonal-hatch image placeholder, amber CTA footer on hover (except `NoteCard`), and the `--bg-rail` surface token.

## Card

Base container component: `--bg-rail` background, `--rule` border, flex column, overflow hidden. Use it directly when none of the specialised card variants fit.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `children` | `Snippet` | `undefined` | Card content. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Card } from '@dxlbnl/ui'
</script>

<Card>
  <p style="padding: 16px;">Custom card content</p>
</Card>
```

### Notable behaviour

- `display: flex; flex-direction: column` — children stack vertically and can use `flex: 1` to fill available height.
- `overflow: hidden` ensures content and borders stay within the card boundary.
- No padding is applied by default; add padding inside child elements.

---

## ProductCard

A full product listing card with a diagonal-hatch image placeholder, SKU label, name, description, price, stock status LED, and a CTA footer that turns amber on hover.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'a'` | HTML element to render. Defaults to anchor for clickable product links. |
| `sku` | `string` | — | Product SKU code. Displayed in the image placeholder and above the name. |
| `name` | `string` | — | Product name. Rendered as an h3. |
| `description` | `string` | — | Short product description. Rendered in mono font. |
| `price` | `string` | `undefined` | Optional price string (e.g. `'€49.00'`). Displayed in amber. |
| `status` | `'in-stock' \| 'coming-soon' \| 'low-stock' \| 'out-of-stock'` | `'out-of-stock'` | Stock status. Controls the LED colour and default CTA label. |
| `ctaLabel` | `string` | `undefined` | Override the CTA footer label. If omitted, derived from `status`. |
| `...rest` | `HTMLAnchorAttributes` | — | All native HTML anchor attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { ProductCard } from '@dxlbnl/ui'
</script>

<ProductCard
  href="/shop/dxlb-vco"
  sku="DXLB-VCO"
  name="Voltage Controlled Oscillator"
  description="4HP Eurorack VCO with sine, saw, and square outputs."
  price="€149.00"
  status="in-stock"
/>
```

### Notable behaviour

- Default CTA labels derived from `status`: `'in-stock'` or `'low-stock'` → `'BUY NOW'`; `'coming-soon'` → `'PRE-ORDER'`; `'out-of-stock'` → `'VIEW DETAILS'`.
- LED colour: `'in-stock'` → `ok`; `'out-of-stock'` → `off`; `'coming-soon'` or `'low-stock'` → `amber`.
- The CTA footer border turns amber background with dark text on hover (`background: var(--amber); color: var(--bg)`).
- The image placeholder is a diagonal-hatch repeating linear gradient using `--bg-sunken` and `--bg-elev` stripes at 135°.
- `text-decoration: none; color: inherit` is set so the anchor does not show default link styling.

---

## ProjectCard

A project showcase card with a diagonal-hatch placeholder, optional `TagPill` tags, title, description, and an amber CTA footer on hover.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'a'` | HTML element to render. |
| `slug` | `string` | — | Project slug. Displayed in the image placeholder as `SLUG · PROJECT`. |
| `title` | `string` | — | Project title. Rendered as an h3. |
| `description` | `string` | — | Short project description. |
| `tags` | `string[]` | `[]` | Optional array of tag strings. Each renders as a default `TagPill`. |
| `ctaLabel` | `string` | `'VIEW PROJECT'` | CTA footer label text. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { ProjectCard } from '@dxlbnl/ui'
</script>

<ProjectCard
  href="/projects/eurorack-filter"
  slug="eurorack-filter"
  title="State Variable Filter"
  description="12dB/oct SVF with simultaneous LP, BP, and HP outputs."
  tags={['Hardware', 'Eurorack', 'Analog']}
/>
```

### Notable behaviour

- Tags are only rendered when `tags.length > 0`.
- The slug is displayed uppercase in the image placeholder (`slug.toUpperCase()`).
- CTA footer turns amber on hover, same as `ProductCard`.
- `text-decoration: none; color: inherit` is applied via `:global(.project-card)`.

---

## NoteCard

A log/note entry card displaying a zero-padded hexadecimal ID, kind label, title, optional lede, and optional date footer.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'a'` | HTML element to render. |
| `idx` | `number` | — | Numeric index. Displayed as a zero-padded two-digit hex ID (e.g. `7` → `0x07`). |
| `kind` | `string` | `'LOG'` | Entry kind label. Displayed in `--cyan` in the card header. |
| `title` | `string` | — | Note title. Rendered as an h3. |
| `lede` | `string` | `undefined` | Optional short summary. Rendered in `--ink-dim` body text. |
| `date` | `string` | `undefined` | Optional date string. Shows a footer row with date and `READ →` label when provided. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { NoteCard } from '@dxlbnl/ui'
</script>

<NoteCard
  href="/notes/7"
  idx={7}
  kind="LOG"
  title="VCO calibration notes"
  lede="Temperature compensation across 8 octaves."
  date="2026-05-17"
/>
```

### Notable behaviour

- `idx` is formatted as `'0x' + idx.toString(16).padStart(2, '0').toUpperCase()`. Index 7 becomes `0x07`; index 255 becomes `0xFF`.
- The border turns amber on hover via `:global(.note-card:hover) { border-color: var(--amber) }`.
- No diagonal-hatch image placeholder — `NoteCard` is a pure text card.
- The date footer row is only rendered when `date` is provided; it includes a dashed top border and a `READ →` amber label.
- There is no `tags` prop on `NoteCard`; use `ProjectCard` when tags are needed.
