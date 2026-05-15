# B3: Layout helpers

## Context

B3 delivers all CSS-only layout utilities that page layouts and component compositions
depend on. These utilities are already authored in `src/lib/tokens/layout.css` and
`src/lib/tokens/patterns.css`; this item formalises what must be present and working,
drives Storybook story coverage, and makes the classes testable.

The helpers are imported globally via `src/app.css` (both files already appear there)
so they are available everywhere in the SvelteKit app and in every Storybook story
without any per-file import.

Related wiki pages: [vision.md](../vision.md), [requirements.md](../requirements.md)
(R9), [architecture.md](../architecture.md), [decisions.md](../decisions.md).

Source files that the implementer must match exactly:

| File | Role |
|---|---|
| `src/lib/tokens/layout.css` | Container, rail, grid, split, flex stack, divider, padding, surface, border, visibility utilities |
| `src/lib/tokens/patterns.css` | Pattern-component CSS (`.page-hero`, `.section-head`, `.section-foot`, `.stat-card`, `.kv-list`, `.kv-row`, `.alert`, `.cta-block`, `.progress`, `.activity-row`) |
| `src/app.css` | Already `@import`s both files — no changes required to the entry point |

Story file location (CSS-only, no Svelte component):

| Story file | Storybook title |
|---|---|
| `src/lib/tokens/layout.stories.svelte` | `Tokens/Layout` |

---

## Acceptance criteria

Numbers are grouped by class family. Every assertion must be verified against computed
CSS properties read from a rendered DOM element inside a Storybook story play function.

### Containers

1. An element with class `.container` has `max-width: 1440px`, `margin-left: auto`,
   `margin-right: auto`, `padding-left: 32px`, `padding-right: 32px`, and
   `padding-bottom: 80px`.
2. An element with class `.container-md` has `max-width: 960px`, `padding-left: 32px`,
   `padding-right: 32px`, and `padding-bottom: 64px`.
3. An element with class `.container-sm` has `max-width: 640px`, `padding-left: 32px`,
   `padding-right: 32px`, and `padding-bottom: 48px`.
4. All three container classes declare `container-type: inline-size` (verified via
   `getComputedStyle` or by confirming the property is set in the stylesheet — container
   queries rely on this).

### Rail layout

5. An element with class `.rail-layout` has `display: flex` and `height: 100vh`.
6. An element with class `.rail-sidebar` has `width: 200px`, `flex-shrink: 0`,
   `border-right: 1px solid var(--rule)`, `background: var(--bg-rail)`,
   `display: flex`, and `flex-direction: column`.
7. An element with class `.rail-main` has `flex: 1`, `overflow-y: auto`,
   `padding: 32px`, and `background: var(--bg)`.

### Grid system

8. An element with class `.grid` has `display: grid` and `gap: 16px` (the `var(--gap,
   16px)` default resolves to `16px` when `--gap` is not set).
9. `.grid-1` applies `grid-template-columns: 1fr` (a single column).
10. `.grid-2` applies `grid-template-columns: repeat(2, 1fr)`.
11. `.grid-3` applies `grid-template-columns: repeat(3, 1fr)`.
12. `.grid-4` applies `grid-template-columns: repeat(4, 1fr)`.
13. `.grid-auto` applies `grid-template-columns: repeat(auto-fill, minmax(240px, 1fr))`.

### Card grid

14. An element with class `.card-grid` has `display: grid`,
    `grid-template-columns: repeat(3, 1fr)`, and `gap: 16px`.

### Split layouts

15. An element with class `.split` has `display: grid`,
    `grid-template-columns: 1fr 1fr`, and `gap: 32px` (the `var(--gap, 32px)` default).
16. An element with class `.split-aside` has `display: grid`,
    `grid-template-columns: 280px 1fr`, and `gap: 32px`.

### Flex stacks

17. An element with class `.stack` has `display: flex`, `flex-direction: column`, and
    `gap: 16px` (the `var(--gap, 16px)` default).
18. Adding class `.stack-sm` to a `.stack` element overrides the gap to `8px` (via
    `--gap: 8px`).
