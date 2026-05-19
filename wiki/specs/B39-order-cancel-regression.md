# B39: Regression — `/order/cancel/` (PageHero / Heading / Rule / Button / Text + new Signoff)

## Context

The website page `/order/cancel/` is the first content page rebuilt entirely on
library primitives (`PageHero`, `Container`, `Button variant="back"`, plus a
local `Signature` composing `Rule` + `Grid` + `Stack` + `Text`). Side-by-side
with the production hand-rolled version, eight library defaults drift and one
capability is missing entirely. This spec captures those nine fixes as a single
item because they share a single observable surface — the migrated route file —
and are all small, contained changes inside the design system primitives the
route already uses.

Relevant wiki pages:

- [vision.md](../vision.md) — replacing site CSS with library components must
  cause zero visual regression.
- [requirements.md](../requirements.md) — R3 (Button variants), R8 (Page hero,
  Pattern components), R9 (Rule).
- [architecture.md](../architecture.md) — component authoring conventions.
- [composition-limits.md](../composition-limits.md) — primitive-owned typography.
- [stories-guide.md](../stories-guide.md) — Svelte CSF format; the "When NOT to
  assert" section that points to D42.
- [decisions.md](../decisions.md) — **D42** (no play-fn assertions for visual-only
  changes), D38 (primitives first), D32 / D34 (`data-*` prop pattern), D41
  (snippet-based dismiss / content props).
- [specs/B14-typography-primitives.md](B14-typography-primitives.md),
  [specs/B26-typography-size-prop.md](B26-typography-size-prop.md) —
  `Text` / `Heading` variant + size/case props (where the eyebrow/lede CSS now
  lives).
- [specs/B27-layout-style-prop-cleanup.md](B27-layout-style-prop-cleanup.md) —
  `Inline align` prop + scoped-CSS pattern.
- [specs/B36-pagehero-snippet-heading.md](B36-pagehero-snippet-heading.md) —
  the model for the new `eyebrowContent` snippet prop and the `border` prop.
- [specs/B4-primitive-components.md](B4-primitive-components.md),
  [specs/B3-layout-helpers.md](B3-layout-helpers.md),
  [specs/B3-layout-components.md](B3-layout-components.md),
  [specs/B9-pattern-components.md](B9-pattern-components.md) — existing
  contracts for Button / Rule / Grid / Stack / patterns.

Item card: [wiki/backlog/doing/B39-order-cancel-regression.md](../backlog/doing/B39-order-cancel-regression.md)

### Key facts established by reading the source

- `--t-title: clamp(36px, 5vw, 56px)` **already exists** in `src/lib/tokens/tokens.css`
  (line 46). No new token needs to be added for the new `Heading variant="title"`.
- `--rule` and `--rule-strong` already exist for both palettes.
- `Rule.svelte` already sets `border-top-color: var(--rule)` explicitly via
  `data-variant="solid"` (lines 22–24) and `var(--rule-strong)` for `strong`
  (line 31). **The diagnosed `currentColor` inheritance bug is not present in
  the current source.** This is captured as OQ-1 below; the AC pair for finding 7
  is therefore a narrow defensive AC that locks the existing tokens in place
  rather than introducing a fix for a non-existent bug.
- `Heading variant="hero"` keys off the `.hero-heading` class produced by
  `VARIANT_CLASS.hero` (Heading.svelte:27–33). The new `title` variant must
  follow the same pattern: a `VARIANT_CLASS.title = 'title-heading'` entry and a
  matching scoped `.title-heading` rule in Heading's `<style>` block.
- `Text variant="eyebrow"` is scoped CSS on `.eyebrow` in `Text.svelte:86–92`.
  `Text variant="lede"` is `.body-lede` at `Text.svelte:71–76`. The matching
  rules in `typography.css` are the legacy global copies; both files must move
  together so the visual matches whichever stylesheet wins cascade order. The
  source-of-truth for the primitives is the scoped block inside
  `Text.svelte` (per B26 / D5).
- `Button variant="back"` currently inherits `display: inline-block` from the
  shared `.btn` base rule (Button.svelte:37). There is **no** `.btn-back` rule
  that overrides display. This is captured as OQ-2; the AC pair for finding 6 is
  similarly defensive.
