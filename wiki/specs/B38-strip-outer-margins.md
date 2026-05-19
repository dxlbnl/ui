# B38: Strip outer margins from all components (consumer owns spacing)

## Context

A primitive or pattern component must never apply its own **outer** margin — the
outermost element it renders must have `margin-top/right/bottom/left === 0px`.
Outer spacing is the consumer's job, expressed through the calling layout
primitive's `gap` (Stack/Inline/Spread) or the page's own scoped CSS. This rule
was surfaced by a regression at `dexterlabs.nl/order/cancel/` where 16 px of
margin-bottom inherited via a `.eyebrow` selector on the consumer page collided
with a 12 px gap on a parent Stack — the library's components must not
contribute to that class of problem.

This item is a focused **audit + cleanup**: per `wiki/backlog/doing/B38-text-heading-eyebrow-strip-outer-margin.md`,
every component under `primitives/`, `cards/`, `navigation/`, `forms/`, `feedback/`,
`patterns/`, and `data/` is inspected; offending outer margins on the root element
are stripped; existing stories gain a play-fn margin assertion on the root; and
caller migration (gap/wrapper change) is documented for any visual breakage.

Internal margins between a component's own child elements stay — the rule is
strictly about the **outermost box** the component renders.

Related wiki pages:
- [architecture.md](../architecture.md) — component authoring conventions, scoped CSS
- [composition-limits.md](../composition-limits.md) — Svelte scoping boundary; why
  internal margins on `Stack`/`Inline` children survive
- [stories-guide.md](../stories-guide.md) — how to query the canvas root and
  assert computed styles
- [specs/B14-typography-primitives.md](B14-typography-primitives.md) — Text/Heading
  origin: zero-CSS primitives that wrap global `typography.css` classes
- [specs/B26-typography-size-prop.md](B26-typography-size-prop.md) — Text/Heading
  later acquired scoped variant CSS; the margin-on-root contract was never made
  explicit there, this item closes that gap
- [specs/B27-layout-style-prop-cleanup.md](B27-layout-style-prop-cleanup.md) —
  introduced the internal PageHero `:global` margins on `.page-hero-eyebrow`,
  `.page-hero-lede`, `.page-hero-actions`; those are internal children, not
  component roots, and are explicitly out of scope here
- [specs/B25-layout-gap-api.md](B25-layout-gap-api.md) — the `gap` API that
  consumers must use to restore spacing after a margin is stripped
- [backlog item](../backlog/doing/B38-text-heading-eyebrow-strip-outer-margin.md)
- [backlog/inbox/regression-order-cancel.md](../backlog/inbox/regression-order-cancel.md)
  — the surfacing regression

### Audit method

For each component, the **root selector** = the outermost element the component
renders to the DOM (the element receiving `{...rest}`). I checked:

1. The component's own `<style>` block (root selector + any rule landing on the
   root via `:global` or unscoped CSS).
2. The global typography classes from `src/lib/tokens/typography.css` that the
   root might carry — these are loaded via `app.css` so they cascade onto any
   `<p>`, `<h1>`–`<h6>`, `<table>` etc. rendered by a component. The relevant
   reset is `p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; margin: 0; }`
   on line 33 of `typography.css`. Components whose root is a heading or
   paragraph element therefore inherit `margin: 0` from the global reset, but
   that dependency is fragile (it disappears if `typography.css` is not loaded
   in a future Prose-only or SSR-without-app-css consumer). Heading and Text
   are tightened to declare their own zero-margin rule under scoped CSS.
3. Inline `style=` props applied to the root in the component template.
4. Token-driven margins propagated via custom properties (none found).

### Per-component audit table

Legend for **Status**: `clean` = root margin already `0px`; `OFFENDER` = root has
a non-zero margin; `RESET-DEPENDENT` = root reads `0px` only because a global
reset in `typography.css` zeroes it (the component itself declares no rule). All
`RESET-DEPENDENT` rows are tightened in this item so the contract is
component-owned, not document-owned.

