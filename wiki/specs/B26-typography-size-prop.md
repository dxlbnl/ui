# B26: Typography primitive size prop and scoped CSS

## Context

`Text` and `Heading` are currently zero-CSS components. They apply global typography
class strings from `typography.css` and delegate all font-size control to their
callers. Because the global classes cover only the natural variant sizes, higher-order
components throughout the library work around the gap with inline `style="font-size:
var(--t-xxx); letter-spacing: …"` — bypassing the token system and creating visual
inconsistency across six files and 15 style overrides.

This item fixes the root cause in three coordinated steps:

1. Add a `size` prop (`xs | sm | md | lg | xl`) to both `Text` and `Heading`, mapping
   to the existing type-scale tokens, so callers can request any size without inline
   styles.
2. Add a `case` prop (`upper | lower | none`) to `Text`, so callers can suppress the
   forced uppercase on `mono` and `eyebrow` variants without inline `text-transform:`.
3. Move all typography variant CSS into each component's own scoped `<style>` block —
   using the same `data-size` / `data-case` attribute pattern as the layout primitives
   use `data-gap` — so the primitives own their visual output and no longer depend on
   global classes being present in the document.

Once the primitives support these props, all 15 inline `style=` font-size and
text-transform overrides in higher-order components are replaced with typed prop calls.

Related wiki pages:
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style
  style props, `data-*` attribute pattern, scoped CSS, strict TypeScript)
- [requirements.md](../requirements.md) — R2 (typography classes), R3 (primitive
  components)
- [decisions.md](../decisions.md) — D4 (Chakra-style composability), D5 (no global
  utility classes), D18 (Svelte scoping strategy)
- [composition-limits.md](../composition-limits.md) — Svelte scoping boundary context
- [specs/B25-layout-gap-api.md](B25-layout-gap-api.md) — structural analogue: `gap`
  prop on layout primitives using the same `data-gap` pattern
- [backlog item](../backlog/doing/B26-typography-size-prop.md) — item card with full
  API design and caller migration table

### Files affected

| File | Change |
|------|--------|
| `src/lib/components/primitives/Text.svelte` | Add `size` prop, `case` prop, `data-size`/`data-case` attributes, scoped `<style>` block with all variant CSS |
| `src/lib/components/primitives/Heading.svelte` | Add `size` prop, `data-size` attribute, scoped `<style>` block with all variant CSS |
| `src/lib/components/primitives/Text.stories.svelte` | Add size-variant and case stories with play assertions |
| `src/lib/components/primitives/Heading.stories.svelte` | Add size-variant stories with play assertions |
| `src/lib/components/cards/NoteCard.svelte` | Replace 5 `style=` overrides with `size="xs"` / `size="lg"` |
| `src/lib/components/cards/ProductCard.svelte` | Replace 4 `style=` overrides with `size=` / `case=` props; replace `.card-desc` scoped block with `<Text variant="mono" case="none">` |
| `src/lib/components/cards/ProjectCard.svelte` | Replace 1 `style=` override with `size="lg"` |
| `src/lib/components/patterns/StatCard.svelte` | Replace 2 `style=` overrides with `size="xs"` (normalize sublabel letter-spacing to mono default 0.08em) |
| `src/lib/components/patterns/ProgressBar.svelte` | Replace 2 `style=` overrides with `size="xs"` |
| `src/lib/components/feedback/Modal.svelte` | Replace `style=` font-size override with `size="lg"`; move `flex: 1` to scoped CSS on a wrapper or `modal-title` class |

### Size scale (both `Text` and `Heading`)

| `size` prop | Token | Resolved |
|-------------|-------|----------|
| `xs` | `--t-micro` | 12 px |
| `sm` | `--t-mono` | 14 px |
| `md` | `--t-body` | 16 px |
| `lg` | `--t-lede` | 19 px |
| `xl` | `--t-h3` | 24 px |

Natural default sizes per `Text` variant (no prop needed in the common case):