- `Grid gap="lg"` maps to `var(--u4)` = **32 px** in `Grid.svelte:28`. The
  Signoff pattern wants exactly 32 px between columns. **Grid does not need an
  API extension** — `<Grid cols={2} gap="lg">` produces the required value.

---

## Acceptance criteria

ACs are grouped per finding, in the item card's "Suggested order of fixes"
sequence. For each section: a current-state / target-state / source-change block
precedes the numbered ACs. ACs are marked **[src]** (source-change only) or
**[play]** (describes behaviour the reviewer must verify).

**Important — test-writer skipped (user directive, 2026-05-19):**

- This is a visual + small-API change. Per D42 we already skip play-fn
  assertions for visual decoration; per the user's clarification on B39, we
  also skip play-fn assertions for the new public API surfaces in this item
  (the `eyebrowContent` snippet prop and the `headingVariant` prop).
- **[play]-marked ACs are documented for the reviewer's verification only.**
  They are NOT to be implemented as `play={...}` blocks in stories. The
  implementer adds demo stories where the spec calls for them (e.g.
  `EyebrowSnippet`, `HeroVariant`) **without** `play=` attributes — stories
  exist as visual demos, not tests.
- The reviewer verifies the behaviour described by each [play] AC by reading
  the diff and opening the relevant story in Storybook (`pnpm storybook`).
  No new automated assertion gates B39.

---

### Section 1 — `PageHero.eyebrowContent` snippet prop (finding 1)

**Current state.** `PageHero` exposes only `eyebrow?: string`, rendered through
`<Text variant="eyebrow">{eyebrow}</Text>` inside a `<div class="page-hero-eyebrow">`
wrapper.

**Target state — revised (2026-05-19).** Per the project convention codified
in D43 (text-or-snippet slots use a single `prop?: string | Snippet`), `eyebrow`
itself becomes `string | Snippet`. No separate `eyebrowContent` prop is added.
When `eyebrow` is a function (snippet), render it directly inside the wrapper;
when it's a string, wrap it in `<Text variant="eyebrow">`. Behaviour with no
value is unchanged.

**Source change.** In `src/lib/components/patterns/PageHero.svelte`:

```ts
import type { Snippet } from 'svelte'

interface Props {
  /** Eyebrow label. String renders inside <Text variant="eyebrow">; a Snippet renders as-is. */
  eyebrow?: string | Snippet
  // ...
}
```

Template — the `.page-hero-eyebrow` wrapper is rendered once and contains the
snippet-or-string branch inside:

```svelte
{#if eyebrow}
  <div class="page-hero-eyebrow">
    {#if typeof eyebrow === 'function'}{@render eyebrow()}{:else}<Text variant="eyebrow">{eyebrow}</Text>{/if}
  </div>
{/if}
```

**AC-1.1 [src]** — `Props` in `PageHero.svelte` declares
`eyebrow?: string | Snippet` (single prop, no `eyebrowContent` companion).

**AC-1.2 [src]** — Inside `<header class="page-hero">`, the template renders
the `.page-hero-eyebrow` wrapper exactly once, with an inner `{#if/else}`
discriminating snippet vs string via `typeof eyebrow === 'function'`. The
wrapper is not duplicated across the if/else branches.

**AC-1.3 [play]** — A new story `EyebrowSnippet` in
`src/lib/components/patterns/PageHero.stories.svelte` passes a snippet to
`eyebrow` (not to a separate `eyebrowContent` prop). Demo example renders
`<Inline><Led color="amber" /><Text variant="eyebrow" color="amber">ORDER CANCELLED</Text></Inline>`
inside the eyebrow wrapper. No play block per project directive.

**AC-1.4 [play]** — Existing stories `Full`, `Heading Only`, `No Slot`, and
`No Inline Styles` continue to pass without modification: their `eyebrow` string
branch is preserved (no caller change — the string overload still works).

---

### Section 2 — `Heading variant="title"` + `PageHero` gains `variant` prop + `heading` accepts Snippet (finding 2)