#### primitives/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `Button.svelte` | `<svelte:element this={as} class="btn btn-{variant}">` | none | `0 0 0 0` | clean — no change |
| `Led.svelte` | `<span class="led led-{color}">` | none | `0 0 0 0` | clean — no change |
| `TagPill.svelte` | `<span class="pill pill-{variant}">` | none | `0 0 0 0` | clean — no change |
| `Text.svelte` | `<svelte:element this={DEFAULT_TAG[variant]} class={VARIANT_CLASS[variant]}>` (p / span) | `typography.css :33` global reset `p { margin: 0 }` applies when root is `<p>` (body/lede variants); no rule applies when root is `<span>` (mono/eyebrow) — spans have no UA margin anyway | `0 0 0 0` (RESET-DEPENDENT for p, intrinsically 0 for span) | Add a scoped rule inside `Text.svelte` `<style>`: `.body-text, .body-lede, .mono-label, .eyebrow { margin: 0 }`. Closes the document-dependency. |
| `Heading.svelte` | `<svelte:element this={"h"+level} class={variantClass}>` (h1–h6) | `typography.css :33` global reset `h1,h2,h3,h4,h5,h6 { margin: 0 }` (RESET-DEPENDENT) | `0 0 0 0` (only because of the global reset) | Add a scoped rule inside `Heading.svelte` `<style>`: `.h1, .h2, .h3, .hero-heading, .display-heading { margin: 0 }`. Also add a non-class rule that covers `level={4|5|6}` (no variant class) — see AC-6. |

> Text/Heading rationale: B14 deliberately wrapped global typography classes, and
> the `margin: 0` for raw `p`/`h*` lives in the global reset. After this item,
> Text and Heading own that guarantee in scoped CSS — independent of whether the
> consumer loads `typography.css`. The eyebrow regression in the item card's
> motivation was a consumer-page `:global(.eyebrow)` selector (not a library
> rule); making Text scoped-`margin: 0` means a future similar consumer rule
> targeting `.eyebrow` can't reach the Text primitive's element via the cascade
> as long as the consumer rule has no higher specificity. (Equal specificity
> still loses to a later sheet — this is documented under Risk.)

#### cards/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `Card.svelte` | `<svelte:element this={as} class="card">` | none | `0 0 0 0` | clean — no change |
| `NoteCard.svelte` | `<Card class="note-card">` → renders Card's `<div class="card note-card">` | none on root; internal `.note-foot { margin-top: 8px }` is between children of Stack inside the body — internal, retained | `0 0 0 0` | clean — no change |
| `ProductCard.svelte` | `<Card class="product-card">` → `<div class="card product-card">` | none on root; internal `.card-footer-row { margin-top: auto }` is on a child, retained | `0 0 0 0` | clean — no change |
| `ProjectCard.svelte` | `<Card class="project-card">` → `<div class="card project-card">` | none on root; internal `.card-desc { margin: 0 }` is a `<p>` reset on a child, retained | `0 0 0 0` | clean — no change |

#### navigation/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `Nav.svelte` | `<nav class="nav">` | none on root; internal `.nav-inner { margin: 0 auto }`, `.nav-path { margin-left: 8px }`, `.nav-right { margin-left: auto }`, `.nav-links { margin: 0 }`, `.nav-menu { margin-left: auto }` (in @media) all target child elements | `0 0 0 0` | clean — no change |
| `Breadcrumb.svelte` | `<svelte:element this={as} class="breadcrumb">` (default `<nav>`) | none on root; internal `.bc-list { margin: 0 }` is the `<ol>` reset, retained | `0 0 0 0` | clean — no change |

#### forms/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `Field.svelte` | `<Stack>` (Stack's `<div class="stack">`) | none | `0 0 0 0` | clean — no change |
| `Input.svelte` | `<input class="input">` | none | `0 0 0 0` | clean — no change |
| `InputWrap.svelte` | `<div class="input-wrap">` | none | `0 0 0 0` | clean — no change |
| `Textarea.svelte` | `<textarea class="input">` | none | `0 0 0 0` | clean — no change |
| `Select.svelte` | `<div class="select">` | none on root; internal `.select-panel { margin: 0 }` is the `<ul>` reset, retained | `0 0 0 0` | clean — no change |
| `Checkbox.svelte` | `<label class="checkbox-wrap">` | none on root; internal `.checkbox-input { margin: -1px }` is the sr-only `<input>` clip, retained | `0 0 0 0` | clean — no change |
| `Radio.svelte` | `<label class="radio-wrap">` | none on root; internal `.radio-input { margin: -1px }` is the sr-only `<input>` clip, retained | `0 0 0 0` | clean — no change |
| `RadioGroup.svelte` | `<fieldset class="radio-group">` | scoped `.radio-group { margin: 0 }` — explicitly resets `<fieldset>` UA margin to 0. The internal `.radio-group-legend { margin-bottom: 4px }` is on a child `<legend>`, retained | `0 0 0 0` (explicit) | clean — no change (confirm assertion passes) |
| `Switch.svelte` | `<span class="switch-wrap">` | none | `0 0 0 0` | clean — no change |