| `variant` | Natural default `size` |
|-----------|----------------------|
| `eyebrow` | `xs` (12 px) |
| `mono` | `sm` (14 px) |
| `body` | `md` (16 px) |
| `lede` | `lg` (19 px) |

`Heading` default sizes come from the variant's existing CSS (e.g. `h3` → 24 px,
`h2` → 36 px). The `size` prop overrides font-size only; all other variant properties
(letter-spacing, line-height, font-weight, text-transform) remain from the variant CSS.

---

## Acceptance criteria

### AC-1 — `Text` declares a `size` prop of the correct type

`Text.svelte` declares `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` inside its `Props`
interface. `pnpm check` produces zero TypeScript errors on the file.

### AC-2 — `Text` renders a `data-size` attribute when `size` is set

When `<Text variant="mono" size="xs">` is rendered, the root DOM element has the
attribute `data-size="xs"`. When `size` is omitted, no `data-size` attribute is
present on the element (attribute is absent, not an empty string).

### AC-3 — `Text size="xs"` produces 12 px computed font-size

When `<Text variant="mono" size="xs">` is rendered (without any inline `style=`),
`getComputedStyle(el).fontSize` resolves to `"12px"`. This verifies that the scoped
CSS rule `[data-size="xs"] { font-size: var(--t-micro) }` is applied.

### AC-4 — `Text size="sm"` produces 14 px computed font-size

When `<Text variant="mono" size="sm">` is rendered, `getComputedStyle(el).fontSize`
resolves to `"14px"`.

### AC-5 — `Text size="md"` produces 16 px computed font-size

When `<Text variant="body" size="md">` is rendered, `getComputedStyle(el).fontSize`
resolves to `"16px"`.

### AC-6 — `Text size="lg"` produces 19 px computed font-size

When `<Text variant="lede" size="lg">` is rendered, `getComputedStyle(el).fontSize`
resolves to `"19px"`.

### AC-7 — `Text size="xl"` produces 24 px computed font-size

When `<Text variant="body" size="xl">` is rendered, `getComputedStyle(el).fontSize`
resolves to `"24px"`.

### AC-8 — `Text` natural defaults: no `size` prop → variant's natural size

When `<Text variant="eyebrow">` is rendered with no `size` prop, computed `fontSize`
is `"12px"`. When `<Text variant="mono">` is rendered with no `size` prop, computed
`fontSize` is `"14px"`. When `<Text variant="body">` is rendered with no `size` prop,
computed `fontSize` is `"16px"`. When `<Text variant="lede">` is rendered with no
`size` prop, computed `fontSize` is `"19px"`. All assertions are made without any
`style=` prop on the element.

### AC-9 — `Text size` overrides only font-size; other variant properties are preserved