**Current state.** `Heading` supports `display | hero | h1 | h2 | h3`. `PageHero`
hardcodes `<Heading level={1} variant="hero">` and accepts both
`heading?: string` and `headingContent?: Snippet` as separate props (B36
mechanism).

**Target state — revised (2026-05-19).** Three coordinated changes:

1. A new `title` variant on `Heading` maps to `--t-title`
   (`clamp(36px, 5vw, 56px)`), `font-weight: 500`, `letter-spacing: -0.02em`,
   `line-height: 1`.
2. `PageHero`'s heading slot is consolidated into a single
   `heading?: string | Snippet` prop (per D43). The separate `headingContent`
   prop is removed.
3. `PageHero` gains a `variant: 'hero' | 'title'` prop (default `'title'`)
   selecting the heading scale. Name is `variant` (not `headingVariant`) because
   PageHero has no other variant axis and the property is the component's
   primary visual control — the discriminator is unambiguous.

**Source change.**

1. `src/lib/components/primitives/Heading.svelte` — extend
   `HeadingVariant = 'display' | 'hero' | 'title' | 'h1' | 'h2' | 'h3'`,
   add `VARIANT_CLASS.title = 'title-heading'`, and add a scoped CSS rule:

   ```css
   .title-heading {
     font-family: var(--sans);
     font-weight: 500;
     font-size: var(--t-title);
     letter-spacing: -0.02em;
     line-height: 1;
   }
   ```

   Also add `.title-heading { margin: 0 }` to the existing reset line.

2. `src/lib/components/patterns/PageHero.svelte` — `Props` declares
   `heading?: string | Snippet` (single prop, replacing both `heading?: string`
   and `headingContent?: Snippet`) and `variant?: 'hero' | 'title'` (default
   `'title'`). Template:

   ```svelte
   <Heading level={1} variant={variant}>
     {#if typeof heading === 'function'}{@render heading()}{:else}{heading}{/if}
   </Heading>
   ```

3. `src/lib/components/patterns/PageHero.svelte` — the existing scoped
   `:global(.hero-heading em)` rule from B36 must be extended to cover the new
   default variant:
   `.page-hero :global(.hero-heading em), .page-hero :global(.title-heading em) { font-style: normal; color: var(--ink-faint); }`.

**AC-2.1 [src]** — `Heading.svelte` `HeadingVariant` type includes `'title'`,
`VARIANT_CLASS` has a `title: 'title-heading'` entry, and the `<style>` block
contains the `.title-heading` rule with the four declarations above.

**AC-2.2 [src]** — `PageHero.svelte` `Props` declares
`heading?: string | Snippet` (no `headingContent` prop exists) AND
`variant?: 'hero' | 'title'` with default `'title'`. The rendered `<Heading>`
passes `variant={variant}` and renders `heading` via the `typeof === 'function'`
discriminator.

**AC-2.3 [src]** — The `:global(...em)` rule in `PageHero.svelte`'s `<style>`
block selects both `.title-heading em` AND `.hero-heading em` (combined
selector). This preserves the B36 `em` behaviour for both default and
`variant="hero"` callers.

**AC-2.4 [play]** — In the existing default-args `Full` story of
`PageHero.stories.svelte`, the H1 element carries the class `title-heading`
(and does **not** carry `hero-heading`). Reviewer-verification only (no play
block).

**AC-2.5 [play]** — A new story `HeroVariant` in `PageHero.stories.svelte`
passes `variant: 'hero'` in its args. The rendered H1 has class
`hero-heading`. Reviewer-verification only (no play block).

**AC-2.6 [src]** — Caller-site migration in stories. The existing PageHero
stories `Full`, `Heading Only`, `No Slot`, `No Inline Styles`, and `NoBorder`
continue to use the new default (`'title'`). The `SnippetHeading` story
migrates from `headingContent={headingContent}` to `heading={headingContent}`
(same snippet reference, passed through the consolidated prop). Its play
function assertion that `getComputedStyle(em).fontStyle === "normal"` continues
to pass because AC-2.3 keeps the `em` rule applicable to `.title-heading`.

---

