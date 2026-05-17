# B24: Style prop cleanup

## Context

After B13 (composition refactor) and B14 (typography primitives), inline `style=` props
were added to layout primitives (Stack, Inline, Spread) and Heading/Text elements in
several higher-order components. These have become redundant in two ways:

1. **Heading and Text variant overlap** — B14 introduced named variants (`hero`, `h1`,
   `h2`, `h3`, `display` for Heading; `body`, `lede`, `mono`, `eyebrow` for Text) that
   each map to an existing global typography class. When a Heading or Text carries a
   `style=` prop that re-specifies properties already covered by that class, those
   declarations are bugs-in-waiting: a future token change to the class will not
   propagate to the overridden prop.

2. **Container styles on layout primitives** — Stack, Inline, and Spread are layout
   utilities. When they carry `style=` props with multiple non-layout declarations
   (background, border, max-width, padding, font-family, etc.), those declarations
   belong in scoped CSS on a plain HTML element owned by the parent component. This is
   pattern 2 from `composition-limits.md` ("wrapper div with scoped CSS").

No `:global()` selectors are introduced by this item. All new rules use Svelte scoped
CSS on elements rendered directly by the parent component.

**Relevant wiki pages:**
- `wiki/composition-limits.md` — three-pattern Svelte scoping strategy
- `wiki/specs/B14-typography-primitives.md` — Heading/Text variant-to-class mapping
- `wiki/specs/B13-composition-refactor.md` — original composition decisions

---

## Decision rules

### Rule A — Typography variant replacement

Replace a `style=` prop on `<Heading>` or `<Text>` with a `variant=` prop when every
style declaration in the `style=` prop is already covered by one of the variant classes
below, **and** the values match exactly (same token, same literal value).

Remove `margin: 0` unconditionally from any Heading `style=` — the global reset
(`typography.css`: `h1, h2, h3, h4, h5, h6 { margin: 0 }`) makes it redundant.

**Heading variant lookup table** (from `Heading.svelte` + `typography.css`):

| `variant` | CSS class | `font-size` | `letter-spacing` | `font-weight` | `line-height` |
|-----------|----------|-------------|-----------------|--------------|--------------|
| `"h1"` | `.h1` | `var(--t-h1)` (72px) | `-0.03em` | `500` | `1` |
| `"h2"` | `.h2` | `var(--t-h2)` (36px) | `-0.01em` | `500` | `1.1` |
| `"h3"` | `.h3` | `var(--t-h3)` (24px) | `-0.01em` | `500` | `1.2` |
| `"hero"` | `.hero-heading` | `var(--t-hero)` (clamp 48–112px) | `-0.03em` | `500` | `1` |
| `"display"` | `.display-heading` | `var(--t-display)` (140px) | `-0.04em` | `500` | `0.9` |

Default variant per level: level 1 → `h1`, level 2 → `h2`, level 3 → `h3`.

**Text variant lookup table** (from `Text.svelte` + `typography.css`):

| `variant` | CSS class | `font-family` | `font-size` | `letter-spacing` | `text-transform` | `color` |
|-----------|----------|--------------|-------------|-----------------|-----------------|--------|
| `"body"` | `.body-text` | sans | `var(--t-body)` (16px) | — | — | inherits |
| `"lede"` | `.body-lede` | sans | `var(--t-lede)` (19px) | — | — | `var(--ink-dim)` |
| `"mono"` | `.mono-label` | mono | `var(--t-mono)` (14px) | `0.08em` | uppercase | `var(--ink-dim)` |
| `"eyebrow"` | `.eyebrow` | mono | `var(--t-micro)` (12px) | `0.12em` | uppercase | `var(--ink-faint)` |

The `eyebrow` variant bakes in `color: var(--ink-faint)`, so `color="faint"` is
redundant alongside `variant="eyebrow"` and should be removed.

### Rule B — Container style replacement

Replace `<Stack|Inline|Spread style="...">` with a scoped native element when:

1. The `style=` attribute has **two or more CSS declarations**, AND
2. The element represents a named structural region (it already carries a `class=` prop,
   or it is the single outermost element of the component).

**Exception:** never move a reactive value (e.g., `style="width: {clampedValue}%"`) to
scoped CSS — it must remain inline.

The native element becomes the scoped container; the layout primitive is nested inside
it with only its semantic props (`gap=`, `as=`, etc.) and no `style=`.

---

## Affected files — complete change table

The table below lists every change. "No change" rows are included for completeness
to confirm the auditor reviewed each instance and explicitly decided to leave it.