When `<Text variant="eyebrow" size="lg">` is rendered, `getComputedStyle(el).fontSize`
is `"19px"` AND `getComputedStyle(el).letterSpacing` is `"0.12em"` (the eyebrow
variant's letter-spacing, unchanged) AND `getComputedStyle(el).textTransform` is
`"uppercase"` (the eyebrow variant's transform, unchanged).

### AC-10 — `Heading` declares a `size` prop of the correct type

`Heading.svelte` declares `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'` inside its
`Props` interface. `pnpm check` produces zero TypeScript errors on the file.

### AC-11 — `Heading` renders a `data-size` attribute when `size` is set

When `<Heading level={3} size="lg">` is rendered, the root DOM element has the
attribute `data-size="lg"`. When `size` is omitted, no `data-size` attribute is
present.

### AC-12 — `Heading size="xs"` produces 12 px computed font-size

When `<Heading level={3} size="xs">` is rendered, `getComputedStyle(el).fontSize`
resolves to `"12px"`.

### AC-13 — `Heading size="lg"` produces 19 px computed font-size

When `<Heading level={3} size="lg">` is rendered, `getComputedStyle(el).fontSize`
resolves to `"19px"`.

### AC-14 — `Heading size="xl"` produces 24 px computed font-size

When `<Heading level={3} size="xl">` is rendered (or any level), `getComputedStyle(el).fontSize`
resolves to `"24px"`.

### AC-15 — `Heading size` overrides only font-size; variant letter-spacing preserved

When `<Heading level={3} size="lg">` is rendered, `getComputedStyle(el).fontSize` is
`"19px"` AND `getComputedStyle(el).letterSpacing` is `"-0.01em"` (the `.h3` variant's
letter-spacing, unchanged).

### AC-16 — `Text` declares a `case` prop of the correct type

`Text.svelte` declares `case?: 'upper' | 'lower' | 'none'` inside its `Props`
interface. `pnpm check` produces zero TypeScript errors.

### AC-17 — `Text` renders a `data-case` attribute when `case` is set

When `<Text variant="mono" case="lower">` is rendered, the root DOM element has the
attribute `data-case="lower"`. When `case` is omitted, no `data-case` attribute is
present.

### AC-18 — `Text case="lower"` produces `text-transform: lowercase`

When `<Text variant="mono" case="lower">` is rendered, `getComputedStyle(el).textTransform`
resolves to `"lowercase"`. This overrides the `mono` variant's default `uppercase`.

### AC-19 — `Text case="upper"` produces `text-transform: uppercase`

When `<Text variant="body" case="upper">` is rendered, `getComputedStyle(el).textTransform`
resolves to `"uppercase"`.

### AC-20 — `Text case="none"` produces `text-transform: none`

When `<Text variant="mono" case="none">` is rendered, `getComputedStyle(el).textTransform`
resolves to `"none"`. This suppresses the `mono` variant's forced uppercase.

### AC-21 — `Text variant="mono"` and `variant="eyebrow"` default to uppercase without `case` prop

When `<Text variant="mono">` is rendered with no `case` prop, `getComputedStyle(el).textTransform`
is `"uppercase"`. When `<Text variant="eyebrow">` is rendered with no `case` prop,
`getComputedStyle(el).textTransform` is `"uppercase"`. When `<Text variant="body">` is
rendered with no `case` prop, `getComputedStyle(el).textTransform` is `"none"`.

### AC-22 — Typography variant CSS is scoped inside `Text.svelte`

The `Text.svelte` `<style>` block contains scoped CSS rules for all four variants:
`.body-text`, `.body-lede`, `.mono-label`, `.eyebrow`. Each rule declares at minimum
the properties present in `typography.css` for that class. `pnpm check` passes; no
browser-visible style regression occurs.

> Verification: a `<Text variant="mono">` element renders with `font-family` resolving
> to the monospace stack (`JetBrains Mono` / `ui-monospace`), `font-size: 14px`,
> `letter-spacing: 0.08em`, and `text-transform: uppercase` — regardless of whether
> `typography.css` global classes are present in the document.

### AC-23 — Typography variant CSS is scoped inside `Heading.svelte`

The `Heading.svelte` `<style>` block contains scoped CSS rules for all five variants:
`.h1`, `.h2`, `.h3`, `.hero-heading`, `.display-heading`. Each rule declares at
minimum the properties present in `typography.css` for that class. `pnpm check` passes.

> Verification: a `<Heading level={3}>` renders with `font-size: 24px`,
> `letter-spacing: -0.01em`, `line-height: 1.2`, and `font-weight: 500` regardless of
> whether `typography.css` global classes are present.

### AC-24 — `typography.css` global classes are retained unchanged

The file `src/lib/tokens/typography.css` is not modified. All existing class
definitions (`.h1`, `.h2`, `.h3`, `.hero-heading`, `.display-heading`, `.body-text`,
`.body-lede`, `.mono-label`, `.eyebrow`) remain present and unchanged. `Prose` and
raw HTML consumers continue to work.

### AC-25 — NoteCard: hexId and kind Text overrides replaced with `size="xs"`

In `NoteCard.svelte`, the two `<Text variant="mono" … style="font-size: var(--t-micro); letter-spacing: 0.1em;">` elements (rendering `{hexId}` and `{kind}`) are replaced with `<Text variant="mono" size="xs">`. No `style=` prop referencing `font-size` or `letter-spacing` remains on those elements. The rendered font-size resolves to `12px`.

### AC-26 — NoteCard: Heading override replaced with `size="lg"`

In `NoteCard.svelte`, the `<Heading level={3} style="font-size: var(--t-lede);">` is
replaced with `<Heading level={3} size="lg">`. The rendered heading's `fontSize`
resolves to `"19px"`. No `style=` attribute remains on that Heading.

### AC-27 — NoteCard: footer date and arrow Text overrides replaced with `size="xs"`

In `NoteCard.svelte`, the two `<Text variant="mono" … style="font-size: var(--t-micro); letter-spacing: 0.08em;">` elements in the footer (date and `READ →`) are replaced with `<Text variant="mono" size="xs">`. No `style=` prop referencing `font-size` or `letter-spacing` remains on those elements.

### AC-28 — ProductCard: Heading override replaced with `size="lg"`

In `ProductCard.svelte`, the `<Heading level={3} style="font-size: var(--t-lede);">` is
replaced with `<Heading level={3} size="lg">`. Rendered heading `fontSize` resolves
to `"19px"`. No `style=` attribute remains on that Heading.

### AC-29 — ProductCard: price Text override replaced with `size="md"`

In `ProductCard.svelte`, the `<Text variant="mono" color="amber" style="font-size: var(--t-body);">` (price) is replaced with `<Text variant="mono" color="amber" size="md">`. Rendered `fontSize` resolves to `"16px"`. No `style=` attribute remains.

### AC-30 — ProductCard: "incl. VAT" Text override replaced with `size="xs" case="lower"`

In `ProductCard.svelte`, the `<Text variant="mono" style="font-size: var(--t-micro); text-transform: lowercase; letter-spacing: 0.06em;">` (showing "incl. VAT") is replaced with `<Text variant="mono" size="xs" case="lower">`. Rendered `fontSize` resolves to `"12px"` and `textTransform` resolves to `"lowercase"`. No `style=` attribute remains on that element.

### AC-31 — ProductCard: stock label Text override replaced with `size="xs"`

In `ProductCard.svelte`, the `<Text variant="mono" style="font-size: var(--t-micro);">` (stockLabel) is replaced with `<Text variant="mono" size="xs">`. Rendered `fontSize` resolves to `"12px"`. No `style=` attribute remains.

### AC-32 — ProductCard: `.card-desc` replaced with `<Text variant="mono" case="none">`

In `ProductCard.svelte`, the `<p class="card-desc">` is replaced with
`<Text variant="mono" case="none" color="dim">` (or equivalent). The rendered
element's `textTransform` is `"none"`, `fontFamily` resolves to the monospace stack,
`fontSize` is `"14px"`, and `color` resolves to `var(--ink-dim)`. The `style="…"`
font-size override is removed. A residual `:global(.card-desc) { line-height: 1.4 }`
rule is acceptable to preserve the intentional line-height (option (b) from OQ-1).

### AC-33 — ProjectCard: Heading override replaced with `size="lg"`

In `ProjectCard.svelte`, the `<Heading level={3} style="font-size: var(--t-lede);">` is
replaced with `<Heading level={3} size="lg">`. Rendered heading `fontSize` resolves
to `"19px"`. No `style=` attribute remains on that Heading.

### AC-34 — StatCard: label Text override replaced with `size="xs"` (tracking normalized)

In `StatCard.svelte`, the `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.1em;">` (label) is replaced with `<Text variant="mono" color="faint" size="xs">`. Rendered `fontSize` resolves to `"12px"`. Letter-spacing resolves to the `mono` variant's default `0.08em` (the `0.1em` override is removed as a deliberate design normalization). No `style=` attribute remains.

### AC-35 — StatCard: sublabel Text override replaced with `size="xs"` (tracking normalized)

In `StatCard.svelte`, the `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.04em;">` (sublabel) is replaced with `<Text variant="mono" color="faint" size="xs">`. Rendered `fontSize` resolves to `"12px"`. Letter-spacing resolves to the `mono` variant's default `0.08em` (the non-standard `0.04em` override is removed as a deliberate design normalization). No `style=` attribute remains.

### AC-36 — ProgressBar: both label Text overrides replaced with `size="xs"`

In `ProgressBar.svelte`, the two `<Text variant="mono" style="font-size: var(--t-micro);">` elements (progress label and percentage value) are each replaced with `<Text variant="mono" size="xs">`. Both render with `fontSize` of `"12px"`. No `style=` attribute remains on either.

### AC-37 — Modal: title Text font-size override replaced with `size="lg"`; `flex: 1` moves to scoped CSS

In `Modal.svelte`, the `<Text variant="mono" … style="font-size: var(--t-lede); letter-spacing: 0.08em; flex: 1;">` is replaced with `<Text variant="mono" size="lg">`. The `flex: 1` behaviour on the title element is preserved by adding a scoped CSS rule in `Modal.svelte` (not a prop on `Text`) — either a `.modal-title` class or a `:global` selector targeting the rendered element within `.modal-header`. Rendered title `fontSize` resolves to `"19px"`. No `style=` attribute remains on that Text element.

### AC-38 — No `style=` font-size overrides remain in the six affected files

After all migrations, a text search of the six caller files (`NoteCard.svelte`,
`ProductCard.svelte`, `ProjectCard.svelte`, `StatCard.svelte`, `ProgressBar.svelte`,
`Modal.svelte`) for `style=["'].*font-size` yields zero matches. All 15 font-size
overrides have been eliminated.

### AC-39 — No `style=` text-transform overrides remain in the six affected files

After all migrations, a text search of the same six files for `style=["'].*text-transform`
yields zero matches.

### AC-40 — `SizeVariant` type is consistent across `Text` and `Heading`

Both `Text.svelte` and `Heading.svelte` declare the same `SizeVariant` union:
`'xs' | 'sm' | 'md' | 'lg' | 'xl'`. `pnpm check` passes with zero TypeScript errors
across the entire project.

### AC-41 — `Text.stories.svelte` covers size prop variants

`Text.stories.svelte` includes at minimum the following stories (new or updated):

- A story rendering `<Text variant="mono" size="xs">` with a play function asserting
  `getComputedStyle(el).fontSize === "12px"`.
- A story rendering `<Text variant="body" size="xl">` with a play function asserting
  `getComputedStyle(el).fontSize === "24px"`.
- A story rendering `<Text variant="mono" size="md">` with a play function asserting
  `getComputedStyle(el).fontSize === "16px"`.

### AC-42 — `Text.stories.svelte` covers `case` prop variants

`Text.stories.svelte` includes at minimum the following stories (new or updated):

- A story rendering `<Text variant="mono" case="none">` with a play function asserting
  `getComputedStyle(el).textTransform === "none"`.
- A story rendering `<Text variant="mono" case="lower">` with a play function asserting
  `getComputedStyle(el).textTransform === "lowercase"`.
- A story rendering `<Text variant="body" case="upper">` with a play function asserting
  `getComputedStyle(el).textTransform === "uppercase"`.

### AC-43 — `Heading.stories.svelte` covers size prop variants

`Heading.stories.svelte` includes at minimum the following stories (new or updated):

- A story rendering `<Heading level={3} size="lg">` with a play function asserting
  `getComputedStyle(el).fontSize === "19px"` and
  `getComputedStyle(el).letterSpacing === "-0.01em"` (variant unchanged).
- A story rendering `<Heading level={3} size="xs">` with a play function asserting
  `getComputedStyle(el).fontSize === "12px"`.

### AC-44 — All previously passing stories continue to pass

`pnpm test` passes with zero failures after all changes in this item. No story play
function that was green before B26 may regress. This includes all stories in
`NoteCard.stories.svelte`, `ProductCard.stories.svelte`, `ProjectCard.stories.svelte`,
`StatCard.stories.svelte`, `ProgressBar.stories.svelte`, and `Modal.stories.svelte`.

### AC-45 — `pnpm check` passes with zero TypeScript errors

After all implementation changes, `pnpm check` reports zero TypeScript errors across
the full project. The new props (`size`, `case`) are fully typed; no `any`, no
`@ts-ignore`, no `as any` casts are introduced.

---

## Out of scope

- **`weight` prop on `Text` or `Heading`.** No current caller overrides font-weight on
  these primitives. Not added in this item.
- **`tracking` prop on `Text` or `Heading`.** The two letter-spacing deviations in
  StatCard (`0.1em` and `0.04em`) are treated as design bugs and normalized to the
  `mono` variant default (`0.08em`). No letter-spacing prop is added.
- **Responsive / clamp size values.** The `size` prop maps to fixed token values only
  (`--t-micro` through `--t-h3`). Fluid sizes (`--t-hero`, `--t-title`, `--t-subtitle`)
  are the natural domain of `Heading` variant classes and are not exposed as `size`
  prop values.
- **`size` values above `xl` on `Heading`.** Headings at h2 and above have natural
  sizes larger than 24 px. The `size` prop is primarily intended for downsizing. No
  `xxl` or `display` size value is added.
- **Layout style props (margin, padding, flex, width).** Any remaining `style=` props
  in caller files that set layout properties (`flex: 1`, `width`, `margin`) are
  explicitly not in scope here. Those are handled by B27.
- **`Inline align` prop.** Not added in this item — handled by B27.
- **Removing `typography.css`.** The global file is retained. Only the per-component
  scoped copies are added.
- **`Prose` component.** Prose continues to depend on the global typography classes in
  `typography.css`. This dependency is unchanged.
- **ProductCard `.card-desc` being its own variant/token.** The decision to replace it
  with `<Text variant="mono" case="none">` is taken by this spec (see AC-32 and Open
  questions OQ-1).
- **Visual regression testing.** Tests are Storybook play-function assertions only.
  Pixel-perfect screenshots are not in scope.
- **`Spread` / `Stack` / layout components.** No changes to layout primitives in this
  item.

---

## Open questions

### OQ-1 — ProductCard `.card-desc`: replace with `<Text variant="mono" case="none">` or keep scoped class? (non-blocking)

The item card notes that `<Text variant="mono" case="none">` could replace the scoped
`.card-desc` CSS block in `ProductCard.svelte`. This spec takes that option (AC-32)
because it eliminates duplicated font/color declarations and keeps the primitive
consistent. The line-height in `.card-desc` is `1.4`, while the `mono-label` variant
uses no explicit line-height (inherits `1.5` from body). The implementer must verify
that `line-height: 1.4` on the description text is intentional and either:
(a) add a `line-height: 1.4` to the `mono-label` scoped rule in `Text.svelte` as a
variant property (changing existing mono line-height globally), or
(b) keep a minimal `.card-desc` scoped rule in `ProductCard.svelte` with only
`line-height: 1.4` while using `<Text variant="mono" case="none">` for everything
else. Option (b) is the conservative choice and is recommended if the line-height
differs intentionally.

This does not block implementation.

### OQ-2 — ProductCard "incl. VAT" letter-spacing: `0.06em` vs `0.08em` (non-blocking)

The current `ProductCard.svelte` line 80 passes `letter-spacing: 0.06em` on the "incl.
VAT" label — slightly tighter than the `mono` variant's standard `0.08em`. The item
card says this override is replaced with `size="xs" case="lower"` (see AC-30), which
means the letter-spacing normalizes to `0.08em`. If the `0.06em` difference is
intentional (it appears to be a bespoke fine-tune), the caller must accept the
normalization to `0.08em` or retain a minimal `style="letter-spacing: 0.06em"` after
removing the font-size and text-transform lines. This spec normalizes to `0.08em` (no
residual `style=`), consistent with the item card's intent. Not blocking.

### OQ-3 — `data-size` attribute conflict with HTML semantics (non-blocking)

`data-size` is a custom data attribute — it has no reserved meaning in the HTML spec
and will not conflict with browser or assistive technology behaviour. The pattern is
identical to `data-gap` used by layout primitives. No issue is foreseen; noted for
completeness.

No open questions block implementation. B26 is ready for `test-writer`.
