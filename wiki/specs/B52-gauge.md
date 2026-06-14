# B52: Gauge component

## Context

`Gauge` is the **radial sibling** of the existing linear
[`ProgressBar`](../../src/lib/components/patterns/ProgressBar.svelte): an SVG dial that
renders a single value (`pct`, 0–100) as an arc around a circular track. It satisfies the
"Progress bar" family in [requirements.md](../requirements.md) R8 and lives in the
`feedback/` category — it surfaces live status to the reader (the same family as
`StatusPill` and the toasts), so `feedback/` reads truer than `patterns/`. `ProgressBar`
remains in `patterns/`; the two siblings now live in different categories by design.

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

File: `src/lib/components/feedback/Gauge.stories.svelte` (Svelte CSF; `component: Gauge`,
`tags: ['autodocs']`, `title: 'Feedback/Gauge'`). Use `resolveTokenFgColor` from
`$lib/storybook-utils.js` for stroke-colour assertions (strokes resolve via the foreground
channel — verified empirically, OQ-1 resolved). Each play function computes expected
geometry from the formula, never hard-coded literals.

The set is **lean and demo-first** (per `stories-guide.md` → *Consolidating stories*): three
stories, each a faithful render of the design sample with its `{pct}%` captions, carrying a
full `play` function that distributes the ACs. The caption is rendered in the **story
composition** (a `.cell` column matching the reference's `Cell` wrapper), never inside the
component (see *Out of scope*).

1. **Tones** — the design sample's row of four tone dials, each with a `{pct}%` caption:
   `24/ok`, `62/cyan`, `88/amber`, `100/danger`, all `size=56`. The hero; its play loops the
   four gauges asserting two shared circles, role+range+`aria-valuenow`, per-tone arc stroke,
   dasharray from the formula, and the caption text — then the `100%` full arc and the
   `rotate(-90deg)` start rotation. (AC 1,2,4,5,7,8,12)
2. **Sizes & geometry** — the props that reshape the dial, side by side: default geometry
   (`pct=50`, no size/width/tone → `42`/width 4/track `--rule-strong`/amber arc), a large
   thick dial (`70/amber/size=84/width=6`, the design's "size 84" cell), a zero arc (`0`),
   clamp-above (`150` → valuenow 100, full arc), and clamp-below (`-10` → valuenow 0, zero
   arc). (AC 1,3,6,9,10,11,16)
3. **Accessibility** — a labelled gauge (`label='Disk usage'`) beside a decorative one
   (`aria-hidden` + `data-testid` forwarded via `...rest`). Asserts the custom accessible
   name, that the decorative gauge is removed from the a11y tree, and `...rest` forwarding.
   (AC 13,14,17)

(3 stories; AC 15 is enforced by the a11y addon on every story.)

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
- The export lives in `feedback/index.ts` and `src/lib/index.ts` (home category: `feedback/`,
  moved from `patterns/` post-build).

## Open questions

- **OQ-1 (non-blocking)**: Whether `stroke` token colours resolve via the foreground or
  background channel in the test environment. The test-writer should verify empirically
  on the first story; `resolveTokenFgColor` is the expected match. Not a blocker — it only
  affects which existing helper the stories import.

No blocking open questions.