19. Adding class `.stack-lg` to a `.stack` element overrides the gap to `32px` (via
    `--gap: 32px`).
20. An element with class `.inline` has `display: flex`, `flex-wrap: wrap`,
    `align-items: center`, and `gap: 12px` (the `var(--gap, 12px)` default).
21. Adding class `.inline-sm` to an `.inline` element overrides the gap to `6px`.
22. Adding class `.inline-lg` to an `.inline` element overrides the gap to `24px`.
23. An element with class `.spread` has `display: flex`, `align-items: center`,
    `justify-content: space-between`, and `gap: 16px`.

### Dividers

24. An element with class `.rule` has `border-top: 1px solid var(--rule)` and `border`
    shorthand of `none` (no bottom/left/right borders), and `margin: 0`.
25. An element with class `.rule-dashed` has `border-top: 1px dashed var(--rule)` and
    `margin: 0`.
26. An element with class `.rule-strong` has `border-top: 1px solid var(--rule-strong)`
    and `margin: 0`.

### Padding utilities

27. `.p-1` applies `padding: 8px` on all sides.
28. `.p-2` applies `padding: 16px` on all sides.
29. `.p-3` applies `padding: 24px` on all sides.
30. `.p-4` applies `padding: 32px` on all sides.
31. `.px-2` applies `padding-left: 16px` and `padding-right: 16px`
    (top and bottom padding are not set by this class).
32. `.px-4` applies `padding-left: 32px` and `padding-right: 32px`.
33. `.py-2` applies `padding-top: 16px` and `padding-bottom: 16px`.
34. `.py-5` applies `padding-top: 40px` and `padding-bottom: 40px`.

### Surface helpers

35. `.surface-rail` applies `background: var(--bg-rail)`.
36. `.surface-elev` applies `background: var(--bg-elev)`.
37. `.surface-sunken` applies `background: var(--bg-sunken)`.

### Border helpers

38. `.bordered` applies `border: 1px solid var(--rule)`.
39. `.bordered-strong` applies `border: 1px solid var(--rule-strong)`.
40. `.bordered-amber` applies `border: 1px solid var(--amber)`.

### Visibility helpers

41. An element with class `.hidden` has `display: none` (the `!important` flag ensures
    no other rule can override it; verify using `getComputedStyle`).
42. An element with class `.sr-only` has `position: absolute`, `width: 1px`,
    `height: 1px`, and `overflow: hidden` — it is removed from layout but remains in
    the accessibility tree.

### Pattern CSS — Page hero

43. An element with class `.page-hero` has `padding-top: 48px` and
    `padding-bottom: 40px`.
44. A `.page-hero.bordered` element has `border-bottom: 1px solid var(--rule)`.
45. Inside `.page-hero`, an element with class `.eyebrow` has `color: var(--ink-faint)`,
    `text-transform: uppercase`, `letter-spacing: 0.12em`, and `margin-bottom: 12px`.
46. Inside `.page-hero`, an `<h1>` has `font-weight: 500`, `line-height: 1`, and
    `letter-spacing: -0.03em`.
47. Inside `.page-hero`, an element with class `.sub` has `margin-top: 20px`,
    `color: var(--ink-dim)`, and `max-width: 62ch`.

### Pattern CSS — Section head

48. An element with class `.section-head` has `display: flex`, `flex-direction: column`,
    `gap: 6px`, `padding-top: 40px`, `padding-bottom: 12px`, and
    `border-bottom: 1px solid var(--rule)`.
49. Inside `.section-head`, an element with class `.num` has `font-family: var(--mono)`,
    `color: var(--ink-faint)`, and `letter-spacing: 0.12em`.
50. Inside `.section-head`, an element with class `.row` has `display: flex`,
    `align-items: baseline`, and `gap: 16px`.
51. Inside `.section-head`, an element with class `.sub` has `margin-left: auto`,
    `font-family: var(--mono)`, `color: var(--ink-dim)`, and
    `text-transform: uppercase`.

### Pattern CSS — Section foot