#### feedback/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `Alert.svelte` | `<div class="alert alert--{variant}">` | none on root; internal `.alert-tag { margin-top: 2px }` (child span) and `.alert-dismiss { margin-left: auto }` (child button) are between siblings inside `.alert`, retained | `0 0 0 0` | clean — no change |
| `Modal.svelte` | `<dialog class="modal modal--{variant}">` | none — `<dialog>` has UA margin in some browsers; the scoped rule explicitly `padding: 0` and `inset: 0` cover positioning. Computed `margin` on a `[open]` dialog with `position: fixed` and `inset: 0` is 0 per the browser. | `0 0 0 0` | clean — no change (confirm via assertion; if a browser reports non-zero, add `margin: 0` to the `.modal` rule) |
| `Toast.svelte` | `<div class="toast toast--{variant}">` | none | `0 0 0 0` | clean — no change |
| `ToastRegion.svelte` | `<div class="toast-region toast-region--{position}">` | none — `position: fixed` element; margin has no layout effect but should still read 0 | `0 0 0 0` | clean — no change |

#### patterns/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `PageHero.svelte` | `<header class="page-hero">` | none on root; internal `.page-hero-eyebrow { margin-bottom: 12px }`, `.page-hero-lede { margin-top: 20px }`, `.page-hero-actions { margin-top: 24px }` are all on child wrapper `<div>`s **inside** `.page-hero` — internal, retained per B27 | `0 0 0 0` | clean — no change |
| `SectionHead.svelte` | `<section class="section-head">` | none on root; internal `.sublabel { margin-left: auto }` is on a child `<span>`, retained per B27 AC-12 | `0 0 0 0` | clean — no change |
| `SectionFoot.svelte` | `<footer class="section-foot">` | scoped `.section-foot { margin-top: 20px }` — **OFFENDER** | `margin-top: 20px` (other sides 0) | Remove `margin-top: 20px` from the scoped rule. The 20 px gap above SectionFoot must come from the parent's `<Stack gap="...">` (or a wrapper). See caller-site migration below — only one caller exists (SectionFoot's own stories), the regression is contained. |
| `StatCard.svelte` | `<Card class="stat-card">` → `<div class="card stat-card">` | none | `0 0 0 0` | clean — no change |
| `KvList.svelte` | `<Stack gap="none">` (Stack's `<div class="stack">`) | none | `0 0 0 0` | clean — no change |
| `ProgressBar.svelte` | `<div class="progress-bar">` | none | `0 0 0 0` | clean — no change |
| `ActivityRow.svelte` | `<div class="activity-row">` | none | `0 0 0 0` | clean — no change |
| `CtaBlock.svelte` | `<svelte:element this={as} class="cta-block">` | none | `0 0 0 0` | clean — no change |

#### data/

| Component | Root selector | Margin source | Before | Proposed fix |
|-----------|--------------|---------------|--------|--------------|
| `Accordion.svelte` | `<div class="accordion">` | none | `0 0 0 0` | clean — no change |
| `AccordionItem.svelte` | `<details class="acc-item">` | none on root; internal `.acc-body` and `.acc-trigger` carry no margin | `0 0 0 0` | clean — no change |
| `Tabs.svelte` | `<Stack class="tabs tabs--{variant}">` (Stack's `<div class="stack">`) | none on root; internal `:global(.btn.tab) { margin-bottom: -1px }` is on the child Button (inside `.tab-bar`), retained as a deliberate underline-overlap trick | `0 0 0 0` | clean — no change |
| `Table.svelte` | `<table class="dxl-table">` | UA `<table>` has no default margin in modern browsers; no scoped rule applies; computed margin should read 0 | `0 0 0 0` | clean — no change (confirm via assertion) |

### Summary

- **OFFENDER** count: **1** (`SectionFoot.svelte`, root `margin-top: 20px`).
- **RESET-DEPENDENT** count: **2** (`Text.svelte`, `Heading.svelte` — tightened to
  scoped self-owned `margin: 0`).
- All other 26 components are already clean. The audit's main value is the
  per-component AC that locks the contract in stories so a future change cannot
  regress it.

---

## Acceptance criteria

> Per [D42](../decisions.md), this is a visual-only bug. No play-fn assertions
> are added to lock the zero-outer-margin contract on already-clean components.
> ACs name the source change and the visual outcome; the reviewer verifies by
> reading the diff and opening the affected stories in Storybook.

### AC-1 — `SectionFoot.svelte` source no longer declares `margin-top`

In `src/lib/components/patterns/SectionFoot.svelte`, the scoped `.section-foot`
rule no longer contains `margin-top: 20px` (or any other margin property). A
grep of `SectionFoot.svelte` for `margin` yields zero matches inside the
`<style>` block.

### AC-2 — `Text.svelte` declares its own scoped `margin: 0`

`Text.svelte`'s `<style>` block contains a rule that sets `margin: 0` on every
variant root class. Either as part of each variant rule, or as a combined
selector (`.body-text, .body-lede, .mono-label, .eyebrow { margin: 0 }`).
The component no longer depends on `typography.css`'s global `p { margin: 0 }`
reset to zero its root margin.

### AC-3 — `Heading.svelte` declares its own scoped `margin: 0` for all levels

`Heading.svelte`'s `<style>` block contains a rule that sets `margin: 0` on
every variant root class **and** on bare h4/h5/h6 (which carry no variant
class). One acceptable implementation:

```css
.h1, .h2, .h3, .hero-heading, .display-heading { margin: 0 }
/* level={4|5|6} have no variant class — cover via scoped element selector */
h4, h5, h6 { margin: 0 }
```

Implementer chooses the exact selector — the AC requirement is that every
`<h1>`–`<h6>` Heading renders with `margin: 0` declared in scoped CSS, not
inherited from the global reset.

### AC-4 — Existing stories still render correctly

Open `SectionFoot.stories.svelte`, `Text.stories.svelte`, and
`Heading.stories.svelte` in Storybook (`pnpm storybook`) and confirm no
unintended visual regressions. SectionFoot stories render no preceding sibling,
so the removed 20 px top margin has no visible effect anyway.

### AC-5 — Full test suite remains green

`pnpm test` passes with zero failures. No existing play function is expected
to regress; the changes are CSS-only on three components.

---

## Removed — original AC-1 through AC-39 (computed-style contract locks)

The earlier draft of this spec proposed 40 play-fn assertions across 28
component stories files (one four-side margin assertion per component) to lock
the zero-outer-margin contract everywhere. Per [D42](../decisions.md), that is
not what tests are for in this project — play functions test behaviour, not
visual decoration. The audit table above is retained as documentation of the
current state; no per-component assertions are written.

<details>
<summary>Original AC text (archived for reference)</summary>

### AC-1 — `Button.svelte` root has zero outer margin

In any existing story in `src/lib/components/primitives/Button.stories.svelte`,
add a play-fn assertion. Root = `canvasElement.firstElementChild` (the rendered
`<button class="btn btn-{variant}">`). Assert:

```ts
const s = getComputedStyle(canvasElement.firstElementChild as HTMLElement);
await expect(s.marginTop).toBe('0px');
await expect(s.marginRight).toBe('0px');
await expect(s.marginBottom).toBe('0px');
await expect(s.marginLeft).toBe('0px');
```

(This pattern is identical for every component below; only the root selector
varies.) The four-side assertion form is what every AC below means by "asserts
zero margin on the root".

### AC-2 — `Led.svelte` root has zero outer margin

Stories file: `Led.stories.svelte`. Root = the rendered `<span class="led led-{color}">`
(`canvasElement.firstElementChild`). Asserts zero margin on the root.

### AC-3 — `TagPill.svelte` root has zero outer margin

Stories file: `TagPill.stories.svelte`. Root = the rendered
`<span class="pill pill-{variant}">` (`canvasElement.firstElementChild`).
Asserts zero margin on the root.

### AC-4 — `Text.svelte` root has zero outer margin for every variant

Stories file: `Text.stories.svelte`. Stories named `Body`, `Lede`, `Mono`,
`Eyebrow` each get a margin assertion on `canvasElement.firstElementChild` —
respectively a `<p class="body-text">`, `<p class="body-lede">`,
`<span class="mono-label">`, `<span class="eyebrow">`. All four variants assert
zero margin on the root.

### AC-5 — `Text.svelte` declares its own scoped `margin: 0` for all four variants

`Text.svelte`'s `<style>` block contains a rule that sets `margin: 0` on every
variant root class. Either as part of each variant rule, or as a combined
selector (`.body-text, .body-lede, .mono-label, .eyebrow { margin: 0 }`).
A grep of `Text.svelte` for `margin:\s*0` yields at least one match within the
scoped `<style>` block. The assertion in AC-4 must continue to pass when
`typography.css`'s `p, h1..h6 { margin: 0 }` line 33 reset is hypothetically
removed (verified by an additional probe story or implementation review — not a
required runtime assertion).

### AC-6 — `Heading.svelte` root has zero outer margin for every level

Stories file: `Heading.stories.svelte`. For the `Levels` story (already renders
h1/h2/h3 with default variants) and a new or extended `Level4NoClass` story
(renders an `<h4>` with no variant class), assert zero margin on
`canvasElement.firstElementChild`. The h4 case is the strictest test — it has
no variant class, so the new self-owned scoped rule must cover bare h4–h6 too.

### AC-7 — `Heading.svelte` declares its own scoped `margin: 0` for all levels

`Heading.svelte`'s `<style>` block contains a rule that sets `margin: 0` on
every variant root class **and** on bare h4/h5/h6 (which carry no variant
class). One acceptable implementation:

```css
.h1, .h2, .h3, .hero-heading, .display-heading { margin: 0 }
/* fallback for level={4|5|6} which have no variant class */
:global(:where(h4, h5, h6)) { margin: 0 }   /* if Heading is the only h4-6 source */
```

Because Heading's `<style>` is scoped to elements **it** renders, the simplest
in-scope path is to apply `margin: 0` to the rendered `<h*>` via a class-less
scoped rule on `h1, h2, h3, h4, h5, h6`. Implementer chooses the exact selector
— the AC requirement is that the AC-6 assertion holds for level=4 with no
variant class.

A grep of `Heading.svelte` for `margin:\s*0` yields at least one match within
the scoped `<style>` block.

### AC-8 — `Card.svelte` root has zero outer margin

Stories file: `Card.stories.svelte`. Root = `canvasElement.firstElementChild`
(the rendered `<svelte:element this={as} class="card">`, defaulting to `<div class="card">`).
Asserts zero margin on the root.

### AC-9 — `NoteCard.svelte` root has zero outer margin

Stories file: `NoteCard.stories.svelte`. Root = `canvasElement.firstElementChild`
(NoteCard renders `<Card class="note-card">`, so the root is Card's rendered
`<a class="card note-card">` since NoteCard defaults `as="a"`). Asserts zero
margin on the root.

### AC-10 — `ProductCard.svelte` root has zero outer margin

Stories file: `ProductCard.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<a class="card product-card">`. Asserts zero margin on the root.

### AC-11 — `ProjectCard.svelte` root has zero outer margin

Stories file: `ProjectCard.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<a class="card project-card">`. Asserts zero margin on the root.

### AC-12 — `Nav.svelte` root has zero outer margin

Stories file: `Nav.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<nav class="nav">`. Asserts zero margin on the root. (Note: `.nav` is
`position: fixed`; margin still computes and the four-side assertion still
applies.)

### AC-13 — `Breadcrumb.svelte` root has zero outer margin

Stories file: `Breadcrumb.stories.svelte`. Root = `canvasElement.firstElementChild`
— defaults to `<nav class="breadcrumb">`, or `<div class="breadcrumb">` when
`as="div"`. Asserts zero margin on the root.

### AC-14 — `Field.svelte` root has zero outer margin

Stories file: `Field.stories.svelte`. Root = `canvasElement.firstElementChild`
— Field renders `<Stack>`, so the root is Stack's rendered `<div class="stack">`.
Asserts zero margin on the root.

### AC-15 — `Input.svelte` root has zero outer margin

Stories file: `Input.stories.svelte`. Root = the rendered `<input class="input">`.
Use `canvasElement.querySelector('input')` (or `getByRole('textbox')` for typed
inputs that surface that role). Asserts zero margin on the root.

### AC-16 — `InputWrap.svelte` root has zero outer margin

Stories file: `InputWrap.stories.svelte` (and `InputWrap.composition.stories.svelte`
remains unaffected — no margin assertion needed there since `component:` is not
set). Root = `canvasElement.firstElementChild` — `<div class="input-wrap">`.
Asserts zero margin on the root.

### AC-17 — `Textarea.svelte` root has zero outer margin

Stories file: `Textarea.stories.svelte`. Root = the rendered
`<textarea class="input">`. Use `canvasElement.querySelector('textarea')`.
Asserts zero margin on the root.

### AC-18 — `Select.svelte` root has zero outer margin

Stories file: `Select.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="select">`. Asserts zero margin on the root.

### AC-19 — `Checkbox.svelte` root has zero outer margin

Stories file: `Checkbox.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<label class="checkbox-wrap">`. Asserts zero margin on the root.

### AC-20 — `Radio.svelte` root has zero outer margin

Stories file: `Radio.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<label class="radio-wrap">`. Asserts zero margin on the root.

### AC-21 — `RadioGroup.svelte` root has zero outer margin

Stories file: `RadioGroup.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<fieldset class="radio-group">`. Asserts zero margin on the root. (This
component already has an explicit `margin: 0` reset on `.radio-group`; the AC
locks that in.)

### AC-22 — `Switch.svelte` root has zero outer margin

Stories file: `Switch.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<span class="switch-wrap">`. Asserts zero margin on the root.

### AC-23 — `Alert.svelte` root has zero outer margin

Stories file: `Alert.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="alert alert--{variant}">`. Asserts zero margin on the root.

### AC-24 — `Modal.svelte` root has zero outer margin

Stories file: `Modal.stories.svelte`. Root = `canvasElement.querySelector('dialog')`
(the dialog is rendered into the canvas with `position: fixed; inset: 0` but it
is still the component's rendered root element). Asserts zero margin on the
root. If a browser surfaces a non-zero UA margin on `<dialog>`, add an explicit
`margin: 0` line to the `.modal` rule in `Modal.svelte` to satisfy this AC.

### AC-25 — `Toast.svelte` root has zero outer margin

Stories file: `Toast.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="toast toast--{variant}">`. Asserts zero margin on the root.

### AC-26 — `ToastRegion.svelte` root has zero outer margin

Stories file: `ToastRegion.stories.svelte`. Root = the rendered
`<div class="toast-region toast-region--{position}">`. Because the toast region
gates rendering on `mounted` and is `position: fixed`, the play-fn must
`await` long enough for the effect to set `mounted = true`, then query
`canvasElement.querySelector('.toast-region')`. Asserts zero margin on the
root.

### AC-27 — `PageHero.svelte` root has zero outer margin

Stories file: `PageHero.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<header class="page-hero">` (or `header.page-hero.page-hero--bordered`).
Asserts zero margin on the root.

### AC-28 — `SectionHead.svelte` root has zero outer margin

Stories file: `SectionHead.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<section class="section-head">`. Asserts zero margin on the root.

### AC-29 — `SectionFoot.svelte` root has zero outer margin (post-strip)

Stories file: `SectionFoot.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<footer class="section-foot">`. Asserts zero margin on the root. Together
with AC-30, this is the only "regression-prone" change in this item.

### AC-30 — `SectionFoot.svelte` source no longer declares `margin-top`

In `src/lib/components/patterns/SectionFoot.svelte`, the scoped `.section-foot`
rule no longer contains `margin-top: 20px` (or any other margin property). A
grep of `SectionFoot.svelte` for `margin` yields zero matches inside the
`<style>` block.

### AC-31 — `StatCard.svelte` root has zero outer margin

Stories file: `StatCard.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="card stat-card">`. Asserts zero margin on the root.

### AC-32 — `KvList.svelte` root has zero outer margin

Stories file: `KvList.stories.svelte`. Root = `canvasElement.firstElementChild`
— KvList renders `<Stack gap="none">`, so root is `<div class="stack">`. Asserts
zero margin on the root.

### AC-33 — `ProgressBar.svelte` root has zero outer margin

Stories file: `ProgressBar.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="progress-bar">`. Asserts zero margin on the root.

### AC-34 — `ActivityRow.svelte` root has zero outer margin

Stories file: `ActivityRow.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="activity-row">`. Asserts zero margin on the root.

### AC-35 — `CtaBlock.svelte` root has zero outer margin

Stories file: `CtaBlock.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<svelte:element this={as} class="cta-block">` (default `<div class="cta-block">`).
Asserts zero margin on the root.

### AC-36 — `Accordion.svelte` root has zero outer margin

Stories file: `Accordion.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<div class="accordion">`. Asserts zero margin on the root.

### AC-37 — `AccordionItem.svelte` root has zero outer margin

`AccordionItem` is exercised inside `Accordion.stories.svelte` (no separate
stories file exists). Add a play-fn assertion in an Accordion story that
queries the first `.acc-item` child (`canvasElement.querySelector('.acc-item')`)
and asserts zero margin on it. (Adjacent `.acc-item` siblings rely on their own
`border-bottom`, not margin, so margin-0 is unaffected.)

### AC-38 — `Tabs.svelte` root has zero outer margin

Stories file: `Tabs.stories.svelte`. Root = `canvasElement.firstElementChild`
— Tabs renders `<Stack class="tabs tabs--{variant}">`, so root is
`<div class="stack tabs tabs--{variant}">`. Asserts zero margin on the root.

### AC-39 — `Table.svelte` root has zero outer margin

Stories file: `Table.stories.svelte`. Root = `canvasElement.firstElementChild`
— `<table class="dxl-table">`. Asserts zero margin on the root. (UA `<table>`
margin is 0 in modern browsers; AC locks the contract regardless of UA.)

### AC-40 — Full test suite green

`pnpm test` passes with zero failures after all changes. Every existing play
function continues to pass — the only deliberate change to behaviour is the
removed `margin-top: 20px` on SectionFoot, which is handled by the caller-site
migration below.

</details>

---

## Caller-site migration

Removed/tightened margins must not produce visual regressions in any existing
story or caller. The single behavioural change is SectionFoot's removed
`margin-top: 20px`.

### SectionFoot — 20 px above the footer

**Removed**: `.section-foot { margin-top: 20px }`.

**Callers in this repo** (audited via grep `SectionFoot`):

| Caller | Current expectation | Required change |
|--------|---------------------|-----------------|
| `src/lib/components/patterns/SectionFoot.stories.svelte` (3 stories) | None of the existing stories assert margin-top. Visual: each story renders SectionFoot alone in the canvas — no preceding sibling, so the previously-present 20 px margin had no visible effect anyway. | No code change needed beyond adding the AC-29 margin assertions. Visual output is unchanged because no preceding element exists in any story. |
| `src/routes/+page.svelte` | Does not import SectionFoot. | No change. |
| Production consumer (dexterlabs.nl) | The library does not control consumer pages. | Documentation note added below. |

**Documentation note** (added to SectionFoot's docstring / story autodocs): "As of
B38, SectionFoot has no outer margin. Wrap it in a `<Stack gap="lg">` (or use
the page's own scoped spacing) to reproduce the previous 20 px top gap."

### Text / Heading — newly self-owned `margin: 0`

The scoped `margin: 0` added to Text and Heading is **value-preserving**: every
existing caller already saw `0px` margin via the global reset. The only
behavioural difference is that a future hypothetical consumer that loads the
component without `typography.css` will now still see `0px` margin. No story
visual changes are expected.

### Every other component

No source change. The new play-fn margin assertion is purely additive — it
locks the existing contract.

---

## Out of scope

- **Internal child margins.** Every `margin-*` rule that targets a child
  element of a component (PageHero's `.page-hero-eyebrow` / `.page-hero-lede` /
  `.page-hero-actions`, SectionHead's `.sublabel`, Nav's `.nav-inner` /
  `.nav-path` / `.nav-right` / `.nav-links`, Alert's `.alert-tag` /
  `.alert-dismiss`, RadioGroup's `.radio-group-legend`, NoteCard's `.note-foot`,
  ProductCard's `.card-footer-row`, Tabs' `.btn.tab`, etc.) **stays as-is**.
  The rule is strictly about the outermost element the component renders, not
  about the structural spacing it owns between its own children.
- **`typography.css` global reset.** Line 33 (`p, h1..h6 { margin: 0 }`) remains.
  Text and Heading add their own scoped rules in addition to (not instead of)
  the global reset, so Prose and raw-HTML consumers continue to work unchanged.
- **`Stack` / `Inline` / `Spread` / `Grid` / `Container` / `Rule` / `Prose`
  layout primitives.** Out of scope — they live in `src/lib/components/layout/`,
  not in the seven categories the item card enumerates. They already have
  their own margin-0 contract documented in the layout specs.
- **Visual regression testing.** Tests are play-fn assertions only. Pixel-level
  comparisons are not in scope.
- **The 16 px margin-bottom on `.eyebrow` reported at `dexterlabs.nl/order/cancel/`.**
  That came from a consumer-page selector, not the library. After this item,
  the library cannot be the source of that regression — but the consumer page
  may still need its own fix, tracked in
  `wiki/backlog/inbox/regression-order-cancel.md`.
- **Token-driven margins.** None found in the audit; nothing to remove.

---

## Risk

This item is **regression-prone** because adjacent content that previously
relied on a component's outer margin will collapse together once that margin
is removed. To contain the risk:

1. **Only one component actually has a non-zero root margin** (`SectionFoot`,
   `margin-top: 20px`). The other 27 components are confirmed clean (or
   tightened in a value-preserving way for Text/Heading). The behavioural blast
   radius is one component.
2. **No existing SectionFoot story renders a preceding sibling**, so no story's
   visual rendering changes. AC-40 (`pnpm test` green) is enforceable.
3. **Text/Heading's scoped `margin: 0`** is value-preserving against the existing
   global reset in `typography.css`. The risk surface is a hypothetical
   consumer-side `:global` selector that previously applied a non-zero margin
   to a Text/Heading root via the cascade — after this change such a selector
   may still win on equal specificity if it loads later than the component's
   scoped style. This is the standard Svelte scoped-CSS / global selector
   interaction documented in `composition-limits.md`; consumers who need to
   override are not blocked.
4. **Test-writer hand-off**: the four-side margin assertion is the same pattern
   in every AC. Test-writer should add a single assertion block to one
   existing story per component (the "default" or "primary" story is fine) —
   not to every story — except where the AC explicitly names multiple stories
   (Text AC-4, Heading AC-6).

---

## Open questions

### OQ-1 — Heading scoped selector for level={4|5|6} (non-blocking)

`Heading.svelte` does not apply a variant class for `level={4|5|6}` (per B14
AC-24). To make AC-7 hold for those levels, the implementer must add a scoped
rule that targets the bare element. Two acceptable patterns:

- **(a)** A scoped element selector inside `Heading.svelte`'s `<style>`:
  `h1, h2, h3, h4, h5, h6 { margin: 0 }`. Svelte's scoper rewrites this to
  the data-attribute selector that only matches elements the component renders.
- **(b)** Apply a sentinel class (e.g. `dxl-heading`) to every Heading
  regardless of variant, and scope the rule on that class. This is more
  invasive — adds a class to every rendered Heading.

The spec recommends (a) — minimal, no public-API change. Not blocking.

### OQ-2 — Modal dialog UA margin variability (non-blocking)

Some browsers historically applied a non-zero margin on `<dialog>` when not in
`[open]` modal state. The audit found no scoped margin rule on `.modal`; the
fix-path is to add `margin: 0` to the `.modal` rule **only if** AC-24's
assertion fails on the CI browser. Implementer should run AC-24 first and add
the line only if needed. Not blocking.

### OQ-3 — Storybook canvas wrapper margin (non-blocking)

`getComputedStyle(canvasElement.firstElementChild).margin*` reads the margin
on the **component's rendered root**, not on a Storybook-injected wrapper. The
existing `Rule.stories.svelte` and `Container.stories.svelte` already use this
same query pattern successfully (see `Rule.stories.svelte:56-59` for an
identical four-side margin assertion). No issue is foreseen. Not blocking.

No open questions block implementation. B38 is ready for `test-writer`.
