# B53: ProportionBar component

## Context

`ProportionBar` ports the design-system `ProportionBar` into `@dxlbnl/ui`: a single
horizontal stacked **share bar** (part-to-whole breakdown) plus a legend. Each segment's
on-screen width is **computed** from its `value` relative to the sum of all values, so the
geometry is testable — this runs the **full** pipeline (test-writer → implementer →
reviewer), not the D42 visual-only track.

It is the data-viz sibling of `Gauge` (B52, [D58](../decisions.md#d58-b52--gauge-lives-in-patterns-uses-roleprogressbar-as-progressbars-radial-sibling)/[D59](../decisions.md#d59-b52--gauge-tests-pin-the-two-circles-via-data-parttrackdata-partarc)) and the linear
`ProgressBar` — both live in `patterns/`. This spec mirrors Gauge's geometry-testing
approach: a numeric example whose exact computed values are asserted, plus `data-part`
structural hooks for elements that have no accessible role.

References:
- Item card: [`wiki/backlog/doing/B53-proportion-bar.md`](../backlog/doing/B53-proportion-bar.md)
- Design refs (downstream React, reference ONLY — the Svelte library is canonical):
  `_design-refs/B53/ProportionBar.jsx`, `_design-refs/B53/preview-26-proportion-bar.html`
- Sibling implementations: `src/lib/components/patterns/Gauge.svelte`,
  `src/lib/components/patterns/ProgressBar.svelte`
- Constraints: [requirements.md](../requirements.md) (SSR-safe, WCAG 2.1 AA, strict TS),
  [architecture.md](../architecture.md) (authoring conventions), Standing Rules
  [D45](../decisions.md#d45-native-css-nesting-required----global-blocks-and-all-component-style-blocks) (native CSS nesting),
  [D52](../decisions.md#d52-b49--nav-dismiss-listeners-rely-on-effect-only-ssr-safety-not-a-browser-import) (SSR-safety).
- Home category + a11y-role decision logged in [decisions.md → D60](../decisions.md).

### API

```ts
interface Segment {
  /** Legend label. Rendered uppercase mono in --ink-faint. */
  label: string
  /** Share value. Negative values are clamped to 0 before any geometry. */
  value: number
  /** Any CSS colour / var token (caller-supplied). Applied inline as the rect fill and the swatch background. */
  color: string
  /** Optional per-segment value caption shown in the legend (e.g. "42%"). */
  valueLabel?: string
}

interface Props extends SVGAttributes<SVGSVGElement> {
  /** Ordered segments, laid left-to-right. */
  segments: Segment[]
  /** SVG height in px (the bar thickness). @default 14 */
  height?: number
  /** Accessible name for the whole bar. @default 'Proportion' */
  label?: string
}
```

- **No polymorphic `as` prop.** The root the consumer interacts with is a fixed
  `<svg>` (the bar); the legend is auxiliary markup. Polymorphism is N/A — mirrors
  `Gauge` ([D58](../decisions.md#d58-b52--gauge-lives-in-patterns-uses-roleprogressbar-as-progressbars-radial-sibling)).
- **`...rest` forwarding.** `Props extends SVGAttributes<SVGSVGElement>`; `...rest` is
  spread onto the root `<svg>` (the bar), so `data-testid`, `aria-hidden`, `class`, etc.
  land on the bar. The legend below is a fixed sibling and does not receive `...rest`.
- The component is **stateless** and **SSR-safe**: pure render, no `$effect`, no browser
  globals, no event handlers.

### Geometry (the testable core)

Mirrors `ProportionBar.jsx` exactly. Let `W = 1000` (fixed viewBox width).

```
clamped(v)  = Math.max(0, v)                       // negatives → 0
total       = sum(clamped(s.value) for s) || 1     // 0 total → fallback 1
w(i)        = (clamped(segments[i].value) / total) * W
gap         = 2                                     // inter-segment gap, px (viewBox units)
rectWidth(i)= Math.max(0, w(i) - (i < last ? gap : 0))   // last segment has no trailing gap
x(i)        = sum(w(j) for j < i)                  // running offset = cumulative UN-gapped widths
```

Note the running `x` offset accumulates the **un-gapped** `w(i)`, not `rectWidth(i)` — the
2px gap is carved out of each rect's right edge, not added to the layout. The last segment
carries no trailing gap so the bar reaches the full width.

## Acceptance criteria

The contract. Each is testable via a Storybook `play` function (imports from
`storybook/test`).

### Structure & root element

1. The component renders a root `<svg>` with `viewBox="0 0 1000 {height}"` and
   `preserveAspectRatio="none"`. With the default `height`, `viewBox="0 0 1000 14"`.
2. The root `<svg>` is followed by a sibling **legend** container (a `<ul>`); the
   component's outermost element is a wrapper (e.g. a `<div data-part="root">`) holding
   the `<svg>` then the `<ul>`. The `<svg>` and `<ul>` are both children of that wrapper.
3. The `<svg>` contains exactly one `<rect>` per segment, in source order, each carrying
   `data-part="segment"` (stable structural hook — rects have no accessible role).
4. Each `<rect>` has `x={x(i)}`, `y="0"`, `height={height}`, `width={rectWidth(i)}`, and
   `fill={segments[i].color}` (the caller-supplied colour, applied inline).

### Geometry — numeric contract

Use the canonical 4-segment example `42 / 28 / 18 / 12` (total = 100, default height 14).
Tests compute expected values from the formula above (no bare literals), but the spec
pins the exact results so the implementer and reviewer can verify by hand:

5. With `segments = [{value:42},{value:28},{value:18},{value:12}]`:
   - `total === 100`; `w = [420, 280, 180, 120]`.
   - rect `width` = `[418, 278, 178, 120]` (first three minus the 2px gap; last unchanged).
   - rect `x` = `[0, 420, 700, 880]` (cumulative un-gapped widths).
6. Each `<rect>`'s `height` attribute equals the `height` prop (default `14`); changing
   `height` to e.g. `24` sets `viewBox="0 0 1000 24"` and every rect `height="24"`.
7. **Negative values clamp to 0**: a segment with `value` < 0 contributes `0` to `total`
   and renders a rect with `width="0"`. Example `[{value:-5},{value:5}]` → `total === 5`,
   `w = [0, 1000]`, rect widths `[0, 1000]` (second is last → no gap), `x = [0, 0]`.
8. **Zero-total fallback**: when every clamped value is 0 (e.g. `[{value:0},{value:0}]`),
   `total` falls back to `1`, so every `w(i) = 0` and every rect `width = 0` — the bar is
   empty, no division-by-zero, no `NaN`. The component still renders the correct number of
   rects and a full legend.
9. A **2-segment** case `[{value:75},{value:25}]` → `total === 100`, `w = [750, 250]`,
   rect widths `[748, 250]` (first minus gap; second is last), `x = [0, 750]`.

### Legend

10. The legend is a `<ul>` with exactly one `<li>` per segment, in source order. Each
    `<li>` contains, in order: a colour **swatch** (`<span data-part="swatch">`) and a
    **label** (`<span data-part="legend-label">{segments[i].label}`).
11. The swatch's inline background is the segment's `color` (`background: {color}` or
    equivalent inline style applying the caller colour).
12. The label text equals `segments[i].label`, is rendered **uppercase**
    (`text-transform: uppercase`), in the **mono** font family (`var(--mono)`), in colour
    `var(--ink-faint)`.
13. When `segments[i].valueLabel` is set, the `<li>` also renders a
    `<span data-part="value-label">{valueLabel}` after the label; when it is absent, no
    `[data-part="value-label"]` element exists in that `<li>`. (Assert both: the 4-segment
    example supplies `valueLabel`s like `"42%"`; a no-valueLabel case omits them.)

### Visual / token contract

14. The `<svg>` bar has a `1px solid var(--rule)` border and `background: var(--bg-sunken)`
    (scoped CSS; the bar is a fixed `<svg>` so its border/background come from the
    component `<style>` block, not inline). `display: block; width: 100%`.
15. All component-owned colours/spacing use design tokens (`--rule`, `--bg-sunken`,
    `--mono`, `--ink-faint`, spacing vars) via scoped CSS. The **only** inline styling is
    the per-segment caller `color` — applied as the rect `fill` attribute and the swatch
    `background` — because it is caller-supplied and cannot be a token-named class.
16. CSS uses native nesting per [D45](../decisions.md#d45-native-css-nesting-required----global-blocks-and-all-component-style-blocks);
    no flat `.host :global(child)` selectors.

### Accessibility

17. The root `<svg>` has `role="img"` and `aria-label={label ?? 'Proportion'}`, so the
    whole chart is announced as a single named image rather than as a confusing pile of
    anonymous rects. (Justification in [D60](../decisions.md); a stacked share bar is a
    pictorial summary, not interactive progress like `ProgressBar`/`Gauge`, so `img` is
    the correct role.)
18. The legend `<ul>` provides the per-segment text (label + optional valueLabel) as
    real, readable DOM content — it is the accessible breakdown that complements the
    `aria-label` summary. The legend is NOT `aria-hidden`.
19. **Decorative fallback**: a consumer may pass `aria-hidden="true"` via `...rest`; it
    forwards onto the root `<svg>`, removing the bar from the accessibility tree. (The
    legend remains in the tree as ordinary text.) Assert the `<svg>` is absent from the
    a11y tree (`queryByRole('img')` is null) when `aria-hidden="true"` is passed, and that
    `...rest` (e.g. `data-testid`) lands on the `<svg>`.
20. No a11y-addon violations on any story (WCAG 2.1 AA).

## Story plan

`ProportionBar.stories.svelte`, `title: 'Patterns/ProportionBar'`, `component: ProportionBar`,
`tags: ['autodocs']`. Imports `expect`, `within` from `storybook/test`. Geometry helpers
mirror the formula (computed, never hard-coded), e.g.:

```ts
const clampV = (v: number) => Math.max(0, v)
const total = (vals: number[]) => vals.reduce((s, v) => s + clampV(v), 0) || 1
const widths = (vals: number[]) => {
  const t = total(vals)
  return vals.map((v) => (clampV(v) / t) * 1000)
}
const rectWidth = (vals: number[], i: number) => {
  const w = widths(vals)
  return Math.max(0, w[i] - (i < vals.length - 1 ? 2 : 0))
}
const offsetX = (vals: number[], i: number) =>
  widths(vals).slice(0, i).reduce((s, w) => s + w, 0)
```

Rect colour/fill assertions read the `fill` attribute directly (caller passes raw token
strings like `"var(--amber)"`); where a story needs to assert the *computed* swatch
background resolves to a token, use `resolveTokenColor` from `$lib/storybook-utils.js`
(background channel). For uppercase/mono/`--ink-faint` label assertions use
`getComputedStyle` + `resolveTokenFgColor` (foreground channel), per
[D37](../decisions.md#d37-b31-test-writer--resolvetokenfgcolor-for-textborder-assertions-vs-resolvetokencolor-for-background-assertions).

1. **Four Segments (42/28/18/12)** — the canonical example, `valueLabel`s supplied.
   - root `<svg>` has `role="img"`, `viewBox="0 0 1000 14"`, `preserveAspectRatio="none"`.
   - exactly 4 `[data-part="segment"]` rects; assert each `x`, `width`, `height`, `fill`
     against the helper (expected `width = [418,278,178,120]`, `x = [0,420,700,880]`).
   - legend `<ul>` has 4 `<li>`; assert each label text + uppercase + mono + `--ink-faint`,
     and each `[data-part="value-label"]` text (`"42%"…"12%"`).
   - assert the `<svg>` border colour resolves to `--rule` and background to `--bg-sunken`.
2. **Two Segments (75/25)** — `total === 100`, rect widths `[748, 250]`, `x = [0, 750]`;
   2 rects, 2 legend `<li>`.
3. **Zero Total** — `[{value:0},{value:0}]`: 2 rects both `width="0"`, no `NaN`; legend
   still renders 2 `<li>`. Asserts the `|| 1` fallback (no division-by-zero).
4. **Negative Clamp** — `[{value:-5},{value:5}]`: rect widths `[0, 1000]`, `x = [0, 0]`;
   proves negative values contribute 0 to `total` and render a zero-width rect.
5. **Custom Height** — `height: 24`: `viewBox="0 0 1000 24"`, every rect `height="24"`.
6. **No Value Labels** — segments without `valueLabel`: no `[data-part="value-label"]`
   element in any `<li>`; labels still present.
7. **Labelled** — `label: "Power budget"`: `getByRole('img', { name: 'Power budget' })`.
8. **Decorative** — `aria-hidden: true` + `data-testid` via `...rest`:
   `queryByRole('img')` is null; the `<svg>` carries `aria-hidden="true"` and the
   forwarded `data-testid`. (Mirrors Gauge Story 11.)

Story count: **8**. AC count: **20**.

## Out of scope

- **Animated transitions** on segment width changes (no `transition` requirement; the bar
  is static per render).
- **Interactive segments** (hover tooltips, click-to-select, focusable rects). The bar is
  a non-interactive `role="img"` summary.
- **Auto-generated `valueLabel`s** (e.g. computing `"42%"` from the value). The caller
  supplies `valueLabel` verbatim — the component never formats numbers.
- **Per-segment colour token validation / palette mapping.** The caller supplies any CSS
  colour/var; the component applies it as-is (matching the reference contract).
- **Vertical orientation, stacked/grouped variants, min-segment-width flooring.**
- **A polymorphic `as` prop** (root is intrinsically an `<svg>`).

## Open questions

None blocking. Resolved during writing:

- *Root a11y role* — chose `role="img"` + summarizing `aria-label`, with the legend
  carrying the readable per-segment breakdown. Rationale: a stacked share bar is a
  pictorial summary, unlike `ProgressBar`/`Gauge` which represent progress toward
  completion and use `role="progressbar"`. Logged as [D60](../decisions.md).
- *`...rest` target* — forwards onto the root `<svg>` (the bar), consistent with Gauge,
  enabling the `aria-hidden` decorative fallback. Logged in [D60](../decisions.md).