52. An element with class `.section-foot` has `display: flex`,
    `justify-content: space-between`, `align-items: baseline`,
    `font-family: var(--mono)`, `padding-top: 16px`, `margin-top: 20px`, and
    `border-top: 1px solid var(--rule)`.
53. Inside `.section-foot`, an element with class `.link` has `color: var(--amber)`,
    `text-transform: uppercase`, and `cursor: pointer`.
54. Inside `.section-foot`, an element with class `.meta` has `color: var(--ink-faint)`,
    `text-transform: uppercase`, and `font-size: var(--t-micro)`.

### Pattern CSS — Stat card

55. An element with class `.stat-card` has `border: 1px solid var(--rule)`,
    `background: var(--bg-rail)`, `padding: 16px 20px`, `display: flex`,
    `flex-direction: column`, and `gap: 6px`.
56. Inside `.stat-card`, an element with class `.stat-value` has `font-family: var(--mono)`,
    `font-size: 32px`, and `color: var(--ink)` by default.
57. `.stat-value.amber` has `color: var(--amber)`.
58. `.stat-value.ok` has `color: var(--ok)`.
59. `.stat-value.danger` has `color: var(--danger)`.

### Pattern CSS — KV list

60. An element with class `.kv-list` has `display: flex` and `flex-direction: column`.
61. An element with class `.kv-row` has `display: flex`, `justify-content: space-between`,
    `align-items: baseline`, `gap: 16px`, `padding-top: 6px`, `padding-bottom: 6px`,
    `border-bottom: 1px dashed var(--rule)`, and `font-family: var(--mono)`.
62. The last `.kv-row` inside a `.kv-list` has `border-bottom: none` (`:last-child` rule).
63. `.kv-key` has `color: var(--ink-faint)`, `text-transform: uppercase`, and
    `flex-shrink: 0`.
64. `.kv-val` has `color: var(--ink)` by default; `.kv-val.amber` overrides to
    `var(--amber)`; `.kv-val.ok` to `var(--ok)`; `.kv-val.danger` to `var(--danger)`;
    `.kv-val.cyan` to `var(--cyan)`.

### Pattern CSS — Alert

65. An element with class `.alert` has `display: flex`, `align-items: flex-start`,
    `gap: 12px`, `padding: 12px 16px`, and `border-left: 2px solid` (color depends on
    variant).
66. `.alert.ok` has `border-left-color: var(--ok)` and a background that is a
    color-mix of `var(--ok)` at 8% opacity (verified by checking `background-color`
    is not transparent and not a solid color — an approximation test is acceptable:
    `background-color` is not `rgba(0,0,0,0)`).
67. `.alert.amber` has `border-left-color: var(--amber)` and a non-transparent
    background derived from `var(--amber)`.
68. `.alert.danger` has `border-left-color: var(--danger)` and a non-transparent
    background derived from `var(--danger)`.
69. `.alert.info` has `border-left-color: var(--cyan)` and a non-transparent background
    derived from `var(--cyan)`.
70. Inside `.alert.ok`, `.alert-tag` and `.alert-title` have `color: var(--ok)`;
    inside `.alert.amber`, they have `color: var(--amber)`; inside `.alert.danger`,
    `color: var(--danger)`; inside `.alert.info`, `color: var(--cyan)`.

### Pattern CSS — CTA block

71. An element with class `.cta-block` has `display: flex`, `align-items: center`,
    `justify-content: space-between`, `gap: 24px`, `border: 1px solid var(--amber)`,
    `padding: 24px 32px`, and `cursor: pointer`.
72. Inside `.cta-block`, `.cta-body` has `display: flex`, `flex-direction: column`,
    and `gap: 3px`.
73. Inside `.cta-block`, `.cta-link` has `color: var(--amber)`,
    `text-transform: uppercase`, and `flex-shrink: 0`.

### Pattern CSS — Progress bar

74. An element with class `.progress` has `display: flex`, `flex-direction: column`,
    `gap: 4px`, and `width: 100%`.
