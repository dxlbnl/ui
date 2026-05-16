# B14: Typography primitives — Text + Heading

## Context

After B13 every higher-order component uses layout primitives for structure, but still
owns its own typography CSS in scoped `<style>` blocks. The root cause is documented in
[composition-limits.md](../composition-limits.md): raw `<span>`, `<p>`, `<h1>`–`<h6>`
elements are rendered by the parent component, so their styles must live there.

`Text` and `Heading` are the final primitive layer. Once they exist, higher-order
components replace their typography spans and headings with these components, eliminating
their `<style>` blocks entirely and achieving pure composition.

Both components are **zero-CSS primitives**: they apply existing global typography
classes from `typography.css` (`.h1`–`.h3`, `.hero-heading`, `.display-heading`,
`.body-text`, `.body-lede`, `.mono-label`, `.eyebrow`) and map a `color` prop to
inline CSS custom properties. No new CSS is introduced.

Related pages:
- [composition-limits.md](../composition-limits.md) — scoping rationale and target end-state
- [specs/B2-design-tokens.md](B2-design-tokens.md) — global typography classes source
- [specs/B4-primitive-components.md](B4-primitive-components.md) — primitive authoring pattern
- [architecture.md](../architecture.md) — D4/D5 composability decisions

---

## Files created by this item

| File | Purpose |
|------|---------|
| `src/lib/components/primitives/Text.svelte` | Typography text primitive |
| `src/lib/components/primitives/Heading.svelte` | Typography heading primitive |
| `src/lib/components/primitives/Text.stories.svelte` | Stories + play functions for Text |
| `src/lib/components/primitives/Heading.stories.svelte` | Stories + play functions for Heading |

`src/lib/index.ts` is updated to export both components.

No existing files are modified by this item (higher-order component refactoring is a
separate follow-on pass).

---

## Design

### Color token vocabulary

Both `Text` and `Heading` accept a `color` prop that maps to an inline CSS custom
property. No color prop = inherits from parent (the correct default for most usage).

| `color` value | Rendered style | Token meaning |
|---------------|----------------|---------------|
| `"ink"` | `color: var(--ink)` | Primary text |
| `"dim"` | `color: var(--ink-dim)` | Secondary / muted |
| `"faint"` | `color: var(--ink-faint)` | Metadata / tertiary |
| `"amber"` | `color: var(--amber)` | Accent / CTA |
| `"cyan"` | `color: var(--cyan)` | Secondary accent |
| `"ok"` | `color: var(--ok)` | Success / online |
| `"danger"` | `color: var(--danger)` | Error / destructive |

Implementation: the component derives `style="color: var(--{token})"` and merges it
with any `style=` prop passed by the caller (caller's `style=` takes precedence for
the same property).

---

## `Text` component

### Purpose

Renders inline or block text with a named typographic role. Covers every non-heading
text element in the design system: body copy, lede paragraphs, monospace labels, and
eyebrow labels.

### Props

```typescript
type TextVariant = 'body' | 'lede' | 'mono' | 'eyebrow'
type TextColor   = 'ink' | 'dim' | 'faint' | 'amber' | 'cyan' | 'ok' | 'danger'

interface Props {
  variant?: TextVariant    // default: 'body'
  color?:   TextColor      // default: undefined (inherits)
  as?:      string         // default: depends on variant (see below)
  children?: Snippet
  class?:   ClassValue | null
  style?:   string | null
  [key: string]: unknown
}
```

### Default tag per variant

| `variant` | Default `as` | Global class applied | Based on |
|-----------|-------------|----------------------|----------|
| `"body"` | `"p"` | `.body-text` | sans, 16px, line-height 1.65 |
| `"lede"` | `"p"` | `.body-lede` | sans, 19px, line-height 1.55, color ink-dim |
| `"mono"` | `"span"` | `.mono-label` | mono, 14px, uppercase, 0.08em tracking |
| `"eyebrow"` | `"span"` | `.eyebrow` | mono, 12px, uppercase, 0.12em tracking, color ink-faint |

The `as` prop overrides the default tag for any variant (e.g. `<Text variant="mono" as="p">`
for a block-level mono paragraph, or `<Text variant="body" as="span">` for inline body text).

### Class merging

```svelte
<svelte:element this={resolvedAs} class={[variantClass, klass]} style={mergedStyle} {...rest}>
  {@render children?.()}
</svelte:element>
```

Where `variantClass` is the global class string (`'body-text'`, `'body-lede'`,
`'mono-label'`, `'eyebrow'`), and `klass` is any additional class passed by the caller.

### Rendered examples

```svelte
<Text variant="body">The quick brown fox.</Text>
<!-- <p class="body-text">The quick brown fox.</p> -->

<Text variant="eyebrow" color="faint">Category</Text>
<!-- <span class="eyebrow" style="color: var(--ink-faint)">Category</span> -->

<Text variant="mono" color="amber" as="div">READ →</Text>
<!-- <div class="mono-label" style="color: var(--amber)">READ →</div> -->

<Text variant="lede" class="hero-lede">A brief opening.</Text>
<!-- <p class="body-lede hero-lede">A brief opening.</p> -->
```

