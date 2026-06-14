# B55: Pager component

## Context

Port the design-system `Pager` — a controlled prev / label / next stepper — into
`@dxlbnl/ui` as a Svelte 5 component in the `navigation/` category. It steps through
pages of results (months, search-result pages, log windows) and disables its arrows at
the range edges. The consumer owns the current-page state; `Pager` is purely
presentational + emits `onPrev` / `onNext`.

Wiki references:
- Item card: [`wiki/backlog/doing/B55-pager.md`](../backlog/doing/B55-pager.md)
- [`requirements.md`](../requirements.md) — R5 (Navigation), Constraints (Svelte 5 runes,
  SSR-safe, WCAG 2.1 AA, strict TS, Chakra-style `as` + `...rest`)
- [`architecture.md`](../architecture.md) — authoring conventions, test harness
- Standing Rules: [D4](../decisions.md#d4-chakra-style-composable-components--strict-typescript)
  (composability), [D45](../decisions.md#d45-native-css-nesting-required----global-blocks-and-all-component-style-blocks)
  (native CSS nesting), [D52](../decisions.md#d52-b49--nav-dismiss-listeners-rely-on-effect-only-ssr-safety-not-a-browser-import)
  (no `$app/environment` import in this project)
- Design reference (downstream React — reference only, library is canonical):
  `wiki/specs/_design-refs/B55/Pager.jsx`, `…/preview-28-pager.html`

### Design reference behaviour

A `<div style="inline-flex">` (border `1px solid var(--rule-strong)`, bg
`var(--bg-rail)`) wrapping two `<button>`s (`‹` and `›`) flanking a centered uppercase
mono `<span>` label. Arrow buttons: padding `6px 12px`, mono `14px`, colour
`var(--ink-dim)` enabled / `var(--rule-strong)` disabled, `cursor: not-allowed` when
disabled, native `disabled` attribute. Label: mono `12px`, `letter-spacing: 0.08em`,
uppercase, `var(--ink)`, padding `0 10px`, `min-width` (default `132`), centered. React
props: `label`, `onPrev`, `onNext`, `prevDisabled`, `nextDisabled`, `minWidth`.

### Key decisions for this port (see Open questions for rationale, logged to decisions Archive)

- **Native `<button>`, not the `Button` primitive.** The arrow styling is bespoke
  (6px/12px padding, mono 14px, `--ink-dim`/`--rule-strong` colours, `not-allowed`
  cursor) and matches none of `Button`'s six variants; forcing `Button` here would mean
  fighting its variant defaults. This is an accepted, narrow exception to D38 — the same
  reasoning that produced D49 (ProductCard plain `<p>`) and D54/StatusPill's native
  trigger. The glyph buttons are plain native `<button>` elements with scoped CSS.
- **A11y: `<nav aria-label>` landmark + explicit button names + `aria-live` label.** The
  glyphs `‹`/`›` are punctuation and convey no accessible name, so each arrow button
  needs an explicit name via `aria-label` (props `prevLabel` / `nextLabel`, defaults
  `'Previous'` / `'Next'`). The root is a `<nav>` with an `aria-label` (default
  `'Pagination'`) so it is a discoverable landmark. The label `<span>` is an
  `aria-live="polite"` region so a screen-reader user hears the new page label announced
  when the consumer updates it after a click.

## API

Component: `src/lib/components/navigation/Pager.svelte`. Props interface extends
`HTMLAttributes<HTMLElement>` (the root is a `<nav>`), spreads `...rest` onto the root,
and uses native CSS nesting (D45). Strict TS, no `any` (D4).

| Prop           | Type                  | Default        | Purpose |
| -------------- | --------------------- | -------------- | ------- |
| `label`        | `string`              | — (required)   | The centered page label, rendered uppercase mono. |
| `onPrev`       | `() => void`          | `undefined`    | Called when the prev (`‹`) button is clicked and not disabled. |
| `onNext`       | `() => void`          | `undefined`    | Called when the next (`›`) button is clicked and not disabled. |
| `prevDisabled` | `boolean`             | `false`        | Disables the prev button (native `disabled`, no `onPrev`). |
| `nextDisabled` | `boolean`             | `false`        | Disables the next button (native `disabled`, no `onNext`). |
| `minWidth`     | `number`              | `132`          | Min width of the label span, in px. |
| `prevLabel`    | `string`              | `'Previous'`   | Accessible name (`aria-label`) for the prev button. |
| `nextLabel`    | `string`              | `'Next'`       | Accessible name (`aria-label`) for the next button. |
| `aria-label`   | `string`              | `'Pagination'` | Landmark label for the root `<nav>`. Passed via `...rest`; the component sets this default when the consumer does not. |
| `as`           | `string`              | `'nav'`        | Polymorphic root element (D4). |
| `...rest`      | `HTMLAttributes`      | —              | Forwarded onto the root element. |

Notes:
- `minWidth` is a `number` (px), matching the reference; the component applies it as
  `min-width: {minWidth}px` on the label.
- `onPrev` / `onNext` are optional so a disabled-edge pager can be rendered without
  dummy callbacks (the reference passes `() => {}`; here `undefined` is fine because a
  disabled button never fires).

## Acceptance criteria

The contract. Each is testable via a Storybook `.stories.svelte` play function importing
from `storybook/test` (NEVER `vitest`, per bug B61). Spies use `fn` from `storybook/test`
(precedent: `SegmentedControl.stories.svelte`, `Nav.stories.svelte`).

### Behaviour

1. **Label renders.** Given `label="Jun 2026"`, the component renders the text
   `Jun 2026` in a centered span. The text content is present in the DOM (visual case is
   uppercase via CSS `text-transform`, so the DOM text remains the verbatim prop value).
2. **Prev click fires `onPrev`.** With both arrows enabled, clicking the prev (`‹`)
   button calls `onPrev` exactly once. (Assert via `fn()` spy + `toHaveBeenCalledTimes(1)`.)
3. **Next click fires `onNext`.** With both arrows enabled, clicking the next (`›`)
   button calls `onNext` exactly once.
4. **`prevDisabled` sets the native disabled attribute.** With `prevDisabled={true}`, the
   prev button has the native `disabled` attribute (`button.disabled === true` /
   `getByRole('button', { name: 'Previous' })` is disabled).
5. **Disabled prev does not fire `onPrev`.** With `prevDisabled={true}`, attempting to
   click the prev button does NOT call `onPrev` (`fn()` spy `not.toHaveBeenCalled()`).
6. **`nextDisabled` sets the native disabled attribute.** With `nextDisabled={true}`, the
   next button has the native `disabled` attribute.
7. **Disabled next does not fire `onNext`.** With `nextDisabled={true}`, attempting to
   click the next button does NOT call `onNext`.
8. **Both enabled independently.** A mid-range pager (`prevDisabled=false`,
   `nextDisabled=false`) has both buttons enabled, and each fires only its own callback
   when clicked (clicking prev does not call `onNext`, and vice versa).

### Accessibility

9. **Both arrow buttons have accessible names.** The prev button is queryable by
   `getByRole('button', { name: 'Previous' })` and the next by `{ name: 'Next' }`
   (defaults). Custom `prevLabel`/`nextLabel` props override these names.
10. **Nav landmark.** The root is a `<nav>` landmark queryable by
    `getByRole('navigation', { name: 'Pagination' })` (default `aria-label`). A
    consumer-supplied `aria-label` via `...rest` overrides the default.
11. **Disabled buttons are not activatable.** A button with the native `disabled`
    attribute does not invoke its callback on click (covered by AC-5/AC-7) — native
    `disabled` also removes it from the tab order, satisfying "not focusable-activatable".
12. **Label is a polite live region.** The label span carries `aria-live="polite"` so
    page-label changes after a click are announced to AT. (Assert the attribute is
    present on the label element.)

### Visual / structure (load-bearing tokens only, per D42)

These are part of the contract because they are the design's defining visual tokens; they
are asserted via computed style + token resolution (`resolveTokenColor` /
`resolveTokenFgColor` from `$lib/storybook-utils.js`, per
[D37](../decisions.md#d37-b31-test-writer--resolvetokenfgcolor-for-textborder-assertions-vs-resolvetokencolor-for-background-assertions)).

13. **Container surface.** The root is `display: inline-flex`, `align-items: center`,
    with a `1px solid` border resolving to `--rule-strong` and a background resolving to
    `--bg-rail`.
14. **Arrow buttons — enabled colour & metrics.** An enabled arrow button has
    `font-family` containing JetBrains Mono (`var(--mono)`), `font-size: 14px`, padding
    `6px 12px`, `cursor: pointer`, and `color` resolving to `--ink-dim`.
15. **Arrow buttons — disabled colour.** A disabled arrow button has `color` resolving to
    `--rule-strong` and `cursor: not-allowed`.
16. **Label typography.** The label span has `font-family` containing JetBrains Mono,
    `font-size: 12px`, `letter-spacing: 0.08em`, `text-transform: uppercase`, `color`
    resolving to `--ink`, padding `0 10px`, `text-align: center`, and
    `min-width: 132px` by default. Passing `minWidth={180}` yields `min-width: 180px`.

### CSS / authoring

17. **Scoped CSS, native nesting.** All styling lives in the component's `<style>` block,
    scoped by Svelte. Native CSS nesting per D45 — no flat `.host :global(child)`
    selectors. (Reviewer-verified; not a play-fn assertion.)
18. **Only existing tokens; literal px where no token fits.** The CSS references only
    tokens that exist in `src/lib/tokens/tokens.css` (`--rule-strong`, `--bg-rail`,
    `--ink-dim`, `--ink`, `--mono`). The font-sizes `14px` (arrows) and `12px` (label),
    the paddings `6px 12px` / `0 10px`, the `letter-spacing: 0.08em`, and `min-width`
    are written as **literal values** — there is no spacing/size token that matches them,
    and the house convention permits literal px for micro-labels (e.g.
    `StatusPill.svelte` uses literal `11px`, `Breadcrumb.svelte` literal `11px`/`6px`).
    Do **NOT** invent tokens (regression guard for B62, which referenced the
    non-existent `--u1`). (Reviewer-verified.)

### Wiring

19. **Exports.** `Pager` is exported from `src/lib/components/navigation/index.ts` and
    re-exported from `src/lib/index.ts` (the package barrel). (Implementer's job;
    reviewer-verified — no INDEX row.)

## Story plan

File: `src/lib/components/navigation/Pager.stories.svelte`, Svelte CSF,
`title: 'Navigation/Pager'`, `component: Pager`, `tags: ['autodocs']`. Import
`{ expect, within, fn }` from `storybook/test`; import
`{ resolveTokenColor, resolveTokenFgColor }` from `$lib/storybook-utils.js`. Pass spies
via `args.onPrev` / `args.onNext` and assert them through `args` in the play function
(precedent: `SegmentedControl.stories.svelte` uses `args.onchange`).

1. **Mid Range** — `args: { label: 'May 2026', onPrev: fn(), onNext: fn(),
   prevDisabled: false, nextDisabled: false }`. Covers AC-1 (label text), AC-2 (click
   prev → `args.onPrev` called once), AC-3 (click next → `args.onNext` called once),
   AC-8 (each callback fires only for its own button), AC-9 (both buttons by accessible
   name), AC-10 (nav landmark), AC-12 (label `aria-live`), AC-13/14/16 (container,
   enabled arrow, label tokens).
2. **Prev Disabled (first item)** — `args: { label: 'Mar 2026', onPrev: fn(),
   onNext: fn(), prevDisabled: true, nextDisabled: false }`. Covers AC-4 (prev has
   `disabled` attr), AC-5 (clicking prev does NOT call `args.onPrev`), AC-15 (disabled
   arrow colour `--rule-strong` + `not-allowed`); positive control: clicking the enabled
   next button DOES call `args.onNext` once (proves the wiring is live, so the AC-5
   negative is non-vacuous).
3. **Next Disabled (last item)** — `args: { label: 'Jun 2026', onPrev: fn(),
   onNext: fn(), prevDisabled: false, nextDisabled: true }`. Covers AC-6 (next has
   `disabled` attr), AC-7 (clicking next does NOT call `args.onNext`); positive control:
   clicking the enabled prev button DOES call `args.onPrev` once.
4. **Accessibility & Custom Width** — `args: { label: 'Page 3 of 9', onPrev: fn(),
   onNext: fn(), prevLabel: 'Previous page', nextLabel: 'Next page', minWidth: 180,
   'aria-label': 'Result pages' }`. Covers AC-9 (custom button names), AC-10 (custom nav
   label), AC-16 (`min-width: 180px`). The `@storybook/addon-a11y` audit on every story
   provides the AA check.

Four stories. Together they assert AC-1 through AC-16 (behaviour + a11y + visual). AC-17,
AC-18, AC-19 are reviewer-verified (CSS authoring + wiring — not play-fn-assertable).

## Out of scope

- **Numbered page buttons / page-indicator dots.** The card mentions "page indicators",
  but the design reference is a prev/label/next stepper only. A numbered variant is a
  future item.
- **First/last (`«`/`»`) jump buttons.**
- **Internal page-state management.** `Pager` is controlled — the consumer owns the
  current index and computes `label`, `prevDisabled`, `nextDisabled`. No `$state`,
  `$effect`, or browser APIs are used (SSR-safe by construction).
- **Keyboard arrow-key navigation between the two buttons** beyond native `<button>`
  Tab/Enter/Space, which is provided for free.
- **Compound sub-components** (`Pager.Prev`, etc.).

## Open questions

None blocking. Resolved during writing (rationale moved to the AC bodies and to
decisions Archive):

- Native `<button>` vs `Button` primitive → native (AC bodies; D38 exception logged).
- A11y approach (nav landmark, explicit button names, `aria-live` label) → adopted
  (AC-9/10/12; logged).
- `onPrev`/`onNext` optionality → optional (a disabled-edge pager needs no callback).
