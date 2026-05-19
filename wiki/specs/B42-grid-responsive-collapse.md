# B42: Grid responsive collapse

## Context

`<Grid>` currently applies `grid-template-columns` as an inline `style` attribute.
Inline styles cannot be overridden by CSS `@container` rules without `!important`.
As a result, a `<Grid cols={2}>` or `cols={3|4}` holds its column count at every
viewport/container width, producing unreadable narrow columns on phones and in
sidebar contexts.

`<Container>` already sets `container-type: inline-size` on its root element, so
container queries fired from inside `<Grid>` correctly track the parent container
width — exactly the mechanism the production `/about/` page relies on.

This item moves the column value off the inline `style` attribute into a CSS custom
property (`--grid-cols`) that scoped `@container` rules can override, and exposes the
numeric `cols` value as a `data-cols` attribute so per-count breakpoint rules can
target it.

Related pages: [architecture.md](../architecture.md), [requirements.md](../requirements.md),
[decisions.md](../decisions.md) (D5, D45), item card
[B42](../backlog/doing/B42-grid-responsive-collapse.md).

---

## Acceptance criteria

### Source changes

**AC-1 — `data-cols` attribute**
`Grid.svelte` renders `data-cols={cols}` on the root element. For `cols={2}` the
rendered HTML attribute is `data-cols="2"`; for `cols="auto"` it is `data-cols="auto"`.
The existing `Five-Column` story is not affected — `GridCols` remains `1|2|3|4|'auto'`.

**AC-2 — CSS custom property for column template**
`Grid.svelte` emits `--grid-cols: {colsTemplate}` (not `grid-template-columns: …`) in
the `style=` attribute. The `<style>` block's `.grid-layout` rule reads
`grid-template-columns: var(--grid-cols)`. Gap is unchanged: `--grid-gap: {gapMap[gap]}`.

**AC-3 — Native CSS nesting (D45)**
All `@container` rules in `Grid.svelte`'s `<style>` block use native CSS nesting.
No flat `.grid-layout :global(…)` selectors. The two breakpoint blocks are nested
inside `.grid-layout` (or written as sibling `@container` blocks that include
`.grid-layout[data-cols]` selectors — either form is acceptable as long as no
`:global()` escape is used).

**AC-4 — Tablet breakpoint: 3 and 4 cols collapse to 2**
When the containing element's inline size is ≤ 900 px:
- `data-cols="3"` grid: `grid-template-columns` resolves to `repeat(2, 1fr)`.
- `data-cols="4"` grid: `grid-template-columns` resolves to `repeat(2, 1fr)`.
- `data-cols="1"` and `data-cols="2"` grids: column count is unchanged.

**AC-5 — Mobile breakpoint: 2, 3, and 4 cols collapse to 1**
When the containing element's inline size is ≤ 720 px:
- `data-cols="2"`, `data-cols="3"`, `data-cols="4"` grids: `grid-template-columns`
  resolves to `1fr`.
- `data-cols="1"` grid: unchanged (`1fr`).

**AC-6 — `cols="auto"` is unaffected by breakpoint rules**
No `@container` rule targets `data-cols="auto"`. The `auto-fill minmax(…)` column
template is in effect at all container widths.

**AC-7 — `cols={1}` is unaffected by breakpoint rules**
No `@container` rule targets `data-cols="1"`. The column template stays `1fr`
regardless of container width.

---

### Story updates (existing stories)

The existing play functions check `root.style.gridTemplateColumns` which will now be
empty (value moved to `--grid-cols`). Each must be updated to check the computed CSS
custom property instead, and to assert the new `data-cols` attribute.

**AC-8 — Three Column story updated**
`Three Column` play function:
- asserts `root.dataset.cols === '3'` (or `getAttribute('data-cols') === '3'`).
- asserts `getComputedStyle(root).getPropertyValue('--grid-cols').trim()` contains
  `'repeat(3, 1fr)'` (or equivalent string for 3 columns).
- asserts `root.style.gridTemplateColumns` is empty (`''`).
- existing gap assertion (`16px`) is unchanged.

**AC-9 — Two Column story updated**
`Two Column` play function:
- asserts `root.dataset.cols === '2'`.
- asserts `--grid-cols` custom property contains `'repeat(2, 1fr)'`.
- asserts `root.style.gridTemplateColumns` is `''`.
- existing gap assertion (`32px`) is unchanged.

**AC-10 — Four Column story updated**
`Four Column` play function:
- asserts `root.dataset.cols === '4'`.
- asserts `--grid-cols` custom property contains `'repeat(4, 1fr)'`.
- asserts `root.style.gridTemplateColumns` is `''`.

