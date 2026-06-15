# Patterns

Higher-order page-composition components that combine primitives and layout components into common UI patterns for the Dexterlabs site.

## CtaBlock

A prominent call-to-action block with an amber border, optional eyebrow label, heading, subtext, and a right-aligned children slot for action buttons.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `eyebrow` | `string` | `undefined` | Small mono label rendered above the heading. |
| `heading` | `string` | — | Main CTA heading text. |
| `subtext` | `string` | `undefined` | Supporting description rendered below the heading. |
| `children` | `Snippet` | `undefined` | Action buttons or other right-aligned content. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { CtaBlock, Button } from '@dxlbnl/ui'
</script>

<CtaBlock
  eyebrow="New module"
  heading="Voltage Controlled Oscillator"
  subtext="4HP, tri/saw/square outputs, 1V/oct tracking."
>
  <Button variant="primary" href="/shop/dxlb-vco">Buy Now</Button>
</CtaBlock>
```

### Notable behaviour

- Amber (`--amber`) 1px border on all sides. Hover adds a light amber background tint via `color-mix(in srgb, var(--amber) 6%, transparent)`.
- Uses a `Spread` layout internally: left side holds the text stack, right side holds the children slot.
- `subtext` is rendered in mono font at `--ink-dim`.
- `eyebrow` is rendered in `--ink-faint` micro mono text.

---

## StatCard

A compact metric display card showing a label, a large mono value, and an optional sublabel. Built on the base `Card` component.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Metric name. Rendered as micro mono in `--ink-faint`. |
| `value` | `string` | — | The primary metric value. Rendered at 32px mono. |
| `sublabel` | `string` | `undefined` | Optional context label below the value (e.g. units or trend). |
| `color` | `'default' \| 'ok' \| 'amber' \| 'danger'` | `'default'` | Colour applied to the value only. `default` uses `--ink`. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { StatCard } from '@dxlbnl/ui'
</script>

<StatCard label="Units sold" value="142" sublabel="last 30 days" />
<StatCard label="Error rate" value="2.4%" color="danger" />
<StatCard label="Uptime" value="99.9%" color="ok" sublabel="30-day rolling" />
```

### Notable behaviour

- The value is always 32px mono regardless of the `color` prop.
- `color="default"` renders the value in `--ink`. Other colours map directly to their design tokens.
- Card padding is `16px 20px`. No hover state.

---

## KvList

Renders a list of key–value pairs separated by dashed rules. Keys are muted uppercase mono; values are optionally coloured.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `{ key: string; value: string; color?: 'default' \| 'ok' \| 'amber' \| 'danger' \| 'cyan' }[]` | — | Array of key–value pairs. `color` defaults to `'default'` (`--ink`) when omitted. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { KvList } from '@dxlbnl/ui'

  const items = [
    { key: 'Status', value: 'Online', color: 'ok' },
    { key: 'Firmware', value: 'v1.4.2' },
    { key: 'Temperature', value: '47°C', color: 'amber' },
    { key: 'Errors', value: '3', color: 'danger' },
  ]
</script>

<KvList {items} />
```

### Notable behaviour

- Each row has a 1px dashed `--rule` bottom border; the last row has no bottom border.
- Keys are `--ink-faint`, uppercase, `letter-spacing: 0.06em`.
- Row layout uses `Spread` so key and value are pushed to opposite ends.
- `color` on each item is independent — rows can mix colours freely.

---

## ProgressBar

A horizontal progress bar with ARIA progressbar role, optional label row, and colour variants.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | Progress percentage. Clamped to 0–100. |
| `label` | `string` | `undefined` | Optional label shown above the bar. When set, a header row also shows the percentage. |
| `color` | `'ok' \| 'amber' \| 'danger'` | `'ok'` | Fill colour of the progress bar. |
| `overflow` | `boolean` | `false` | Opt in to over-budget rendering when `value` exceeds 100. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { ProgressBar } from '@dxlbnl/ui'
</script>

<ProgressBar value={72} label="Storage" color="amber" />
<ProgressBar value={95} color="danger" />
<ProgressBar value={42} label="Upload progress" />

<!-- Over-budget: shows the real percentage in danger with an end notch -->
<ProgressBar value={128} label="Budget" overflow />
```