---

## `Heading` component

### Purpose

Renders semantic heading elements (`<h1>`–`<h6>`) with the design system's visual
heading classes. Decouples semantic level (important for accessibility and document
outline) from visual size (important for hierarchy within layouts).

### Props

```typescript
type HeadingLevel   = 1 | 2 | 3 | 4 | 5 | 6
type HeadingVariant = 'display' | 'hero' | 'h1' | 'h2' | 'h3'
type TextColor      = 'ink' | 'dim' | 'faint' | 'amber' | 'cyan' | 'ok' | 'danger'

interface Props {
  level?:   HeadingLevel    // default: 2
  variant?: HeadingVariant  // default: auto-mapped from level (see below)
  color?:   TextColor       // default: undefined (inherits)
  children?: Snippet
  class?:   ClassValue | null
  style?:   string | null
  [key: string]: unknown
}
```

There is no `as` prop — the element tag is always `<h{level}>`. The level controls
semantics; the variant controls appearance.

### Default variant per level

| `level` | Default `variant` | Rationale |
|---------|-------------------|-----------|
| 1 | `"h1"` | Top-level heading |
| 2 | `"h2"` | Section heading |
| 3 | `"h3"` | Sub-section heading |
| 4–6 | none | No visual class; inherits surrounding typography |

When `variant` is specified explicitly it always overrides the default. Common pattern:
`<Heading level={2} variant="h3">` — semantically an h2, visually at h3 size (used by
SectionHead for section titles).

### Global class applied per variant

| `variant` | Global class | Size |
|-----------|-------------|------|
| `"display"` | `.display-heading` | 140px, -0.04em, line-height 0.9 |
| `"hero"` | `.hero-heading` | clamp(48px, 8vw, 112px), -0.03em |
| `"h1"` | `.h1` | 72px, -0.03em |
| `"h2"` | `.h2` | 36px, -0.01em |
| `"h3"` | `.h3` | 24px, -0.01em |

### Rendered examples

```svelte
<Heading level={1} variant="hero">Dexterlabs</Heading>
<!-- <h1 class="hero-heading">Dexterlabs</h1> -->

<Heading level={2} variant="h3">Projects</Heading>
<!-- <h2 class="h3">Projects</h2> -->

<Heading level={3} color="amber">Card Title</Heading>
<!-- <h3 class="h3" style="color: var(--amber)">Card Title</h3> -->

<Heading level={1} variant="display">Dx</Heading>
<!-- <h1 class="display-heading">Dx</h1> -->
```

---

## Authoring pattern reference

Both components follow the same pattern as Stack/Inline/Button:

```svelte
<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  // ... type definitions ...

  interface Props {
    variant?: TextVariant
    color?:   TextColor
    as?:      string
    children?: Snippet
    class?:   ClassValue | null
    style?:   string | null
    [key: string]: unknown
  }

  let { variant = 'body', color, as, children, class: klass = '', style, ...rest } = $props()

  const COLOR_MAP: Record<NonNullable<TextColor>, string> = {
    ink: 'ink', dim: 'ink-dim', faint: 'ink-faint',
    amber: 'amber', cyan: 'cyan', ok: 'ok', danger: 'danger',
  }

  const resolvedAs  = $derived(as ?? DEFAULT_TAG[variant])
  const colorStyle  = $derived(color ? `color: var(--${COLOR_MAP[color]});` : '')
  const mergedStyle = $derived([colorStyle, style].filter(Boolean).join(' ') || undefined)
</script>

<svelte:element this={resolvedAs} class={[VARIANT_CLASS[variant], klass]} style={mergedStyle} {...rest}>
  {@render children?.()}
</svelte:element>
```

No `<style>` block. Both components are zero-CSS.

---

## Acceptance criteria

### Global

**AC-1.** `pnpm check` reports zero TypeScript errors.

**AC-2.** All existing Storybook play functions pass after the new files are added
(`pnpm test` returns 164+ green). No existing story is modified.

**AC-3.** `src/lib/index.ts` exports `Text` and `Heading`.

---

### `Text` — variant and tag

**AC-4.** `<Text variant="body">` renders a `<p>` with class `body-text`.
[`root.tagName === 'P'`; `root.classList.contains('body-text')`]

**AC-5.** `<Text variant="lede">` renders a `<p>` with class `body-lede`.
[`root.tagName === 'P'`; `root.classList.contains('body-lede')`]

**AC-6.** `<Text variant="mono">` renders a `<span>` with class `mono-label`.
[`root.tagName === 'SPAN'`; `root.classList.contains('mono-label')`]

**AC-7.** `<Text variant="eyebrow">` renders a `<span>` with class `eyebrow`.
[`root.tagName === 'SPAN'`; `root.classList.contains('eyebrow')`]

**AC-8.** `<Text variant="body" as="span">` renders a `<span>` (not `<p>`).
[`root.tagName === 'SPAN'`]

**AC-9.** Default variant is `"body"`: `<Text>hello</Text>` renders `<p class="body-text">`.
[`root.tagName === 'P'`; `root.classList.contains('body-text')`]

---

### `Text` — color prop

