# B9: Pattern components

## Context

B9 delivers nine composite pattern components — page-level building blocks that are one
layer above the atom/primitive layer but are not full page templates. They implement the
`patterns/` category of the design system and correspond to the HTML prototype in
`dexterlabs-design-system/project/preview/22-layout-patterns.html` and supporting
previews `18-components-alerts.html` and `13-components-cta.html`.

Each component absorbs the CSS from `src/lib/tokens/patterns.css` (the reference source)
into its own scoped `<style>` block. No global class names are exported. The components
are page-level composition helpers — not atoms, not full layouts, but the vocabulary used
to assemble dexterlabs.nl pages.

Layer position: `src/lib/components/patterns/`. May import from:
- `src/lib/components/primitives/` — `Button`, `Led`, `TagPill`
- `src/lib/components/layout/` — `Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule`

Must not import from cards, navigation, forms, feedback, or data layers.

Related wiki pages:
- [requirements.md](../requirements.md) — R8 (Pattern components), R1 (design tokens),
  constraints (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TypeScript)
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style,
  scoped CSS, polymorphic `as` prop, `...rest` forwarding, Svelte 5 runes, snippets for
  slots)
- [decisions.md](../decisions.md) — D1 (tests = Story play functions), D4 (Chakra-style
  composability), D5 (no global utility classes — CSS scoped to components)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function
  rules

---

## Files produced

| File | Role |
|---|---|
| `src/lib/components/patterns/Alert.svelte` | Alert status bar component |
| `src/lib/components/patterns/Alert.stories.svelte` | Alert stories + tests |
| `src/lib/components/patterns/CtaBlock.svelte` | Call-to-action panel component |
| `src/lib/components/patterns/CtaBlock.stories.svelte` | CtaBlock stories + tests |
| `src/lib/components/patterns/StatCard.svelte` | Single-stat display component |
| `src/lib/components/patterns/StatCard.stories.svelte` | StatCard stories + tests |
| `src/lib/components/patterns/KvList.svelte` | Key-value list component |
| `src/lib/components/patterns/KvList.stories.svelte` | KvList stories + tests |
| `src/lib/components/patterns/ProgressBar.svelte` | Horizontal progress bar component |
| `src/lib/components/patterns/ProgressBar.stories.svelte` | ProgressBar stories + tests |
| `src/lib/components/patterns/ActivityRow.svelte` | Single activity feed row component |
| `src/lib/components/patterns/ActivityRow.stories.svelte` | ActivityRow stories + tests |
| `src/lib/components/patterns/SectionHead.svelte` | Section heading block component |
| `src/lib/components/patterns/SectionHead.stories.svelte` | SectionHead stories + tests |
| `src/lib/components/patterns/SectionFoot.svelte` | Section footer component |
| `src/lib/components/patterns/SectionFoot.stories.svelte` | SectionFoot stories + tests |
| `src/lib/components/patterns/PageHero.svelte` | Full-width hero block component |
| `src/lib/components/patterns/PageHero.stories.svelte` | PageHero stories + tests |
| `src/lib/components/patterns/index.ts` | Barrel export for the patterns layer |
| `src/lib/index.ts` | Updated to re-export all 9 pattern components from `$lib` |

---

## Component specifications

---

### 1. Alert

A status banner with a left-border accent, a short tag glyph, a title, and a message.
Used to communicate build status, warnings, errors, and informational notices.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

type AlertVariant = 'ok' | 'amber' | 'danger' | 'info'

interface Props extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant    // defaults to 'info'
  title: string             // uppercase mono title line; required
  message?: string          // prose message text; optional if children provided
  children?: Snippet        // alternative/additional body content
}

