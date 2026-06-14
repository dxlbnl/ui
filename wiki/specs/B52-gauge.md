# B52: Gauge component

## Context

`Gauge` is the **radial sibling** of the existing linear
[`ProgressBar`](../../src/lib/components/patterns/ProgressBar.svelte): an SVG dial that
renders a single value (`pct`, 0–100) as an arc around a circular track. It satisfies the
"Progress bar" family in [requirements.md](../requirements.md) R8 and lives in the
`patterns/` category alongside `ProgressBar`.

Source item card: [B52-gauge.md](../backlog/doing/B52-gauge.md).
Design reference (React, reference only — the Svelte library is canonical):
[`Gauge.jsx`](_design-refs/B52/Gauge.jsx),
[`preview-25-gauge.html`](_design-refs/B52/preview-25-gauge.html).

Constraints from [architecture.md](../architecture.md) and
[decisions.md](../decisions.md) Standing Rules: Svelte 5 runes, strict TS, `...rest`
forwarding (D4), tokens-only colours, native CSS nesting (D45), SSR-safety (D52), WCAG
2.1 AA.

**This is NOT a visual-only item.** Per D42, components whose only output is visual styling
skip play-function assertions. `Gauge`, however, has real **computed geometry** — radius,
circumference, and `stroke-dasharray` are derived numerically from `pct`, `size`, and
`width`. That geometry is deterministic and testable, so B52 runs the full
`test-writer → implementer → reviewer` pipeline with play-function assertions on the SVG
attributes.

## Geometry (the computed contract)

For props `pct`, `size`, `width` the component computes:

```
r = (size - width - 3) / 2          // radius, leaves a 3px inset so the stroke fits
c = 2 * Math.PI * r                 // circumference
p = Math.max(0, Math.min(100, pct)) // clamped percentage
dash = (p / 100) * c                // arc length
stroke-dasharray = `${dash} ${c}`   // progress arc, then full-circumference gap
```