**AC-11 — Single Column story updated**
`Single Column` play function:
- asserts `root.dataset.cols === '1'`.
- asserts `--grid-cols` custom property is `'1fr'`.
- asserts `root.style.gridTemplateColumns` is `''`.

**AC-12 — Auto Fill story updated**
`Auto Fill` play function:
- asserts `root.dataset.cols === 'auto'`.
- asserts `--grid-cols` custom property contains `'auto-fill'` and `'160px'`.
- asserts `root.style.gridTemplateColumns` is `''`.

---

### New stories — collapse behaviour

Container-query testing requires the grid to be wrapped in an element with
`container-type: inline-size`. Use `<Container>` as the wrapper in these stories.
Force the container to a specific width using an inline style on the `<Container>`
element (e.g. `style="width: 680px; max-width: 100%;"`) so the test is
viewport-independent and reproducible in Vitest browser mode.

**AC-13 — "Tablet Collapse — 3 cols" story**
A new story renders `<Grid cols={3}>` inside `<Container style="width: 680px;">`.
Play function:
- asserts `root.dataset.cols === '3'`.
- asserts `getComputedStyle(root).gridTemplateColumns` resolves to two equal
  columns (matches `/^(\S+)\s+\1$/` or `'50% 50%'` or the browser-resolved
  equivalent of `repeat(2, 1fr)`).

At 680 px the container is below 720 px so the 720 px rule fires (1 column). Use
width `820px` to land in the 720–900 px range where only the tablet rule fires
(result: 2 columns).

> Note: The story width to exercise the 900 px → 2-column rule for cols=3/4 must
> be in the 721–900 px window. Use `width: 820px`.

Story name: `"Tablet Collapse — 3 cols"`. Container width: `820px`.
Play function asserts `gridTemplateColumns` resolves to 2 equal columns.

**AC-14 — "Tablet Collapse — 4 cols" story**
Same as AC-13 but `cols={4}` and container width `820px`.
Play function asserts `gridTemplateColumns` resolves to 2 equal columns.

**AC-15 — "Mobile Collapse — 2 cols" story**
`<Grid cols={2}>` inside `<Container style="width: 680px;">`.
Play function asserts `gridTemplateColumns` resolves to a single column (`'1fr'` or
the resolved width of the container, e.g. `'680px'`).

**AC-16 — "Mobile Collapse — 3 cols" story**
`<Grid cols={3}>` inside `<Container style="width: 680px;">`.
Play function asserts `gridTemplateColumns` resolves to a single column.

**AC-17 — "Mobile Collapse — 4 cols" story**
`<Grid cols={4}>` inside `<Container style="width: 680px;">`.
Play function asserts `gridTemplateColumns` resolves to a single column.

**AC-18 — No-collapse cases remain stable**
Two stories verify that cols without a collapse rule are unaffected at 680 px:
- `"No Collapse — 1 col"`: `<Grid cols={1}>` inside `<Container style="width: 680px;">`.
  `gridTemplateColumns` remains a single column.
- `"No Collapse — auto"`: `<Grid cols="auto" minColWidth="120px">` inside
  `<Container style="width: 680px;">`. `gridTemplateColumns` does **not** resolve to a
  single hard `1fr` value driven by a `@container` rule; it resolves via `auto-fill`
  (may be `'120px'` repeated or similar — assert that `data-cols === 'auto'` and that
  `--grid-cols` still contains `'auto-fill'`).

---

### Story placement

New collapse stories live in `Grid.stories.svelte` (the existing file). They use a
**composition-in-slot pattern**: `<Container>` and `<Grid>` are both instantiated in
the story slot with no `component:` interaction — the stories use their own explicit
`<Grid>` and `<Container>` markup inside the slot, outside the `defineMeta component:
Grid` wrapping. To avoid double-render for these stories, place them in a sibling file
`Grid.collapse.stories.svelte` with no `component:` set in `defineMeta`.

---

## Out of scope

- Asymmetric grids (`60px 1fr`, `160px 1fr auto auto`, etc.) — separate primitives.
- `cols={5}` or any value beyond `1|2|3|4|'auto'` — `GridCols` type is not extended
  in this item.
- Footer-style 5→2 intermediate collapse — see item card edge cases.
- Consumer-facing `@container` override examples or documentation.
- Any change to `Container.svelte` — it already sets `container-type: inline-size`.

---

## Open questions

None blocking. The implementation path is fully specified by the item card.
