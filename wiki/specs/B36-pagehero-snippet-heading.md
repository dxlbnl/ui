# B36: PageHero — snippet-based heading with mixed ink colors

## Context

The production homepage at dexterlabs.nl renders a `PageHero` heading that mixes
normal ink text and faded ink-faint text across multiple lines (achieved via `<em>`).
The current design-system `PageHero` only accepts a plain `heading` string, which
the component renders inside `<Heading level={1} variant="hero">`. There is no way
for a caller to compose richer inline content without reaching outside the design
system.

This item adds three targeted enhancements to `PageHero.svelte`:

1. A `headingContent` Svelte 5 snippet prop, so callers can pass arbitrary inline
   content into the `<Heading level={1} variant="hero">` wrapper instead of the
   plain string.
2. A scoped `:global(.hero-heading em)` rule inside `.page-hero` that styles `<em>`
   children of the Heading primitive with `font-style: normal` and
   `color: var(--ink-faint)` — matching the visual pattern from the OG site.
3. A `border` boolean prop that lets callers suppress the bottom rule (the homepage
   uses `border={false}`).

Relevant wiki pages: [vision.md](../vision.md), [requirements.md](../requirements.md)
(R8 — Page hero), [architecture.md](../architecture.md),
[composition-limits.md](../composition-limits.md) (`:global` boundary workaround),
[stories-guide.md](../stories-guide.md).

Item card: [wiki/backlog/doing/B36-pagehero-snippet-heading.md](../backlog/doing/B36-pagehero-snippet-heading.md)

### Key implementation facts established by reading the source

- `Heading.svelte` renders `<svelte:element this={"h" + level} class={[variantClass, klass]} ...>`.
  For `level={1} variant="hero"` the root element receives **class `hero-heading`** (from
  `VARIANT_CLASS.hero = 'hero-heading'`). There is no outer wrapper element.
- The correct `:global` selector for reaching `<em>` inside a `Heading level={1}
  variant="hero">` that is a descendant of `.page-hero` is therefore:

  ```css
  .page-hero :global(.hero-heading em) {
    font-style: normal;
    color: var(--ink-faint);
  }
  ```

- The OG website PageHero uses a raw `<h1>` (not the Heading primitive); the design
  system version must not copy raw `<h1>` or font CSS — all composition goes through
  the existing `Heading` primitive.

---

## Acceptance criteria

### AC-1 — `headingContent` snippet prop declared in `PageHero.svelte`

**File:** `src/lib/components/patterns/PageHero.svelte`

`Props` must declare `headingContent?: Snippet`. The prop must be destructured
alongside `heading`, `eyebrow`, `lede`, and `children`.

**Verification:** story `SnippetHeading` (see AC-3) renders without TypeScript errors
and Storybook produces no prop-type warning.

---

### AC-2 — Conditional render: snippet takes precedence over string

**File:** `src/lib/components/patterns/PageHero.svelte`

Inside `<Heading level={1} variant="hero">`, the template must use the pattern:

```
{#if headingContent}{@render headingContent()}{:else}{heading}{/if}
```

- When `headingContent` is provided, `{@render headingContent()}` is called and
  `heading` is ignored.
- When `headingContent` is absent, the plain `heading` string is rendered exactly as
  it is today.
- No other change to the Heading wrapper (`level={1} variant="hero"` is preserved in
  both branches).

**Verification (branch A — string):** existing story `Full` must continue to pass —
`getByRole("heading", { level: 1, name: "Things built in the lab." })` returns
a visible element.

**Verification (branch B — snippet):** story `SnippetHeading` (AC-3) passes.

---

### AC-3 — Story `SnippetHeading` in `PageHero.stories.svelte`

**File:** `src/lib/components/patterns/PageHero.stories.svelte`

Add a story named `"SnippetHeading"` that passes no `heading` arg and instead
provides a `headingContent` snippet containing:

```svelte
{#snippet headingContent()}
  Dexter.<br /><em>Things built</em><br />in the lab.
{/snippet}
```

The story's `play` function must assert:

a. `canvasElement.querySelector("h1")` is not null and is visible.
b. The `<h1>` element contains at least one `<em>` child
   (`h1.querySelector("em")` is not null).
c. The computed `fontStyle` of the `<em>` element is `"normal"` — this is sufficient
   proof that the `:global(.hero-heading em)` rule fired (it is the only rule that
   would override the browser default `italic`). A separate color probe is not required.

This story must be added to the existing `PageHero.stories.svelte` file (not a new
file) and inherit the `defineMeta` `component: PageHero` so it is rendered via the
standard CSF wrapper.

---

### AC-4 — `:global(.hero-heading em)` scoped rule in `PageHero.svelte`

**File:** `src/lib/components/patterns/PageHero.svelte`

The component's `<style>` block must include:

```css
.page-hero :global(.hero-heading em) {
  font-style: normal;
  color: var(--ink-faint);
}
```

- No other `:global` selectors are added.
- The rule must not use `.hero-heading` without the `.page-hero` ancestor guard
  (to avoid collisions outside this component).