### `src/lib/components/patterns/SectionHead.svelte`

| Change | Current | After |
|--------|---------|-------|
| Outer Stack → native section | `<Stack as="section" style="gap: 6px; padding: 40px 0 12px; border-bottom: 1px solid var(--rule);" {...rest}>` | `<section class="section-head" {...rest}><Stack style="gap: 6px;">` + scoped CSS |
| Inner Inline gap prop | `<Inline style="align-items: baseline; gap: 16px;">` | `<Inline gap="sm" style="align-items: baseline;">` |
| Eyebrow Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">` | `<Text variant="eyebrow">` |
| Section heading | `<Heading level={2} style="font-weight: 500; font-size: var(--t-h3); letter-spacing: -0.01em; margin: 0;">` | `<Heading level={2} variant="h3">` |

Scoped CSS added:
```css
.section-head {
  padding: 40px 0 12px;
  border-bottom: 1px solid var(--rule);
}
```

Note on gap: `gap: 6px` is not a standard token value (`xs` = 8px, `none` = 0). It is
preserved as a single-property `style="gap: 6px;"` on the inner Stack per Rule B's
exception (one property = below threshold). See Open questions for whether 8px is
acceptable.

### `src/lib/components/patterns/PageHero.svelte`

| Change | Current | After |
|--------|---------|-------|
| Eyebrow Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em; margin-bottom: 12px;">` | `<Text variant="eyebrow" style="margin-bottom: 12px;">` (keep margin; remove color=, remove font-size + letter-spacing from style=) |
| Hero heading | `<Heading level={1} style="font-weight: 500; font-size: var(--t-hero); line-height: 1; letter-spacing: -0.03em; margin: 0;">` | `<Heading level={1} variant="hero">` |
| Lede Text | `<Text color="dim" style="font-size: var(--t-lede); margin-top: 20px; line-height: 1.55; max-width: 62ch;">` | `<Text variant="lede" style="margin-top: 20px; max-width: 62ch;">` (lede bakes in font-size + line-height + color:ink-dim) |
| Children Inline | `<Inline gap="sm" style="margin-top: 24px;">` | No change (single-prop style= is below threshold) |

### `src/lib/components/patterns/CtaBlock.svelte`

| Change | Current | After |
|--------|---------|-------|
| Eyebrow Text | `<Text variant="mono" color="faint" class="cta-eyebrow" style="font-size: var(--t-micro); letter-spacing: 0.12em;">` | `<Text variant="eyebrow" class="cta-eyebrow">` |
| Spread | `<Spread style="gap: 24px;">` | No change (single-prop style=) |
| `.cta-eyebrow` scoped rule | Existing rule in `<style>` block (if it only duplicated font styling) | Remove the `.cta-eyebrow` rule if it is empty or redundant after the variant change; keep any remaining declarations |

### `src/lib/components/patterns/SectionFoot.svelte`

| Change | Current | After |
|--------|---------|-------|
| Outer Spread → native footer | `<Spread as="footer" style="border-top: 1px solid var(--rule); padding: 12px 0; font-family: var(--mono); font-size: var(--t-mono); letter-spacing: 0.06em; margin-top: 20px;" {...rest}>` | `<footer class="section-foot" {...rest}><Spread>` + scoped CSS |

Scoped CSS added:
```css
.section-foot {
  border-top: 1px solid var(--rule);
  padding: 12px 0;
  font-family: var(--mono);
  font-size: var(--t-mono);
  letter-spacing: 0.06em;
  margin-top: 20px;
}
```

### `src/lib/components/cards/NoteCard.svelte`

| Change | Current | After |
|--------|---------|-------|
| Card body Stack → div | `<Stack gap="xs" style="padding: 20px; flex: 1;">` | `<div class="card-body"><Stack gap="xs">` + scoped CSS |
| Card title Heading | `<Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; margin: 0;">` | `<Heading level={3} style="font-size: var(--t-lede);">` (remove `letter-spacing` — `.h3` covers it; remove `margin: 0` — global reset covers it) |
| Hex ID Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.1em;">` | No change — `0.1em` ≠ eyebrow's `0.12em` |
| Kind Text | `<Text variant="mono" color="cyan" style="font-size: var(--t-micro); letter-spacing: 0.1em;">` | No change — `0.1em` ≠ eyebrow's `0.12em` |
| Date Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.08em;">` | No change — `0.08em` ≠ eyebrow's `0.12em`; `font-size: var(--t-micro)` ≠ mono's `var(--t-mono)` |
| READ Text | `<Text variant="mono" color="amber" style="font-size: var(--t-micro); letter-spacing: 0.08em;">` | No change — same reasoning |
| Lede Text | `<Text variant="body" color="dim" class="note-lede" style="flex: 1;">` | No change (single-prop style=) |