### Notable behaviour

- `role="progressbar"` with `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}` is always present.
- `aria-label` is set to `label` when provided, otherwise to `'Progress'`.
- The header row (label + percentage) is only rendered when `label` is provided; it is `aria-hidden="true"` since the ARIA attributes on the track already convey the value.
- Track height is 5px with `--bg-sunken` background and `--rule` border.
- Fill width transitions with `transition: width 0.3s`.
- **Over-budget (`overflow`):** by default `value` is clamped to 0–100 and the percentage readout caps at `100%`. With `overflow` set and `value > 100`, the readout instead shows the real rounded percentage (e.g. `128%`) in `--danger`, the fill switches to the danger colour, and a `--danger` notch is drawn at the right edge of the track. The fill width itself still caps at 100% (the bar is full). When `value ≤ 100`, `overflow` has no effect.

---

## ActivityRow

A single log entry row with a timestamp, LED status indicator, optional actor name, and description text. Rows are separated by dashed bottom borders.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `timestamp` | `string` | — | Timestamp string (e.g. `'14:32:01'` or an ISO date). |
| `description` | `string` | — | Description of the activity. |
| `actor` | `string` | `undefined` | Optional actor name shown before the description, separated by ` · `. |
| `status` | `'ok' \| 'amber' \| 'danger' \| 'off'` | `'off'` | LED colour indicator for the activity status. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { ActivityRow } from '@dxlbnl/ui'
</script>

<ActivityRow
  timestamp="14:32:01"
  actor="deploy-bot"
  description="Production deployment complete"
  status="ok"
/>
<ActivityRow
  timestamp="14:31:44"
  description="Build started"
  status="amber"
/>
```

### Notable behaviour

- Uses `Inline` layout with `gap="sm"` internally: timestamp, LED, then message.
- Timestamp is `--ink-faint`; actor name is `--ink`; description is `--ink-dim`.
- The separator between actor and description (` · `) is `aria-hidden="true"`.
- The last child row in a group has no bottom border (`:last-child { border-bottom: none }`).
- Font is `--mono` at `--t-micro` (12px).

---

## SectionHead

Section header with optional eyebrow label, a heading, optional inline sublabel, and a children slot for filter controls or actions.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `eyebrow` | `string` | `undefined` | Small mono label above the heading. |
| `heading` | `string` | — | Section heading text. |
| `sublabel` | `string` | `undefined` | Optional label rendered inline to the right of the heading. |
| `children` | `Snippet` | `undefined` | Optional content below the heading row (e.g. filter buttons). |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root `<section>` element. |

### Usage

```svelte
<script>
  import { SectionHead, Button } from '@dxlbnl/ui'
</script>

<SectionHead eyebrow="Catalogue" heading="Modules" sublabel="12 items">
  <Button variant="ghost">Filter</Button>
</SectionHead>
```

### Notable behaviour

- Renders as a `<section>` element with a `border-bottom: 1px solid var(--rule)` and `padding: 40px 0 12px`.
- Heading is an h2, rendered at `--t-h3` size (24px) with `font-weight: 500`.
- `sublabel` is pushed to the right of the heading via `margin-left: auto` inside an `Inline` layout.
- `eyebrow` is rendered in `--ink-faint` micro mono above the heading row.

---

## SectionFoot

Section footer with an amber link, optional item count, and optional meta text. The count and meta appear right-aligned.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `href` | `string` | — | URL for the amber "see all" link. |
| `label` | `string` | — | Link text. Rendered in uppercase amber mono. |
| `count` | `number` | `undefined` | Optional item count rendered on the right in muted mono. |
| `meta` | `string` | `undefined` | Optional meta string rendered beside the count. |
| `...rest` | `HTMLAttributes<HTMLElement>` | — | All native HTML element attributes forwarded to the root `<footer>` element. |

### Usage

```svelte
<script>
  import { SectionFoot } from '@dxlbnl/ui'
