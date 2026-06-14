# B51: SegmentedControl component

## Context

Port the design-system `SegmentedControl` into `@dxlbnl/ui` (Svelte 5). It is a
horizontal row of joined buttons representing a set of mutually-exclusive options;
exactly one is active. It is the terminal-aesthetic counterpart of a radio group used
for compact view/period toggles (e.g. `week | month | year`, `List | Grid | Chart`).

- Item card: `wiki/backlog/doing/B51-segmented-control.md`
- Vision / constraints: [vision.md](../vision.md), [requirements.md](../requirements.md)
  (WCAG 2.1 AA hard requirement; SSR-safe; Svelte 5 runes; no external primitives)
- Authoring conventions: [architecture.md](../architecture.md) (Chakra-style `as` +
  `...rest`, strict TS), Standing Rules D2, D4, D5, **D45** (native CSS nesting),
  **D42** (no play-fn assertions for visual-only locks), **D43** (single `string | Snippet`
  slot prop — not used here, options are typed data).
- Design reference (downstream React, reference ONLY — library is canonical):
  `wiki/specs/_design-refs/B51/SegmentedControl.jsx`,
  `wiki/specs/_design-refs/B51/preview-24-segmented.html`.
- House patterns reconciled against:
  - `src/lib/components/forms/RadioGroup.svelte` — the existing single-select control
    that uses roving `tabindex`, fires `onchange(value)`, and renders a `fieldset`. Its
    keyboard model (Arrow keys move focus + select, wrap-around) is the template.
  - `src/lib/components/forms/Select.svelte` — the controlled value idiom
    (`value?: string` + `onchange?: (value: string) => void`, internal committed copy so
    the display tracks selection even if the caller does not feed `value` back).
  - `src/lib/components/data/Tabs.svelte` — the existing Arrow/Home/End keyboard handler
    and ARIA reconciliation reference (`Tabs` uses tablist; this item uses radiogroup —
    see decision below).
  - `src/lib/components/primitives/Button.svelte` — authoring conventions.

### Home category and a11y role decisions (logged as D57)