Scoped CSS added:
```css
.card-body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

### `src/lib/components/cards/ProductCard.svelte`

| Change | Current | After |
|--------|---------|-------|
| Card body Stack → div | `<Stack gap="xs" style="padding: 12px 14px 10px; flex: 1;">` | `<div class="card-body"><Stack gap="xs">` + scoped CSS |
| SKU label Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">` | `<Text variant="eyebrow">` (matches eyebrow exactly: micro + 0.12em + ink-faint) |
| Card title Heading | `<Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; line-height: 1.2;">` | `<Heading level={3} style="font-size: var(--t-lede);">` (remove `letter-spacing` + `line-height` — `.h3` covers both) |
| Price Text | `<Text variant="mono" color="amber" style="font-size: var(--t-body);">` | No change (single-prop style=) |
| VAT Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); text-transform: lowercase; letter-spacing: 0.06em;">` | No change — `text-transform: lowercase` overrides mono's uppercase; custom combo |
| Stock Text | `<Text variant="mono" style="font-size: var(--t-micro);">` | No change (single-prop style=) |
| Price Inline | `<Inline gap="xs" style="align-items: baseline;">` | No change (single-prop style=) |
| Spread in body | `<Spread style="align-items: baseline; margin-top: auto; padding-top: 8px;">` | Three props. Replace: `<div class="card-footer-row"><Spread>` + scoped CSS (see below) |

Scoped CSS added:
```css
.card-body {
  padding: 12px 14px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-footer-row {
  align-items: baseline;
  margin-top: auto;
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  gap: var(--u2);
}
```

### `src/lib/components/cards/ProjectCard.svelte`

| Change | Current | After |
|--------|---------|-------|
| Card body Stack → div | `<Stack gap="xs" style="padding: 12px 14px 10px; flex: 1;">` | `<div class="card-body"><Stack gap="xs">` + scoped CSS |
| Slug label Text | `<Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">` | `<Text variant="eyebrow">` |
| Card title Heading | `<Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; line-height: 1.2;">` | `<Heading level={3} style="font-size: var(--t-lede);">` (remove `letter-spacing` + `line-height`) |

Scoped CSS added:
```css
.card-body {
  padding: 12px 14px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

### `src/lib/components/feedback/Modal.svelte`

| Change | Current | After |
|--------|---------|-------|
| Inner Stack → div | `<Stack class="modal-inner" style="background: var(--bg-elev); border: 1px solid var(--rule-strong); width: 100%; max-width: 480px; max-height: 80vh; overflow-y: auto;">` | `<div class="modal-inner">` containing an inner Stack (or no Stack if the div handles column flex) |
| Header Inline → native | `<Inline as="header" style="align-items: center; gap: var(--u); padding: var(--u2) var(--u3); border-bottom: 1px solid var(--rule);">` | `<header class="modal-header"><Inline gap="xs">` + scoped CSS |
| Modal title Text | `<Text variant="mono" as="h2" id="modal-title" style="font-size: var(--t-lede); letter-spacing: 0.08em; margin: 0; flex: 1;">` | `<Text variant="mono" as="h2" id="modal-title" style="font-size: var(--t-lede); letter-spacing: 0.08em; flex: 1;">` (remove `margin: 0` — global reset) |
| Footer Spread → native | `<Spread as="footer" style="padding: var(--u2) var(--u3); border-top: 1px solid var(--rule);">` | `<footer class="modal-footer"><Spread>` + scoped CSS |

Scoped CSS added to existing `<style>` block:
```css
.modal-inner {
  background: var(--bg-elev);
  border: 1px solid var(--rule-strong);
  width: 100%;
  max-width: 480px;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: var(--u2) var(--u3);
  border-bottom: 1px solid var(--rule);
  display: flex;
  align-items: center;
}