let {
  variant = 'info',
  title,
  message,
  children,
  ...rest
}: Props = $props()
```

Notes:
- `message` and `children` are both optional individually but at least one should be
  provided for meaningful content. The component renders both if both are supplied
  (message first, then children).
- `...rest` forwards onto the root `<div>` element.
- No `as` prop — the root is always `<div>` (non-interactive status element).

#### HTML structure

```html
<div class="alert alert--{variant}" role="status" {...rest}>
  <span class="alert-tag" aria-hidden="true">{TAG_GLYPH}</span>
  <div class="alert-body">
    <span class="alert-title">{title}</span>
    {#if message}
      <span class="alert-msg">{message}</span>
    {/if}
    {@render children?.()}
  </div>
</div>
```

Tag glyphs by variant (rendered inside `.alert-tag`, aria-hidden):
- `ok` → `"ok"`
- `amber` → `"!!"`
- `danger` → `"err"`
- `info` → `"inf"`

Structure notes:
- `role="status"` on the root — live region for screen readers; uses polite assertion.
  For `danger` variant, `role="alert"` would be more urgent, but `role="status"` is
  used uniformly for simplicity. See Open Questions OQ-1.
- `.alert-tag` is `aria-hidden="true"` — the glyph is decorative; the `title` carries
  the semantic meaning.
- `.alert-title` text corresponds to the `title` prop.
- `.alert-msg` is only rendered when `message` prop is provided.

#### CSS rules (scoped)

All colors via CSS custom properties. No hardcoded hex values.

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-left: 2px solid;
  font-size: var(--t-body);
  line-height: 1.5;
}

/* Variant — border-color and tinted background */
.alert--ok     { border-color: var(--ok);     background: color-mix(in srgb, var(--ok)     8%, transparent); }
.alert--amber  { border-color: var(--amber);  background: color-mix(in srgb, var(--amber)  8%, transparent); }
.alert--danger { border-color: var(--danger); background: color-mix(in srgb, var(--danger) 8%, transparent); }
.alert--info   { border-color: var(--cyan);   background: color-mix(in srgb, var(--cyan)   8%, transparent); }

/* Tag glyph */
.alert-tag {
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  flex-shrink: 0;
  margin-top: 2px;
}
.alert--ok     .alert-tag { color: var(--ok); }
.alert--amber  .alert-tag { color: var(--amber); }
.alert--danger .alert-tag { color: var(--danger); }
.alert--info   .alert-tag { color: var(--cyan); }

/* Body */
.alert-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Title */
.alert-title {
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.alert--ok     .alert-title { color: var(--ok); }
.alert--amber  .alert-title { color: var(--amber); }
.alert--danger .alert-title { color: var(--danger); }
.alert--info   .alert-title { color: var(--cyan); }

/* Message */
.alert-msg {
  font-size: var(--t-mono);
  color: var(--ink-dim);
  line-height: 1.5;
}
```

#### State / behaviour

No interactive behaviour. Static display component.

---

### 2. CtaBlock

A call-to-action panel with an amber border, a body area (eyebrow + heading + description),
and a link/action slot on the right. The whole block gets a subtle amber background tint
on hover.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface Props extends HTMLAttributes<HTMLElement> {
  as?: string               // defaults to 'div'; use 'a' for a link block or 'article'
  eyebrow?: string          // mono uppercase eyebrow line above the heading
  heading: string           // primary heading; required
  subtext?: string          // description line below heading; optional
  children?: Snippet        // action slot — typically a Button or anchor rendered on
                            // the right side; optional
}

let {
  as = 'div',
  eyebrow,
  heading,
  subtext,
  children,
  ...rest
}: Props = $props()
```

Notes:
- `as` prop allows the block to be rendered as an `<a>` for fully-linked CTA cards.
  When rendered as `<a>`, the consumer should pass `href`.
- `children` slot renders in the right column. If omitted, the body fills full width.

#### HTML structure

```html
<svelte:element this={as} class="cta-block" {...rest}>
  <div class="cta-body">
    {#if eyebrow}
      <span class="cta-eyebrow">{eyebrow}</span>
    {/if}
    <span class="cta-heading">{heading}</span>
    {#if subtext}
      <span class="cta-desc">{subtext}</span>
    {/if}
  </div>
  {#if children}
    <div class="cta-action">
      {@render children()}
    </div>
  {/if}
</svelte:element>
```

#### CSS rules (scoped)

```css
.cta-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border: 1px solid var(--amber);
  padding: 24px 32px;
  color: inherit;
  transition: background var(--transition);
  cursor: pointer;
  text-decoration: none;   /* safe no-op on non-anchor elements */
}

.cta-block:hover {
  background: color-mix(in srgb, var(--amber) 6%, transparent);
}

.cta-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cta-eyebrow {
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.12em;
  color: var(--ink-faint);
  text-transform: uppercase;
}

.cta-heading {
  font-weight: 500;
  font-size: var(--t-lede);
  letter-spacing: -0.01em;
  color: var(--ink);
}

.cta-desc {
  font-size: var(--t-mono);
  color: var(--ink-dim);
  line-height: 1.4;
}

.cta-action {
  flex-shrink: 0;
}
```

#### State / behaviour

Hover: `background` transitions to amber-tinted surface (`color-mix(in srgb, var(--amber) 6%, transparent)`).
No focus ring override — relies on inherited browser default or token-level `:focus-visible` rule.

---

### 3. StatCard

A single-statistic display card — a large monospaced number with a label above and an
optional sub-label below. Used in dashboard-style grid layouts.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type StatColor = 'default' | 'ok' | 'amber' | 'danger'

interface Props extends HTMLAttributes<HTMLDivElement> {
  label: string             // small uppercase label above the value; required
  value: string             // the large stat value (number, percentage, etc.); required
  unit?: string             // optional unit appended to value (e.g. "A", "%"); not rendered
                            // separately — consumer should include it in `value` if needed
  sublabel?: string         // small uppercase sub-label below value; optional
  color?: StatColor         // color applied to the value; defaults to 'default' (var(--ink))
}

let {
  label,
  value,
  sublabel,
  color = 'default',
  ...rest
}: Props = $props()
```

Notes:
- The `unit` prop is listed in the backlog description but the reference CSS and HTML
  prototype do not separate `unit` from `value` — the stat value cell is a single text
  node. The `unit` prop is therefore **not rendered separately**; consumers embed the
  unit in the `value` string (e.g. `value="68%"`, `value="2.04A"`). The `unit` prop is
  accepted and silently ignored, or alternatively, it is omitted from the interface.
  See Open Questions OQ-2.
- `color` maps directly to the value's text color.

#### HTML structure

```html
<div class="stat-card" {...rest}>
  <span class="stat-label">{label}</span>
  <span class="stat-value stat-value--{color}">{value}</span>
  {#if sublabel}
    <span class="stat-sub">{sublabel}</span>
  {/if}
</div>
```

#### CSS rules (scoped)

```css
.stat-card {
  border: 1px solid var(--rule);
  background: var(--bg-rail);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.stat-value {
  font-family: var(--mono);
  font-size: 32px;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--ink);
}

.stat-value--ok     { color: var(--ok); }
.stat-value--amber  { color: var(--amber); }
.stat-value--danger { color: var(--danger); }
/* --default falls through to the .stat-value base color: var(--ink) */

.stat-sub {
  font-family: var(--mono);
  font-size: var(--t-micro);
  color: var(--ink-faint);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

#### State / behaviour

No interactive behaviour. Static display component.

---

### 4. KvList

A key-value pair list rendered as a definition-list-style set of rows with dashed
separator rules between items. Keys are monospaced and faint; values are monospaced and
support color variants.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type KvColor = 'default' | 'ok' | 'amber' | 'danger' | 'cyan'

interface KvItem {
  key: string
  value: string
  color?: KvColor    // optional per-item value color; defaults to 'default'
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  items: KvItem[]   // required; renders one row per item
}

let {
  items,
  ...rest
}: Props = $props()
```

Notes:
- `items` is required and must have at least one entry for the component to render
  meaningfully. Empty array renders an empty container with no rows.
- Colors are applied per-item on the value span, not globally on the list.
- The last row has no dashed border-bottom (CSS `:last-child` rule).

#### HTML structure

```html
<div class="kv-list" {...rest}>
  {#each items as item}
    <div class="kv-row">
      <span class="kv-key">{item.key}</span>
      <span class="kv-val kv-val--{item.color ?? 'default'}">{item.value}</span>
    </div>
  {/each}
</div>
```

#### CSS rules (scoped)

```css
.kv-list {
  display: flex;
  flex-direction: column;
}

.kv-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--rule);
  font-family: var(--mono);
  font-size: var(--t-mono);
}

.kv-row:last-child {
  border-bottom: none;
}

.kv-key {
  color: var(--ink-faint);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.kv-val {
  color: var(--ink);
  text-align: right;
}

.kv-val--amber  { color: var(--amber); }
.kv-val--ok     { color: var(--ok); }
.kv-val--danger { color: var(--danger); }
.kv-val--cyan   { color: var(--cyan); }
/* --default falls through to .kv-val base: var(--ink) */
```

#### State / behaviour

No interactive behaviour. Static display component.

---

### 5. ProgressBar

A horizontal progress bar showing fill percentage with an optional label line above.
The fill color can be `ok` (green), `amber`, or `danger` (red), defaulting to `ok`.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type ProgressColor = 'ok' | 'amber' | 'danger'

interface Props extends HTMLAttributes<HTMLDivElement> {
  value: number            // 0–100 (percentage); required; clamped to [0, 100]
  label?: string           // left label text in the header row; optional
  color?: ProgressColor    // fill color; defaults to 'ok'
}

let {
  value,
  label,
  color = 'ok',
  ...rest
}: Props = $props()
```

Notes:
- `value` is clamped: values below 0 render as 0%, values above 100 render as 100%.
- The percentage display in the header row shows the raw `value` (post-clamp) with `%`
  suffix. The color of the percentage text matches the fill color.
- `...rest` forwards onto the outer `.progress` wrapper `<div>`.
- No `as` prop — always a `<div>`.
- The accessible role for a progress bar is `progressbar` with `aria-valuenow`,
  `aria-valuemin`, and `aria-valuemax`.

#### HTML structure

```html
<div class="progress" {...rest}>
  {#if label}
    <div class="progress-header" aria-hidden="true">
      <span>{label}</span>
      <span class="progress-pct progress-pct--{color}">{clampedValue}%</span>
    </div>
  {/if}
  <div
    class="progress-track"
    role="progressbar"
    aria-valuenow={clampedValue}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label ?? 'Progress'}
  >
    <div
      class="progress-fill progress-fill--{color}"
      style="width: {clampedValue}%"
    ></div>
  </div>
</div>
```

Notes:
- `aria-hidden="true"` on the header row — the `role="progressbar"` element carries the
  accessible state; the visual label row is redundant for screen readers.
- `aria-label` on the track uses `label` if provided, otherwise falls back to `'Progress'`.
- `clampedValue` is a `$derived` value: `Math.min(100, Math.max(0, value))`.

#### CSS rules (scoped)

```css
.progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.progress-pct--ok     { color: var(--ok); }
.progress-pct--amber  { color: var(--amber); }
.progress-pct--danger { color: var(--danger); }

.progress-track {
  height: 5px;
  background: var(--bg-sunken);
  border: 1px solid var(--rule);
}

.progress-fill {
  height: 100%;
  background: var(--ok);
  transition: width 0.3s;
}

.progress-fill--amber  { background: var(--amber); }
.progress-fill--danger { background: var(--danger); }
/* --ok is the default, no extra rule needed */
```

#### State / behaviour

- `clampedValue` is computed via `$derived`: `Math.min(100, Math.max(0, value))`.
- The fill bar width is driven by the inline `style` attribute: `width: {clampedValue}%`.
- No interactive state — display only.

---

### 6. ActivityRow

A single row in an activity feed, showing a timestamp, an LED status dot, and a message
text. Rows are separated by a dashed bottom border; the last row in a container omits it
(handled by `:last-child` or consumer wrapping). The LED is rendered using the `Led`
primitive from `src/lib/components/primitives/`.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type LedStatus = 'ok' | 'amber' | 'danger' | 'off'

interface Props extends HTMLAttributes<HTMLDivElement> {
  timestamp: string         // display string (e.g. "14:22", "2026-05-16"); required
  actor?: string            // optional actor/source label (e.g. "PDX-2"); shown before
                            // the message if provided
  description: string       // activity message text; required
  status?: LedStatus        // LED color; defaults to 'off' (no glow)
}

let {
  timestamp,
  actor,
  description,
  status = 'off',
  ...rest
}: Props = $props()
```

Notes:
- `actor` is optional. When provided, it is rendered before `description` in the message
  cell, separated by `" · "`.
- The LED uses the `Led` primitive with `color={status}`.
- `...rest` forwards onto the root `<div>`.

#### HTML structure

```html
<div class="activity-row" {...rest}>
  <span class="activity-time">{timestamp}</span>
  <Led color={status} />
  <span class="activity-msg">
    {#if actor}
      <span class="activity-actor">{actor}</span>
      <span aria-hidden="true"> · </span>
    {/if}
    {description}
  </span>
</div>
```

#### CSS rules (scoped)

```css
.activity-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 7px 0;
  border-bottom: 1px dashed var(--rule);
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.04em;
}

/* Consumer stacks ActivityRow instances; the last-child rule removes the bottom border
   when ActivityRow is a direct child of a container using :last-child.
   The component applies this self-scoped rule so it works when rows are siblings. */
.activity-row:last-child {
  border-bottom: none;
}

.activity-time {
  color: var(--ink-faint);
  flex-shrink: 0;
}

.activity-msg {
  color: var(--ink-dim);
  flex: 1;
}

.activity-actor {
  color: var(--ink);
}
```

#### State / behaviour

No interactive behaviour. Static display component. The embedded `Led` component handles
its own glow animation if `status` is set to a lit color.

---

### 7. SectionHead

A section heading block with a hex number eyebrow, a large heading, and an optional
right-aligned sub-label. Has a bottom border rule to separate it from the content below.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface Props extends HTMLAttributes<HTMLElement> {
  eyebrow?: string          // mono hex-style label (e.g. "// 0x01"); optional
  heading: string           // main section title; required
  sublabel?: string         // right-aligned mono uppercase sub-label; optional
  children?: Snippet        // optional additional content below the heading row
}

let {
  eyebrow,
  heading,
  sublabel,
  children,
  ...rest
}: Props = $props()
```

Notes:
- `as` is NOT used here — the root element is always `<section>` for semantic correctness.
  `...rest` is spread onto the `<section>` root.
- The heading is rendered as `<h2>` by default. The heading level is fixed at `<h2>`
  because `SectionHead` is a section-level heading. See Open Questions OQ-3 for discussion
  on making heading level configurable.

#### HTML structure

```html
<section class="section-head" {...rest}>
  {#if eyebrow}
    <span class="section-num">{eyebrow}</span>
  {/if}
  <div class="section-row">
    <h2 class="section-title">{heading}</h2>
    {#if sublabel}
      <span class="section-sub">{sublabel}</span>
    {/if}
  </div>
  {#if children}
    {@render children()}
  {/if}
</section>
```

#### CSS rules (scoped)

```css
.section-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 40px 0 12px;
  border-bottom: 1px solid var(--rule);
}

.section-num {
  font-family: var(--mono);
  font-size: var(--t-mono);
  color: var(--ink-faint);
  letter-spacing: 0.12em;
}

.section-row {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.section-title {
  font-weight: 500;
  font-size: var(--t-h3);
  letter-spacing: -0.01em;
  margin: 0;
  color: var(--ink);
}

.section-sub {
  margin-left: auto;
  font-family: var(--mono);
  font-size: var(--t-mono);
  color: var(--ink-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

#### State / behaviour

No interactive behaviour. Static display component.

---

### 8. SectionFoot

A section footer row with a "view all" link on the left and optional meta text on the
right. Has a top border rule separating it from the content above.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

interface Props extends HTMLAttributes<HTMLElement> {
  href: string              // navigation destination for the "view all" link; required
  label: string             // link text (e.g. "VIEW ALL HARDWARE →"); required
  count?: number            // optional item count displayed as part of the meta text
  meta?: string             // right-side meta label text; optional — if omitted, only
                            // count is shown (if provided), or right side is empty
}

let {
  href,
  label,
  count,
  meta,
  ...rest
}: Props = $props()
```

Notes:
- The left-side link renders as an `<a>` element.
- The right-side meta is a `<span>`. If both `count` and `meta` are provided, they are
  rendered as `"{count} · {meta}"`. If only `count` is provided, it renders as `"{count}"`.
  If only `meta` is provided, it renders as `"{meta}"`.
- `...rest` forwards onto the root `<footer>` element.

#### HTML structure

```html
<footer class="section-foot" {...rest}>
  <a class="section-foot-link" {href}>{label}</a>
  {#if count !== undefined || meta}
    <span class="section-foot-meta">
      {#if count !== undefined && meta}
        {count} · {meta}
      {:else if count !== undefined}
        {count}
      {:else}
        {meta}
      {/if}
    </span>
  {/if}
</footer>
```

#### CSS rules (scoped)

```css
.section-foot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--mono);
  font-size: var(--t-mono);
  letter-spacing: 0.06em;
  padding-top: 16px;
  margin-top: 20px;
  border-top: 1px solid var(--rule);
}

.section-foot-link {
  color: var(--amber);
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: color var(--transition);
}

.section-foot-link:hover {
  color: var(--ink);
}

.section-foot-meta {
  color: var(--ink-faint);
  text-transform: uppercase;
  font-size: var(--t-micro);
}
```

#### State / behaviour

Hover on the link: `color` transitions from `var(--amber)` to `var(--ink)`.

---

### 9. PageHero

A full-width hero block with an eyebrow line, a large heading, a lede paragraph, and an
optional CTA buttons slot below. Bottom border separates it from the content below.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

interface Props extends HTMLAttributes<HTMLElement> {
  eyebrow?: string          // mono uppercase eyebrow label above the heading; optional
  heading: string           // large hero heading text (may contain HTML via children
                            // or raw markup); required
  lede?: string             // lede paragraph text below the heading; optional
  children?: Snippet        // slot for CTA buttons or additional markup below the lede
}

let {
  eyebrow,
  heading,
  lede,
  children,
  ...rest
}: Props = $props()
```

Notes:
- The root element is `<header>` by default (renders as page/section header).
  No `as` prop.
- `heading` renders inside an `<h1>`. One `<h1>` per page — the consumer is responsible
  for page-level heading hierarchy.
- The design reference shows italic-styled dim text inline with the heading
  (e.g. `Dexter.<br><em>Things built</em><br>in the lab.`). The `heading` prop is a
  plain string; rich inline formatting (em, br) requires the consumer to use the
  `children` slot or a future `headingSnippet` prop. See Open Questions OQ-4.

#### HTML structure

```html
<header class="page-hero" {...rest}>
  {#if eyebrow}
    <div class="page-hero-eyebrow">{eyebrow}</div>
  {/if}
  <h1 class="page-hero-heading">{heading}</h1>
  {#if lede}
    <p class="page-hero-lede">{lede}</p>
  {/if}
  {#if children}
    <div class="page-hero-actions">
      {@render children()}
    </div>
  {/if}
</header>
```

#### CSS rules (scoped)

```css
.page-hero {
  padding: 48px 0 40px;
  border-bottom: 1px solid var(--rule);
}

.page-hero-eyebrow {
  font-family: var(--mono);
  font-size: var(--t-micro);
  letter-spacing: 0.12em;
  color: var(--ink-faint);
  text-transform: uppercase;
  margin-bottom: 12px;
}

.page-hero-heading {
  font-weight: 500;
  font-size: var(--t-hero);
  line-height: 1;
  letter-spacing: -0.03em;
  margin: 0;
  color: var(--ink);
}

.page-hero-lede {
  margin-top: 20px;
  font-size: var(--t-lede);
  color: var(--ink-dim);
  line-height: 1.55;
  max-width: 62ch;
}

.page-hero-actions {
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
```

#### State / behaviour

No interactive behaviour. Static display component.

---

## Story specifications

All stories follow the rules in `wiki/stories-guide.md`:
- `<script module lang="ts">` with `lang="ts"`
- `defineMeta` from `"@storybook/addon-svelte-csf"`, `component:` set
- `expect` and `within` imported from `"storybook/test"` (no `@` prefix)
- Play functions inline in `play={...}`, no TypeScript type annotations inside the
  template expression, no null-guard checks
- Props in `args`, children/slot content in the story slot
- `resolveTokenColor` from `"$lib/storybook-utils.js"` for CSS custom property assertions

---

### `Alert.stories.svelte` — title: `'Patterns/Alert'`

**Story: "Ok"** — args: `{ variant: 'ok', title: 'Build successful', message: 'All rails nominal.' }`

Play:
- `getByRole('status')` is visible.
- The element with text `"Build successful"` (`.alert-title`) is visible.
- The element with text `"All rails nominal."` (`.alert-msg`) is visible.
- The `.alert-tag` (`getByText('ok')`) has `aria-hidden="true"`.
- The root element's computed `border-left-color` matches `var(--ok)` (via `resolveTokenColor`).

**Story: "Amber"** — args: `{ variant: 'amber', title: 'High load', message: '+12V rail at 88%.' }`

Play:
- `getByRole('status')` is visible.
- `getByText('High load')` is visible.
- Root element's `border-left-color` matches `var(--amber)`.

**Story: "Danger"** — args: `{ variant: 'danger', title: 'Thermal fault', message: 'Over-temperature protection triggered.' }`

Play:
- `getByRole('status')` is visible.
- `getByText('Thermal fault')` is visible.
- Root element's `border-left-color` matches `var(--danger)`.

**Story: "Info"** — args: `{ variant: 'info', title: 'Firmware update available', message: 'v2.1.0 → v2.2.0.' }`

Play:
- `getByRole('status')` is visible.
- Root element's `border-left-color` matches `var(--cyan)` (the info token).

**Story: "No Message"** — args: `{ variant: 'ok', title: 'Status OK' }`

Play:
- `getByRole('status')` is visible.
- `getByText('Status OK')` is visible.
- `canvasElement.querySelector('.alert-msg')` returns null (no message element rendered).

---

### `CtaBlock.stories.svelte` — title: `'Patterns/CtaBlock'`

**Story: "Default"** — args: `{ heading: 'Conduit PDX-2', eyebrow: '// CATALOGUE · HARDWARE', subtext: 'Power your entire Eurorack from a laptop charger.' }`

Slot content: `VIEW →` (plain text in the `.cta-action` slot)

Play:
- `canvasElement.firstElementChild` is visible.
- `getByText('Conduit PDX-2')` is visible.
- `getByText(/CATALOGUE · HARDWARE/i)` is visible.
- `getByText('Power your entire Eurorack from a laptop charger.')` is visible.
- Root element's computed `border-color` matches `var(--amber)`.

**Story: "No Eyebrow"** — args: `{ heading: 'View All Projects' }`

Play:
- `getByText('View All Projects')` is visible.
- `canvasElement.querySelector('.cta-eyebrow')` returns null.

**Story: "As Link"** — args: `{ as: 'a', href: '/catalogue', heading: 'Browse Catalogue', subtext: 'All Dexterlabs products.' }`

Slot content: `BROWSE →`

Play:
- `getByRole('link', { name: /Browse Catalogue/i })` — actually the link role wraps the
  whole element; assert `canvasElement.querySelector('a')` has `href="/catalogue"`.
- The root tag name is `"A"`.

---

### `StatCard.stories.svelte` — title: `'Patterns/StatCard'`

**Story: "Default"** — args: `{ label: 'Modules', value: '12', sublabel: 'across 2 cases' }`

Play:
- `canvasElement.firstElementChild` is visible.
- `getByText('12')` is visible.
- `getByText('MODULES')` is visible (the label is `text-transform: uppercase`; query
  case-insensitively: `getByText(/modules/i)`).
- `getByText(/across 2 cases/i)` is visible.
- The value element (`getByText('12')`) computed `color` matches `var(--ink)`.

**Story: "Ok Color"** — args: `{ label: '+12V draw', value: '68%', color: 'ok', sublabel: '2.04A / 3.0A' }`

Play:
- `getByText('68%')` computed `color` matches `var(--ok)`.

**Story: "Amber Color"** — args: `{ label: 'Orders open', value: '2', color: 'amber', sublabel: 'awaiting shipment' }`

Play:
- `getByText('2')` computed `color` matches `var(--amber)`.

**Story: "Danger Color"** — args: `{ label: 'Thermal', value: '97%', color: 'danger' }`

Play:
- `getByText('97%')` computed `color` matches `var(--danger)`.

**Story: "No Sublabel"** — args: `{ label: 'Projects', value: '5' }`

Play:
- `canvasElement.querySelector('.stat-sub')` returns null.

---

### `KvList.stories.svelte` — title: `'Patterns/KvList'`

**Story: "Default"** — args: `{ items: [{ key: '+12V Output', value: '3.0A' }, { key: '-12V Output', value: '1.5A' }, { key: 'Efficiency', value: '>92%', color: 'amber' }, { key: 'Width', value: '4 HP' }] }`

Play:
- `canvasElement.firstElementChild` is visible.
- `getByText(/\+12V Output/i)` is visible.
- `getByText('3.0A')` is visible.
- `getByText('>92%')` computed `color` matches `var(--amber)`.
- There are 4 `.kv-row` elements (`canvasElement.querySelectorAll('.kv-row').length === 4`).
- The last `.kv-row` has `border-bottom` style of `none` or `0px` (last-child rule).

**Story: "Single Item"** — args: `{ items: [{ key: 'Status', value: 'Nominal', color: 'ok' }] }`

Play:
- 1 row exists.
- `getByText('Nominal')` computed `color` matches `var(--ok)`.
- The single row has no bottom border (it is also the last-child).

**Story: "All Colors"** — args: `{ items: [{ key: 'Ok', value: 'Pass', color: 'ok' }, { key: 'Amber', value: 'Warn', color: 'amber' }, { key: 'Danger', value: 'Fail', color: 'danger' }, { key: 'Cyan', value: 'Info', color: 'cyan' }, { key: 'Default', value: 'Normal' }] }`

Play:
- 5 rows exist.
- `getByText('Pass')` computed `color` matches `var(--ok)`.
- `getByText('Normal')` computed `color` matches `var(--ink)`.

---

### `ProgressBar.stories.svelte` — title: `'Patterns/ProgressBar'`

**Story: "68% Ok"** — args: `{ value: 68, label: '+12V load', color: 'ok' }`

Play:
- `getByRole('progressbar')` is visible.
- `getByRole('progressbar')` has `aria-valuenow="68"`, `aria-valuemin="0"`,
  `aria-valuemax="100"`.
- `getByText('+12V load')` is visible.
- `getByText('68%')` is visible (the header percentage span).
- The `.progress-fill` element's computed `width` is approximately `68%` of the track
  width (or assert `getComputedStyle(fill).width` is not `'0px'`).
- The fill's computed `background-color` matches `var(--ok)`.

**Story: "88% Amber"** — args: `{ value: 88, label: '-12V load', color: 'amber' }`

Play:
- `getByRole('progressbar')` has `aria-valuenow="88"`.
- Fill's computed `background-color` matches `var(--amber)`.

**Story: "97% Danger"** — args: `{ value: 97, label: 'Thermal', color: 'danger' }`

Play:
- `getByRole('progressbar')` has `aria-valuenow="97"`.
- Fill's computed `background-color` matches `var(--danger)`.

**Story: "No Label"** — args: `{ value: 50 }`

Play:
- `getByRole('progressbar')` is visible with `aria-label="Progress"` (fallback label).
- `canvasElement.querySelector('.progress-header')` returns null (no header row).

**Story: "Clamped at 100"** — args: `{ value: 150, label: 'Overflow', color: 'danger' }`

Play:
- `getByRole('progressbar')` has `aria-valuenow="100"` (clamped).
- `getByText('100%')` is visible.

**Story: "Clamped at 0"** — args: `{ value: -10, label: 'Underflow', color: 'ok' }`

Play:
- `getByRole('progressbar')` has `aria-valuenow="0"` (clamped).
- `getByText('0%')` is visible.

---

### `ActivityRow.stories.svelte` — title: `'Patterns/ActivityRow'`

Because `component:` in `defineMeta` renders single instances, and ActivityRow is most
meaningful in groups, the primary stories file covers single-instance stories with
`component:` set. A composition story file covers groups.

**Story: "Ok Status"** — args: `{ timestamp: '14:22', description: 'PDX-2 thermal check passed', status: 'ok' }`

Play:
- `canvasElement.firstElementChild` is visible.
- `getByText('14:22')` is visible.
- `getByText('PDX-2 thermal check passed')` is visible.
- A LED element (`canvasElement.querySelector('.led')`) is present and visible.

**Story: "Amber Status"** — args: `{ timestamp: '13:55', description: 'New order: DISTRANS-AR1 · #DXL-0044', status: 'amber' }`

Play:
- `getByText('13:55')` is visible.
- `getByText(/New order/i)` is visible.

**Story: "With Actor"** — args: `{ timestamp: '09:30', actor: 'PDX-2', description: 'All rails nominal', status: 'ok' }`

Play:
- `getByText('PDX-2')` is visible (the actor element).
- `getByText('All rails nominal')` is visible.

**Story: "Off Status"** — args: `{ timestamp: '08:00', description: 'System boot', status: 'off' }`

Play:
- `canvasElement.firstElementChild` is visible.
- `getByText('System boot')` is visible.

**`ActivityRow.composition.stories.svelte`** — title: `'Patterns/ActivityRow'`, no `component:`

**Story: "Activity Feed"**

Slot content:
```svelte
<div style="border: 1px solid var(--rule); padding: 0 14px;">
  <ActivityRow timestamp="14:22" description="PDX-2 thermal check passed" status="ok" />
  <ActivityRow timestamp="13:55" description="New order: #DXL-0044" status="amber" />
  <ActivityRow timestamp="09:30" description="System boot — all rails nominal" status="ok" />
</div>
```

Play:
- 3 `.activity-row` elements exist.
- The last row has no bottom border (`:last-child` rule).

---

### `SectionHead.stories.svelte` — title: `'Patterns/SectionHead'`

**Story: "With Eyebrow and Sublabel"** — args: `{ eyebrow: '// 0x01', heading: 'Catalogue', sublabel: 'PRODUCTION-READY HARDWARE' }`

Play:
- `getByRole('heading', { level: 2, name: 'Catalogue' })` is visible.
- `getByText(/\/\/ 0x01/)` is visible (eyebrow).
- `getByText(/PRODUCTION-READY HARDWARE/i)` is visible (sublabel).
- Root element is a `<section>` (`canvasElement.querySelector('section')` is not null).
- Root element has `border-bottom` style set.

**Story: "Heading Only"** — args: `{ heading: 'Projects' }`

Play:
- `getByRole('heading', { level: 2, name: 'Projects' })` is visible.
- `canvasElement.querySelector('.section-num')` returns null (no eyebrow).
- `canvasElement.querySelector('.section-sub')` returns null (no sublabel).

**Story: "With Children Slot"** — args: `{ eyebrow: '// 0x02', heading: 'Notes' }`

Slot content: `<p>Recent bench notes and experiments.</p>`

Play:
- `getByRole('heading', { level: 2, name: 'Notes' })` is visible.
- `getByText('Recent bench notes and experiments.')` is visible.

---

### `SectionFoot.stories.svelte` — title: `'Patterns/SectionFoot'`

**Story: "With Count and Meta"** — args: `{ href: '/hardware', label: 'VIEW ALL HARDWARE →', count: 4, meta: 'SHIPPED BY DEXTERLABS · DELFT, NL' }`

Play:
- `getByRole('link', { name: 'VIEW ALL HARDWARE →' })` is visible.
- `getByRole('link', { name: 'VIEW ALL HARDWARE →' })` has `href="/hardware"`.
- `getByText(/SHIPPED BY DEXTERLABS/i)` is visible.
- Root element is `<footer>` (`canvasElement.querySelector('footer')` is not null).
- Root `border-top` style is set.

**Story: "Link Only"** — args: `{ href: '/projects', label: 'VIEW ALL PROJECTS →' }`

Play:
- `getByRole('link', { name: 'VIEW ALL PROJECTS →' })` is visible.
- `canvasElement.querySelector('.section-foot-meta')` returns null (no meta).

**Story: "Count Only"** — args: `{ href: '/notes', label: 'VIEW ALL NOTES →', count: 12 }`

Play:
- `getByRole('link')` is visible.
- `getByText('12')` is visible (count rendered as meta).

---

### `PageHero.stories.svelte` — title: `'Patterns/PageHero'`

**Story: "Full"** — args: `{ eyebrow: '// DEXTERLABS · WORKBENCH · 2026', heading: 'Things built in the lab.', lede: 'Software engineer by day; hardware builder by night.' }`

Slot content:
```svelte
<Button variant="primary">View Catalogue</Button>
<Button variant="ghost">View Projects →</Button>
```

Play:
- `getByRole('heading', { level: 1, name: 'Things built in the lab.' })` is visible.
- `getByText(/DEXTERLABS · WORKBENCH/i)` is visible (eyebrow).
- `getByText(/Software engineer by day/i)` is visible (lede).
- `getByRole('button', { name: 'View Catalogue' })` is visible.
- Root element is `<header>` (`canvasElement.querySelector('header')` is not null).
- Root element has `border-bottom` style set.

**Story: "Heading Only"** — args: `{ heading: 'Catalogue' }`

Play:
- `getByRole('heading', { level: 1, name: 'Catalogue' })` is visible.
- `canvasElement.querySelector('.page-hero-eyebrow')` returns null.
- `canvasElement.querySelector('.page-hero-lede')` returns null.
- `canvasElement.querySelector('.page-hero-actions')` returns null.

**Story: "No Slot"** — args: `{ eyebrow: '// SECTION', heading: 'Projects', lede: 'Open source and web work.' }`

Play:
- `getByRole('heading', { level: 1, name: 'Projects' })` is visible.
- `getByText('Open source and web work.')` is visible.
- `canvasElement.querySelector('.page-hero-actions')` returns null (no children slot).

---

## Acceptance criteria

### File existence and exports

1. All 9 component files exist at `src/lib/components/patterns/<Name>.svelte`.
2. All 9 story files exist at `src/lib/components/patterns/<Name>.stories.svelte`.
3. `ActivityRow.composition.stories.svelte` exists at
   `src/lib/components/patterns/ActivityRow.composition.stories.svelte` and does NOT set
   `component:` in `defineMeta`.
4. `src/lib/components/patterns/index.ts` exists and exports all 9 components as named
   exports: `Alert`, `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`, `ActivityRow`,
   `SectionHead`, `SectionFoot`, `PageHero`.
5. `src/lib/index.ts` exports all 9 pattern components so that
   `import { Alert, CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead, SectionFoot, PageHero } from '$lib'`
   resolves without error in a SvelteKit consumer.
6. `pnpm check` passes with zero TypeScript errors across all 9 component files, both
   index files, and all story files.

### Svelte 5 runes compliance

7. All 9 components use `$props()` for prop declarations — no `export let`.
8. `ProgressBar.svelte` uses `$derived` to compute the clamped value:
   `const clampedValue = $derived(Math.min(100, Math.max(0, value)))`.
9. No component uses `onMount`, `onDestroy`, or imports from `svelte`. Lifecycle concerns
   (none exist for this set of static components) must use `$effect` if needed.
10. No component uses `any`, `@ts-ignore`, or `as any`. Props extend the appropriate
    `HTMLAttributes` type.

### HTML structure — Alert

11. `Alert` renders a root `<div>` with `role="status"`.
12. `Alert` renders a `.alert-tag` child with `aria-hidden="true"` containing the correct
    glyph per variant: `ok` → `"ok"`, `amber` → `"!!"`, `danger` → `"err"`, `info` → `"inf"`.
13. `Alert` renders a `.alert-title` element with the `title` prop value.
14. `Alert` renders `.alert-msg` only when `message` prop is provided.
15. `Alert` with `variant="ok"` has computed `border-left-color` equal to `var(--ok)`.
16. `Alert` with `variant="amber"` has computed `border-left-color` equal to `var(--amber)`.
17. `Alert` with `variant="danger"` has computed `border-left-color` equal to `var(--danger)`.
18. `Alert` with `variant="info"` has computed `border-left-color` equal to `var(--cyan)`.

### HTML structure — CtaBlock

19. `CtaBlock` renders its root element with a 1px solid border whose `border-color`
    matches `var(--amber)`.
20. `CtaBlock` renders the `heading` prop in a `.cta-heading` element.
21. `CtaBlock` renders `.cta-eyebrow` only when `eyebrow` prop is provided.
22. `CtaBlock` renders `.cta-desc` only when `subtext` prop is provided.
23. `CtaBlock` with `as="a"` renders an `<a>` element as its root.
24. `CtaBlock` children slot content is rendered inside `.cta-action`.

### HTML structure — StatCard

25. `StatCard` renders `.stat-label` with the `label` prop value, `text-transform: uppercase`.
26. `StatCard` renders `.stat-value` with the `value` prop value, `font-family: var(--mono)`.
27. `StatCard` with `color="ok"` renders `.stat-value` with computed `color` equal to
    `var(--ok)`.
28. `StatCard` with `color="amber"` renders `.stat-value` with computed `color` equal to
    `var(--amber)`.
29. `StatCard` with `color="danger"` renders `.stat-value` with computed `color` equal to
    `var(--danger)`.
30. `StatCard` with `color="default"` (or omitted) renders `.stat-value` with computed
    `color` equal to `var(--ink)`.
31. `StatCard` renders `.stat-sub` only when `sublabel` prop is provided.

### HTML structure — KvList

32. `KvList` renders one `.kv-row` child per item in the `items` array.
33. `KvList` renders `.kv-key` with `text-transform: uppercase` and `color: var(--ink-faint)`.
34. `KvList` renders `.kv-val` with the item's `value`.
35. `KvList` `.kv-val` with `color="ok"` has computed `color` equal to `var(--ok)`.
36. `KvList` `.kv-val` with `color="amber"` has computed `color` equal to `var(--amber)`.
37. `KvList` `.kv-val` with `color="danger"` has computed `color` equal to `var(--danger)`.
38. `KvList` `.kv-val` with `color="cyan"` has computed `color` equal to `var(--cyan)`.
39. `KvList` `.kv-val` with no `color` prop (default) has computed `color` equal to
    `var(--ink)`.
40. `KvList` — the last `.kv-row` element has no bottom border
    (`getComputedStyle(lastRow).borderBottomStyle === 'none'` or `borderBottomWidth === '0px'`).
41. `KvList` — all rows except the last have `border-bottom: 1px dashed var(--rule)`.

### HTML structure — ProgressBar

42. `ProgressBar` renders an element with `role="progressbar"`.
43. `ProgressBar` `aria-valuenow` equals the clamped value (integer).
44. `ProgressBar` `aria-valuemin` equals `0`.
45. `ProgressBar` `aria-valuemax` equals `100`.
46. `ProgressBar` with `label` provided has `aria-label` equal to that label on the
    `role="progressbar"` element.
47. `ProgressBar` without `label` has `aria-label="Progress"` on the `role="progressbar"` element.
48. `ProgressBar` with `value=150` renders the fill at `100%` width and shows `"100%"` in
    the header.
49. `ProgressBar` with `value=-10` renders the fill at `0%` width and shows `"0%"` in the
    header.
50. `ProgressBar` with `label` provided renders a `.progress-header` row containing the
    label text and the percentage value.
51. `ProgressBar` without `label` does not render a `.progress-header` element.
52. `ProgressBar` fill element with `color="ok"` has computed `background-color` equal to
    `var(--ok)`.
53. `ProgressBar` fill element with `color="amber"` has computed `background-color` equal
    to `var(--amber)`.
54. `ProgressBar` fill element with `color="danger"` has computed `background-color` equal
    to `var(--danger)`.

### HTML structure — ActivityRow

55. `ActivityRow` renders `.activity-time` with the `timestamp` prop value.
56. `ActivityRow` renders the `description` prop inside `.activity-msg`.
57. `ActivityRow` with `actor` prop renders the actor text and `" · "` separator before
    the description inside `.activity-msg`.
58. `ActivityRow` without `actor` prop does not render `.activity-actor`.
59. `ActivityRow` renders a `Led` component with `color` set to the `status` prop.
60. `ActivityRow` — when used as a direct sibling, the last row has `border-bottom: none`
    (`:last-child` CSS rule).

### HTML structure — SectionHead

61. `SectionHead` root element is a `<section>`.
62. `SectionHead` renders an `<h2>` with the `heading` prop value.
63. `SectionHead` renders `.section-num` with the `eyebrow` text only when `eyebrow` is
    provided.
64. `SectionHead` renders `.section-sub` with the `sublabel` text only when `sublabel` is
    provided.
65. `SectionHead` renders children snippet content when provided.
66. `SectionHead` has `border-bottom: 1px solid var(--rule)` on the root `<section>`.

### HTML structure — SectionFoot

67. `SectionFoot` root element is a `<footer>`.
68. `SectionFoot` renders an `<a>` element with the `href` prop and `label` as text.
69. `SectionFoot` `.section-foot-link` has computed `color` equal to `var(--amber)`.
70. `SectionFoot` with both `count` and `meta` renders `"{count} · {meta}"` in the meta span.
71. `SectionFoot` with only `count` renders `"{count}"` in the meta span.
72. `SectionFoot` with only `meta` renders `"{meta}"` in the meta span.
73. `SectionFoot` with neither `count` nor `meta` renders no meta span element.
74. `SectionFoot` has `border-top: 1px solid var(--rule)` on the root `<footer>`.

### HTML structure — PageHero

75. `PageHero` root element is a `<header>`.
76. `PageHero` renders an `<h1>` with the `heading` prop value.
77. `PageHero` renders `.page-hero-eyebrow` only when `eyebrow` is provided.
78. `PageHero` renders a `<p class="page-hero-lede">` only when `lede` is provided.
79. `PageHero` renders `.page-hero-actions` only when the `children` snippet is provided.
80. `PageHero` has `border-bottom: 1px solid var(--rule)`.
81. `PageHero` `.page-hero-heading` has `font-size: var(--t-hero)`.

### CSS and visual constraints

82. No component in `src/lib/components/patterns/` contains global CSS selectors —
    all styles are scoped to the component `<style>` block.
83. No hardcoded hex, rgb, or hsl colour values appear in any pattern component `<style>`
    block. All colours use `var(--…)` tokens or `color-mix()` using only token vars.
84. No component imports or applies a utility class from `patterns.css`, `layout.css`, or
    any other global stylesheet. CSS is absorbed verbatim from the reference into each
    component's `<style>` block.

### Attribute forwarding

85. All 9 components forward `...rest` onto their root element. Attributes passed by the
    consumer (e.g. `data-testid`, `class`, `id`) are present on the rendered root element.

### Accessibility (WCAG 2.1 AA)

86. `Alert` root element has `role="status"` so screen readers announce updates.
87. `Alert` `.alert-tag` glyph elements have `aria-hidden="true"`.
88. `ProgressBar` `role="progressbar"` element has `aria-valuenow`, `aria-valuemin`,
    `aria-valuemax`, and `aria-label` attributes.
89. `SectionFoot` link is a real `<a>` with `href` — accessible by keyboard Tab.
90. `SectionHead` heading is an `<h2>` — meaningful in the document outline.
91. `PageHero` heading is an `<h1>` — meaningful in the document outline.
92. `@storybook/addon-a11y` reports no accessibility violations on any story across all 9
    story files under `pnpm test`.

### Stories

93. Every story file uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, imports `expect` and `within` from `"storybook/test"`,
    and sets `component: <Name>` in `defineMeta`.
94. `ActivityRow.composition.stories.svelte` does NOT set `component:` in `defineMeta`.
95. Every story has a `play` function. Every play function passes under `pnpm test` with
    zero assertion failures.
96. No play function contains TypeScript type annotations (`: Type` syntax) inside the
    `play={...}` template attribute.
97. No play function contains null-guard checks before querying elements.
98. No story renders the component again inside the story slot when `component:` is set
    in `defineMeta` (no double-render).

---

## Out of scope

- **Toast / snackbar** — the design bundle includes a toast pattern (auto-dismissing
  status notification). This is distinct from `Alert` (persistent inline banner) and is
  deferred to a later item.
- **Badge component** — `21-components-misc.html` shows a `.badge` inline element; it is
  close to `TagPill` (already in B4) and does not need a separate B9 component.
- **Empty state component** — also present in `21-components-misc.html`; deferred.
- **Keyboard shortcut (`kbd`) component** — present in `21-components-misc.html`; deferred.
- **Tooltip component** — present in `21-components-misc.html`; deferred.
- **Alert auto-dismiss / close button** — `Alert` in B9 is a static banner with no
  dismiss interaction. An interactive dismissible alert with a close button is deferred.
- **Rich heading markup in PageHero** — the design reference shows `<em>` and `<br>` tags
  within the hero heading. B9 `PageHero` accepts `heading` as a plain string. A
  `headingSnippet` prop to support rich markup is out of scope for B9.
- **Configurable heading level on SectionHead** — `<h2>` is hardcoded. Making the heading
  level a prop (e.g. `level={2}`) is deferred.
- **role="alert" for danger Alert** — all variants use `role="status"` uniformly.
  Using `role="alert"` (assertive live region) for the `danger` variant is an enhancement
  that is deferred.
- **Animated fill transition testing** — `ProgressBar` uses `transition: width 0.3s`.
  Testing the CSS transition animation in play functions is not required; only the final
  computed width is asserted.
- **Palette toggle testing** — verifying all 9 components render correctly in Paper
  palette is a visual review concern; it is not covered by B9 play functions.

---

## Open questions

**OQ-1 (non-blocking): Alert live region role.**
All four `Alert` variants use `role="status"` (polite live region). The `danger` variant
would be more correctly announced with `role="alert"` (assertive live region), which
interrupts the screen reader immediately. Using `role="alert"` for `danger` and
`role="status"` for the other three would be more semantically precise but adds a
conditional. This is deferred and does not block implementation. The implementer may
choose to conditionally set `role={variant === 'danger' ? 'alert' : 'status'}` without
diverging from this spec.

**OQ-2 (non-blocking): StatCard `unit` prop.**
The backlog description lists `unit` as an optional prop alongside `value`. The reference
CSS and HTML prototype (`22-layout-patterns.html`) do not render `unit` as a separate DOM
element — the stat value cell is a single text node (`"68%"`, `"2.04A"`). This spec
treats `unit` as a documentation hint to consumers (embed the unit in the `value` string)
and does not render it separately. If the design later requires `unit` to have different
typography (e.g. smaller, dimmer), a `unit` prop rendering a `<sup>` or separate span
can be added without breaking the existing API.

**OQ-3 (non-blocking): Configurable heading level on SectionHead.**
`SectionHead` hardcodes `<h2>`. A page with multiple section heads at different hierarchy
levels (h2 inside a container that is itself h2-level) would need `<h3>`. A `level` prop
(`2 | 3 | 4`) rendered via `<svelte:element this="h{level}">` would solve this without
breaking the existing API. Deferred to a follow-up.

**OQ-4 (non-blocking): Rich heading markup in PageHero.**
The design reference shows inline `<em>` and `<br>` within the hero `<h1>`. The `heading`
prop is a plain string in B9. A `headingSnippet?: Snippet` alternative prop (rendered
instead of the string `heading` when provided) could support rich markup without
`{@html}` (which would be an XSS risk). This requires no immediate action — use a plain
heading string for B9.

No open questions block implementation. B9 is ready for `test-writer`.
