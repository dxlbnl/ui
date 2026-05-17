# B27: Layout style prop cleanup — Inline align prop + scoped CSS pass

## Context

After B26 eliminates typography `style=` overrides across Text/Heading consumers, a
second wave of layout-only `style=` attributes remains across nine components. Two are
`align-items: baseline` on `<Inline>` elements — which require a new `align` prop on
the `Inline` primitive. The rest are single-concern overrides (margin, padding, border,
flex, width, flex-shrink) applied to layout primitives that act as named structural
regions inside higher-order components; these move to scoped CSS within each component.

This item completes the style-prop cleanup pass started in B24 and B25 by eliminating
the remaining raw CSS property values from component templates.

Related wiki pages:
- [architecture.md](../architecture.md) — Chakra-style style props, scoped CSS,
  component authoring conventions, strict TypeScript
- [composition-limits.md](../composition-limits.md) — Svelte scoping strategy,
  three-pattern approach (style= / wrapper div / :global)
- [decisions.md](../decisions.md) — D5 (no global utility classes), D18
  (three-pattern Svelte scoping strategy), D31 (two-prop threshold for container
  replacement)
- [specs/B25-layout-gap-api.md](B25-layout-gap-api.md) — structural analogue:
  how `gap` and `data-gap` were added to layout primitives
- [backlog/doing/B27-layout-style-prop-cleanup.md](../backlog/doing/B27-layout-style-prop-cleanup.md) — item card

### Files affected

| File | Change |
|------|--------|
| `src/lib/components/layout/Inline.svelte` | Add `align` prop + `AlignValue` type + `data-align` CSS |
| `src/lib/components/patterns/SectionHead.svelte` | `<Stack gap="xs">` + scoped `.sublabel` margin |
| `src/lib/components/patterns/PageHero.svelte` | Three `style=` removals → scoped CSS in `.page-hero` |
| `src/lib/components/feedback/Modal.svelte` | Fix bare `:global(.modal-title)` → `.modal-header :global(.modal-title)` |
| `src/lib/components/patterns/StatCard.svelte` | Stack padding → scoped `.stat-card-body` CSS |
| `src/lib/components/patterns/ProgressBar.svelte` | Stack width → scoped `.progress-bar` wrapper element |
| `src/lib/components/navigation/Nav.svelte` | `flex-shrink: 0` → scoped `.nav-actions` CSS |
| `src/lib/components/data/Accordion.svelte` | Stack border → scoped `.accordion` CSS |
| `src/lib/components/cards/NoteCard.svelte` | NoteCard lede `flex: 1` → scoped `.note-lede` CSS |
| `src/lib/components/cards/ProductCard.svelte` | Price `<Inline>` → `align="baseline"` |

### `Inline` `align` prop — corrected token table

| `align` prop value | CSS `align-items` value | Notes |
|--------------------|------------------------|-------|
| `"start"` | `flex-start` | |
| `"center"` | `center` | **default** — matches current hardcoded value |
| `"end"` | `flex-end` | |
| `"baseline"` | `baseline` | needed by ProductCard and SectionHead |
| `"stretch"` | `stretch` | |

---

## Acceptance criteria

### Part 1 — `Inline` align prop

#### AC-1 — `align` prop is declared and typed

`Inline.svelte` declares `align?: AlignValue` in its `Props` interface, where
`AlignValue = 'start' | 'center' | 'end' | 'baseline' | 'stretch'`. The prop
defaults to `'center'`. `pnpm check` produces zero TypeScript errors on the file.

#### AC-2 — `align` is forwarded via `data-align` attribute

When `Inline` is rendered, the root element carries `data-align="{value}"` with the
resolved align value. For example, `<Inline align="baseline">` produces a DOM element
with attribute `data-align="baseline"`. This mirrors the `data-gap` pattern from B25.

#### AC-3 — Default `align="center"` produces `align-items: center`

When `<Inline>` is rendered without an `align` prop, the root element's computed
`align-items` is `"center"`. No existing caller is broken by this change.

#### AC-4 — `align="start"` produces `align-items: flex-start`

When `<Inline align="start">` is rendered, the root element's computed `align-items`
is `"flex-start"`.

#### AC-5 — `align="center"` produces `align-items: center`

When `<Inline align="center">` is rendered, the root element's computed `align-items`
is `"center"`.

#### AC-6 — `align="end"` produces `align-items: flex-end`

