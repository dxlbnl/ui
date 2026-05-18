# B31: Select design overhaul — remove amber option boxes

## Context

The `Select` component (`src/lib/components/forms/Select.svelte`) is a fully
custom listbox built with a `<button>` trigger and `<ul role="listbox">` panel
(see D10). The component works functionally, but visual inspection reveals two
styling issues:

1. **Amber border on the panel.** `.select-panel` uses `border: 1px solid var(--amber)`.
   Cross-referencing the design reference (`dexterlabs-design-system/project/preview/15-components-forms.html`),
   this is **intentional** — the panel border is amber in the design. The B31 spec
   previously stated this should be `--rule`, which was incorrect.

2. **Checkmark not right-aligned.** The selected option renders `{#if}` + `<span class="select-check">✓</span>` as a sibling to the text node inside the flex `<li>`. Svelte comment anchors inserted by `{#if}` can disrupt `justify-content: space-between`. The design reference uses a `::after` pseudo-element on `.selected` — this is reliable, CSS-only, and matches the design exactly.

3. **`:global(.select .btn)` audit.** Trigger button styles use `:global(.select .btn …)` — retaining `:global` is required (Button child renders outside this component's scoped class) but all rules must be audited to ensure no `amber` fills appear on the trigger in its default state.

The intended form-control appearance for Select at rest is identical to `Input`:
`var(--bg-sunken)` background, `var(--ink)` text, `var(--rule-strong)` border,
amber border only on focus/active/open, `var(--danger)` border on error.

Related wiki pages:
- [requirements.md](../requirements.md) — R6: Form components share the `.input` base style
- [architecture.md](../architecture.md) — component authoring conventions, scoped CSS,
  strict TypeScript
- [decisions.md](../decisions.md) — D10 (Select is fully custom; no native `<select>`)
- [backlog/doing/B31-select-design.md](../backlog/doing/B31-select-design.md) — item card

### Files affected

| File | Change |
|------|--------|
| `src/lib/components/forms/Select.svelte` | Fix panel border token; audit all `:global` trigger rules for incorrect amber fills |
| `src/lib/components/forms/Select.stories.svelte` | Add play-function assertions for correct token values on trigger and panel |

---

## Acceptance criteria

### Trigger (`.select .btn`) — at rest

#### AC-1 — Background token at rest

`getComputedStyle(trigger).backgroundColor` equals the resolved value of
`var(--bg-sunken)`. The trigger must not render with `var(--amber)` or any
amber/orange fill in its default (closed, non-hover) state.

#### AC-2 — Text color token at rest

`getComputedStyle(trigger).color` equals the resolved value of `var(--ink)`.

#### AC-3 — Border color token at rest

`getComputedStyle(trigger).borderColor` (or `borderTopColor` / `borderRightColor` /
`borderBottomColor` / `borderRightColor` — all four sides) equals the resolved value of
`var(--rule-strong)` when the panel is closed and `error` is false.

#### AC-4 — Amber border on open state only

When the panel is open (trigger has class `open`):
- `getComputedStyle(trigger).borderColor` equals the resolved value of `var(--amber)`.
- The trigger background remains `var(--bg-sunken)` — no amber background fill.

#### AC-5 — Danger border on error state

When `error={true}` and the panel is closed, `getComputedStyle(trigger).borderColor`
equals the resolved value of `var(--danger)`. This AC already has coverage in the
existing `Error State` story; this spec restates it for completeness.

#### AC-6 — No amber fill in any trigger state

`getComputedStyle(trigger).backgroundColor` is never equal to the resolved value of
`var(--amber)` in any of the following states: default closed, open, error, disabled.
This is the primary regression guard for the bug described in the item card.

---

### Panel (`.select-panel`) — open state

#### AC-7 — Panel border uses amber token

When the panel is open, the `.select-panel` element's `getComputedStyle().borderColor`
(or `borderTopColor`) equals the resolved value of `var(--amber)`.

Rationale: The design reference (`15-components-forms.html`, `.dxl-panel`) uses
`border: 1px solid var(--amber)` on the panel. Amber border on the panel is intentional
and correct.

#### AC-8 — Panel background

`getComputedStyle(panel).backgroundColor` equals the resolved value of `var(--bg-elev)`.

---

### Option items (`.select-option`) — open state

#### AC-9 — Default option color

Unselected, non-highlighted option items have `color` equal to the resolved value of
`var(--ink-dim)`.

#### AC-10 — Selected option color

The option with `aria-selected="true"` has `color` equal to the resolved value of
`var(--amber)`. This is the intentional amber accent for the selected state (text
color accent, not background fill).

#### AC-10b — Selected option checkmark is right-aligned via `::after`

The selected option's `✓` checkmark is rendered via a CSS `::after` pseudo-element
on `.select-option.selected` — NOT via a child `<span>`. The design reference uses
`.dxl-option.selected::after { content: '✓'; font-size: 11px; color: var(--amber); }`.
The `<li>` uses `display: flex; justify-content: space-between`, so the `::after`
element is pushed to the right edge. No `{#if}` block or child element for the
checkmark exists in the template.

#### AC-11 — Highlighted option background

The option with class `highlighted` has `getComputedStyle().backgroundColor` equal to
the resolved value of `var(--bg-rail)`. It must not be amber.

#### AC-12 — Highlighted option outline uses amber token

The option with class `highlighted` has `getComputedStyle().outlineColor` equal to the
resolved value of `var(--amber)`. (`outline: 2px solid var(--amber); outline-offset: -2px`
is the intended keyboard-highlight style — this is correct and must be preserved.)

---

### Token correctness — play function coverage

#### AC-13 — New story: `Trigger Tokens`

A new story named `"Trigger Tokens"` (or `"Design Tokens"`) is added to
`Select.stories.svelte`. Its play function:

1. Renders the Select in its closed default state.
2. Asserts `getComputedStyle(trigger).backgroundColor` equals `resolveTokenColor('--bg-sunken')`.
3. Asserts `getComputedStyle(trigger).color` equals `resolveTokenColor('--ink')`.
4. Asserts `getComputedStyle(trigger).borderTopColor` equals `resolveTokenColor('--rule-strong')`.

This story fails before the fix (because `--rule-strong` border may have regressed to
`--amber` in some states) and passes after.

#### AC-14 — New story: `Panel Tokens`

A new story named `"Panel Tokens"` is added. Its play function:

1. Opens the panel by clicking the trigger.
2. Queries `canvas.getByRole("listbox")` to get the panel element.
3. Asserts `getComputedStyle(panel).borderTopColor` equals `resolveTokenColor('--amber')`.
4. Asserts `getComputedStyle(panel).backgroundColor` equals `resolveTokenColor('--bg-elev')`.

Rationale: panel border is amber per design reference — `--amber`, not `--rule`.

---

### Build health

#### AC-15 — `pnpm check` passes with 0 errors

After all changes, running `pnpm check` produces zero TypeScript errors. No
`@ts-ignore`, no `as any` casts are introduced. No new Svelte compilation warnings.

#### AC-16 — Existing stories remain green

All existing Select stories (`Default`, `Open Panel`, `With Selection`, `Disabled`,
`Error State`, `Keyboard Navigation`) continue to pass without modification to their
play function assertions.

---

## Out of scope

- **Native `<select>` / `<option>` styling.** The component uses a fully custom
  listbox (D10). Styling native `<option>` elements is explicitly not attempted.
- **Hover state token assertions.** `getComputedStyle` in play functions reflects the
  computed style at rest, not hover. CSS hover state correctness (`:hover` changes
  `border-color` to `var(--amber)`) is accepted as a visual review task, not a
  play-function test.
- **Keyboard navigation behaviour changes.** B15 delivered the full ARIA Listbox
  keyboard pattern. B31 is purely a visual/CSS fix and must not alter any JavaScript
  logic.
- **Refactoring `:global` selectors.** The `:global(.select .btn …)` approach is a
  known limitation of styling a child Svelte component from a parent (see
  `composition-limits.md`). B31 audits existing `:global` rules for correctness but
  does not refactor the approach itself — that is a future chore.
- **`--bg-dim` hover on option items.** The item card mentions `var(--bg-dim)` for
  option hover. The current implementation uses `var(--bg-rail)` on hover, which is
  visually equivalent. B31 does not change option hover tokens — only the panel border.

---

## Open questions

OQ-1 — **`--rule` vs `--rule-strong` for the panel border.** The panel is a floating
surface, not a focused input. `--rule` (1 px subtle border) is specified here.
`--rule-strong` would make the panel match the trigger border weight. Either is
defensible; `--rule` is chosen for visual differentiation. If Dexter prefers
`--rule-strong`, this can be changed without re-speccing.

OQ-2 — **Trigger border-left widening on open.** The current CSS sets
`border-left-width: 3px` on `.btn.open`. This means the four border sides are
`resolveTokenColor('--amber')` but widths differ (3 px left, 1 px others). The test in
AC-4 asserts `borderColor` (which checks all four sides are equal). If `borderColor` is
reported as the shorthand only when all sides match, the test may need to assert
`borderTopColor` instead. The test-writer should check which `getComputedStyle` property
is reliable across browsers for this case.

No blocking questions — this item is ready for implementation.