### Section 3 — `Rule` border colour locked to `--rule` / `--rule-strong` (finding 7)

**Current state (re-verified at source).** `Rule.svelte:22–32` already declares
`border-top: 1px solid var(--rule)` for `data-variant="solid"`, dashed, and
`var(--rule-strong)` for `strong`. The website's regression at
`border-top-color: rgb(20, 17, 11)` (== `--ink`) is **not reproducible from this
source**. Either the website is using an older built version of the library, or
a different element is being measured. See OQ-1.

**Target state.** The Rule component visibly uses `--rule` (or `--rule-strong`
for `strong`) regardless of the surrounding text-colour context. The current
source already satisfies this; the only AC is a defensive lock so a future
refactor cannot regress to `currentColor`.

**Source change.** None expected, unless investigation under OQ-1 finds a
specific regression path. If a regression is found, the fix is to keep the
explicit `var(--rule)` / `var(--rule-strong)` declarations.

**AC-3.1 [src]** — `Rule.svelte`'s `<style>` block contains literal text
`border-top: 1px solid var(--rule)` for the `solid` and (`dashed` equivalent with
`dashed`) variants, and `var(--rule-strong)` for the `strong` variant. No
selector in `Rule.svelte` uses `currentColor` or omits the colour value (which
would default to `currentColor`).

**AC-3.2 [src]** — `Rule.svelte` does **not** inherit border colour from
context: no `border-color: inherit`, no bare `border-top: 1px solid` (without an
explicit colour), and no CSS variable indirection that resolves to an ink token.

> Per D42 these are source-shape assertions, not play-fn assertions. A reviewer
> verifies by inspecting the file diff.

---

### Section 4 — `Button variant="back"` is inline-block (finding 6)

**Current state (re-verified at source).** `Button.svelte:37` declares
`display: inline-block` on the shared `.btn` base rule, and `.btn-back`
(lines 98–108) does not override `display`. The website's regression at
`display: block` is **not reproducible from this source**. See OQ-2.

**Target state.** `Button variant="back"` renders at `display: inline-block` so
the anchor hugs its content. This is the existing behaviour; the AC is a
defensive lock.

**Source change.** None expected at the `.btn-back` selector. The shared `.btn`
rule must continue to set `display: inline-block`. If a future refactor adds a
`.btn-back { display: block }` override, this AC catches it.

**AC-4.1 [src]** — `Button.svelte`'s shared `.btn` rule contains
`display: inline-block`. No variant-specific override sets `display: block` on
`.btn-back` (or any other variant whose intended layout is inline).

**AC-4.2 [play]** — A new play assertion is added to the existing `Back` story
in `Button.stories.svelte` (or, if there is no `Back` story, one is created with
`args={{ variant: 'back' }}` and child text "RETURN TO CATALOGUE"). The play
function asserts
`getComputedStyle(buttonEl).display === 'inline-block'`. This is appropriate per
D42 because the variant's `display` value is part of its public contract — a
button that stretches to full width is functionally a different component.

---

### Section 5 — `Signoff` pattern — **OUT OF SCOPE for B39**

Finding 9 originally proposed adding a `Signoff` (or `Signature`) pattern to
the library. On review the abstraction was judged too thin — `<Rule /> +
<Grid cols={2}> + <Stack gap="xs">` per column is already a small composition
the website encodes locally in `src/lib/Signature.svelte`. The decision
(2026-05-19, user) is to **keep Signoff as a local component in the website**
and not add it to the library at this time. If a stronger case for a library
pattern emerges (semantic role, responsive collapse, repeated 10+ sites with
divergent shapes), file a new backlog item then.

No source change. No ACs. AC-5.* slots intentionally left blank below.

<details>
<summary>Archived original Section 5 (Signoff in library) — for reference</summary>

The original spec defined `Signoff.svelte` with `left`/`right` snippet slots,
internal Rule + scoped grid + per-cell stack, `margin-top: 56px`, `padding:
24px 0`, `gap: 32px`, and `@media (max-width: 720px)` 1-column collapse, plus
six ACs (4 src + 2 play). This section is preserved for traceability but
explicitly **not** part of the implementer's mandate.