.modal-footer {
  padding: var(--u2) var(--u3);
  border-top: 1px solid var(--rule);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--u2);
}
```

### `src/lib/components/navigation/Nav.svelte`

| Change | Current | After |
|--------|---------|-------|
| Nav inner Inline → div | `<Inline class="nav-inner" gap="none" style="padding: 0 24px; height: 48px; max-width: 1200px; margin: 0 auto;">` | `<div class="nav-inner">` + scoped CSS |
| Brand link Inline → native a | `<Inline as="a" href="/" class="nav-brand" gap="xs" style="flex-shrink: 0; color: var(--ink); text-decoration: none; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;">` | `<a class="nav-brand" href="/">` with Led + span inside directly + scoped CSS |
| Right group Inline → div | `<Inline class="nav-right" gap="sm" style="margin-left: auto; flex-shrink: 0;">` | `<div class="nav-right">` with children inline + scoped CSS |
| Links list Inline → ul | `<Inline as="ul" class="nav-links" gap="md" style="padding: 0; margin: 0; flex-shrink: 0; text-transform: uppercase; font-size: 12px; list-style: none;">` | `<ul class="nav-links">` + scoped CSS; existing `:global(.nav-links)` media rule becomes `.nav-links` (no `:global()`) |
| Actions Inline | `<Inline class="nav-actions" gap="xs" style="flex-shrink: 0;">` | No change (single-prop style=) |
| Drawer links Stack → ul | `<Stack as="ul" class="nav-drawer-links" gap="sm" style="list-style: none; padding: 0; margin: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.08em;">` | `<ul class="nav-drawer-links">` + scoped CSS |

Scoped CSS added to existing `<style>` block:
```css
.nav-inner {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0 24px;
  height: 48px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--u);
  flex-shrink: 0;
  color: var(--ink);
  text-decoration: none;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: var(--u2);
  margin-left: auto;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--u2);
  padding: 0;
  margin: 0;
  flex-shrink: 0;
  text-transform: uppercase;
  font-size: 12px;
  list-style: none;
}

