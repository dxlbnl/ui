# B54: CompareBars component

## Context

Port the design-system `CompareBars` component into `@dxlbnl/ui` — a small multi-bar
chart that stacks target-vs-actual rows for a handful of labelled values (e.g. a budget:
spent vs budgeted per category). Each row shows a track containing a "ghost" target fill
under an actual fill; the actual fill (and its value caption) turn `--danger` when the
value exceeds its target, else `--ok`.

This is the third data-viz sibling after `Gauge` (D58) and `ProportionBar` (D60), and it
follows their template: its bar widths are **computed geometry**
(percentages derived from `value`/`target`/`max`), so per the precedent it runs the
**full pipeline** (test-writer → implementer → reviewer with play-function assertions),
NOT the D42 visual-only track. It pins internal structure with `data-part` hooks
(D55/D59/D60) and asserts computed widths as exact inline `style.width` percentage
strings.

> **Amended 2026-06-14 (D72):** `CompareBars` moved from `patterns/` to `feedback/`
> alongside `Gauge` ([D71](../decisions.md#d71-gauge-moves-to-feedback-story-lightening-pass-progressbar-stays-in-patterns)) and `ProportionBar`; story `title` is now
> `Feedback/CompareBars`. Stories were consolidated to **3** (Budget / Edges & clamping /
> Labelled section); all ACs remain covered.

- Item card: `wiki/backlog/doing/B54-compare-bars.md`
- Vision / requirements / architecture: `wiki/vision.md`, `wiki/requirements.md` (R8
  pattern components, WCAG 2.1 AA, SSR-safe), `wiki/architecture.md`
- Decisions: D45 (native CSS nesting), D42 (visual-only track — this item is exempt; it
  has computed geometry), D58/D59 (Gauge), D60 (ProportionBar — the closest sibling)
- Design reference (read-only; the Svelte library is canonical):
  `wiki/specs/_design-refs/B54/preview-27-compare-bars.html`,
  `wiki/specs/_design-refs/B54/CompareBars.jsx`
- Siblings mirrored (all now under `feedback/`, see D71/D72):
  `src/lib/components/feedback/ProportionBar.svelte` (+ stories),
  `src/lib/components/feedback/Gauge.svelte`

## API

```ts
interface CompareRow {
  /** Row label. Rendered uppercase mono, --ink-dim, ellipsis-truncated. */
  label: string
  /** Actual value. Drives the actual-fill width and the over-target comparison. */
  value: number
  /** Target value. Drives the ghost target-fill width. */
  target: number
  /** Optional caption shown at the row's right edge (e.g. "€240 / 320"). */
  valueLabel?: string
}

interface Props extends HTMLAttributes<HTMLElement> {
  /** Ordered rows, stacked top-to-bottom. */
  rows: CompareRow[]
  /** Accessible name for the whole chart. @default 'Comparison' */
  label?: string
  /** Polymorphic root element. @default 'div' */
  as?: string
}
```

- The root is a non-SVG block element, so a polymorphic `as` prop **is** offered (default
  `'div'`), unlike Gauge/ProportionBar (which are intrinsically SVG). `...rest` (and
  `class`) forward onto the root element per D4/D20.
- Stateless and SSR-safe: no `$state`, no `$effect`, no browser globals in the render path.
- The component does **not** format `valueLabel` — the consumer supplies the caption text
  verbatim (mirrors ProportionBar's `valueLabel`).

## Geometry (the contract)

For a `rows` array, with each row `r = { value, target }`:

```
max         = Math.max(1, ...rows.map(r => r.target), ...rows.map(r => r.value))
over(r)     = r.value > r.target                       // strict greater-than
targetW(r)  = (r.target / max) * 100                   // ghost fill width %, unclamped
actualW(r)  = Math.min(100, (r.value / max) * 100)     // actual fill width %, clamped to 100
```

- `max` is seeded with `1` (`Math.max(1, …)`) so an all-zero / empty input never divides
  by zero. With `rows = []`, `max === 1` and no rows render.
- `targetW` is **not** clamped — but because `max ≥ every target`, `targetW ≤ 100`
  always (it equals `100` only for the row(s) holding the maximum target).
- `actualW` **is** clamped to `100`: when a row's `value` is the global max,
  `(value/max)*100 === 100`; the clamp is the defensive guard the reference applies
  (`Math.min(100, sw)`).
- The widths are applied as inline `style="width: <n>%"` strings (the **only** dynamic
  inline values in the component). Tests assert the exact percentage string the formula
  produces — they must compute it from the formula above, never hard-code a literal that
  the formula does not yield.

### Canonical numeric example (the 4-row budget)

`rows`:

| label     | value | target | valueLabel  |
|-----------|-------|--------|-------------|
| Groceries | 240   | 320    | €240 / 320  |
| Transport | 95    | 120    | €95 / 120   |
| Dining    | 180   | 140    | €180 / 140  |
| Utilities | 88    | 90     | €88 / 90    |

`max = Math.max(1, 320,120,140,90, 240,95,180,88) = 320`.

| row       | over  | targetW = (target/320)*100 | actualW = min(100,(value/320)*100) | actual fill | valueLabel colour |
|-----------|-------|----------------------------|------------------------------------|-------------|-------------------|
| Groceries | false | `100%`                     | `75%`                              | `--ok`      | `--ink-faint`     |
| Transport | false | `37.5%`                    | `29.6875%`                         | `--ok`      | `--ink-faint`     |
| Dining    | true  | `43.75%`                   | `56.25%`                           | `--danger`  | `--danger`        |
| Utilities | false | `28.125%`                  | `27.5%`                            | `--ok`      | `--ink-faint`     |

(`240/320*100 = 75`; `95/320*100 = 29.6875`; `320/320*100 = 100`; `180/320*100 = 56.25`;
`140/320*100 = 43.75`; `88/320*100 = 27.5`; `90/320*100 = 28.125`. The over-target row
"Dining" has `actualW (56.25) > targetW (43.75)`, i.e. the actual fill visibly overruns
the ghost target.)

## Structure & data-part hooks

The implementer MUST render this structure with these stable `data-part` hooks (inert
test/structure handles, not styling selectors — per D55/D59/D60):

```
root            [data-part="root"]  — the polymorphic element (`as`, default <div>)
  per row:
  row           [data-part="row"]   — grid container, one per row, in source order
    label       [data-part="label"] — <span>, the uppercase mono label
    track       [data-part="track"] — <div position:relative>
      target    [data-part="target-fill"] — ghost fill (under)
      actual    [data-part="actual-fill"] — actual fill (over)
    value       [data-part="value-label"] — <span>, only when valueLabel is set
```

## Acceptance criteria

Geometry & colour logic:

1. **`max`** equals `Math.max(1, ...targets, ...values)` across all rows. For the
   canonical 4-row example, `max === 320`. For `rows = [{label:'A',value:0,target:0}]`,
   `max === 1`.
2. **One row per entry.** Exactly one `[data-part="row"]` element renders per `rows`
   entry, in source order. For `rows = []`, zero `[data-part="row"]` elements render.
3. **Target (ghost) fill width.** Each row's `[data-part="target-fill"]` has inline
   `style` width `` `${(target/max)*100}%` ``. For the canonical example the four target
   fills have width `100%`, `37.5%`, `43.75%`, `28.125%` respectively.
4. **Actual fill width.** Each row's `[data-part="actual-fill"]` has inline `style` width
   `` `${Math.min(100,(value/max)*100)}%` ``. For the canonical example the four actual
   fills have width `75%`, `29.6875%`, `56.25%`, `27.5%` respectively.
5. **Actual fill clamps at 100%.** For a row whose `value` is the global maximum (e.g.
   `rows = [{label:'Max',value:500,target:200}]` → `max=500`), the actual fill width is
   exactly `100%` and the target fill width is `40%`. For a contrived `value > max`
   input that cannot occur naturally (max already includes value), the `Math.min(100, …)`
   guard still caps the width string at `100%`.
6. **Over-target drives the actual fill colour.** When `over(r)` (`value > target`) the
   `[data-part="actual-fill"]` computed `background-color` resolves to `--danger`; when
   not over (`value <= target`, including `value === target`), it resolves to `--ok`. In
   the canonical example only the "Dining" row's actual fill is `--danger`; the other
   three are `--ok`.
7. **Over-target drives the valueLabel colour.** When `over(r)` the
   `[data-part="value-label"]` computed `color` resolves to `--danger`; otherwise it
   resolves to `--ink-faint`. In the canonical example only "Dining" is `--danger`; the
   others are `--ink-faint`.
8. **`value === target` is NOT over.** A row with `value === target` (e.g.
   `{label:'Even',value:90,target:90}`) renders an `--ok` actual fill and an
   `--ink-faint` valueLabel (strict `>` comparison).

Structure & visual:

9. **Track box.** Each `[data-part="track"]` has `position: relative`, computed
   `background-color` resolving to `--bg-sunken`, a `1px` border whose colour resolves to
   `--rule`, and a height of `16px`.
10. **Ghost target fill styling.** Each `[data-part="target-fill"]` is absolutely
    positioned (top/left 0, height 100% of the track), has computed `background-color`
    resolving to `--bg-elev`, and a right border whose colour resolves to
    `--rule-strong`.
11. **Actual fill positioning.** Each `[data-part="actual-fill"]` is absolutely
    positioned (top/left 0, height 100% of the track) and stacks above the ghost target
    fill (the actual fill follows the target fill in source order within the track).
12. **Row grid columns.** Each `[data-part="row"]` has computed
    `grid-template-columns` corresponding to `110px 1fr auto` (label | track | value),
    `display: grid`, and `align-items: center`.
13. **Label styling.** Each `[data-part="label"]` is uppercase (`text-transform:
    uppercase`), mono (`font-family` contains `JetBrains Mono`), colour resolves to
    `--ink-dim`, and ellipsis-truncates (`overflow: hidden`, `text-overflow: ellipsis`,
    `white-space: nowrap`). Its text content equals the row's `label`.
14. **valueLabel rendering.** When a row has a `valueLabel`, a `[data-part="value-label"]`
    span renders with that exact text, mono font, and `white-space: nowrap`. When a row
    omits `valueLabel`, no `[data-part="value-label"]` element renders for that row.

Accessibility:

15. **Per-row accessible image.** Each `[data-part="row"]` carries `role="img"` and an
    `aria-label` that states the label, the actual and target numbers, and the over/under
    state as text — format: `` `${label}: ${value} of ${target}, ${over ? 'over target' :
    'within target'}` `` (e.g. `"Dining: 180 of 140, over target"`,
    `"Groceries: 240 of 320, within target"`). This is queryable with
    `getByRole('img', { name })`. (Rationale + WCAG 1.4.1 in Open questions / decision.)
16. **Chart accessible name.** The root carries `role="group"` and
    `aria-label={label ?? 'Comparison'}`. With no `label` prop the accessible name is
    `'Comparison'`; with `label="Monthly budget"` it is `'Monthly budget'`. Queryable via
    `getByRole('group', { name })`.
17. **Over/under state is not conveyed by colour alone.** The over/target distinction is
    available as text in two non-colour channels: the per-row `aria-label` (AC 15) and —
    when supplied — the visible `valueLabel` caption text (the consumer's `€180 / 140`
    style string carries both numbers). The component therefore satisfies WCAG 1.4.1 (Use
    of Colour): the `--danger`/`--ok` and `--danger`/`--ink-faint` colour shifts are
    redundant reinforcement, not the sole indicator.

Authoring:

18. **`...rest` / `as` forwarding.** Native attributes spread onto the root element (e.g.
    `data-testid` is present on the root). `as="section"` renders the root as a
    `<section>` while preserving `role="group"`, the `aria-label`, and all row content.
19. **CSS contract.** All styling is component-scoped CSS using native nesting (D45) and
    `var(--token)` custom properties only. The single dynamic inline values are the
    computed `width: <n>%` strings on the two fill elements (AC 3, AC 4); no other inline
    style is used. No flat `.host :global(child)` selectors.

## Story plan (test-first, `storybook/test`)

`CompareBars.stories.svelte`, title `Feedback/CompareBars` (was `Patterns/…`, see D72),
`component: CompareBars`,
`tags: ['autodocs']`. Imports `expect`, `within` from `storybook/test` (NEVER `vitest` —
bug B61) and `resolveTokenColor` / `resolveTokenFgColor` from `$lib/storybook-utils.js`.
Width assertions compute the expected percentage from the geometry formula in a local
helper (mirroring `ProportionBar.stories.svelte`), never a bare literal. Use
`resolveTokenColor` for `background-color`/`border-color` assertions and
`resolveTokenFgColor` for `color` (text) assertions per D37.

1. **Budget (canonical 4 rows)** — the table above. Asserts: `max=320`; four
   `[data-part="row"]` in order (AC 2); each target-fill `style.width` ===
   `100/37.5/43.75/28.125 %` (AC 3); each actual-fill `style.width` ===
   `75/29.6875/56.25/27.5 %` (AC 4); the "Dining" actual fill `background-color` resolves
   to `--danger` and its valueLabel `color` to `--danger`, the other three actual fills
   `--ok` and valueLabels `--ink-faint` (AC 6, AC 7); track box `--bg-sunken` / `--rule`
   / 16px (AC 9); ghost fill `--bg-elev` + right border `--rule-strong` (AC 10); grid
   columns + align (AC 12); label uppercase/mono/`--ink-dim`/ellipsis + text (AC 13);
   valueLabel text present (AC 14); per-row `role="img"` names incl. "over target" /
   "within target" (AC 15).
2. **Single over-target row** — `[{label:'Dining',value:180,target:140,valueLabel:'180/140'}]`.
   `max=180`; actual-fill width `100%`, target-fill width `` `${140/180*100}%` ``; actual
   fill `--danger`, valueLabel `--danger`; `role="img"` name "Dining: 180 of 140, over
   target" (AC 4, 5, 6, 7, 15).
3. **Value clamps at 100%** — `[{label:'Max',value:500,target:200}]`. `max=500`;
   actual-fill width exactly `100%`, target-fill width `40%`; actual fill `--ok`
   (`500 > 200`? yes → actually over). NOTE: choose inputs deliberately —
   `value:500,target:200` is over-target, so to test the clamp on an `--ok` row use
   `[{label:'Max',value:200,target:500}]` → `max=500`, actual `40%` ok; and a separate
   over-target max-holder `[{label:'Top',value:500,target:200}]` → actual `100%` danger.
   Assert the clamp produces the exact `100%` string and no value over 100 (AC 5).
4. **value === target (boundary)** — `[{label:'Even',value:90,target:90}]`. `max=90`;
   both fills `100%`; actual fill `--ok`, valueLabel (if present) `--ink-faint`; `role`
   name "...within target" (AC 8, 15).
5. **Empty / edge** — `rows: []`. Zero `[data-part="row"]` elements; root still present
   as `role="group"` with the default `'Comparison'` name; no throw / no `NaN` in any
   width string (AC 2, AC 16, AC 1's `max=1` guard exercised indirectly).
6. **Labelled + polymorphic** — `label="Monthly budget"`, `as="section"`, plus a
   `data-testid`. Asserts root `role="group"` name "Monthly budget" (AC 16), root
   `tagName === 'SECTION'` and `data-testid` present (AC 18).

(Stories 1, 2, 4 also assert per-row `role="img"` aria-label text, covering AC 15/AC 17's
non-colour channel. A "No valueLabel" assertion — AC 14's absence branch — is folded into
Story 3 or 4 by passing rows without `valueLabel` and asserting no `[data-part="value-label"]`.)

## Out of scope

- Tooltips, hover/focus interactivity on rows.
- Width transition/animation (the reference's `transition: width .35s ease` is cosmetic;
  the implementer may include the scoped transition rule but no AC asserts it).
- Auto-formatting of `valueLabel` (e.g. currency/percent) — the consumer supplies the
  string verbatim.
- A compound `CompareBars.Row` sub-component API.
- Negative-value clamping semantics beyond what `Math.max(1, …)` already guards (rows are
  assumed non-negative budgets; a negative `value`/`target` would still compute a width
  string, but defining its visual meaning is out of scope).
- Horizontal/vertical orientation switch.

## Open questions

None blocking.

- The a11y model (per-row `role="img"` + summarizing `aria-label`, outer `role="group"`)
  is resolved and logged to `decisions.md` Archive as the home-category + accessibility
  decision. Rationale: a multi-row comparison chart is a set of pictorial summaries rather
  than progress toward completion (so not `progressbar`, unlike Gauge/ProgressBar) and not
  a single share image (unlike ProportionBar's single `role="img"`); each row is its own
  small image whose label/value/target/over-state is exposed as text in the `aria-label`,
  which also satisfies WCAG 1.4.1 (over/under is not colour-only). If a future review
  prefers a list semantics (`role="list"` / `role="listitem"`) this can change without an
  API break.