**Current state.** No `Signoff` component exists. The website maintains a local
`src/lib/Signature.svelte` that composes `<Rule />` + `<Grid cols={2} gap="md">` +
two `<Stack gap="xs">` columns, repeated by hand on ~10 pages.

**Target state.** A new `Signoff` pattern component lives at
`src/lib/components/patterns/Signoff.svelte`, exported from
`src/lib/components/patterns/index.ts`, with the API:

```svelte
<Signoff>
  {#snippet left()}
    <Text variant="eyebrow">// SIGNED</Text>
    <Text variant="lede" color="ink">— Dexter, in the lab</Text>
  {/snippet}
  {#snippet right()}
    <Text variant="eyebrow">// SHIPPED BY</Text>
    <Text variant="lede" color="ink">
      DEXTERLABS <Text as="span" variant="lede" color="faint">/ a one-person lab</Text>
    </Text>
  {/snippet}
</Signoff>
```

Reference for shape — the website currently keeps a local
`src/lib/Signature.svelte`:

```svelte
<Rule />
<Grid cols={2} gap="md">
  <Stack gap="xs">
    <Text variant="eyebrow">// SIGNED</Text>
    <Text variant="lede" color="ink">— Dexter, in the lab</Text>
  </Stack>
  <Stack gap="xs">
    <Text variant="eyebrow">// SHIPPED BY</Text>
    <Text variant="lede" color="ink">
      DEXTERLABS <Text as="span" variant="lede" color="faint">/ a one-person lab</Text>
    </Text>
  </Stack>
</Grid>
```

The library `Signoff` absorbs the `<Rule />`, the `<Grid cols={2}>`, AND the
per-column `<Stack gap="xs">` — so consumers only write the inner content
(eyebrow + lede) inside each snippet, not the column layout. Migration from
`Signature.svelte` is therefore a strict reduction in boilerplate.

Internal structure:

- A `<Rule />` at the top.
- A scoped two-column grid container `.signoff-grid` with `gap: 32 px` between
  columns. Implementation note: **do not** use `<Grid>` internally — write the
  grid CSS directly in `Signoff.svelte`'s scoped `<style>` block so the
  responsive collapse (≤ 720 px → 1 fr) is self-contained without depending on
  Grid acquiring a responsive `cols` API.
- Each snippet renders into its own cell wrapper `<div class="signoff-cell">`
  which is a flex column with `gap: var(--u1)` (4 px — the same value
  `Stack gap="xs"` resolves to). This is what gives the eyebrow → lede the
  tight `xs` rhythm the website currently uses, without requiring the consumer
  to wrap the snippet content in a Stack.
- Container padding: `padding: 24 px 0` on the root wrapper.
- Outer rhythm: `margin-top: 56 px` (= `var(--u7)`) on the root wrapper so the
  signoff sits clearly below page content.

The `Rule` primitive **is** used directly for the top divider.

**Source change.** Add two new files:

- `src/lib/components/patterns/Signoff.svelte` — implementation per above.
- `src/lib/components/patterns/Signoff.stories.svelte` — at least one story
  exercising both snippets (see AC-5.5).

Update `src/lib/components/patterns/index.ts` to export `Signoff`.

**AC-5.1 [src]** — `src/lib/components/patterns/Signoff.svelte` exists. Its
`Props` interface declares `left?: Snippet` and `right?: Snippet` plus
`[key: string]: unknown` for `...rest` forwarding. Both snippets are optional;
when absent, the corresponding grid cell renders nothing (no placeholder).

**AC-5.2 [src]** — The component template renders, in order: a `<Rule />`
primitive, then a scoped `<div class="signoff-grid">` containing two cell
wrappers:

```svelte
<Rule />
<div class="signoff-grid">
  <div class="signoff-cell">{@render left?.()}</div>
  <div class="signoff-cell">{@render right?.()}</div>
</div>
```

No use of `<Grid>` or `<Stack>` internally — the grid CSS and the per-cell
column stack CSS are scoped inside `Signoff.svelte` (per the implementation
note above).

**AC-5.3 [src]** — The component's `<style>` block declares:

- A root wrapper rule (the `<svelte:element>` or outermost element that the
  template renders to) with `margin-top: 56px` (= `var(--u7)`) and
  `padding: 24px 0`. Implementer's choice whether the root is a `<section>`,
  a `<footer>`, or a `<div>`; the visual values must be `56 px` top margin
  and `24 px 0` padding.
- `.signoff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }`.
- `.signoff-cell { display: flex; flex-direction: column; gap: var(--u1); }`
  (4 px — matches `Stack gap="xs"` so the eyebrow-over-lede rhythm exactly
  matches the website's current `<Stack gap="xs">` usage).
- `@media (max-width: 720px) { .signoff-grid { grid-template-columns: 1fr; } }`.

**AC-5.4 [src]** — `src/lib/components/patterns/index.ts` adds
`export { default as Signoff } from './Signoff.svelte'`.

**AC-5.5 [play]** — `Signoff.stories.svelte` has at least one story (`Default`)
with `component: Signoff` in `defineMeta`. The story passes `left` and `right`
snippets containing distinguishable text ("// SIGNED" / "// SHIPPED BY") and the
play function asserts:

a. `getByText(/SIGNED/i)` and `getByText(/SHIPPED BY/i)` are both visible.
b. `canvasElement.querySelector("hr")` (the `Rule` primitive renders an `<hr>`)
   is not null and is the first structural child.
c. The scoped grid container (`.signoff-grid`) exists and contains exactly two
   `.signoff-cell` children — verified by
   `canvasElement.querySelectorAll('.signoff-cell').length === 2`.

These are behavioural assertions about a new component's public composition,
appropriate per D42.

**AC-5.6 [play]** — A second story `LeftOnly` (or equivalent) passes only the
`left` snippet. Play function asserts:

a. `getByText(/SIGNED/i)` is visible.
b. The grid container has fewer rendered children than the two-snippet case
   (verifies the conditional `{@render right?.()}` does not emit empty
   elements).

</details>

---

### Section 6 — `Text variant="eyebrow"` font-size 12 px → 14 px (finding 4)

**Current state.** `Text.svelte:86–92` declares `.eyebrow { font-size: var(--t-micro) }`
(= 12 px). The legacy global copy in `typography.css:99–105` matches.

**Target state.** `.eyebrow { font-size: var(--t-mono) }` (= 14 px). Letter-spacing
stays at `0.12em`; uppercase and ink-faint colour unchanged.

**Source change.**

1. `src/lib/components/primitives/Text.svelte` — change `.eyebrow`'s `font-size`
   from `var(--t-micro)` to `var(--t-mono)`.
2. `src/lib/tokens/typography.css` — make the same change to the global
   `.eyebrow` rule so the cascade matches.

**AC-6.1 [src]** — `Text.svelte`'s `.eyebrow` rule contains
`font-size: var(--t-mono)`. No `font-size: var(--t-micro)` remains inside the
`.eyebrow` selector body.

**AC-6.2 [src]** — `typography.css`'s `.eyebrow` rule contains
`font-size: var(--t-mono)` (matches).

> Per D42 visual-only — no play-fn assertion. The reviewer verifies the source
> change and opens the existing `Eyebrow` story to confirm visually.

---

### Section 7 — `Text variant="lede"` tracking + line-height (finding 5)

**Current state.** `Text.svelte:71–76` declares `.body-lede { line-height: 1.55 }`
with no `letter-spacing`. The global copy in `typography.css:77–82` matches.

**Target state.** `.body-lede { line-height: 1.5; letter-spacing: -0.01em }`.

**Source change.**

1. `src/lib/components/primitives/Text.svelte` — change `.body-lede`'s
   `line-height` from `1.55` to `1.5` and add `letter-spacing: -0.01em`.
2. `src/lib/tokens/typography.css` — same change to the global `.body-lede`.

**AC-7.1 [src]** — `Text.svelte`'s `.body-lede` rule contains
`line-height: 1.5` and `letter-spacing: -0.01em`. No `line-height: 1.55`
remains.

**AC-7.2 [src]** — `typography.css`'s `.body-lede` rule mirrors the same two
declarations.

> Per D42 visual-only — no play-fn assertion.

---

### Section 8 — `Heading variant="hero"` (and new `title`) letter-spacing -0.02em (finding 3)

**Current state.** `Heading.svelte:85–91` declares `.hero-heading { letter-spacing: -0.03em }`.
`typography.css:60–66` matches.

**Target state.** `.hero-heading { letter-spacing: -0.02em }`. The new
`.title-heading` (Section 2) also uses `-0.02em`. `.display-heading` keeps its
`-0.04em` and `.h1` keeps `-0.03em` (the page-level `h1` heading style, unrelated
to hero).

**Source change.**

1. `src/lib/components/primitives/Heading.svelte` — change `.hero-heading`'s
   `letter-spacing` from `-0.03em` to `-0.02em`. The new `.title-heading` rule
   from Section 2 already specifies `-0.02em`.
2. `src/lib/tokens/typography.css` — same change to the global `.hero-heading`.

**AC-8.1 [src]** — `Heading.svelte`'s `.hero-heading` rule contains
`letter-spacing: -0.02em`. No `letter-spacing: -0.03em` remains in the
`.hero-heading` rule body. `.display-heading` keeps `-0.04em`. `.h1` keeps
`-0.03em`. The new `.title-heading` rule (per AC-2.1) carries `-0.02em`.

**AC-8.2 [src]** — `typography.css`'s `.hero-heading` rule mirrors
`letter-spacing: -0.02em`.

> Per D42 visual-only — no play-fn assertion.

---

### Section 9 — `PageHero` vertical rhythm (finding 8)

**Current state.** `PageHero.svelte:51–70`:

```css
.page-hero            { padding: 48px 0 40px; }
.page-hero-eyebrow    { margin-bottom: 12px; }
.page-hero-lede       { margin-top: 20px; max-width: 62ch; }
.page-hero-actions    { margin-top: 24px; }
```

**Target state** — use design tokens (`--u<n>` spacing scale) where they exist;
the only raw values are those without a corresponding token.

```css
.page-hero            { padding: var(--u10) 0 var(--u5); }  /* 48 → 80 top; 40 unchanged */
.page-hero-eyebrow    { margin-bottom: 12px; }              /* no --u-12 token exists */
.page-hero-lede       { margin-top: var(--u2); max-width: 62ch; }  /* 20 → 16 */
.page-hero-actions    { margin-top: var(--u4); }            /* 24 → 32 */
```

Token mapping (from `src/lib/tokens/tokens.css`):
`--u2 = 16px`, `--u4 = 32px`, `--u5 = 40px`, `--u10 = 80px`. The scale is
sparse — `--u1`, `--u8`, `--u9` and an intermediate at 12 px do not exist.
`12px` and `62ch` are kept as literals; the 12 px gap is captured as an
out-of-scope follow-up (see "Out of scope" below).

`max-width: 62ch` stays as library canon (the production 48ch was site-level,
not library-level).

**Source change.** `src/lib/components/patterns/PageHero.svelte` — three numeric
edits in the `<style>` block.

**AC-9.1 [src]** — `PageHero.svelte`'s `.page-hero` rule has
`padding: var(--u10) 0 var(--u5)` (computed `80px 0 40px`).

**AC-9.2 [src]** — `.page-hero-lede` has `margin-top: var(--u2)` (computed
`16px`) and the existing `max-width: 62ch`.

**AC-9.3 [src]** — `.page-hero-actions` has `margin-top: var(--u4)` (computed
`32px`).

**AC-9.4 [src]** — `.page-hero-eyebrow` retains `margin-bottom: 12px` (no
intermediate token exists in the spacing scale; see Out of scope follow-up).

> Per D42 visual-only — no play-fn assertion. Existing PageHero story play
> functions continue to pass (none of them assert these specific values).

---

## Out of scope

- The website route file (`src/routes/(console)/order/cancel/+page.svelte` in
  the website repo) and the website's local `Signature.svelte` are caller-site
  concerns. After this item ships, the website is expected to swap `eyebrow="…"`
  for `eyebrowContent={…}` on PageHero — but `Signature.svelte` itself stays
  local to the website (see Section 5: Signoff dropped from B39).
- A library `Signoff` (or `Signature`) pattern component — see Section 5. May
  be reconsidered in a future backlog item.
- New `Button` variants. `back` is the only one tweaked, and only defensively.
- Image / portrait support inside `PageHero` (covered by B36 out-of-scope).
- Responsive type-scale changes beyond what `--t-title`'s `clamp()` already
  provides.
- Migration of the Modal title style (handled by B33 / B34).
- Extending the `--u<n>` spacing scale. The current scale (`--u2 = 16`,
  `--u3 = 24`, `--u4 = 32`, `--u5 = 40`, `--u6 = 48`, `--u7 = 56`, `--u10 = 80`)
  is missing `--u1` (4 px), an entry at 8 px, an intermediate at 12 px, and
  `--u8` / `--u9`. `PageHero.svelte` keeps `12px` and `4px` (from B38's Stack
  xs equivalent) as literals where no token exists. **Follow-up backlog item
  recommended:** complete the spacing scale and sweep the codebase for raw
  pixel values in token-relevant positions.

---

## Open questions

### OQ-1 — Rule `currentColor` regression not reproducible (non-blocking)

The item card diagnoses `<Rule />` rendering with `border-top-color` equal to
`--ink` because of `currentColor` inheritance. Reading the current `Rule.svelte`
source, every variant already specifies `var(--rule)` / `var(--rule-strong)`
explicitly. Either the website is consuming a stale built copy of `Rule`, or the
diagnosis is misattributed (the offending border could be on the `Grid` /
`Stack` / a wrapper element inside the local `Signature.svelte`, not on
`<Rule />` itself). The Section 3 ACs are defensive locks rather than fixes.

Recommended action by the implementer: rebuild the library (`pnpm build`) and
relink to the website to confirm the regression is gone. If the regression
persists, investigate whether the website's `Signature.svelte` is applying a
border to its outer wrapper rather than via `<Rule />`. **Non-blocking** for
this spec — the AC pair holds the current source shape correct either way.

### OQ-2 — Button `back` `display: block` regression not reproducible (non-blocking)

Same situation as OQ-1: the current `Button.svelte` source inherits
`display: inline-block` from `.btn` and `.btn-back` does not override it. The
website-side regression is likely a stale dist or a caller wrapping the button
in a block element. **Non-blocking** — AC-4.2 locks the contract.

### OQ-3 — Signoff component name — **moot**

The original question (`Signoff` vs `Signature`) is resolved by dropping the
Signoff component from B39 (see Section 5). The website's local
`Signature.svelte` stays; nothing is added to the library under either name.

### OQ-4 — Should `eyebrow` become optional? (non-blocking, parallels B36 OQ-1)

When a caller passes `eyebrowContent`, `eyebrow` is unused but currently still
typed as optional `string` (already optional — `eyebrow?: string`). No change
required for AC-1.1, but the implementer should not add a new required-prop
constraint.

### OQ-5 — Should the `:global(.hero-heading em)` rule be kept alongside `.title-heading em`? (non-blocking)

AC-2.3 leaves this to the implementer. If the rule selects both classes, callers
using `headingContent` with a nested `<Heading variant="hero">` retain the
ink-faint `<em>` styling. If the rule is renamed (only `title-heading em`), the
escape-hatch `hero` path loses the faded-em behaviour. Recommended: select
**both** classes — costs nothing, preserves B36 behaviour for the legacy variant.

---

## Decision to be logged in `decisions.md`

A new decision entry will be appended (D43) recording:

- The default `PageHero` heading variant changes from `hero` to a new `title`
  variant; existing PageHero stories accept the smaller scale without being
  rewritten to pass a `headingContent` snippet.
- The Signoff pattern is named `Signoff` (not `Signature`), and is implemented
  with native scoped grid CSS (not `<Grid>`), because `Grid` cannot collapse
  responsively from `cols={2}` to `cols={1}` at a media-query breakpoint.
- Grid `gap="lg"` already resolves to 32 px; no Grid API extension is needed
  for the Signoff column gap.
