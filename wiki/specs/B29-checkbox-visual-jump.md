# B29: Checkbox shifts down on toggle

## Context

Two visual bugs were filed against `Checkbox.svelte` (B29 card:
`wiki/backlog/doing/B29-checkbox-visual-jump.md`):

1. **Layout shift on toggle** — The checkbox widget shifts position when toggled. The
   root cause is that `.checkbox-indicator::after` inserts glyph content (`✓` / `–`)
   only in checked/indeterminate states. Adding text content to a pseudo-element changes
   the indicator's rendered height, which causes the surrounding `inline-flex` row to
   re-flow.

2. **Illegible checkmark** — The `✓` character at `font-size: 11px` in JetBrains Mono
   is rendered at a size and weight where it may be visually unclear, especially in the
   Paper (light) palette where `--bg` resolves to a near-white value.

Relevant wiki pages: [vision.md](../vision.md), [requirements.md](../requirements.md),
[architecture.md](../architecture.md), [decisions.md](../decisions.md).

Design constraints that apply here (see D38 in `decisions.md`):
- Use design system primitives in higher-order components; `Checkbox` is itself a
  primitive so no composition change is needed, but the fix must not introduce raw
  `style=` props or gratuitous custom CSS.
- All form components must remain WCAG 2.1 AA compliant (R6, R3, `requirements.md`).
- No emoji; iconography via unicode glyphs, CSS, or SVG only (`vision.md` non-goals).

Tests are Storybook play functions in `.stories.svelte` files — no separate `.test.ts`
files (D1, `architecture.md`).

## Acceptance criteria

### Regression guard — no layout shift

**AC-1.** The `.checkbox-indicator` element has a computed `width` of exactly `16px`
and a computed `height` of exactly `16px` in the unchecked state.

**AC-2.** After programmatically toggling the checkbox to the checked state (setting
`checked = true`), the `.checkbox-indicator` element still has a computed `width` of
`16px` and `height` of `16px`. The bounding box dimensions must not change between
unchecked and checked.

**AC-3.** After setting the `indeterminate` prop to `true`, the `.checkbox-indicator`
element still has a computed `width` of `16px` and `height` of `16px`. The bounding
box dimensions must not change between unchecked and indeterminate.

**AC-4.** A story named `"No Layout Shift"` (regression story) renders the checkbox in
unchecked state, captures the indicator's `getBoundingClientRect()`, programmatically
clicks the checkbox to toggle it to checked, captures the rect again, and asserts that
`height` and `width` are identical before and after. This story must fail on the current
implementation and pass after the fix.

### Checkmark legibility

**AC-5.** In the checked state, the `.checkbox-indicator::after` pseudo-element (or the
equivalent SVG/CSS mark) renders a checkmark that is visually distinct and clearly
readable against the amber background in both the Phosphor (dark) and Paper (light)
palettes. Legibility is defined as: the mark occupies at least 8px × 8px of visual
space within the 16px × 16px indicator box, uses `--bg` as its color (reversed against
amber), and is not clipped by the indicator bounds.

**AC-6.** The checkmark implementation must not use a bare unicode `✓` character
rendered via `::after { content: '✓' }` at a font size below `12px`. Acceptable
implementations include: an SVG checkmark embedded as `background-image`, an inline
`<svg>` child element (added to the template), or a CSS-drawn mark (e.g. border-corner
technique) that maintains fixed dimensions regardless of state. The chosen technique
must not affect the indicator's layout box size.

**AC-7.** In the indeterminate state, the `–` dash mark is similarly legible: visible,
correctly sized, and rendered without altering the indicator's bounding box.

### Indicator fixed-size guarantee (implementation rule)

**AC-8.** The `.checkbox-indicator` CSS must explicitly declare `width: 16px`,
`height: 16px`, and `flex-shrink: 0` (already present). It must also ensure that the
checked/indeterminate mark does not add to the element's layout size. Acceptable
techniques: (a) the `::after` pseudo-element uses `position: absolute` so it is removed
from flow, (b) the mark is a `background-image` (no flow contribution), or (c) an SVG
child element is sized to `width: 100%; height: 100%; position: absolute`.

**AC-9.** If technique (a) `position: absolute` is used for `::after`, the
`.checkbox-indicator` must declare `position: relative` (already present in current
implementation) and the `::after` element must set `top: 50%; left: 50%; transform:
translate(-50%, -50%)` (or equivalent) so the mark is visually centred in all states.

### Colour-token correctness

**AC-10.** In the checked state, `getComputedStyle(indicator).backgroundColor` resolves
to the RGB value of `var(--amber)` in both Phosphor and Paper palettes. (This AC already
passes; it is retained as a regression guard.)

**AC-11.** In the unchecked state, `getComputedStyle(indicator).backgroundColor` is
`rgba(0, 0, 0, 0)` (transparent). (Retained regression guard.)

### Existing stories remain green

**AC-12.** All six pre-existing stories in `Checkbox.stories.svelte` (`Default
(Unchecked)`, `Checked`, `Indeterminate`, `Disabled Unchecked`, `Disabled Checked`,
`Space to Toggle`) must continue to pass without modification to their `play` functions.

### Accessibility

**AC-13.** The `a11y` addon must report zero violations on the `No Layout Shift`,
`Checked`, `Indeterminate`, and `Default (Unchecked)` stories after the fix.

**AC-14.** The native `<input type="checkbox">` remains in the DOM and accessible to
screen readers via the accessible-hide pattern (D29 in `decisions.md`): `position:
absolute; width: 1px; height: 1px; margin: -1px; clip: rect(0,0,0,0); overflow:
hidden; white-space: nowrap`.

## Out of scope

- Changing the indicator size (it stays 16px × 16px).
- Adding new Checkbox variants (size, shape, or color variants beyond the existing
  amber-filled checked state).
- Full ARIA Listbox or group pattern for sets of checkboxes — that belongs to a
  dedicated form-group component.
- Animated check/uncheck transitions (smooth draw-on animation for the checkmark).
- Replacing the `<label>` / `<input>` HTML structure with a different markup approach.

## Open questions

**OQ-1 (non-blocking).** SVG vs CSS-drawn checkmark: both are acceptable per AC-6. The
implementer should choose the approach that minimises CSS complexity. An inline `<svg>` in
the Svelte template is the most straightforward but adds a DOM node; a `background-image:
url("data:image/svg+xml,...")` avoids template changes. Either is conformant.

**OQ-2 (non-blocking).** The `--bg` token value differs between palettes (`#070908`
Phosphor vs approximately `#f5f5f0` Paper). Both produce readable marks against the amber
fill (`--amber` ≈ `#ffb500`), but the contrast ratios should be verified with the a11y
addon. No blocking action required unless the addon reports a contrast violation.

No blocking open questions — item does not need to be flagged `review`.