75. `.progress-track` has `height: 5px`, `background: var(--bg-sunken)`, and
    `border: 1px solid var(--rule)`.
76. `.progress-fill` has `background: var(--ok)` by default.
77. `.progress-fill.amber` has `background: var(--amber)`.
78. `.progress-fill.danger` has `background: var(--danger)`.

### Pattern CSS — Activity row

79. An element with class `.activity-row` has `display: flex`, `gap: 12px`,
    `align-items: center`, `padding-top: 7px`, `padding-bottom: 7px`,
    `border-bottom: 1px dashed var(--rule)`, and `font-family: var(--mono)`.
80. The last `.activity-row` in a group has `border-bottom: none` (`:last-child` rule).
81. `.activity-time` has `color: var(--ink-faint)` and `flex-shrink: 0`.
82. `.activity-msg` has `color: var(--ink-dim)` and `flex: 1`.

---

## Implementation plan

No new files are required. Both CSS source files already exist and are already imported
by `src/app.css`. The implementer's job is to confirm the files exactly match the
definitions above (they should already pass) and to create the story file.

### Files to create

| File | Action |
|---|---|
| `src/lib/tokens/layout.stories.svelte` | Create: Storybook stories with play functions for every class family above |

### Files to verify / not modify

| File | Action |
|---|---|
| `src/lib/tokens/layout.css` | Read and confirm — must match acceptance criteria 1–42 |
| `src/lib/tokens/patterns.css` | Read and confirm — must match acceptance criteria 43–82 |
| `src/app.css` | No change — already imports both files |

---

## Story plan

All stories live in `src/lib/tokens/layout.stories.svelte`.
Storybook title: `Tokens/Layout`.
No `component` in `defineMeta` (CSS-only, no Svelte component).
Every story renders raw HTML inside the `<Story>` slot.
Play functions are named variables in `<script module lang="ts">`.
Imports use `'storybook/test'` (no `@` prefix).

### Story 1 — `Containers`

- **Visual purpose**: Show all three container widths side-by-side with a colored
  background so max-width clamping is visible.
- **Template**: Three `<div>` elements, one for each container class, each labeled with
  its class name and containing a short paragraph.
- **Play function** (`playContainers`): Query the `.container` element; assert
  `max-width` is `1440px` and `padding-left` is `32px`. Query `.container-sm`; assert
  `max-width` is `640px` and `padding-bottom` is `48px`.

### Story 2 — `Rail Layout`

- **Visual purpose**: Demonstrate the fixed sidebar + scrollable main pattern.
- **Template**: A `<div class="rail-layout">` containing a `<aside class="rail-sidebar">`
  (with some nav items) and a `<main class="rail-main">` (with placeholder content).
  The story canvas height is set to `400px` so the overflow scroll is visible.
- **Play function** (`playRail`): Assert `.rail-layout` has `display: flex`. Assert
  `.rail-sidebar` has `width: 200px` and `flex-shrink: 0`. Assert `.rail-main` has
  `flex: 1` and `padding: 32px`.

### Story 3 — `Grid System`

- **Visual purpose**: Show each grid column variant with numbered cells.
- **Template**: Six grid examples in a vertical stack. Each has a label above it and
  uses colored cells to show column count. Classes shown: `.grid.grid-1`,
  `.grid.grid-2`, `.grid.grid-3`, `.grid.grid-4`, `.grid.grid-auto`,
  `.card-grid`.
- **Play function** (`playGrid`): Query the `.grid-2` element; assert
  `grid-template-columns` resolves to two equal columns. Query `.grid-auto`; assert
  `grid-template-columns` contains `auto-fill` or `minmax(240px`. Query `.card-grid`;
  assert `display: grid` and `gap: 16px`.

### Story 4 — `Split Layouts`

- **Visual purpose**: Show `.split` (50/50) and `.split-aside` (280px + flex) layouts.
- **Template**: Two `<div>` grids in a vertical stack, each with two colored child cells.
- **Play function** (`playSplit`): Assert `.split` has `grid-template-columns` resolving
  to two equal `1fr` columns. Assert `.split-aside` has `grid-template-columns`
  beginning with `280px`.