When `<Inline align="end">` is rendered, the root element's computed `align-items`
is `"flex-end"`.

#### AC-7 — `align="baseline"` produces `align-items: baseline`

When `<Inline align="baseline">` is rendered, the root element's computed
`align-items` is `"baseline"`.

#### AC-8 — `align="stretch"` produces `align-items: stretch`

When `<Inline align="stretch">` is rendered, the root element's computed `align-items`
is `"stretch"`.

#### AC-9 — ProductCard uses `align="baseline"` on its price Inline; no `style=` remains

In `src/lib/components/cards/ProductCard.svelte`, the `<Inline>` wrapping the price
and VAT text (currently `<Inline gap="xs" style="align-items: baseline;">`) is
rendered as `<Inline gap="xs" align="baseline">` with no `style=` attribute. A grep
of `ProductCard.svelte` for `style=.*align-items` yields zero matches.

#### AC-10 — SectionHead uses `align="baseline"` on its heading Inline; no `style=` remains

In `src/lib/components/patterns/SectionHead.svelte`, the `<Inline>` wrapping the
heading and sublabel (currently `<Inline gap="sm" style="align-items: baseline;">`) is
rendered as `<Inline gap="sm" align="baseline">` with no `style=` attribute. A grep
of `SectionHead.svelte` for `style=.*align-items` yields zero matches.

---

### Part 2 — Scoped CSS fixes

#### AC-11 — SectionHead: Stack gap uses the `gap="xs"` prop (8 px); no `style="gap: 6px"` remains

In `SectionHead.svelte`, the outer `<Stack>` is rendered as `<Stack gap="xs">`. The
`style="gap: 6px;"` attribute is removed. The computed gap on the Stack's root
element is `8px` (`var(--u)`). A grep of `SectionHead.svelte` for
`style=.*gap:\s*6px` yields zero matches.

> Note: `gap="xs"` is 8 px (on the spacing scale), superseding the off-scale 6 px
> value. This is a 2 px change that keeps the value on-token.

#### AC-12 — SectionHead: sublabel `margin-left: auto` moves to scoped CSS; no `style=` remains

In `SectionHead.svelte`, the `<Text>` element rendering the `sublabel` no longer
carries `style="margin-left: auto;"`. Instead, SectionHead's scoped `<style>` block
contains a rule (e.g. `.sublabel { margin-left: auto }` or a `:global` rule scoped
to an ancestor class on a native wrapper element) that applies `margin-left: auto` to
the sublabel text element. A grep of `SectionHead.svelte` for
`style=.*margin-left:\s*auto` yields zero matches. The rendered sublabel element's
computed `margin-left` resolves to `auto` (confirming the rule applies).

#### AC-13 — PageHero: eyebrow `margin-bottom: 12px` moves to scoped CSS; no `style=` remains

In `PageHero.svelte`, the `<Text variant="eyebrow">` element does not carry a
`style=` attribute. Instead, `PageHero`'s scoped `<style>` block contains a rule
within `.page-hero` that applies `margin-bottom: 12px` to the eyebrow element. A grep
of `PageHero.svelte` for `style=.*margin-bottom:\s*12px` yields zero matches.

#### AC-14 — PageHero: lede `margin-top: 20px; max-width: 62ch` moves to scoped CSS; no `style=` remains

In `PageHero.svelte`, the `<Text variant="lede">` element does not carry a `style=`
attribute. Instead, `PageHero`'s scoped `<style>` block contains rules within
`.page-hero` that apply both `margin-top: 20px` and `max-width: 62ch` to the lede
element. A grep of `PageHero.svelte` for
`style=.*margin-top:\s*20px` yields zero matches and for
`style=.*max-width:\s*62ch` yields zero matches.

#### AC-15 — PageHero: actions Inline `margin-top: 24px` moves to scoped CSS; no `style=` remains

In `PageHero.svelte`, the `<Inline gap="sm">` that wraps the children snippet does
not carry `style="margin-top: 24px;"`. Instead, `PageHero`'s scoped `<style>` block
contains a rule (via a native wrapper element or a `:global` selector chained to an
ancestor class owned by `PageHero`) that applies `margin-top: 24px` to that layout
region. A grep of `PageHero.svelte` for `style=.*margin-top:\s*24px` yields zero
matches.

#### AC-16 — Modal: `.modal-title` flex rule uses an ancestor-scoped selector