**AC-10.** `<Text color="amber">` has `style` containing `color: var(--amber)`.
[`root.style.color` resolves to the amber token; or `root.getAttribute('style').includes('var(--amber)')`]

**AC-11.** `<Text color="cyan">` has `style` containing `color: var(--cyan)`.

**AC-12.** `<Text color="faint">` has `style` containing `color: var(--ink-faint)`.

**AC-13.** `<Text color="dim">` has `style` containing `color: var(--ink-dim)`.

**AC-14.** `<Text>` with no `color` prop has no inline `color` style.
[`root.getAttribute('style')` is null or does not contain `color:`]

---

### `Text` — class merging and rest forwarding

**AC-15.** `<Text variant="mono" class="my-class">` has both `mono-label` and `my-class`
on the root element.
[`root.classList.contains('mono-label')` AND `root.classList.contains('my-class')`]

**AC-16.** `<Text data-testid="probe">` forwards the attribute to the rendered element.
[`root.getAttribute('data-testid') === 'probe'`]

---

### `Heading` — level and tag

**AC-17.** `<Heading level={1}>` renders `<h1>`.
[`root.tagName === 'H1'`]

**AC-18.** `<Heading level={2}>` renders `<h2>`.
[`root.tagName === 'H2'`]

**AC-19.** `<Heading level={3}>` renders `<h3>`.
[`root.tagName === 'H3'`]

**AC-20.** Default level is `2`: `<Heading>text</Heading>` renders `<h2>`.
[`root.tagName === 'H2'`]

---

### `Heading` — variant and visual class

**AC-21.** `<Heading level={1}>` (no explicit variant) renders with class `h1`.
[`root.classList.contains('h1')`]

**AC-22.** `<Heading level={2}>` (no explicit variant) renders with class `h2`.
[`root.classList.contains('h2')`]

**AC-23.** `<Heading level={3}>` (no explicit variant) renders with class `h3`.
[`root.classList.contains('h3')`]

**AC-24.** `<Heading level={4}>` (no explicit variant) has no heading visual class.
[`!root.classList.contains('h1')` etc.; level 4–6 inherits styles]

**AC-25.** `<Heading level={1} variant="hero">` renders `<h1 class="hero-heading">`.
[`root.tagName === 'H1'`; `root.classList.contains('hero-heading')`]

**AC-26.** `<Heading level={1} variant="display">` renders `<h1 class="display-heading">`.
[`root.classList.contains('display-heading')`]

**AC-27.** `<Heading level={2} variant="h3">` renders `<h2 class="h3">` — semantic h2,
visual h3 size.
[`root.tagName === 'H2'`; `root.classList.contains('h3')`]

---

### `Heading` — color, class merging, rest forwarding

**AC-28.** `<Heading color="amber">` has `style` containing `color: var(--amber)`.

**AC-29.** `<Heading level={2} class="section-title">` has both `h2` and `section-title`
classes.
[`root.classList.contains('h2')` AND `root.classList.contains('section-title')`]

**AC-30.** `<Heading data-testid="probe">` forwards the attribute.
[`root.getAttribute('data-testid') === 'probe'`]

---

## Stories plan

### `Text.stories.svelte` (8 stories)

| Story | What it tests |
|-------|--------------|
| `Body` | variant="body" → `<p class="body-text">`, correct font/size in computed style |
| `Lede` | variant="lede" → `<p class="body-lede">`, 19px font-size |
| `Mono` | variant="mono" → `<span class="mono-label">`, uppercase |
| `Eyebrow` | variant="eyebrow" → `<span class="eyebrow">`, 12px, uppercase |
| `Colors` | color prop across all 7 values — inline style present for each |
| `PolymorphicAs` | variant="body" as="span" renders SPAN not P |
| `ClassMerge` | extra class present alongside variant class |
| `DefaultVariant` | no variant prop → body-text |

### `Heading.stories.svelte` (7 stories)

| Story | What it tests |
|-------|--------------|
| `Levels` | level 1/2/3 render h1/h2/h3 with matching default variant class |
| `HeroVariant` | level=1 variant="hero" → `<h1 class="hero-heading">` |
| `DisplayVariant` | level=1 variant="display" → `<h1 class="display-heading">` |
| `DecoupledLevelVariant` | level=2 variant="h3" → `<h2 class="h3">` |
| `Level4NoClass` | level=4 → h4, no heading visual class applied |
| `Color` | color="amber" → inline style present |
| `ClassMerge` | extra class present alongside variant class |

---

## Out of scope

- **Higher-order component refactoring** — updating NoteCard, ProductCard, SectionHead
  etc. to use Text + Heading is a separate follow-on item (B15). B14 only delivers the
  primitives and their stories.
- **New global CSS classes** — B14 introduces no new CSS. It wraps what already exists
  in `typography.css`.
- **`<code>` / `<pre>` primitives** — `code` and `pre` are styled by the global element
  reset and do not need wrapper components. Not in scope.
- **Responsive variants** — `var(--t-title)` and `var(--t-subtitle)` tokens exist but
  are unused in the current codebase. Not mapped to a variant until a real use case
  exists.