### Story 5 — `Flex Stacks`

- **Visual purpose**: Demonstrate `.stack`, `.stack-sm`, `.stack-lg`, `.inline`,
  `.inline-sm`, `.inline-lg`, and `.spread` with color-coded children.
- **Template**: One `.spread` div (left label + right label) followed by three `.stack`
  variants and three `.inline` variants.
- **Play function** (`playFlex`): Assert `.stack` has `flex-direction: column` and
  `gap: 16px`. Assert `.stack-sm` has `gap: 8px`. Assert `.stack-lg` has `gap: 32px`.
  Assert `.inline` has `flex-wrap: wrap` and `gap: 12px`. Assert `.spread` has
  `justify-content: space-between`.

### Story 6 — `Dividers`

- **Visual purpose**: Show all three rule variants between labeled placeholder sections.
- **Template**: Three `<hr>` elements each with one of the rule classes, each preceded
  by a short label.
- **Play function** (`playDividers`): Assert `.rule` has `border-top` containing
  `1px solid` and `margin: 0`. Assert `.rule-dashed` has `border-top` containing
  `1px dashed`. Assert `.rule-strong` has `border-top` containing `1px solid`.

### Story 7 — `Padding and Surface Helpers`

- **Visual purpose**: Show padding utility classes as labeled colored boxes and surface
  helpers as colored panels.
- **Template**: A `.grid.grid-4` of padding examples (each box shows its padding size
  visually with a border) plus three surface boxes for `.surface-rail`,
  `.surface-elev`, `.surface-sunken`.
- **Play function** (`playPaddingSurface`): Assert `.p-1` has `padding: 8px`. Assert
  `.p-4` has `padding: 32px`. Assert `.py-5` has `padding-top: 40px` and
  `padding-bottom: 40px`. Assert `.surface-sunken` has a `background-color` that
  is not the same as `.surface-rail`.

### Story 8 — `Border and Visibility Helpers`

- **Visual purpose**: Show the three border variants on identical `<div>` boxes. Show
  `.hidden` is invisible and `.sr-only` is off-screen.
- **Template**: Three bordered boxes side by side. One element with `.hidden`
  (invisible). One element with `.sr-only` (text present but not rendered).
- **Play function** (`playBorderVisibility`): Assert `.bordered` has `border` containing
  `1px solid`. Assert `.bordered-amber` has `border-color` equal to the resolved amber
  value. Assert the `.hidden` element has `display: none`. Assert the `.sr-only` element
  has `width: 1px` and `height: 1px`.

### Story 9 — `Page Hero and Section Head`

- **Visual purpose**: Show a `.page-hero` block with eyebrow, h1, and sub paragraph,
  followed by a `.section-head` with hex number, title row, and sub-label.
- **Template**: `<section class="page-hero bordered">` containing `.eyebrow`, `<h1>`,
  and `.sub`; followed by `<div class="section-head">` containing `.num`, a `.row`
  with `<h2>` and `.sub`.
- **Play function** (`playPageHero`): Assert `.page-hero` has `padding-top: 48px`.
  Assert `.page-hero.bordered` has `border-bottom` containing `1px solid`. Assert
  `.section-head` has `display: flex` and `flex-direction: column`. Assert the
  `.section-head .num` has `color` resolving to the `--ink-faint` value.

### Story 10 — `Section Foot and KV List`

- **Visual purpose**: Show a `.section-foot` with `.link` and `.meta` children, and a
  `.kv-list` with four `.kv-row` entries (last has no bottom border).
- **Template**: A `.section-foot` followed by a `.kv-list` with four `.kv-row` items,
  each with a `.kv-key` and a `.kv-val`. One row uses `.kv-val.amber`.
- **Play function** (`playSectionFootKv`): Assert `.section-foot` has `display: flex`
  and `justify-content: space-between`. Assert `.section-foot .link` has `color`
  resolving to amber. Assert the last `.kv-row` has `border-bottom: none`. Assert
  `.kv-val.amber` has `color` resolving to amber.

