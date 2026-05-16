# B5: Card components

## Context

B5 delivers the four card-level Svelte 5 components — `Card` (base), `ProductCard`,
`ProjectCard`, and `NoteCard` — that represent the first **composite** layer in the
component library. Unlike atoms (B4) and layout primitives (B3), cards compose those
lower-level building blocks into domain-specific containers that directly mirror the
pages of dexterlabs.nl: the `/catalogue/` product listing, the `/projects/` index, and
the `/notes/` engineering log.

The visual reference for all four components is:
- `dexterlabs-design-system/project/preview/10-components-cards.html` — HTML prototype
- `dexterlabs-design-system/project/ui_kits/website/Cards.jsx` — React UI-kit reference

Related wiki pages:
- [vision.md](../vision.md) — Dexterlabs visual identity, site sections
- [requirements.md](../requirements.md) — R4 (card components), R1 (design tokens),
  constraints (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TypeScript, `...rest`
  forwarding)
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style,
  scoped CSS, compound sub-components, polymorphic `as` prop)
- [decisions.md](../decisions.md) — D4 (Chakra-style composability), D5 (no global
  utility classes — CSS scoped to components), D1 (tests = Story play functions)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function rules

### Layer position

Cards are the third layer of the build pyramid. They may import from:
- `src/lib/components/primitives/` — `Button`, `Led`, `TagPill`
- `src/lib/components/layout/` — `Stack`, `Inline`, `Spread`, `Grid`, `Rule`

No imports from other card files (no cross-card dependencies).

### Files produced by this item

| File | Role |
|---|---|
| `src/lib/components/cards/Card.svelte` | Base card component |
| `src/lib/components/cards/Card.stories.svelte` | Card stories + tests |
| `src/lib/components/cards/ProductCard.svelte` | Product card composite |
| `src/lib/components/cards/ProductCard.stories.svelte` | ProductCard stories + tests |
| `src/lib/components/cards/ProjectCard.svelte` | Project card composite |
| `src/lib/components/cards/ProjectCard.stories.svelte` | ProjectCard stories + tests |
| `src/lib/components/cards/NoteCard.svelte` | Note card composite |
| `src/lib/components/cards/NoteCard.stories.svelte` | NoteCard stories + tests |
| `src/lib/components/cards/index.ts` | Barrel export for all four components |
| `src/lib/index.ts` | Updated to re-export all four components |

---

## Visual language: shared patterns

Before the per-component specs, the following patterns apply to all four cards:

### Diagonal hatch placeholder

When a card has no image/thumbnail, a placeholder area uses a diagonal hatching pattern
to signal "image goes here". The CSS is:

```css
background: repeating-linear-gradient(
  135deg,
  var(--bg-sunken) 0 10px,
  var(--bg-elev)   10px 20px
);
```

This is a repeating stripe pattern, not a gradient surface fill. It does not violate
the "no gradients on surfaces" constraint because it is a geometric placeholder pattern,
not a decorative surface treatment. The aspect ratio of the placeholder area is `14/9`.

### Amber footer hover

`ProductCard` and `ProjectCard` have a footer strip (`.card-cta` in the reference HTML).
On card hover, the footer strip transitions to `background: var(--amber)` and
`color: var(--bg)`. The transition duration is `var(--transition)` (0.15s). This is
applied via a CSS `:hover` rule on the card root targeting the footer element — no JS
state is used.

### Amber border hover (NoteCard)

`NoteCard` has no footer strip. Instead, the entire card's border transitions from
`var(--rule)` to `var(--amber)` on hover. Transition: `border-color var(--transition)`.

### Token usage

All colours, spacing, and typography values must use CSS custom properties from
`tokens.css`. No hardcoded hex or rgb values.

---

## Component specifications

### Card (base)

`Card` is the foundational container. `ProductCard`, `ProjectCard`, and `NoteCard` are
**separate components** that replicate the card shell themselves (not wrappers around
`Card`) — this keeps each composite self-contained and avoids prop-threading. `Card`
itself is a general-purpose container that consumer pages can use to build one-off card
layouts.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

interface Props extends HTMLAttributes<HTMLElement> {
  as?: string      // polymorphic element tag; defaults to 'div'
  children?: import('svelte').Snippet
}