Both circles share `cx = cy = size / 2`, `r`, `fill="none"`, `stroke-width = width`. The
`<svg>` is rotated `-90deg` so the arc starts at the top (12 o'clock) and fills clockwise.

Worked example for the test-writer (`size = 56`, `width = 4`, default geometry used by the
reference cells):
`r = (56 - 4 - 3) / 2 = 24.5`; `c = 2π·24.5 ≈ 153.93804`. Tests should compute expected
values with the same `2 * Math.PI * r` expression (not a hard-coded literal) and assert
the rendered `stroke-dasharray` string matches `` `${(p/100)*c} ${c}` ``.

## API

Root element is a fixed `<svg>`. There is **no polymorphic `as` prop** — a gauge is
intrinsically an SVG, so polymorphism is N/A (state this in the component JSDoc). `...rest`
is forwarded onto the root `<svg>` element so consumers can pass `class`, `style`,
`data-*`, `aria-*`, etc.

| Prop     | Type      | Default              | Notes |
|----------|-----------|----------------------|-------|
| `pct`    | `number`  | required             | Value 0–100. Clamped to that range; values <0 → 0, >100 → 100. |
| `size`   | `number`  | `42`                 | SVG width/height in px. |
| `tone`   | `string`  | `'amber'`            | Token name for the progress arc colour. Rendered as `stroke="var(--{tone})"`. Expected values: `ok`, `amber`, `cyan`, `danger` (any token name is accepted — not a closed union, mirroring the reference). |
| `track`  | `string`  | `'var(--rule-strong)'` | Track (background ring) stroke. A full CSS colour/var string, passed straight to `stroke`. |
| `width`  | `number`  | `4`                  | Stroke width of both circles. |
| `label`  | `string \| undefined` | `undefined` | Accessible name (see Accessibility). When omitted, a sensible default name is used. |

- `tone` is a **token name** (`amber`), not a full var — the component wraps it as
  `var(--{tone})`. `track` is a **full colour string** (`var(--rule-strong)`), passed
  through unchanged. This asymmetry matches the reference; keep it.
- The numeric props (`size`, `width`) are written as resolved px values on the SVG/circle
  attributes. `pct`/clamp logic uses a `$derived`.

## Accessibility

**Role decision: `role="progressbar`"** (see D-entry logged in `decisions.md`). Justification:
the ARIA `meter` role is for a static measurement within a known range (disk usage, fuel),
while `progressbar` represents progress toward completion — which is exactly `ProgressBar`'s
semantics, and `Gauge` is its radial sibling. Reusing `progressbar` keeps the two siblings
consistent for AT users and matches the established `ProgressBar` implementation
(`role="progressbar"` + `aria-valuenow/min/max` + `aria-label`). Browser/AT support for
`progressbar` is also broader than for `meter`.

The root `<svg>` carries:
- `role="progressbar"`
- `aria-valuenow={clampedPct}` (the clamped integer/number, matching the rendered arc)
- `aria-valuemin={0}`
- `aria-valuemax={100}`
- `aria-label={label ?? 'Progress'}` — default name `'Progress'` mirrors `ProgressBar`.

**Decorative-only usage**: when a gauge is purely ornamental (e.g. duplicated next to a
visible text percentage that already conveys the value), the consumer passes
`aria-hidden="true"` via `...rest`. Because `...rest` is forwarded onto the root `<svg>`,
a consumer-supplied `aria-hidden="true"` removes the element from the accessibility tree.
The component does not itself decide decorativeness — it always renders the role/value
attributes and lets the consumer opt out via `aria-hidden`. (This matches ProgressBar's
pattern where the header row is `aria-hidden` and the track owns the role.)

## CSS

- Scoped `<style>` block; native CSS nesting per D45 if any nesting is needed.
- The only static style on the SVG is `display: block`, `transform: rotate(-90deg)`,
  `flex-shrink: 0`, and an optional `transition: stroke-dasharray .4s ease` on the
  progress circle (cosmetic; not asserted). These may live in scoped CSS classes rather
  than inline `style=` attributes (prefer scoped CSS per D38).
- Colours are **tokens only**: progress stroke is the computed `var(--{tone})`, track is
  the `track` prop (default `var(--rule-strong)`). No literal hex.
- The `stroke` colour for the progress arc is necessarily computed from the `tone` prop,
  so it is applied as an inline `stroke="var(--{tone})"` attribute (a computed token var),
  not a static class — this is the one unavoidable computed-value attribute and is allowed.

## Acceptance criteria

Geometry / structure:

1. The root element is an `<svg>` with `width` and `height` attributes equal to `size` and
   a `viewBox` of `0 0 {size} {size}`. For `size=42` (default), `width="42"`, `height="42"`,
   `viewBox="0 0 42 42"`.
2. The SVG contains exactly **two** `<circle>` elements, both with `cx = cy = size/2`,
   `r = (size - width - 3)/2`, `fill="none"`, and `stroke-width = width`.
3. The **first** circle (track) has `stroke` equal to the `track` prop — default resolves to
   the `--rule-strong` token colour.
4. The **second** circle (progress arc) has `stroke="var(--{tone})"` — for `tone="amber"`
   the computed stroke colour equals the `--amber` token; for `ok`/`cyan`/`danger`
   likewise.
5. The progress circle's `stroke-dasharray` equals `` `${(clampedPct/100)*c} ${c}` `` where
   `c = 2*Math.PI*((size-width-3)/2)`. For `size=56, width=4, pct=62`:
   `r=24.5`, `c≈153.93804`, dash ≈ `95.4416 153.93804` (test computes both numbers from the
   formula, not literals).
6. `pct=0` renders a zero-length arc: the first value of `stroke-dasharray` is `0`
   (`"0 {c}"`).
7. `pct=100` renders a full arc: the first value of `stroke-dasharray` equals `c`
   (the full circumference; `"{c} {c}"`).
8. The SVG is rotated so the arc starts at the top: a `transform: rotate(-90deg)` (via
   inline style or scoped class) is applied to the root SVG.
9. Changing `width` changes both circles' `stroke-width` and the computed `r`/`c`: for
   `size=84, width=6`, `r=(84-6-3)/2=37.5`, both circles have `stroke-width="6"`.

Clamping:

10. `pct` below 0 clamps to 0: `aria-valuenow="0"` and `stroke-dasharray` starts with `0`.
11. `pct` above 100 clamps to 100: `aria-valuenow="100"` and the dash equals `"{c} {c}"`.

Accessibility:

12. The root SVG has `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, and
    `aria-valuenow` equal to the clamped `pct`.
13. With no `label`, the SVG has `aria-label="Progress"`. With `label="Disk usage"`, the
    SVG has `aria-label="Disk usage"`.
14. A consumer-supplied `aria-hidden="true"` (via `...rest`) is forwarded onto the root SVG,
    removing it from the accessibility tree (the gauge is not found by `getByRole`).
15. No a11y addon violations in any Story.

API / defaults / forwarding:

16. Defaults apply when props are omitted: `size=42`, `width=4`, `tone='amber'` (progress
    stroke = `--amber`), `track` resolves to `--rule-strong`.
17. `...rest` attributes (e.g. `data-testid`, `class`) are forwarded onto the root SVG.

## Storybook story plan

File: `src/lib/components/patterns/Gauge.stories.svelte` (Svelte CSF; `component: Gauge`,
`tags: ['autodocs']`, `title: 'Patterns/Gauge'`). Use `resolveTokenColor` /
`resolveTokenFgColor` from `$lib/storybook-utils.js` for stroke-colour assertions
(strokes resolve via the foreground channel — test-writer picks the resolver that matches
how the browser computes `stroke`; verify empirically, default to `resolveTokenFgColor`).
Each play function computes expected geometry from the formula, never hard-coded literals.

1. **Ok Low (24%)** — `pct=24, tone='ok', size=56`. Assert two circles, `aria-valuenow="24"`,
   role+min+max, progress stroke = `--ok`, dasharray = `(24/100)*c  c`. (AC 1,2,4,5,12)
2. **Cyan Mid (62%)** — `pct=62, tone='cyan', size=56`. Assert stroke = `--cyan`,
   dasharray for 62%, `aria-valuenow="62"`. (AC 4,5)
3. **Amber High (88%)** — `pct=88, tone='amber', size=56`. Assert stroke = `--amber`,
   dasharray for 88%. (AC 4,5)
4. **Danger Full (100%)** — `pct=100, tone='danger', size=56`. Assert stroke = `--danger`,
   dasharray = `"{c} {c}"`, `aria-valuenow="100"`. (AC 4,7,12)
5. **Zero (0%)** — `pct=0, tone='amber', size=56`. Assert dasharray starts with `0`,
   `aria-valuenow="0"`. (AC 6)
6. **Large Thick** — `pct=70, tone='amber', size=84, width=6`. Assert `width/height="84"`,
   both `stroke-width="6"`, `r` and `c` from formula, dasharray for 70%. (AC 1,2,9)
7. **Clamped Above** — `pct=150`. Assert `aria-valuenow="100"`, dasharray = `"{c} {c}"`.
   (AC 11)
8. **Clamped Below** — `pct=-10`. Assert `aria-valuenow="0"`, dasharray starts `0`. (AC 10)
9. **Default Geometry** — `pct=50` only (no size/width/tone). Assert `width="42"`,
   `viewBox="0 0 42 42"`, both `stroke-width="4"`, progress stroke = `--amber`, track stroke
   = `--rule-strong`. (AC 1,3,4,16)
10. **Labelled** — `pct=40, label='Disk usage'`. Assert `aria-label="Disk usage"`. (AC 13)
11. **Decorative (aria-hidden)** — `pct=40` with `aria-hidden: true` in args. Assert the
    gauge is removed from the a11y tree (`queryByRole('progressbar')` is null) and the SVG
    has `aria-hidden="true"`. (AC 14)

(11 stories; AC 8 and AC 17 are covered structurally within the above — AC 8 by asserting
the `rotate(-90deg)` transform in story 1; AC 17 by the `data-testid`/args forwarding used
to query elements.)

## Out of scope

- Polymorphic `as` prop (root is always `<svg>`).
- A closed/typed union for `tone` — it is an open `string` token name, matching the
  reference and `Led`/`Alert` tone conventions.
- A visible numeric label *inside or beside* the dial — the reference draws the `42%`
  caption in the surrounding demo, not inside `Gauge`. Consumers compose their own caption
  (e.g. with `Text`). Only the `label` accessible name is in scope.
- Animation correctness — the `transition: stroke-dasharray .4s ease` is cosmetic and not
  asserted.
- Multi-segment / threshold-coloured gauges, min/max other than 0–100, start-angle
  configuration.
- Adding the export to `patterns/index.ts` and `src/lib/index.ts` is the implementer's job
  (home category confirmed: `patterns/`).

## Open questions

- **OQ-1 (non-blocking)**: Whether `stroke` token colours resolve via the foreground or
  background channel in the test environment. The test-writer should verify empirically
  on the first story; `resolveTokenFgColor` is the expected match. Not a blocker — it only
  affects which existing helper the stories import.

No blocking open questions.