In `Modal.svelte`, the rule that sets `flex: 1` on the `.modal-title` element is
expressed as `.modal-header :global(.modal-title) { flex: 1 }` (or an equivalent
selector where the `:global` part is chained to a scoped ancestor class such as
`.modal-inner` or `.modal-header`). The existing bare `:global(.modal-title) { flex: 1 }`
rule — which leaks globally — is removed. A grep of `Modal.svelte` for
`^\s*:global\(\.modal-title\)` (bare, without an ancestor prefix) yields zero matches.
The rendered title element in an open Modal has computed `flex: 1` (or `flex-grow: 1`
equivalent).

#### AC-17 — StatCard: padding moves to scoped CSS; no `style="padding: 16px 20px"` remains

In `StatCard.svelte`, the `<Stack gap="xs">` inside the Card does not carry
`style="padding: 16px 20px;"`. Instead, `StatCard`'s scoped `<style>` block contains
a rule that applies `padding: 16px 20px` to the stack container (via a native wrapper
element or a scoped class). A grep of `StatCard.svelte` for
`style=.*padding:\s*16px` yields zero matches. The rendered container's computed
`padding-top` is `16px` and `padding-left` is `20px`.

#### AC-18 — ProgressBar: `width: 100%` moves to scoped CSS; Stack root has no `style="width: 100%"`

In `ProgressBar.svelte`, the root `<Stack gap="xs">` does not carry
`style="width: 100%;"`. Instead, `ProgressBar`'s scoped `<style>` block or a native
wrapper element applies `width: 100%` to the outermost element of the component. A
grep of `ProgressBar.svelte` for `style=.*width:\s*100%` yields zero matches (this
excludes the `style="width: {clampedValue}%"` on the progress fill, which is a
reactive value and is intentionally retained). The rendered component's root
element has a computed width equal to its container's width (i.e. `width: 100%` is
in effect).

#### AC-19 — Nav: `flex-shrink: 0` on nav-actions moves to scoped CSS; no `style=` on `<Inline>` remains

In `Nav.svelte`, the `<Inline class="nav-actions" gap="xs">` element does not carry
`style="flex-shrink: 0;"`. Instead, `Nav`'s scoped `<style>` block contains a rule
`.nav-actions { flex-shrink: 0 }` (or a `:global` variant chained to a scoped
ancestor). A grep of `Nav.svelte` for `style=.*flex-shrink:\s*0` yields zero matches.
The rendered `.nav-actions` element's computed `flex-shrink` is `"0"`.

#### AC-20 — Accordion: border moves to scoped CSS; Stack carries no `style="border: 1px solid var(--rule)"`

In `Accordion.svelte`, the `<Stack class="accordion" gap="none">` element does not
carry `style="border: 1px solid var(--rule);"`. Instead, `Accordion`'s scoped
`<style>` block (or a `:global(.accordion)` rule chained to a scoped ancestor)
contains `.accordion { border: 1px solid var(--rule) }`. A grep of `Accordion.svelte`
for `style=.*border:\s*1px` yields zero matches. The rendered Accordion root element's
computed `border-top-width` is `"1px"`.

#### AC-21 — NoteCard: lede `flex: 1` moves to scoped CSS; `<Text>` carries no `style="flex: 1"` 

In `NoteCard.svelte`, the `<Text variant="body" class="note-lede">` element does not
carry `style="flex: 1;"`. Instead, `NoteCard`'s scoped `<style>` block contains
`.note-lede { flex: 1 }` (or a `:global` rule chained to a scoped ancestor class
owned by `NoteCard`). The `.note-lede` class is already present on the element; only
the `style=` attribute is removed. A grep of `NoteCard.svelte` for
`style=.*flex:\s*1` yields zero matches. The rendered lede element's computed
`flex-grow` is `"1"`.

#### AC-22 — Field: `style="min-width: 0"` is intentionally retained; no change made

`Field.svelte` continues to render `<Stack gap="xs" style="min-width: 0;" ...>`. The
`style="min-width: 0;"` attribute is present in the source and the `min-width: 0` rule
continues to apply to the rendered root element. No change is made to this file as part
of B27. This is a deliberate defensive flex-overflow guard with no equivalent Stack
prop.

> Verification: grep `Field.svelte` for `style=.*min-width:\s*0` must yield exactly
> one match (the existing line is unchanged).

---

### Part 3 — Cross-cutting

