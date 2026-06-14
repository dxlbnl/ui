# B59: Accordion sticky-header behaviour

## Context

B59 folds the design system's **"sticky sections"** behaviour into the **existing**
`Accordion` / `AccordionItem` components as an **opt-in `sticky` prop**. It is an
enhancement, not a new component (per the item card and user direction 2026-06-14).

When `sticky` is on and the accordion is rendered inside a scroll container, each
section header (`<summary>`) gets `position: sticky` with a computed `top` offset (the
cumulative height of the headers **above** it) and `bottom` offset (the cumulative
height of the headers **below** it), plus a tiered `z-index`. As the user scrolls a tall
open list, the headers **tile** into a top stack and a bottom stack instead of all
piling onto the same edge and overlapping. Header heights are measured live in the
browser (ResizeObserver), falling back to a fixed `fallbackHeaderHeight` (46) before
measurement / during SSR.

When `sticky` is off (the **default**), behaviour is **exactly as today** — zero
regression. All existing Accordion stories must continue to pass.

Related wiki pages:
- Item card: [backlog/doing/B59-accordion-sticky-headers.md](../backlog/doing/B59-accordion-sticky-headers.md)
- [requirements.md](../requirements.md) — R10 (Accordion), SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TS
- [architecture.md](../architecture.md) — component authoring conventions, scoped CSS, story format
- [specs/B10-accordion-tabs-table.md](B10-accordion-tabs-table.md) — original Accordion contract (native `<details>`/`<summary>`, composition pattern)
- [specs/B17-navigation-enhancements.md](B17-navigation-enhancements.md) — prior `AccordionItem` CSS enhancement (height animation)
- [decisions.md](../decisions.md) — D16 (native `<details>`), D45 (native CSS nesting), D52 (no `$app/environment` import; `$effect`-only SSR-safety), D62 (only existing tokens — do not invent), D68 (this item)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format, token-probe helpers
- Design reference (React, reference only): [_design-refs/B59/Accordion.jsx](_design-refs/B59/Accordion.jsx)

---

## Existing component — what is there today

- **`Accordion.svelte`** — `<div class="accordion" {...rest}>` wrapper, renders a single
  `children` snippet. Scoped `.accordion` rule: flex column + `1px solid var(--rule)`
  border. No `$state`, no context.
- **`AccordionItem.svelte`** — native `<details class="acc-item" {open}>` containing
  `<summary class="acc-trigger">` (with `.acc-title` + `.acc-icon` `›` glyph) and a
  sibling `<div class="acc-body">`. Props: `label: string`, `open?: boolean`,
  `children: Snippet`. Open/close is **browser-owned** (native `<details>`), no `$state`.
  Includes a `@supports (interpolate-size: allow-keywords)` height-animation block (B17).
- **Composition pattern**: items are passed as **snippet children**, not an items array.
  The `Accordion` wrapper does **not** enumerate its children — they are opaque.

This composition pattern means the wrapper cannot directly measure each header's height.
B59 therefore coordinates measurement via a **Svelte context registry** (see below).

---

## Design decisions for this item

### Sticky-offset measurement approach (the registry-context model)

Because the cumulative top/bottom offsets for header *i* depend on the heights of **all**
sibling headers, and the wrapper cannot see opaque snippet children, B59 uses a
**context-backed registry**:

1. **`Accordion` owns the registry.** When `sticky` is true, `Accordion` creates a
   reactive registry in `$state` and provides it via `setContext` under the key
   `'dxl-accordion-sticky'`. The registry value is **null** when `sticky` is false (so
   items detect non-sticky mode and stay inert).
2. **Each `AccordionItem` registers on mount.** When the context registry is present, the
   item registers itself and receives a stable **index** reflecting DOM/registration
   order. It writes its measured header height into `registry.heights[index]`.
3. **Measurement is browser-only and SSR-safe.** Each item binds its `<summary>` element
   with `bind:this` and, inside a single `$effect` (which runs **only in the browser**
   after hydration — no `$app/environment` import per **D52**), reads
   `summaryEl.offsetHeight` into the registry and observes the element with a
   `ResizeObserver`. The `$effect` returns a cleanup that disconnects the observer and
   deregisters the item. Until measured (and during SSR), the height is treated as
   `fallbackHeaderHeight` (default **46**).