</script>

<SectionFoot href="/shop" label="View all modules" count={12} meta="in stock" />
```

### Notable behaviour

- Renders as a `<footer>` element using `Spread` layout internally: link on the left, count/meta on the right.
- `border-top: 1px solid var(--rule)` and `padding: 12px 0` with `margin-top: 20px`.
- When both `count` and `meta` are provided, they are joined as `{count} · {meta}`.
- When only one is provided, just that value is shown.
- The link turns `--ink` on hover.

---

## PageHero

Full-width page header with eyebrow, large fluid heading, optional lede paragraph, and a children slot for action buttons.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `eyebrow` | `string \| Snippet` | `undefined` | Small label above the heading. String renders inside `<Text variant="eyebrow">`; a Snippet renders as-is. |
| `heading` | `string \| Snippet` | `undefined` | Main page heading. String renders as plain text inside an `<h1>`; a Snippet renders as-is. |
| `variant` | `'hero' \| 'title'` | `'title'` | Heading scale. `'title'` uses `--t-title` (clamp 36–56px). `'hero'` uses `--t-hero` (fluid 48–112px). |
| `lede` | `string` | `undefined` | Optional lead paragraph. Capped at `max-width: 62ch`. |
| `border` | `boolean` | `false` | Render a `border-bottom: 1px solid var(--rule)` on the root `<header>`. |
| `children` | `Snippet` | `undefined` | Action buttons or other content below the lede. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root `<header>` element. |

### Usage

```svelte
<script>
  import { PageHero, Button, Inline, Led, Text } from '@dxlbnl/ui'
</script>

<!-- String forms — both eyebrow and heading as plain strings -->
<PageHero
  eyebrow="// DEXTERLABS"
  heading="Open-source Eurorack"
  lede="Hardware modules designed in Delft."
  border
>
  <Button variant="primary" href="/shop">Shop modules</Button>
  <Button variant="cta" href="/projects">View projects</Button>
</PageHero>

<!-- Snippet forms — pass markup to eyebrow / heading via the same prop -->
{#snippet eyebrow()}
  <Inline gap="xs">
    <Led color="amber" />
    <Text variant="eyebrow" color="amber">ORDER CANCELLED</Text>
  </Inline>
{/snippet}
{#snippet heading()}
  Dexter.<br /><em>Things built</em><br />in the lab.
{/snippet}
<PageHero {eyebrow} {heading} lede="No charge made." />
```

### Notable behaviour

- Renders as a `<header>` element with `padding: var(--u10) 0 var(--u5)` (80px top, 40px bottom).
- No `border-bottom` by default. Pass `border` to opt in to a `1px solid var(--rule)` divider.
- Heading defaults to the `title` variant — `<Heading level={1} variant="title">` → `--t-title` (clamp 36–56px), `letter-spacing: -0.02em`, `line-height: 1`. Pass `variant="hero"` for the larger marketing scale.
- `lede` is `--ink-dim`, `--t-lede` size, `max-width: 62ch`, `line-height: 1.5`, `margin-top: var(--u2)` (16px).
- Children are wrapped in an `Inline gap="sm"` with `margin-top: var(--u4)` (32px).
- `eyebrow` wrapper has `margin-bottom: 12px` to separate it from the heading. The wrapper is rendered exactly once — the string-vs-snippet branch is inside it.
- `em` elements inside the rendered heading (either `.hero-heading` or `.title-heading`) render as upright `--ink-faint` text via a scoped `:global` rule, so callers can use `<em>` as a faded-emphasis token inside a heading snippet.