let { as = 'div', children, ...rest }: Props = $props()
```

#### HTML structure

`<svelte:element this={as} class="card" {...rest}>`  
`  {@render children?.()}`  
`</svelte:element>`

No sub-components (`Card.Header` etc.) are required for B5. Compound sub-components
are out of scope — see Out of scope.

#### CSS behaviour

```css
.card {
  border: 1px solid var(--rule);
  background: var(--bg-rail);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

- No border-radius (square corners — `--radius-card` is intentionally not applied to
  the base card; the design system uses flat square cards).
- No hover state on the base `Card`. Hover effects are implemented on the composite
  cards only.

#### Accessibility

- No ARIA role added. The rendered element's semantic role comes from the `as` tag and
  its children.
- `...rest` forwards `aria-label`, `role`, `tabindex`, etc.
- When used as a link (`as="a"` with `href`), the element has role `link` natively.

#### Story ideas

- "Default" — `<Card>` wrapping a heading and a paragraph. Shows the base border and
  background.
- "As Article" — `<Card as="article">` wrapping a heading, lede text, and a `<Rule>`.
  Demonstrates semantic override.
- "As Link" — `<Card as="a" href="#demo">` wrapping content. Demonstrates polymorphic
  use for navigable cards.

---

### ProductCard

`ProductCard` represents a hardware product from the `/catalogue/` page. It shows:
- A diagonal hatch placeholder (the product thumbnail area)
- SKU / product ID in mono
- Product name as a heading
- Short description
- Price in amber + stock status with a `Led`
- Footer strip with a CTA label (e.g. "PRE-ORDER →" or "BUY NOW →")

The footer strip turns amber on hover (the amber footer hover pattern above).

#### Props interface

```ts
import type { HTMLAnchorAttributes } from 'svelte/elements'

type StockStatus = 'in-stock' | 'coming-soon' | 'low-stock' | 'out-of-stock'

interface Props extends HTMLAnchorAttributes {
  as?: string            // polymorphic element; defaults to 'a'
  sku: string            // e.g. "CONDUIT-PDX2" — displayed as mono uppercase label
  name: string           // product display name, e.g. "Conduit PDX-2"
  description: string    // short description, one or two sentences
  price?: string         // formatted price string e.g. "€200" — optional; omit if not yet priced
  status?: StockStatus   // defaults to 'out-of-stock'
  ctaLabel?: string      // footer CTA text; defaults derived from status (see below)
}

let {
  as = 'a',
  sku,
  name,
  description,
  price,
  status = 'out-of-stock',
  ctaLabel,
  ...rest
}: Props = $props()
```

Default `ctaLabel` values derived from `status`:
- `'in-stock'` → `'BUY NOW'`
- `'coming-soon'` → `'PRE-ORDER'`
- `'low-stock'` → `'BUY NOW'`
- `'out-of-stock'` → `'VIEW DETAILS'`

The `→` arrow is appended by the component in the footer, not by the consumer.

#### Stock LED color mapping

| `status` | Led `color` | Label colour |
|----------|------------|-------------|
| `'in-stock'` | `'ok'` | `var(--ok)` |
| `'coming-soon'` | `'amber'` | `var(--amber)` |
| `'low-stock'` | `'amber'` | `var(--amber)` |
| `'out-of-stock'` | `'off'` | `var(--ink-faint)` |

#### HTML structure

```
<svelte:element this={as} class="product-card" {...rest}>
  <div class="card-img">        <!-- hatch placeholder -->
    <span class="card-img-label">{sku} · PRODUCT</span>
  </div>
  <div class="card-body">
    <span class="card-sku">{sku}</span>
    <h3 class="card-title">{name}</h3>
    <p class="card-desc">{description}</p>
    <div class="card-meta">
      <span class="card-price">         <!-- only rendered when price is set -->
        {price}
        <span class="card-price-sub">incl. VAT</span>
      </span>
      <span class="card-stock">
        <Led color={ledColor} aria-hidden="true" />
        <span class="card-stock-label">{stockLabel}</span>
      </span>
    </div>
  </div>
  <div class="card-cta">
    <span>{resolvedCtaLabel}</span>
    <span aria-hidden="true">→</span>
  </div>
</svelte:element>
```

The `card-price` element is conditionally rendered only when `price` is defined.

#### CSS behaviour

```css
.product-card {
  border: 1px solid var(--rule);
  background: var(--bg-rail);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.card-img {
  aspect-ratio: 14 / 9;
  background: repeating-linear-gradient(
    135deg,
    var(--bg-sunken) 0 10px,
    var(--bg-elev)   10px 20px
  );
  border-bottom: 1px solid var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-img-label {
  font-family: var(--mono);
  font-size: var(--t-micro);
  color: var(--ink-faint);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-body {
  padding: 12px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}

.card-sku {
  font-family: var(--mono);
  font-size: var(--t-micro);
  color: var(--ink-faint);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-title {
  font-weight: 500;
  font-size: var(--t-lede);
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 0;
}

.card-desc {
  font-size: var(--t-mono);
  color: var(--ink-dim);
  line-height: 1.4;
  margin: 0;
}

.card-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 8px;
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.card-price {
  font-size: var(--t-body);
  color: var(--amber);
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.card-price-sub {
  font-size: var(--t-micro);
  color: var(--ink-faint);
  letter-spacing: 0.06em;
  text-transform: lowercase;
}

.card-stock {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--t-micro);
  letter-spacing: 0.08em;
}

.card-cta {
  border-top: 1px solid var(--rule);
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: var(--t-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-dim);
  transition: background var(--transition), color var(--transition);
}

/* Amber footer hover — CSS only, no JS */
.product-card:hover .card-cta {
  background: var(--amber);
  color: var(--bg);
}
```

#### Accessibility

- Default `as="a"` renders an `<a>` element. The consumer must pass `href` via `...rest`
  for the link to be valid. Without `href`, the element still renders but will not be
  keyboard-focusable.
- The hatch placeholder image area is purely decorative — it has no `alt` text because
  it contains no semantic image. The `card-img-label` text is visible but faint.
- The `→` arrow glyph in the footer is `aria-hidden="true"` — it is decorative.
- The `Led` inside the stock indicator is `aria-hidden="true"` because its meaning is
  conveyed by the adjacent `card-stock-label` text.
- Focus indicator: the default `:focus-visible` outline must not be suppressed.
- WCAG 1.4.3: The amber price text (`var(--amber)` on `var(--bg-rail)`) and the amber
  footer text-on-background at hover state (`var(--bg)` text on `var(--amber)` background)
  must each meet 4.5:1 contrast. Both palettes must pass.

#### Story ideas

- "Coming Soon" — Conduit PDX-2, `status="coming-soon"`, `price="€200"`. Shows amber
  LED, amber price, amber stock label. Footer shows "PRE-ORDER".
- "In Stock" — Distrans AR-1, `status="in-stock"`, `price="€150"`. Shows ok LED, green
  stock label. Footer shows "BUY NOW".
- "Out of Stock" — an archived product, no `price` prop. Shows off LED. Footer shows
  "VIEW DETAILS".
- "As Div" — same card but with `as="div"` (no `href`), for cases where the card is
  not a navigation element.

---

### ProjectCard

`ProjectCard` represents a software project from the `/projects/` page. It shows:
- A diagonal hatch placeholder (the project thumbnail area)
- Tag row with project category tags (`TagPill` atoms in `default` variant)
- Project title as a heading
- Short description
- Footer strip with a CTA label ("VIEW PROJECT →" or "OPEN SOURCE →")

The footer strip turns amber on hover (same pattern as ProductCard).

There is no price or Led stock indicator on a ProjectCard.

#### Props interface

```ts
import type { HTMLAnchorAttributes } from 'svelte/elements'

interface Props extends HTMLAnchorAttributes {
  as?: string          // polymorphic element; defaults to 'a'
  slug: string         // project slug used in the placeholder label, e.g. "zod-fixture"
  title: string        // project display name, e.g. "zod-fixture"
  description: string  // short description
  tags?: string[]      // category tags, e.g. ["TypeScript", "Open Source"]; defaults to []
  ctaLabel?: string    // footer CTA text; defaults to 'VIEW PROJECT'
}

let {
  as = 'a',
  slug,
  title,
  description,
  tags = [],
  ctaLabel = 'VIEW PROJECT',
  ...rest
}: Props = $props()
```

The `→` arrow is appended by the component.

#### HTML structure

```
<svelte:element this={as} class="project-card" {...rest}>
  <div class="card-img">
    <span class="card-img-label">{slug.toUpperCase()} · PROJECT</span>
  </div>
  <div class="card-body">
    <div class="card-tags">               <!-- only rendered when tags.length > 0 -->
      {#each tags as tag}
        <TagPill>{tag}</TagPill>
      {/each}
    </div>
    <h3 class="card-title">{title}</h3>
    <p class="card-desc">{description}</p>
  </div>
  <div class="card-cta">
    <span>{ctaLabel} →</span>
  </div>
</svelte:element>
```

#### CSS behaviour

```css
.project-card {
  border: 1px solid var(--rule);
  background: var(--bg-rail);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

/* Shared with ProductCard — same hatch, same title/desc/body/cta styles */
/* .card-img, .card-img-label, .card-body, .card-title, .card-desc: identical */
/* (Implementer may extract shared rules — see Out of scope for notes) */

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-cta {
  border-top: 1px solid var(--rule);
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: var(--t-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-dim);
  transition: background var(--transition), color var(--transition);
}

.project-card:hover .card-cta {
  background: var(--amber);
  color: var(--bg);
}
```

The `.card-tags` element is only rendered when `tags.length > 0`. When empty, the body
layout adjusts naturally (no empty gap element).

#### Accessibility

- Same link/focus rules as ProductCard.
- Tags rendered as `<TagPill>` spans are purely decorative labels — no ARIA roles needed.
- The `→` glyph in the CTA footer is part of the text content here (not `aria-hidden`)
  because it is appended inline to the `ctaLabel` text — the combined string reads
  naturally by screen readers (e.g. "VIEW PROJECT →").

#### Story ideas

- "Open Source Project" — zod-fixture, `tags={["TypeScript", "Open Source"]}`,
  `ctaLabel="OPEN SOURCE"`.
- "Web Project" — Private Share, `tags={["SvelteKit", "Utility"]}`.
- "No Tags" — a project with no tags, showing the body layout without the tag row.
- "As Div" — `as="div"` for static display without navigation.

---

### NoteCard

`NoteCard` represents an engineering log entry from the `/notes/` page. It shows:
- Hex note index (e.g. `0x06`) in mono, on the left of the header row
- Note kind label (e.g. `PROJECT-LOG`) in cyan, on the right of the header row
- Note title as a heading
- Optional lede text (short excerpt)
- Footer: date on the left, "READ →" in amber on the right

The card has no placeholder image area. Instead of a footer amber hover, the **whole
card border** turns amber on hover (the amber border hover pattern).

#### Props interface

```ts
import type { HTMLAnchorAttributes } from 'svelte/elements'

interface Props extends HTMLAnchorAttributes {
  as?: string         // polymorphic element; defaults to 'a'
  idx: number         // note index (integer), displayed as hex e.g. idx=6 → "0x06"
  kind?: string       // note kind label; defaults to 'LOG'; displayed uppercase in cyan
  title: string       // note title
  lede?: string       // optional short excerpt text
  date?: string       // formatted date string e.g. "1 May 2026"; optional
}

let {
  as = 'a',
  idx,
  kind = 'LOG',
  title,
  lede,
  date,
  ...rest
}: Props = $props()
```

The hex ID is derived from `idx` using JavaScript: `'0x' + idx.toString(16).padStart(2, '0').toUpperCase()`. This computation happens in the component script, not the template, keeping the template readable.

#### HTML structure

```
<svelte:element this={as} class="note-card" {...rest}>
  <div class="note-head">
    <span class="note-hex">{hexId}</span>
    <span class="note-kind">{kind.toUpperCase()}</span>
  </div>
  <h3 class="note-title">{title}</h3>
  {#if lede}
    <p class="note-lede">{lede}</p>
  {/if}
  {#if date}
    <div class="note-foot">
      <span class="note-date">{date}</span>
      <span class="note-read" aria-hidden="true">READ →</span>
    </div>
  {/if}
</svelte:element>
```

#### CSS behaviour

```css
.note-card {
  border: 1px solid var(--rule);
  background: var(--bg-rail);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: border-color var(--transition);
}

/* Amber border hover — no footer strip */
.note-card:hover {
  border-color: var(--amber);
}

.note-head {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.note-hex {
  color: var(--ink-faint);
}

.note-kind {
  color: var(--cyan);
}

.note-title {
  font-weight: 500;
  font-size: var(--t-lede);
  letter-spacing: -0.01em;
  margin: 0;
}

.note-lede {
  font-size: var(--t-body);
  color: var(--ink-dim);
  line-height: 1.5;
  flex: 1;
  margin: 0;
}

.note-foot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.08em;
  color: var(--ink-faint);
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px dashed var(--rule);
}

.note-date {
  color: var(--ink-faint);
}

.note-read {
  color: var(--amber);
}
```

#### Accessibility

- Default `as="a"` renders an `<a>`. Consumer must pass `href` via `...rest`.
- The "READ →" span is `aria-hidden="true"` because it is a decorative cue — screen
  readers will announce the link text from the heading, which is sufficient.
- The hex ID is visible text and requires no special ARIA treatment. Screen readers
  will read "0x06" phonetically; this is acceptable for this context.
- The kind label (`var(--cyan)` on `var(--bg-rail)`) must meet WCAG 4.5:1 contrast in
  both palettes. Note: in the Paper palette `--cyan` maps to `#030304` (near-black),
  which will pass contrast trivially.

#### Story ideas

- "With Lede" — `idx={6}`, `kind="PROJECT-LOG"`, title "Shipping the Site", lede
  excerpt, `date="1 May 2026"`. Full NoteCard with all optional props.
- "Minimal" — `idx={1}`, `kind="LOG"`, title only, no lede, no date. Shows layout
  without optional sections.
- "High Index" — `idx={255}` (two hex digits max), verifying `0xFF` rendering.
- "As Div" — `as="div"` for static display.

---

## Barrel exports

### `src/lib/components/cards/index.ts`

```ts
export { default as Card } from './Card.svelte'
export { default as ProductCard } from './ProductCard.svelte'
export { default as ProjectCard } from './ProjectCard.svelte'
export { default as NoteCard } from './NoteCard.svelte'
```

### `src/lib/index.ts`

Must re-export all four components (in addition to existing exports from B2/B3/B4):

```ts
export { Card, ProductCard, ProjectCard, NoteCard } from './components/cards/index.js'
```

---

## Story specifications

All story files use **Svelte CSF format** (`.stories.svelte`), co-located with the
component. The mandatory format rules from `wiki/stories-guide.md` apply without
exception:

- `<script module lang="ts">` with `lang="ts"`
- `import { defineMeta } from "@storybook/addon-svelte-csf"`
- `import { expect, within } from "storybook/test"` (no `@` prefix)
- Play functions as named `const` variables in the module script block
- No `component:` key in `defineMeta`
- No TypeScript casts or type annotations in template attribute expressions

---

### `Card.stories.svelte` — title: `'Cards/Card'`

#### Story: "Default"

Template: `<Card data-testid="card">` wrapping a `<p>` of short text.

Play:
- Query `data-testid="card"` — assert element is visible.
- Assert computed `background-color` matches `var(--bg-rail)` token value.
- Assert computed `border-top-style` is `"solid"` and `border-top-width` is `"1px"`.
- Assert computed `border-color` matches `var(--rule)` token value.
- Assert computed `display` is `"flex"` and `flex-direction` is `"column"`.

#### Story: "As Article"

Template: `<Card as="article" data-testid="card">` wrapping a `<h2>` and a `<p>`.

Play:
- Assert the root element's `tagName` is `"ARTICLE"`.
- Assert it is visible.

#### Story: "As Link"

Template: `<Card as="a" href="#demo" data-testid="card">` wrapping a `<span>` "View demo".

Play:
- Query by role `"link"` — assert it exists and is visible.
- Assert `href` attribute is `"#demo"`.

---

### `ProductCard.stories.svelte` — title: `'Cards/ProductCard'`

#### Story: "Coming Soon"

Template:
```svelte
<ProductCard
  href="#conduit-pdx2"
  sku="CONDUIT-PDX2"
  name="Conduit PDX-2"
  description="Power your entire Eurorack from a laptop charger."
  price="€200"
  status="coming-soon"
  data-testid="card"
/>
```

Play:
- Assert root element is visible and has `tagName` `"A"`.
- Assert the element with `data-testid="card"` has `href="#conduit-pdx2"`.
- Query by text `"Conduit PDX-2"` — assert the heading is visible.
- Query by text `"CONDUIT-PDX2"` — assert the SKU label is visible.
- Assert an element containing `"€200"` is visible.
- Assert an element containing `"PRE-ORDER"` is visible in the footer area.
- Assert the hatch image area exists: find the `.card-img` element and assert its
  computed `background-image` is not `"none"` (it contains `repeating-linear-gradient`).
- Assert the `.card-img` element has computed `aspect-ratio` resolving to `14/9`
  (or assert the ratio of clientHeight/clientWidth is approximately 0.643).

#### Story: "In Stock"

Template: Distrans AR-1, `status="in-stock"`, `price="€150"`.

Play:
- Assert an element containing `"BUY NOW"` exists.
- Assert a `<span>` element (the Led) exists inside the stock area — assert its computed
  `background-color` matches `var(--ok)` token value (the ok green).

#### Story: "Out of Stock"

Template: a product with `status="out-of-stock"`, no `price` prop.

Play:
- Assert `"VIEW DETAILS"` text is present in the footer.
- Assert no element with text `"€"` is present (price is omitted).

#### Story: "As Div"

Template: ProductCard with `as="div"`, same props as "Coming Soon" but no `href`.

Play:
- Assert the root element's `tagName` is `"DIV"`.
- Assert the card is visible.

---

### `ProjectCard.stories.svelte` — title: `'Cards/ProjectCard'`

#### Story: "Open Source"

Template:
```svelte
<ProjectCard
  href="#zod-fixture"
  slug="zod-fixture"
  title="zod-fixture"
  description="Creating fixtures based on zod schemas automatically."
  tags={["TypeScript", "Open Source"]}
  ctaLabel="OPEN SOURCE"
  data-testid="card"
/>
```

Play:
- Assert root element is visible.
- Query by text `"zod-fixture"` (the title heading) — assert visible.
- Assert a `<span>` element with text `"TypeScript"` is visible (a TagPill).
- Assert a `<span>` element with text `"Open Source"` is visible.
- Assert footer contains text `"OPEN SOURCE"`.
- Assert the hatch image area exists and has computed `background-image` containing
  `"repeating-linear-gradient"` (not `"none"`).

#### Story: "No Tags"

Template: A project with `tags={[]}` (or no `tags` prop).

Play:
- Assert the card renders without error.
- Assert the title heading is visible.
- Assert no `TagPill` elements are rendered (query `getByRole('listitem')` should find
  zero items, or confirm that `queryByText` for a tag text returns null).

#### Story: "As Div"

Template: ProjectCard with `as="div"`.

Play:
- Assert the root element's `tagName` is `"DIV"`.

---

### `NoteCard.stories.svelte` — title: `'Cards/NoteCard'`

#### Story: "With Lede"

Template:
```svelte
<NoteCard
  href="#note-0x06"
  idx={6}
  kind="PROJECT-LOG"
  title="Shipping the Site"
  lede="Turning a messy prototype into a stable place to document the work and sell hardware."
  date="1 May 2026"
  data-testid="card"
/>
```

Play:
- Assert root element is visible.
- Assert an element with text `"0x06"` is present (hex ID, upper-cased).
- Assert an element with text `"PROJECT-LOG"` is present (kind label).
- Assert the `<h3>` element contains text `"Shipping the Site"`.
- Assert a `<p>` element with the lede text is present.
- Assert an element containing `"1 May 2026"` is visible.
- Assert an element containing `"READ"` is visible in the footer.
- Assert computed `border-color` of the root matches `var(--rule)` value (resting state).

#### Story: "Minimal"

Template:
```svelte
<NoteCard
  href="#note-0x01"
  idx={1}
  kind="LOG"
  title="First entry"
  data-testid="card"
/>
```

Play:
- Assert root element is visible.
- Assert an element with text `"0x01"` is present.
- Assert no `<p>` element is rendered (no lede).
- Assert no footer date element is rendered (no date).

#### Story: "High Index"

Template: `idx={255}`.

Play:
- Assert an element with text `"0xFF"` is present (upper-cased hex, two digits).

#### Story: "As Div"

Template: NoteCard with `as="div"`.

Play:
- Assert root element's `tagName` is `"DIV"`.

---

## Acceptance criteria

### General (all four components)

1. All four component files exist at their specified paths within
   `src/lib/components/cards/`.
2. `src/lib/components/cards/index.ts` barrel-exports `Card`, `ProductCard`,
   `ProjectCard`, and `NoteCard` as named exports.
3. `src/lib/index.ts` re-exports all four so that
   `import { Card, ProductCard, ProjectCard, NoteCard } from '$lib'`
   resolves without error in a SvelteKit consumer.
4. `pnpm check` (Svelte type-check) passes with zero errors on all four component
   files and both barrel export files.
5. No component file contains an `@import` or any external CSS file reference; all
   styles live inside the component's own `<style>` block.
6. No hardcoded hex or rgb colour values appear in any component's `<style>` block;
   every colour reference uses a `var(--token)` CSS custom property.
7. No component uses Svelte 4 `export let`; all props are declared via `$props()`.
8. Every component spreads `...rest` onto its root element so that arbitrary HTML
   attributes passed by a consumer are forwarded to the rendered DOM element.
9. All four story files exist at `src/lib/components/cards/<Name>.stories.svelte`,
   co-located with the components.
10. Every story file uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, and imports `expect` and `within` from
    `"storybook/test"` (no `@` prefix). `defineMeta` does not include a `component:`
    key. Play functions are named `const` variables in the module script block.
11. Every story `play` function passes when executed via `pnpm test`
    (`@storybook/addon-vitest` Vitest browser mode).

### Card (base)

12. `<Card>` renders as a `<div>` element by default.
13. When `as="article"` is passed, the root element is `<article>`.
14. When `as="a"` and `href="#demo"` are passed, querying by role `"link"` succeeds
    and the `href` attribute is `"#demo"`.
15. The root element has computed `background-color` matching `var(--bg-rail)` value.
16. The root element has computed `border-top-width: 1px`, `border-top-style: solid`,
    and `border-top-color` matching `var(--rule)` value.
17. The root element has computed `display: flex` and `flex-direction: column`.
18. `children` (snippet content) render inside the card root element.
19. A `data-testid` attribute passed via `...rest` appears on the rendered root element.
20. `@storybook/addon-a11y` reports no accessibility violations on any Card story.

### ProductCard

21. `<ProductCard>` renders as an `<a>` element by default.
22. When `as="div"` is passed, the root element is `<div>`.
23. The `sku` prop renders as visible uppercase mono text above the product title.
24. The `name` prop renders as an `<h3>` element containing the product name text.
25. The `description` prop renders as a `<p>` element with the description text.
26. The hatch placeholder area is present (`.card-img`), has `aspect-ratio: 14/9`, and
    its computed `background-image` is not `"none"` (contains a gradient pattern).
27. When `price` is provided, an element containing the price string (e.g. `"€200"`) is
    rendered and visible.
28. When `price` is omitted, no element containing `"€"` is rendered.
29. The `.card-cta` footer element renders the resolved `ctaLabel` (or the
    status-derived default) in uppercase mono text.
30. `status="in-stock"` causes the footer label to default to `"BUY NOW"` (when no
    `ctaLabel` is provided).
31. `status="coming-soon"` causes the footer label to default to `"PRE-ORDER"`.
32. `status="low-stock"` causes the footer label to default to `"BUY NOW"`.
33. `status="out-of-stock"` causes the footer label to default to `"VIEW DETAILS"`.
34. When `ctaLabel` is explicitly provided, that value overrides the status-derived
    default.
35. A `Led` component is rendered inside the stock indicator area with the correct
    `color` for each `status` value: `ok` for `in-stock`, `amber` for `coming-soon`,
    `amber` for `low-stock`, `off` for `out-of-stock`.
36. The `.card-cta` element has a CSS `:hover` rule inside the component's `<style>`
    block that sets `background: var(--amber)` and `color: var(--bg)` on the card root's
    hover. (Verifiable by asserting the style block contains a `.product-card:hover
    .card-cta` or equivalent selector.)
37. `@storybook/addon-a11y` reports no accessibility violations on any ProductCard story.

### ProjectCard

38. `<ProjectCard>` renders as an `<a>` element by default.
39. When `as="div"` is passed, the root element is `<div>`.
40. The `title` prop renders as an `<h3>` element.
41. The `description` prop renders as a `<p>` element.
42. The hatch placeholder area is present, has `aspect-ratio: 14/9`, and its computed
    `background-image` contains a gradient pattern (not `"none"`).
43. When `tags` contains one or more strings, each is rendered as a `<TagPill>` (a
    `<span>`) with the tag text visible.
44. When `tags` is empty or omitted, no `TagPill` elements are rendered inside the
    card body's tag area.
45. The footer renders the `ctaLabel` (defaulting to `"VIEW PROJECT"`) with the `→`
    arrow appended by the component.
46. The footer element has a CSS `:hover` rule that sets `background: var(--amber)` and
    `color: var(--bg)` on card root hover.
47. `@storybook/addon-a11y` reports no accessibility violations on any ProjectCard story.

### NoteCard

48. `<NoteCard>` renders as an `<a>` element by default.
49. When `as="div"` is passed, the root element is `<div>`.
50. The `idx` prop is converted to a hex string in the form `"0x" + hex.toUpperCase()`
    with at least two digits. Examples: `idx=1` → `"0x01"`, `idx=6` → `"0x06"`,
    `idx=255` → `"0xFF"`.
51. The hex ID is rendered in mono text with colour matching `var(--ink-faint)`.
52. The `kind` prop renders in uppercase mono text with colour matching `var(--cyan)`.
53. `kind` defaults to `"LOG"` when not provided.
54. The `title` prop renders as an `<h3>` element containing the title text.
55. When `lede` is provided, a `<p>` element with the lede text is rendered.
56. When `lede` is not provided, no `<p>` element for lede is rendered.
57. When `date` is provided, the date string is rendered in the footer area.
58. When `date` is not provided, no footer date element is rendered.
59. The root element has a CSS `:hover` rule that sets `border-color: var(--amber)`.
60. The root element's resting computed `border-color` matches `var(--rule)`.
61. `@storybook/addon-a11y` reports no accessibility violations on any NoteCard story.

### Stories

62. `Card.stories.svelte` exists and defines stories with `title: 'Cards/Card'`.
    Named stories: "Default", "As Article", "As Link". Each story has a `play`
    function that passes.
63. `ProductCard.stories.svelte` exists and defines stories with
    `title: 'Cards/ProductCard'`. Named stories: "Coming Soon", "In Stock",
    "Out of Stock", "As Div". Each story has a `play` function that passes.
64. `ProjectCard.stories.svelte` exists and defines stories with
    `title: 'Cards/ProjectCard'`. Named stories: "Open Source", "No Tags", "As Div".
    Each story has a `play` function that passes.
65. `NoteCard.stories.svelte` exists and defines stories with
    `title: 'Cards/NoteCard'`. Named stories: "With Lede", "Minimal",
    "High Index", "As Div". Each story has a `play` function that passes.

---

## Out of scope

- **Compound sub-components** (`Card.Header`, `Card.Body`, `Card.Footer`) — the
  architecture decision D4 mentions these as a pattern, but for B5 each composite card
  is self-contained with its own internal structure. Sub-components would be appropriate
  if arbitrary card layouts were needed; the three concrete card types make this
  unnecessary for now.
- **Shared CSS extraction** — `ProductCard` and `ProjectCard` share several internal
  CSS rules (hatch, body, title, desc, footer). The implementer may observe this
  duplication. Extracting shared styles into a CSS utility is explicitly not done — each
  component's CSS lives in its own `<style>` block (D5). The duplication is intentional
  and acceptable.
- **Image support** — none of the cards accept an actual `<img>` element or `src` prop.
  The placeholder is always the diagonal hatch. Real image support is a future
  enhancement outside this item.
- **Hover state assertions via computed style** — asserting the state of CSS
  `:hover` rules via computed style after a `userEvent.hover()` call is possible in
  Vitest browser mode but fragile (hover styles may not compute in headless mode
  depending on Playwright driver). The spec accepts asserting that the hover CSS rule
  is present in the component's `<style>` block (a code-review check) as a fallback.
  If `userEvent.hover` works in the test environment, test-writer should prefer it.
- **Card grid layout** — `layout.css` defines a `.card-grid` container query grid.
  This is a page-level layout pattern, not a card component. It is out of scope for B5
  (deferred to B9/B11 or a future page-layout item).
- **Amber card container hover on Card (base)** — the base `Card` has no hover effect
  specified. Amber hover effects are only on the three composite cards. The base `Card`
  is intentionally neutral.
- **NoteCard footer "READ →" as an interactive link** — the "READ →" text is decorative
  in the NoteCard; the entire card is the link. The "READ →" text is `aria-hidden`.
- **Palette toggle testing** — testing that all cards look correct in Paper palette is
  out of scope for B5 play functions. The a11y addon will flag contrast issues; colour
  correctness in Paper is a visual review concern (B11 Storybook catalogue).
- **Visual regression / snapshot testing** — tests are interaction and assertion only.

---

## Open questions

**OQ-1 (non-blocking): Hover state assertability in Vitest browser mode.**
CSS `:hover` pseudo-class styles may or may not be reflected in `getComputedStyle()`
after `userEvent.hover()` depending on whether the Playwright driver fires a real
mouse-enter event that triggers CSS pseudo-class matching. If hover computed styles do
not reflect in the play function, the acceptance criteria for amber footer hover and
amber border hover (criteria 36, 46, 59) fall back to a code-review check: confirm
the `:hover` selector is present in the component's scoped `<style>` block. This does
not block implementation. The test-writer should attempt `userEvent.hover()` first and
note in the story comment if it must be skipped.

**OQ-2 (non-blocking): ProductCard `price` string format.**
The spec accepts a pre-formatted price string (e.g. `"€200"`). It does not accept a
numeric integer (cents) and format it internally. This keeps the component simple and
locale-agnostic. If the dexterlabs.nl site needs internal formatting (e.g. from a
Stripe price integer), that formatting belongs in the page layer, not the component.
This is a deliberate scoping decision, not a gap.

**OQ-3 (non-blocking): `as` prop type on `ProductCard` and `ProjectCard`.**
Both default to `"a"` and extend `HTMLAnchorAttributes`. If `as="div"` is passed, the
`href` and other anchor-specific attributes passed through `...rest` remain valid
TypeScript (they are present in `HTMLAnchorAttributes`) but semantically incorrect.
As with B3 layout components (OQ-2 there), the `as` prop is typed as `string` for
simplicity; full generic polymorphism is a future TypeScript refinement. Not blocking.

No open questions block implementation. B5 is ready for `test-writer`.