#### AC-23 — No bare `:global()` style rules added; all new :global selectors are ancestor-chained

Any `:global()` selector introduced in this item is of the form
`.scoped-ancestor :global(.child-class) { ... }` where `.scoped-ancestor` is a class
applied by a native element rendered within the parent component. No new bare
`:global(.class) { ... }` rules at the root level of any component's `<style>` block
are introduced. (The existing bare `:global(.note-card)` and `:global(.product-card)`
in NoteCard/ProductCard are out of scope for this item.)

#### AC-24 — No existing Storybook story play functions regress

`pnpm test` passes with zero failures after all changes in B27. Every previously
passing play-function assertion continues to pass. No new stories are required unless
they are needed to cover the new `align` prop on `Inline`.

#### AC-25 — No `style=` attribute containing a raw CSS layout property remains on any layout primitive in the affected files

After all changes, a grep of the ten affected component files
(`SectionHead.svelte`, `PageHero.svelte`, `Modal.svelte`, `StatCard.svelte`,
`ProgressBar.svelte`, `Nav.svelte`, `Accordion.svelte`, `NoteCard.svelte`,
`ProductCard.svelte`, `Field.svelte`) for the pattern
`style=["'](?!width: \{).*(?:margin|padding|border|flex(?!-wrap|-direction)|align-items|gap)` yields only the two intentional exceptions:
- `Field.svelte`: `style="min-width: 0;"` (AC-22)
- `ProgressBar.svelte`: `style="width: {clampedValue}%"` on the fill div (reactive, out of scope)

---

## Out of scope

- **`Grid`, `Stack`, or `Spread` align/justify props.** Only `Inline` gains an `align`
  prop in this item. Other layout primitives may follow in a future item.
- **Changing the visual output of any component.** All CSS moves are value-preserving.
  The only deliberate value change is SectionHead's gap from 6 px (off-scale) to 8 px
  (on-scale `xs`) — a 2 px adjustment.
- **Adding Storybook stories for the new `align` prop beyond what is needed to satisfy
  AC-3 through AC-8.** Full `Inline` stories coverage is a separate concern.
- **The existing bare `:global(.note-card)` and `:global(.product-card)` selectors** in
  `NoteCard.svelte` and `ProductCard.svelte`. These are pre-existing structural globals
  required by the Card composition pattern and are not in scope for B27.
- **`Field.svelte` min-width override.** Intentionally kept per the item card (AC-22).
- **Any component not listed in the item card.** This item addresses exactly the eleven
  entries in the item card's fix table.
- **Visual regression testing.** Tests are play-function assertions only.

---

## Open questions

No open questions block implementation. The following observations are noted for the
implementer:

1. **Modal `:global(.modal-title)` — already implemented but leaky.** The `flex: 1`
   rule for `.modal-title` is already present in `Modal.svelte` line 182–184 but as a
   bare `:global(.modal-title)` selector. B27 must replace it with
   `.modal-header :global(.modal-title) { flex: 1 }` to eliminate the global leak. The
   behaviour is unchanged; only the selector scope is corrected.

2. **`data-align` CSS implementation.** The `Inline` scoped CSS will have six rules in
   the form `.inline[data-align="start"] { align-items: flex-start }` etc., directly
   mirroring the `data-gap` rules added in B25. The existing hardcoded `align-items:
   center` in `.inline { ... }` must be removed from the base rule and moved to
   `.inline[data-align="center"]` to allow the attribute-driven approach to own the
   alignment fully.

3. **ProgressBar wrapper strategy.** The `<Stack gap="xs">` is currently the root
   element of the component (it receives `{...rest}`). Two implementation options exist:
   (a) add a native `<div class="progress-bar">` wrapper around the Stack and apply
   `width: 100%` to it; (b) apply the width rule to Stack's root element via
   `.progress-bar :global(.stack)` on a scoped ancestor. Option (a) adds one nesting
   level but keeps the component's public root clearly identifiable. Either is acceptable
   as long as `width: 100%` is applied and no `style=` attribute remains on the Stack.

4. **SectionHead sublabel margin-left strategy.** The sublabel `<Text>` is a child
   component; its root element cannot be directly targeted by SectionHead's scoped CSS.
   The implementer should wrap it in a `<span class="sublabel">` native element and apply
   `margin-left: auto` to that span, following the wrapper pattern from `composition-limits.md`.