4. **Offsets are derived centrally and read back per item.** The registry exposes, as
   `$derived` reads, for a given index `i` (with `n` total registered items and
   `h(k)` = measured height of item `k` or `fallbackHeaderHeight`):
   - `topOffset(i) = Σ h(k) for k in [0, i)` — cumulative height of headers above.
   - `bottomOffset(i) = Σ h(k) for k in (i, n)` — cumulative height of headers below.
   - `zIndex(i) = 10 + (n - i)` — earlier headers stack above later ones.
5. **The item applies the offsets to its `<summary>`.** When sticky, the `<summary>` gets
   `data-sticky="true"` and an inline
   `style="top:{topOffset}px;bottom:{bottomOffset}px;z-index:{zIndex}"`. `position: sticky`
   and the sticky surface/border tokens are applied via **scoped CSS** keyed on
   `[data-sticky="true"]` (native nesting, D45) — only the dynamic numeric offsets live in
   the inline `style`. When not sticky, `data-sticky` is absent and no inline offset style
   is emitted (the `<summary>` keeps exactly its current markup → regression-safe).

This keeps the existing composition / native-`<details>` contract (D16) intact: open/close
stays browser-owned, and sticky is **purely visual / positional** — no ARIA or disclosure
semantics change.

> Logged as **D68** in `decisions.md`.

### Companion props adopted

- **`sticky?: boolean`** (default `false`) — on `Accordion`. The single feature switch.
- **`fallbackHeaderHeight?: number`** (default `46`) — on `Accordion`. Used as the
  per-header height before live measurement and during SSR, matching the reference. It is
  forwarded to items via the registry context (items do not take it as a prop).

**Companion props deliberately NOT adopted** (the reference has them, but they are out of
B59's tight scope and the existing Accordion does not need them for sticky to work):
`multiple`, `controlled` (`openIds` / `onToggle`), `defaultOpenIds`, and `flush`. The
existing native `<details>` already gives independent multi-open behaviour for free, so
`multiple` is moot; controlled state is out of scope (consistent with B10/D16). `flush`
(zero body padding) is **not** required for sticky positioning to work — `position:
sticky` on the header is independent of body padding — so it is excluded to keep scope
tight. See **Out of scope**.

---

## Acceptance criteria

The acceptance criteria are the contract. Token-color assertions use the probe helpers
from `$lib/storybook-utils.js` (`resolveTokenColor` for background/border, per D37).
Numeric `top`/`bottom` offsets are asserted from **known/fallback header heights** and may
need small numeric tolerance (parse the inline `style` value rather than relying on
`getComputedStyle` px rounding).

### Prop API

1. `Accordion` accepts a `sticky?: boolean` prop defaulting to `false`. The `sticky` and
   `fallbackHeaderHeight` props are **not** spread onto the root `<div>` via `...rest`
   (they are consumed, not forwarded as DOM attributes).
2. `Accordion` accepts a `fallbackHeaderHeight?: number` prop defaulting to `46`.
3. With no `sticky` prop (or `sticky={false}`), `Accordion` renders an identical DOM to
   today: root `<div class="accordion">`, no sticky context, and child `<summary>`
   elements carry **no** `data-sticky` attribute and **no** inline `top`/`bottom`/`z-index`
   style.
4. Strict TypeScript: `sticky` is optional `boolean`, `fallbackHeaderHeight` is optional
   `number`; `AccordionProps` still extends `HTMLAttributes<HTMLDivElement>`. `pnpm check`
   passes with zero errors. `AccordionItem`'s public props are unchanged (`label`, `open`,
   `children`) — no new public prop is added to `AccordionItem`.

### Sticky positioning behaviour (sticky mode)

5. When `Accordion sticky` is set, every child `AccordionItem`'s `<summary class="acc-trigger">`
   has `data-sticky="true"`.
6. Each sticky `<summary>` has computed `position: sticky` (assert via
   `getComputedStyle(summary).position === 'sticky'` — computed `position` is reliable).
7. Each sticky `<summary>` carries an inline `style` whose `top` equals the cumulative
   height of the headers **above** it: for item index `i`, `top = Σ height(k)` for
   `k < i`. Before live measurement settles, each `height(k)` is `fallbackHeaderHeight`,
   so item 0 → `top: 0px`, item 1 → `top: 46px`, item 2 → `top: 92px` (with the default
   fallback). The test asserts the parsed inline `top` value against this arithmetic.
8. Each sticky `<summary>` carries an inline `style` whose `bottom` equals the cumulative
   height of the headers **below** it: for item index `i` of `n` items,
   `bottom = Σ height(k)` for `k > i`. With the default fallback and 3 items: item 0 →
   `bottom: 92px`, item 1 → `bottom: 46px`, item 2 → `bottom: 0px`.