### Story 11 — `Alerts`

- **Visual purpose**: Show all four alert tones in a vertical stack.
- **Template**: Four `.alert` elements — `.ok`, `.amber`, `.danger`, `.info` — each
  containing `.alert-tag`, `.alert-body > (.alert-title + .alert-msg)`.
- **Play function** (`playAlerts`): Assert `.alert.ok` has `border-left` containing
  `2px solid` and a non-transparent `background-color`. Assert `.alert.amber` has a
  non-transparent `background-color`. Assert `.alert.danger .alert-title` has `color`
  resolving to the danger value. Assert `.alert.info` has `border-left-color` resolving
  to the cyan value.

### Story 12 — `CTA Block`

- **Visual purpose**: A single `.cta-block` with eyebrow, name, description, and link.
- **Template**: `<a class="cta-block">` containing `.cta-body` (`.cta-eyebrow`,
  `.cta-name`, `.cta-desc`) and `.cta-link`.
- **Play function** (`playCtaBlock`): Assert `.cta-block` has `display: flex`,
  `border` containing `1px solid`, and `cursor: pointer`. Assert `.cta-link` has
  `color` resolving to amber and `flex-shrink: 0`.

### Story 13 — `Stat Card`

- **Visual purpose**: Four `.stat-card` examples — default ink, amber, ok, and danger
  value colors — arranged in a `.grid.grid-4`.
- **Template**: `.grid.grid-4` wrapping four `.stat-card` elements, each with
  `.stat-label`, `.stat-value` (with/without color modifier), and `.stat-sub`.
- **Play function** (`playStatCard`): Assert `.stat-card` has `background` resolving to
  `var(--bg-rail)` and `border` containing `1px solid`. Assert `.stat-value.amber` has
  `color` resolving to amber. Assert `.stat-value.ok` has `color` resolving to ok.

### Story 14 — `Progress Bar and Activity Row`

- **Visual purpose**: Three progress bars (ok, amber, danger fills) and a short
  activity feed of three `.activity-row` entries.
- **Template**: Three `.progress` elements each containing `.progress-header`,
  `.progress-track > .progress-fill` (with appropriate modifier). Then three
  `.activity-row` elements with `.activity-time`, an LED-like span, and `.activity-msg`.
- **Play function** (`playProgressActivity`): Assert `.progress-fill` (no modifier) has
  `background` resolving to ok. Assert `.progress-fill.amber` has `background` resolving
  to amber. Assert `.progress-fill.danger` has `background` resolving to danger.
  Assert the last `.activity-row` has `border-bottom: none`. Assert `.activity-time`
  has `flex-shrink: 0`.

---

## Out of scope

- Responsive breakpoint behaviour at actual viewport widths — the stories run at a fixed
  canvas size and cannot simulate media queries at the `720px` breakpoint. Responsive
  behaviour of containers, rail layout, and split layouts at narrow viewports is
  documented here but not test-asserted.
- Container query collapse of `.card-grid` and `.split` / `.split-aside` — these require
  a resizable parent `container-type` context that is not practical to assert in play
  functions.
- Svelte wrapper components — no `.svelte` component files are produced for any layout
  helper. All classes are used directly on HTML elements.
- Pattern component Svelte implementations (Alert, StatCard, CtaBlock, etc.) — those
  live in B9 as Svelte components. B3 only covers the CSS classes defined in
  `patterns.css` and verifies them through plain HTML.
- CTA block hover background (`color-mix`) — the hover state requires a `mouseenter`
  interaction; verifying the color-mix result is fragile and is excluded. Hover style
  is present in the source CSS and visually verifiable in Storybook.
- `.hide-mobile` and `.hide-desktop` — these are media-query-driven and cannot be
  reliably asserted inside a Storybook play function at a fixed canvas width.

---

## Open questions

None identified. All class definitions are fully specified in
`src/lib/tokens/layout.css` and `src/lib/tokens/patterns.css`, and both files are
already imported by `src/app.css`. This item is not blocking.