- The rule must not duplicate any CSS that is already correctly handled by the
  `Heading` primitive itself.

**Verification:** AC-3 play function assertions (c) and (d) exercise this rule
directly via computed-style checks.

---

### AC-5 — `border` prop declared and applied

**File:** `src/lib/components/patterns/PageHero.svelte`

`Props` must declare `border?: boolean` with default `false` in the destructure:

```ts
let { eyebrow, heading, headingContent, lede, border = false, children, ...rest }: Props = $props()
```

> **Note (2026-05-19, post-B38):** the default was flipped from `true` → `false`
> per the "no boolean prop defaults to true" rule. The `Full` story now passes
> `border: true` explicitly in its args to keep its borderBottomStyle assertion
> valid; AC-7's "default `border=true` preserved" line is superseded by this
> flip.

The `.page-hero` CSS rule must be split so that:

- `padding: 48px 0 40px` always applies (no change).
- `border-bottom: 1px solid var(--rule)` is conditional — present when
  `border === true`, absent when `border === false`.

Implement via a CSS class toggle. The recommended approach is a `class:` directive
that adds a modifier class (e.g., `class:page-hero--bordered={border}`) with the
`border-bottom` rule scoped to `.page-hero--bordered`. Alternatively a `data-`
attribute + attribute selector is acceptable. Direct `style=` injection is not
acceptable (per B27 constraint — no inline `style=` on layout elements).

---

### AC-6 — Story `NoBorder` in `PageHero.stories.svelte`

**File:** `src/lib/components/patterns/PageHero.stories.svelte`

Add a story named `"NoBorder"` with args:

```ts
{ eyebrow: "// DEXTERLABS", heading: "Homepage", border: false }
```

The play function must assert:

a. `canvas.getByRole("heading", { level: 1, name: "Homepage" })` is visible.
b. `canvasElement.querySelector("header")` is not null.
c. The `borderBottomStyle` of the `<header>` element (via `getComputedStyle`) is
   `"none"`.

---

### AC-7 — Existing stories continue to pass (no regression)

**File:** `src/lib/components/patterns/PageHero.stories.svelte`

All four pre-existing stories — `Full`, `Heading Only`, `No Slot`, and
`No Inline Styles` — must pass without modification. In particular:

- `Full` story must still observe a non-`"none"` `borderBottomStyle` on the
  `<header>` element (default `border=true` preserved).
- `No Inline Styles` must still find zero `[style]` descendants inside `.page-hero`.

---

### AC-8 — No raw `<h1>` or font CSS added to `PageHero.svelte`

**File:** `src/lib/components/patterns/PageHero.svelte`

After this change, `PageHero.svelte` must not contain:

- Any literal `<h1>` element.
- Any `font-family`, `font-size`, `font-weight`, `letter-spacing`, or `line-height`
  declarations directly on a heading selector.

The heading sizing/tracking/weight is exclusively owned by the `Heading` primitive's
own `<style>` block (`.hero-heading` class). The scoped rule added in AC-4 is limited
to `font-style` and `color`.

**Verification:** `grep` of the rendered `PageHero.svelte` file.

---

### AC-9 — TypeScript: no errors introduced

**File:** `src/lib/components/patterns/PageHero.svelte`

`Props` must extend `[key: string]: unknown` (existing pattern). The `headingContent`
prop type must be `Snippet` imported from `'svelte'` (already imported). No `any`,
no `@ts-ignore`, no `as any` casts. `pnpm check` must exit clean.

---

## Out of scope

- **Image support inside `headingContent`**: the reference usage (`+page.svelte`)
  includes a portrait image alongside the heading text. That image is a site-level
  concern (layout, `mix-blend-mode`, responsive `srcset`). The design system only
  needs to expose the snippet prop — what the caller renders inside it is their
  business.
- **`heading` prop becoming optional**: to preserve the existing API, `heading` stays
  as `string` (required). Callers using `headingContent` must still provide a
  `heading` fallback value; alternatively this is left as `heading?: string` — see
  Open questions.
- **Multi-palette color verification**: the `--ink-faint` probe check in AC-3(c) runs
  in the default Phosphor palette. Paper-palette contrast is covered by the a11y addon
  running on all stories.
- **Responsive / media-query rules** on `.page-hero`: not part of this item.
- **Portrait image layout on the homepage**: not a design system concern.

---

## Open questions

### OQ-1 — Should `heading` become optional? (non-blocking)

Currently `heading: string` is required. If `headingContent` is provided, the caller
still has to pass a dummy `heading` value or TypeScript will complain. Making `heading`
optional (`heading?: string`) and rendering an empty string when absent would be the
cleanest API, and there are no existing callers inside this repo that would break
(all stories provide a `heading`). This is a minor API choice; the implementer should
make `heading` optional (`heading?: string`) unless the manager decides otherwise.

### OQ-2 — Modifier class vs. `class:` directive for `border` (non-blocking)

AC-5 recommends `class:page-hero--bordered={border}` on the `<header>` element. An
alternative is to bind a CSS custom property or use a `data-border` attribute. Either
approach is acceptable; the implementation choice does not need manager sign-off.