9. Each sticky `<summary>` carries an inline `z-index` of `10 + (n - i)` (so earlier
   headers sit above later ones). With 3 items: item 0 → `13`, item 1 → `12`, item 2 →
   `11`.
10. The offsets are **measured live**: when a header's rendered height differs from
    `fallbackHeaderHeight`, the `top`/`bottom` offsets of the sibling headers update to
    reflect the measured cumulative heights (driven by the `$effect` + `ResizeObserver`).
    (The "Default fallback offsets" story asserts the fallback arithmetic; this AC is
    satisfied by the measurement wiring described under Design decisions and is verified by
    the reviewer plus the offsets being non-zero/consistent once rendered.)

### Sticky structure & style (sticky mode)

11. Each sticky `<summary>` has computed `background-color` resolving to `var(--bg-sunken)`
    (probe via `resolveTokenColor('--bg-sunken')`).
12. Each sticky `<summary>` has a top border and a bottom border resolving to
    `var(--rule-strong)` (`borderTopColor` / `borderBottomColor` via
    `resolveTokenColor('--rule-strong')`, `1px solid`).
13. The sticky surface/border rules are applied via **scoped CSS** keyed on
    `[data-sticky="true"]` using native nesting (D45); only the numeric
    `top`/`bottom`/`z-index` values appear in the element's inline `style` attribute.

### Non-sticky regression (default mode)

14. With `sticky` absent/false, `getComputedStyle(summary).position` is **not** `'sticky'`
    (it is the default `static`) for every `<summary>`.
15. With `sticky` absent/false, no `<summary>` has a `data-sticky` attribute and no
    `<summary>` carries an inline `top`/`bottom`/`z-index` style.
16. With `sticky` absent/false, the open/close toggle, icon rotation, amber/ink-faint icon
    color, and trigger background tokens (`--bg-rail` closed, `--bg-elev` open) behave
    exactly as in B10 — the existing "Default", "All Closed", "Toggle Interaction", "Rich
    Body", "Wrapper Border", "Item Borders", "Animated", "No Inline Border Style", and
    "Attribute Forwarding" stories all still pass unchanged.

### SSR safety

17. No component file introduced or modified by B59 imports from `$app/environment` (per
    D52). The browser-only measurement runs inside a Svelte `$effect` (which executes only
    in the browser after hydration). `ResizeObserver`, `offsetHeight`, and any DOM
    measurement are accessed **only** inside that `$effect` or event handlers — never in
    the render/initialisation path.
18. With no measurement having run (SSR / first paint), the sticky offsets resolve from
    `fallbackHeaderHeight` so the markup is well-formed and renders without error; nothing
    throws if `ResizeObserver` runs before/after the element is connected.

### Accessibility & semantics

19. Sticky mode does **not** change disclosure semantics: each item remains a native
    `<details>` with a `<summary>`; no `role`, `aria-expanded`, or other ARIA attribute is
    added or removed by `sticky`. Open/close remains browser-owned (D16).
20. The a11y addon reports zero violations for the new sticky stories.

### Exports / no API break

21. `Accordion` and `AccordionItem` remain exported from
    `src/lib/components/data/index.ts` and re-exported from `src/lib/index.ts`. No export
    is renamed or removed.

---

## Story plan

All stories live in the existing `src/lib/components/data/Accordion.stories.svelte`
(append; do not remove or alter existing stories). Use `storybook/test`
(`expect`, `within`, `waitFor`) and `resolveTokenColor` from `$lib/storybook-utils.js`.

Sticky stories must render the `<Accordion sticky>` inside a **fixed-height scroll
container** (an outer `<div style="height:200px;overflow:auto">` wrapping the Accordion)
so `position: sticky` has a scroll context — the reference notes sticky "needs a real
scroll-container ancestor; breaks under overflow:hidden", so the wrapper must use
`overflow:auto` (not `hidden`). Give the items tall bodies and set them open so the list
is scrollable.

### Story 1 — "Sticky Headers" (behaviour + structure)

`<Accordion sticky>` with 3 `AccordionItem`s (all `open`, tall bodies) inside a
height-constrained `overflow:auto` wrapper. Play function asserts:
- All three `<summary class="acc-trigger">` have `data-sticky="true"` (AC-5).
- `getComputedStyle(summary).position === 'sticky'` for each (AC-6).
- The parsed inline `top` offsets match the cumulative-above arithmetic from the default
  `fallbackHeaderHeight` (item 0 → `0px`, item 1 → `46px`, item 2 → `92px`), allowing a
  small numeric tolerance (AC-7).