.nav-drawer-links {
  display: flex;
  flex-direction: column;
  gap: var(--u2);
  list-style: none;
  padding: 0;
  margin: 0;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.08em;
}
```

The existing `@media (max-width: 767px) { :global(.nav-links) { display: none !important; } }`
becomes `@media (max-width: 767px) { .nav-links { display: none !important; } }`.
This is the **only** `:global()` reduction in the file — all other `:global()` usages in
Nav remain untouched (they are documented exceptions in `composition-limits.md`).

### Components with no changes

The following components were audited and require no changes under the rules above:

| Component | Reason |
|-----------|--------|
| `Alert.svelte` | Layout div + Stack already use scoped CSS or single-prop style |
| `StatCard.svelte` | Text overrides (0.1em, 0.04em) match no Text variant; Stack has 2-prop style= on padding+flex but these are both layout props — acceptable single pattern; implementer may optionally convert the Stack style= to a wrapper div |
| `KvList.svelte` | No layout primitives with multi-prop style= |
| `ProgressBar.svelte` | `style="width: 100%;"` is single-prop; Text overrides are reactive or non-variant |
| `ActivityRow.svelte` | Outer `.activity-row` is already a scoped div |
| `SectionFoot.svelte` child spans | Scoped CSS already on the section-foot container post-change |
| `Accordion.svelte` | `style="border: 1px solid var(--rule);"` is single-prop |
| `AccordionItem.svelte` | No layout primitives; documented exception |
| `Table.svelte` | No layout primitives; semantic table HTML |
| `Toast.svelte` | No layout primitives |
| `ToastRegion.svelte` | No layout primitives |
| `Breadcrumb.svelte` | No layout primitives |
| `Card.svelte` | Base card primitive; documented exception |

---

## Acceptance criteria

### AC-1 — SectionHead: eyebrow variant

`SectionHead.svelte` template: the eyebrow `<Text>` uses `variant="eyebrow"`. It has no
`color=` prop and no `style=` prop (the `font-size` and `letter-spacing` declarations
are gone). The rendered element has CSS class `eyebrow`.

```
Before: <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">{eyebrow}</Text>
After:  <Text variant="eyebrow">{eyebrow}</Text>
```

**Test:** in the SectionHead story with `eyebrow` prop set, `getByText(eyebrowValue)` returns
an element whose `className` contains `eyebrow` and whose inline `style` attribute does not
contain `font-size` or `letter-spacing`.

---

### AC-2 — SectionHead: heading variant

`SectionHead.svelte` template: the heading `<Heading level={2}>` uses `variant="h3"`. It
has no `style=` prop. The rendered `<h2>` has CSS class `h3`.

```
Before: <Heading level={2} style="font-weight: 500; font-size: var(--t-h3); letter-spacing: -0.01em; margin: 0;">{heading}</Heading>
After:  <Heading level={2} variant="h3">{heading}</Heading>
```

**Test:** `getByRole('heading', { level: 2 })` returns an element with `className`
containing `h3` and whose `style` attribute (if present) does not contain `font-size`,
`letter-spacing`, `font-weight`, or `margin`.

---

### AC-3 — SectionHead: outer container

`SectionHead.svelte` template: the outer element is a `<section class="section-head">`,
not a Stack. A `<Stack>` is nested inside it. `{...rest}` spreads onto the `<section>`.
The `<style>` block contains `.section-head` with `padding: 40px 0 12px` and
`border-bottom: 1px solid var(--rule)`. The Stack has no `style=` containing `padding`
or `border-bottom`.

**Test:** in the SectionHead story, the root element is a `<section>` and has class
`section-head`. The `border-bottom` CSS property resolves on that element.

---

### AC-4 — SectionHead: inner Inline gap prop

`SectionHead.svelte` template: the `<Inline>` for the heading row uses `gap="sm"` as a
prop. Its `style=` prop contains at most one property (`align-items: baseline`). The
string `gap:` does not appear in any `style=` value on this element.

```
Before: <Inline style="align-items: baseline; gap: 16px;">
After:  <Inline gap="sm" style="align-items: baseline;">
```

---

### AC-5 — PageHero: eyebrow variant

`PageHero.svelte` template: the eyebrow `<Text>` uses `variant="eyebrow"`. It has no
`color=` prop. Its `style=` prop (if present) contains only `margin-bottom: 12px` and
no `font-size` or `letter-spacing` declarations.

```
Before: <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em; margin-bottom: 12px;">{eyebrow}</Text>
After:  <Text variant="eyebrow" style="margin-bottom: 12px;">{eyebrow}</Text>
```

---

### AC-6 — PageHero: hero heading variant

`PageHero.svelte` template: `<Heading level={1}>` uses `variant="hero"` and has no
`style=` prop. The rendered `<h1>` has CSS class `hero-heading`.

```
Before: <Heading level={1} style="font-weight: 500; font-size: var(--t-hero); line-height: 1; letter-spacing: -0.03em; margin: 0;">{heading}</Heading>
After:  <Heading level={1} variant="hero">{heading}</Heading>
```

**Test:** `getByRole('heading', { level: 1 })` returns an element with `className`
containing `hero-heading` and no inline `style` containing `font-size` or `letter-spacing`.

---

### AC-7 — PageHero: lede text variant

`PageHero.svelte` template: the lede `<Text>` uses `variant="lede"` and has no `color=`
prop. Its `style=` prop (if present) contains only `margin-top: 20px` and
`max-width: 62ch`. The strings `font-size` and `line-height` do not appear in that `style=`.

```
Before: <Text color="dim" style="font-size: var(--t-lede); margin-top: 20px; line-height: 1.55; max-width: 62ch;">{lede}</Text>
After:  <Text variant="lede" style="margin-top: 20px; max-width: 62ch;">{lede}</Text>
```

---

### AC-8 — CtaBlock: eyebrow variant

`CtaBlock.svelte` template: the eyebrow `<Text>` uses `variant="eyebrow"` and has no
`color=` or `style=` prop. The `class="cta-eyebrow"` attribute is retained.

```
Before: <Text variant="mono" color="faint" class="cta-eyebrow" style="font-size: var(--t-micro); letter-spacing: 0.12em;">{eyebrow}</Text>
After:  <Text variant="eyebrow" class="cta-eyebrow">{eyebrow}</Text>
```

The `.cta-eyebrow` scoped CSS rule is removed if it duplicates styling now provided by
the `eyebrow` variant class. Any remaining properties in `.cta-eyebrow` that are _not_
covered by `.eyebrow` must be preserved.

---

### AC-9 — SectionFoot: outer container

`SectionFoot.svelte` template: the outer element is a `<footer class="section-foot">`,
not a Spread. A `<Spread>` is nested inside it. `{...rest}` spreads onto the `<footer>`.
The `<style>` block contains `.section-foot` with at minimum: `border-top`,
`padding`, `font-family`, `font-size`, `letter-spacing`, and `margin-top`. No `style=`
prop exists on the `<footer>` or the `<Spread>`.

```
Before: <Spread as="footer" style="border-top:...; padding:...; font-family:...; font-size:...; letter-spacing:...; margin-top:..." {...rest}>
After:  <footer class="section-foot" {...rest}><Spread> … </Spread></footer>
```

**Test:** in the SectionFoot story, the root element is a `<footer>` with class
`section-foot`. The element has a `border-top` CSS property.

---

### AC-10 — NoteCard: card body container

`NoteCard.svelte` template: the inner `<Stack>` that was `<Stack gap="xs" style="padding: 20px; flex: 1;">` is
now wrapped in a `<div class="card-body">`. The Stack itself has no `style=` prop. The
`<style>` block contains `.card-body` with `padding: 20px`, `flex: 1`, `display: flex`,
and `flex-direction: column`.

```
Before: <Stack gap="xs" style="padding: 20px; flex: 1;">
After:  <div class="card-body"><Stack gap="xs"> … </Stack></div>
```

**Test:** in the NoteCard story, a `<div>` with class `card-body` is present in the DOM.
The `<h3>` heading is a descendant of `.card-body`.

---

### AC-11 — NoteCard: heading style cleanup

`NoteCard.svelte` template: the `<Heading level={3}>` `style=` contains only
`font-size: var(--t-lede)`. The strings `letter-spacing` and `margin` do not appear in
that `style=` value.

```
Before: <Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; margin: 0;">{title}</Heading>
After:  <Heading level={3} style="font-size: var(--t-lede);">{title}</Heading>
```

**Test:** `getByRole('heading', { level: 3 })` has a `style` attribute that does not
contain `letter-spacing` or `margin`. It has CSS class `h3` (the default for level 3).

---

### AC-12 — ProductCard: card body container

`ProductCard.svelte` template: the inner Stack is wrapped in `<div class="card-body">`.
The Stack has no `style=`. The `<style>` block contains `.card-body` with `padding`,
`flex: 1`, `display: flex`, and `flex-direction: column`.

```
Before: <Stack gap="xs" style="padding: 12px 14px 10px; flex: 1;">
After:  <div class="card-body"><Stack gap="xs"> … </Stack></div>
```

---

### AC-13 — ProductCard: SKU label eyebrow

`ProductCard.svelte` template (inside the Stack/card-body): the SKU label `<Text>` uses
`variant="eyebrow"` with no `color=` and no `style=`.

```
Before: <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">{sku}</Text>
After:  <Text variant="eyebrow">{sku}</Text>
```

---

### AC-14 — ProductCard: heading style cleanup

`ProductCard.svelte` template: the `<Heading level={3}>` `style=` contains only
`font-size: var(--t-lede)`. The strings `letter-spacing` and `line-height` do not appear
in that `style=` value.

```
Before: <Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; line-height: 1.2;">{name}</Heading>
After:  <Heading level={3} style="font-size: var(--t-lede);">{name}</Heading>
```

---

### AC-15 — ProductCard: footer row container

`ProductCard.svelte` template: the `<Spread style="align-items: baseline; margin-top: auto; padding-top: 8px;">` is
replaced by a `<div class="card-footer-row">` wrapping a `<Spread>`. The `<style>` block
contains `.card-footer-row` with `align-items: baseline`, `margin-top: auto`, and
`padding-top: 8px`, plus `display: flex`, `justify-content: space-between`, and `gap`.

```
Before: <Spread style="align-items: baseline; margin-top: auto; padding-top: 8px;">
After:  <div class="card-footer-row"><Spread> … </Spread></div>
```

---

### AC-16 — ProjectCard: card body container

`ProjectCard.svelte` template: inner Stack wrapped in `<div class="card-body">`. The
Stack has no `style=`. The `<style>` block contains `.card-body` with `padding`,
`flex: 1`, `display: flex`, and `flex-direction: column`.

```
Before: <Stack gap="xs" style="padding: 12px 14px 10px; flex: 1;">
After:  <div class="card-body"><Stack gap="xs"> … </Stack></div>
```

---

### AC-17 — ProjectCard: slug label eyebrow

`ProjectCard.svelte` template: the slug label `<Text>` uses `variant="eyebrow"` with no
`color=` and no `style=`.

```
Before: <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">{slug.toUpperCase()} · PROJECT</Text>
After:  <Text variant="eyebrow">{slug.toUpperCase()} · PROJECT</Text>
```

---

### AC-18 — ProjectCard: heading style cleanup

`ProjectCard.svelte` template: the `<Heading level={3}>` `style=` contains only
`font-size: var(--t-lede)`. The strings `letter-spacing` and `line-height` do not appear.

```
Before: <Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; line-height: 1.2;">{title}</Heading>
After:  <Heading level={3} style="font-size: var(--t-lede);">{title}</Heading>
```

---

### AC-19 — Modal: inner container

`Modal.svelte` template: the `<Stack class="modal-inner">` is replaced by
`<div class="modal-inner">`. The `<style>` block contains `.modal-inner` with
`background`, `border`, `width`, `max-width`, `max-height`, `overflow-y`,
`display: flex`, and `flex-direction: column`.

```
Before: <Stack class="modal-inner" style="background: var(--bg-elev); border: 1px solid var(--rule-strong); width: 100%; max-width: 480px; max-height: 80vh; overflow-y: auto;">
After:  <div class="modal-inner"> (with scoped CSS)
```

**Test:** in the Modal story (open), the element with class `modal-inner` is a `<div>`.
Its computed `max-width` is `480px`.

---

### AC-20 — Modal: header container

`Modal.svelte` template: the `<Inline as="header">` is replaced by
`<header class="modal-header">` containing an `<Inline gap="xs">`. The `<style>` block
contains `.modal-header` with `padding` and `border-bottom`. The inner Inline has no
`style=` prop and no `align-items` override.

```
Before: <Inline as="header" style="align-items: center; gap: var(--u); padding: var(--u2) var(--u3); border-bottom: 1px solid var(--rule);">
After:  <header class="modal-header"><Inline gap="xs"> … </Inline></header>
```

---

### AC-21 — Modal: title Text margin cleanup

`Modal.svelte` template: the modal title `<Text>` `style=` does not contain `margin: 0`.
The remaining style contains `font-size: var(--t-lede)`, `letter-spacing: 0.08em`, and
`flex: 1`.

```
Before: <Text variant="mono" as="h2" id="modal-title" style="font-size: var(--t-lede); letter-spacing: 0.08em; margin: 0; flex: 1;">
After:  <Text variant="mono" as="h2" id="modal-title" style="font-size: var(--t-lede); letter-spacing: 0.08em; flex: 1;">
```

---

### AC-22 — Modal: footer container

`Modal.svelte` template: the `<Spread as="footer">` is replaced by
`<footer class="modal-footer">` containing a `<Spread>`. The `<style>` block contains
`.modal-footer` with `padding` and `border-top`.

```
Before: <Spread as="footer" style="padding: var(--u2) var(--u3); border-top: 1px solid var(--rule);">
After:  <footer class="modal-footer"><Spread> … </Spread></footer>
```

**Test:** in the Modal story with footer (Confirm variant), a `<footer>` element with
class `modal-footer` is present in the DOM inside `.modal-inner`.

---

### AC-23 — Nav: inner bar container

`Nav.svelte` template: the `<Inline class="nav-inner">` is replaced by
`<div class="nav-inner">`. The `<style>` block contains `.nav-inner` with `display: flex`,
`align-items: center`, `padding`, `height`, `max-width`, and `margin`. No `style=` prop
exists on the element.

```
Before: <Inline class="nav-inner" gap="none" style="padding: 0 24px; height: 48px; max-width: 1200px; margin: 0 auto;">
After:  <div class="nav-inner"> … </div>
```

---

### AC-24 — Nav: brand link container

`Nav.svelte` template: the `<Inline as="a" ... class="nav-brand">` is replaced by a
native `<a class="nav-brand" href="/">` containing the `<Led>` and `<span class="nav-wordmark">`
directly (no Inline wrapper). The `<style>` block contains `.nav-brand` with `display: flex`,
`align-items: center`, `gap`, `flex-shrink`, `color`, `text-decoration`, `font-weight`,
`letter-spacing`, and `text-transform`. No `style=` prop exists on the `<a>` element.

```
Before: <Inline as="a" href="/" class="nav-brand" gap="xs" style="flex-shrink: 0; color: var(--ink); ...">
After:  <a class="nav-brand" href="/"><Led .../><span class="nav-wordmark">{siteName}</span></a>
```

---

### AC-25 — Nav: right group container

`Nav.svelte` template: the `<Inline class="nav-right">` is replaced by
`<div class="nav-right">`. The `<style>` block contains `.nav-right` with at minimum
`margin-left: auto`, `flex-shrink: 0`, and flex display properties. No `style=` prop
on the element.

```
Before: <Inline class="nav-right" gap="sm" style="margin-left: auto; flex-shrink: 0;">
After:  <div class="nav-right"> … </div>
```

---

### AC-26 — Nav: links list

`Nav.svelte` template: the `<Inline as="ul" class="nav-links">` is replaced by a native
`<ul class="nav-links">`. The `<style>` block contains `.nav-links` with `display: flex`,
`list-style: none`, `padding: 0`, `margin: 0`, `text-transform: uppercase`,
`font-size: 12px`, and `gap`. The existing `:global(.nav-links)` in the media query is
replaced by `.nav-links` (scoped, no `:global()` needed). No `style=` prop on the `<ul>`.

```
Before: <Inline as="ul" class="nav-links" gap="md" style="padding: 0; margin: 0; ...">
After:  <ul class="nav-links"> … </ul>
```

**Test:** in the Nav story, `getByRole('list')` (or `document.querySelector('.nav-links')`)
returns a `<ul>` element.

---

### AC-27 — Nav: drawer links list

`Nav.svelte` template: the `<Stack as="ul" class="nav-drawer-links">` is replaced by a
native `<ul class="nav-drawer-links">`. The `<style>` block contains `.nav-drawer-links`
with `display: flex`, `flex-direction: column`, `gap`, `list-style: none`, `padding: 0`,
`margin: 0`, and text formatting properties. No `style=` prop on the element.

```
Before: <Stack as="ul" class="nav-drawer-links" gap="sm" style="list-style: none; padding: 0; margin: 0; ...">
After:  <ul class="nav-drawer-links"> … </ul>
```

---

### AC-28 — No new :global() selectors

Running `grep -rn ':global(' src/lib/components/` after all changes returns a result set
with the same number of matches as before, or fewer. The `:global(.nav-links)` in
`Nav.svelte` is removed (replaced by a scoped rule), which reduces the count by one.
No new `:global()` is added anywhere.

---

### AC-29 — TypeScript clean

`pnpm check` reports zero TypeScript errors after all changes.

---

### AC-30 — Test suite passes

`pnpm test` (all Storybook play functions) passes with no regressions. The count of
passing tests is equal to or greater than the count before B24 was applied.

---

### AC-31 — Visual parity

The rendered output of each affected component in Storybook is visually identical to the
pre-B24 snapshot. Specifically:
- `SectionHead` heading is still visually h3-sized.
- `PageHero` heading is still visually hero-sized (clamp font).
- Modal inner panel still has the correct `max-width: 480px` constraint.
- Nav bar retains correct height (48px), padding, and max-width.
- Card body padding and layout are unchanged.

---

## Out of scope

- Introducing new Heading or Text variants to cover the card-title size (`var(--t-lede)` on
  a heading) — these remain as single-prop `style=` overrides.
- Changing the gap value in `SectionHead` from 6px to 8px — see Open questions.
- Any `style=` containing a single property anywhere in the codebase (below threshold).
- `StatCard.svelte` Stack style (`padding: 16px 20px; flex: 1;`) — these are two
  layout/spacing properties that are borderline; left unchanged by this spec to keep scope
  bounded. May be revisited in a future cleanup pass.
- Changes to story files, token files, or the `Heading`/`Text` primitive implementations.
- The `<Inline gap="sm" style="margin-top: 24px;">` in PageHero children slot — single prop.
- `Alert.svelte`, `KvList.svelte`, `ProgressBar.svelte`, `ActivityRow.svelte`, `Accordion.svelte`,
  `AccordionItem.svelte`, `Table.svelte`, `Toast.svelte`, `ToastRegion.svelte`, `Breadcrumb.svelte` —
  all confirmed clean or out of scope.

---

## Open questions

**OQ-1 (non-blocking).** `SectionHead` currently sets `gap: 6px` on the outer Stack.
The spec preserves this as `style="gap: 6px;"` on the inner Stack (single-prop, valid).
`gap="xs"` = 8px would be cleaner but is a visual change. The implementer should confirm
with the reviewer whether 6px was intentional or can safely round to 8px.

**OQ-2 (non-blocking).** `Modal.svelte` AC-19 — after removing the outer Stack, the
`modal-body` div relies on `flex: 1` to expand inside the flex column. The implementer
must verify that `.modal-inner { display: flex; flex-direction: column }` is present and
that `.modal-body { flex: 1 }` (already in the existing `<style>`) still applies
correctly to the new DOM structure. If the inner Stack is kept, it must also be
`display: flex; flex-direction: column` and the existing `.modal-body { flex: 1 }` must
target a direct child of the new `.modal-inner`.

**OQ-3 (non-blocking).** `Nav.svelte` AC-25 — the `nav-right` div replaces an Inline.
The Inline contained `<Inline class="nav-links">` and `<Inline class="nav-actions">`.
After both children are themselves native elements (per AC-26 and the unchanged nav-actions),
the `nav-right` div becomes a plain flex row. The implementer must ensure the `nav-actions`
Inline (which stays as-is) is correctly positioned inside the `nav-right` div.

None of these are blocking; implementation can proceed.