- **Home category: `forms/`.** SegmentedControl selects a *value* (not a view panel),
  exactly like `RadioGroup` and `Select`, which both live in `forms/`. Story title
  `Forms/SegmentedControl`. Exports added to `src/lib/components/forms/index.ts` and
  `src/lib/index.ts` (implementer's job).
- **A11y role: `role="radiogroup"` on the container + `role="radio"` + `aria-checked`
  on each segment.** Rationale: this control commits a value from a small, fixed set of
  mutually-exclusive options — the exact semantic of a radio group. Tablist semantics
  (`role="tab"` / `aria-selected` / `tabpanel`) imply switching between visible *panels*,
  which SegmentedControl does not own. `radiogroup` also matches the existing
  `RadioGroup` precedent in the same category. The container takes an accessible name via
  a required `label` prop applied as `aria-label` (no visible `<legend>`; this is a
  compact inline control, not a fieldset).

## API

```ts
type SegmentSize = 'sm' | 'md'

type SegmentOption = string | { value: string; label: string }

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
  /** Options: plain strings (value === label) or `{ value, label }` objects. */
  options: SegmentOption[]
  /** Currently selected value (controlled / bindable). */
  value?: string
  /** Accessible name for the radiogroup, applied as aria-label. (required) */
  label: string
  /** Padding + font-size scale. @default 'md' */
  size?: SegmentSize
  /** Polymorphic root element. @default 'div' */
  as?: string
  /** Called with the newly selected value string when a segment is activated. */
  onchange?: (value: string) => void
  [key: string]: unknown
}
```

- `value` is **bindable** — declared `value = $bindable(undefined)` so consumers may use
  `bind:value`. When a segment is activated the component updates its own committed value
  AND calls `onchange(value)` (mirrors `Select` so the active state reflects the choice
  even if the caller does not feed `value` back).
- `options` accepts a heterogeneous array; each entry is normalised to `{ value, label }`
  internally: a string `o` becomes `{ value: o, label: o }`.
- `...rest` is spread onto the root container; `aria-label` defaults to `label` but an
  explicit `aria-label`/`aria-labelledby` passed via `...rest` must win.

## Acceptance criteria

Each criterion below is testable via a Storybook `play` function unless explicitly
marked visual (D42 — these are load-bearing structural/token facts asserted only where
they are the observable contract of the component, not a CSS-value sweep).

### Structure & rendering

1. The root element has `role="radiogroup"` and renders one child `<button>` per entry
   in `options`. With 3 options, `getAllByRole('radio')` returns exactly 3 elements.
2. The root element carries class `segmented` (used for scoped CSS and structural
   queries) and renders with `display: inline-flex` so it shrinks to its content width.
3. Each segment is a `<button type="button">` with `role="radio"`. (Default `<button>`
   `type` is `submit`; it must be `type="button"` so it never submits an enclosing form.)
4. Each segment's visible text is its `label`. For a string option the label equals the
   string; for a `{ value, label }` option the label is `label` and the activation value
   is `value` (asserted via the `{value,label}` story: clicking `List` selects `list`).
5. The root forwards `...rest` attributes: a story passing `id="period-sc"` and
   `data-testid="x"` produces a root element carrying both.

### Selection behaviour

6. The segment whose value equals `value` has `aria-checked="true"`; every other segment
   has `aria-checked="false"`. Exactly one segment is checked at any time.
7. Clicking an inactive segment sets it `aria-checked="true"`, clears the previously
   active segment to `aria-checked="false"`, and the new segment carries the active
   visual class (see AC-15).
8. Clicking a segment calls the `onchange` callback exactly once with that segment's
   **value** string (the `value` for `{value,label}` options, the string itself for
   string options). Clicking the already-active segment still calls `onchange` with its
   own value (idempotent re-select is allowed; the active state does not change).
9. When `value` is not supplied (undefined), no segment is checked initially
   (`aria-checked="true"` count is 0) and the first segment is the keyboard entry point
   (see AC-12). After the first click/selection, exactly one segment is checked.
10. `value` is bindable: a story using `bind:value` and clicking a segment updates the
    bound parent variable to that segment's value.

### Keyboard & ARIA (WCAG 2.1 AA — required)

11. Roving tabindex: the checked segment has `tabindex="0"`; all other segments have
    `tabindex="-1"`. When no value is selected, the **first** segment has `tabindex="0"`
    and the rest `-1`. Exactly one segment is in the tab order at any time.
12. With focus on a segment, **ArrowRight** (and **ArrowDown**) moves focus to the next
    segment and selects it (`aria-checked="true"` + `onchange` fired); **ArrowLeft** (and
    **ArrowUp**) moves to the previous segment and selects it. Navigation wraps:
    ArrowRight from the last segment focuses+selects the first; ArrowLeft from the first
    focuses+selects the last. (Automatic-activation model, consistent with RadioGroup /
    D23.)
13. **Home** focuses+selects the first segment; **End** focuses+selects the last segment.
14. The root has an accessible name: `aria-label` equals the `label` prop by default. A
    story passing an explicit `aria-label` via `...rest` overrides the `label`-derived
    value. The control passes the `@storybook/addon-a11y` audit with no violations.
    (Single-segment edge: Arrow/Home/End keep focus and selection on the only segment
    without error — mirrors Tabs' "Single Tab" story.)

### Visual & structure (D42 — assert only the load-bearing token contract)

15. The active segment has `background` resolving to `var(--amber)` and `color` resolving
    to `var(--bg)`. Inactive segments have a transparent background and `color` resolving
    to `var(--ink-faint)`. (Asserted via token resolvers, per Tabs' "Pill variant"
    precedent — these colours are the observable contract of the selected state.)
16. Segments are joined: the container has a `1px solid var(--rule-strong)` border on a
    `var(--bg-sunken)` background; each segment after the first has a
    `border-left: 1px solid var(--rule-strong)` and the first has no left border (no
    double rule, no gaps). *(Visual — verified by reviewer in Storybook; no computed-value
    sweep required beyond the active/inactive colour assertions in AC-15.)*
17. Segment labels are mono (`font-family: var(--mono)`), `text-transform: uppercase`,
    with `letter-spacing` ~`0.1em` and `white-space: nowrap`. Asserted: a segment's
    computed `textTransform` is `uppercase` and computed `fontFamily` includes
    `jetbrains`/`mono` (Tabs "Tab label typography" precedent).
18. Size affects padding and font-size: `md` (default) uses padding `7px 13px` /
    font-size `11px`; `sm` uses padding `5px 10px` / font-size `10px`. The two `size`
    stories render with the corresponding computed `fontSize` (`11px` vs `10px`),
    asserted as the observable size contract.

### CSS implementation

19. All component CSS lives in the component's scoped `<style>` block (D5) and uses
    **native CSS nesting** (D45) — no flat `.host :global(child)` selectors. All colours,
    spacing, and fonts reference design tokens (`var(--…)`) only; no hard-coded hex/rgb.
20. The component is SSR-safe (D2/D7): no `window`/`document`/`localStorage` in the render
    path. Any focus management (`element.focus()`) occurs only inside keyboard event
    handlers, which run only in the browser. No top-level browser-global access.

## Story plan

`Forms/SegmentedControl` — `SegmentedControl.stories.svelte`, `component: SegmentedControl`,
`tags: ['autodocs']`. Token assertions use `resolveTokenColor` (background) and
`resolveTokenFgColor` (foreground) from `$lib/storybook-utils.js`. Queries prefer
`getByRole('radio', { name: /…/i })`. Eight stories:

1. **Default (md, string options)** — `options={['week','month','year']}`, `value="month"`,
   `label="Period"`. Asserts AC-1, AC-2, AC-3, AC-4, AC-6 (month checked, others not),
   AC-17 (mono uppercase), AC-18 (`fontSize` `11px`).
2. **Small ({value,label} options)** — `size="sm"`,
   `options={[{value:'list',label:'List'},{value:'grid',label:'Grid'},{value:'chart',label:'Chart'}]}`,
   `value="list"`, `label="View"`. Asserts AC-4 (label/value split — `List` button selects
   `list`), AC-18 (`fontSize` `10px`).
3. **Selection interaction** — click an inactive segment; assert AC-7 (checked moves),
   AC-8 (`onchange` called once with the right value — `onchange` passed via `args` as a
   `fn()` spy or an inline closure mutating a local), and that the previously-active
   segment is cleared.
4. **Controlled (bind:value)** — composition-style story (own file or same file with a
   local `$state`) using `bind:value`; click a segment, assert AC-10 (bound variable
   updates) and the rendered checked state follows.
5. **Unselected initial state** — no `value`; assert AC-9 (zero checked) and AC-11 (first
   segment `tabindex="0"`, others `-1`); click a segment → exactly one checked.
6. **Active / inactive colours** — assert AC-15: active background `var(--amber)`, active
   color `var(--bg)`, inactive color `var(--ink-faint)`, inactive background transparent
   (`rgba(0, 0, 0, 0)`).
7. **Keyboard navigation** — mirrors Tabs' "Keyboard Navigation" story. Click first
   segment, then drive `{ArrowRight}`, `{ArrowDown}`, `{ArrowLeft}`, `{ArrowUp}`,
   `{Home}`, `{End}`, plus wrap-around at both ends. After each key assert the focused
   segment is checked and exactly one segment has `aria-checked="true"` (AC-11, AC-12,
   AC-13). Verify `onchange` fires on keyboard activation.
8. **Single segment** — one option; Arrow/Home/End keep focus + selection on the only
   segment without throwing (AC-14 edge), and `...rest` forwarding (`id`, `data-testid`)
   is asserted here or in story 1 (AC-5).

Notes for test-writer:
- `onchange` spying: pass a `fn()` from `storybook/test` in `args`, or an inline
  closure. Stories 3/7 must assert call count and the argument value.
- If `component: SegmentedControl` causes any double-render with the `bind:value` story,
  split story 4 into a `SegmentedControl.controlled.stories.svelte` sibling without
  `component:` (D9/D46 precedent). Otherwise keep all eight in one file.

## Out of scope

- Visible `<legend>`/label rendering inside the control (the `label` prop is `aria-label`
  only — a compact inline control, not a labelled fieldset).
- Disabled individual segments or a whole-control `disabled` state.
- Manual-activation keyboard model (Arrow moves focus without selecting). This item uses
  automatic activation (D23 precedent); a future `activationMode` prop could add manual.
- Multi-select / toggle-off (deselecting the active segment to a no-selection state).
- Vertical orientation, icon-only segments, badge counts, overflow/scroll handling.
- `Field` context integration (`aria-describedby`/error wiring via D24). SegmentedControl
  takes its own `aria-label`; Field integration is a possible follow-up.
- Compound sub-component API (`SegmentedControl.Item`). Options are passed as data.

## Open questions

None blocking. Resolved during writing:
- *Role choice* → `radiogroup` (decided above, D57).
- *Home category* → `forms/` (decided above, D57).
- *Activation model* → automatic, per D23/RadioGroup precedent (in AC-12).
- *Bindable vs pure-controlled value* → bindable with internal committed copy, per the
  `Select` idiom (in API + AC-10).