- The parsed inline `bottom` offsets match the cumulative-below arithmetic (item 0 →
  `92px`, item 1 → `46px`, item 2 → `0px`), with tolerance (AC-8).
- The inline `z-index` values are `13`, `12`, `11` for items 0, 1, 2 (AC-9).
- Each `<summary>` computed `background-color` equals `resolveTokenColor('--bg-sunken')`
  (AC-11) and `borderTopColor`/`borderBottomColor` equal `resolveTokenColor('--rule-strong')`
  with `1px solid` (AC-12).

> Tolerance note: parse the numeric px from the **inline `style`** (`summary.style.top`)
> rather than `getComputedStyle`, which may round or resolve sticky offsets differently.
> Assert with `Math.abs(parsed - expected) <= 1`.

### Story 2 — "Custom Fallback Height" (offset arithmetic with a non-default fallback)

`<Accordion sticky fallbackHeaderHeight={60}>` with 3 open items inside the scroll
wrapper. Play function asserts the inline `top` offsets follow the new fallback before
measurement settles (item 0 → `0px`, item 1 → `60px`, item 2 → `120px`, with tolerance)
— proving `fallbackHeaderHeight` feeds the offset arithmetic (AC-2, AC-7).

> If, in the test browser, live measurement settles before the assertion (real `<summary>`
> height ≠ 60), the test-writer asserts the **measured** cumulative arithmetic instead:
> `top(i) = Σ measuredHeight(k)` for `k < i`, reading each summary's `offsetHeight`. Either
> way the arithmetic (cumulative sum of header heights) is the asserted contract; this is
> flagged in Open questions OQ-1.

### Story 3 — "Non-Sticky (regression guard)"

`<Accordion>` (no `sticky`) with 2 items inside the same wrapper. Play function asserts:
- No `<summary>` has `data-sticky` (AC-15).
- `getComputedStyle(summary).position !== 'sticky'` for each (AC-14).
- No `<summary>` carries an inline `top`/`bottom`/`z-index` style (AC-15).

(The existing "Default", "Toggle Interaction", etc. stories already cover the rest of the
non-sticky contract for AC-16.)

---

## Out of scope

- **`multiple` prop** — the existing native `<details>` already allows independent
  multi-open; no single-open coordination is added.
- **Controlled mode** (`openIds` / `onToggle` / `defaultOpenIds`) — open state stays
  browser-owned (D16). Programmatic control remains a consumer concern via the reactive
  `open` prop, unchanged from B10.
- **`flush` (zero body padding)** — not required for sticky positioning; excluded to keep
  scope tight. Bodies keep their existing padding.
- **Section `count` / `controls` slots** from the reference header — not part of the
  existing Accordion API; not added here.
- **Glyph change** — the reference uses `▸`/`▾`; the existing component uses the rotating
  `›`. No glyph change is made.
- **Sticky inside `overflow:hidden`** — `position: sticky` requires a real scroll
  ancestor; behaviour under `overflow:hidden` is a documented limitation, not handled.
- **Animation of the sticky tiling** — purely positional; no transition is added beyond
  the existing trigger background transition.

---

## Open questions

**OQ-1** (non-blocking): In the Vitest/Playwright browser, the `ResizeObserver`-driven
measurement may settle before a play function asserts, replacing the `fallbackHeaderHeight`
arithmetic with **measured** header heights. The acceptance contract is the **cumulative
sum** (top = sum of heights above, bottom = sum of heights below); the test-writer should
assert that relationship from whichever heights are live (fallback before measurement,
`summary.offsetHeight` after), with a ±1px tolerance, rather than hard-coding `46`. The
fallback values (`0/46/92`, `0/60/120`) are the expected pre-measurement baseline and are
the safest assertion if measurement is deferrable; otherwise compute from measured
`offsetHeight`. This is a test-strategy detail, not a spec ambiguity.

**OQ-2** (non-blocking): The registry/index assignment for `AccordionItem`s must reflect
DOM order to make the cumulative offsets correct. The implementer chooses the mechanism
(registration-order counter in the context, or an explicit ordered list). The ACs assert
the resulting offsets, not the internal index mechanism, so any correct ordering scheme
satisfies the contract. If items can be reordered/added dynamically after mount and the
indices must stay consistent, that is left to the implementer's registry design; dynamic
reordering is not exercised by the stories.
