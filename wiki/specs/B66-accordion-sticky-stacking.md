# B66: Accordion sticky headers don't stack

## Context

B59 added an opt-in `sticky` prop to the existing `Accordion`/`AccordionItem`
(see [specs/B59-accordion-sticky-headers.md](B59-accordion-sticky-headers.md), **D68**).
The offset arithmetic it shipped is correct — each header gets a `top` offset (cumulative
height of headers above), a `bottom` offset (cumulative height below), and a tiered
`z-index = 10 + (n - i)` — but the headers **still do not stack**. As you scroll a tall
open list down, the first header pins to the top correctly, then **un-sticks and scrolls
away** the moment the second header arrives. The complete header set is supposed to stay
on screen at all times (the classic stacked-sticky-headers pattern).

**Root cause (verified against the source).** `position: sticky` is constrained to the
element's **containing block** — its parent's content box. In the B59 port each
`AccordionItem` is its own native `<details class="acc-item">`, and the sticky
`<summary>` lives *inside* that `<details>`. So each `<summary>`'s containing block is its
own `<details>`: the header can only stay pinned while ITS OWN `<details>` is on screen,
and un-sticks the instant that `<details>` scrolls fully past. This matches the reported
symptom exactly.

The design reference ([_design-refs/B59/Accordion.jsx](_design-refs/B59/Accordion.jsx))
does **not** have this problem because it renders a **flat** structure: every header
`<div>` and body `<div>` is a direct sibling of the single accordion `<div>` (header and
body are emitted side-by-side inside one `React.Fragment`, both children of the bordering
container). All sticky headers therefore share **one** containing block spanning the whole
accordion, so they tile into a top stack + a bottom stack and all stay visible.

**This bug is structural, not arithmetic.** The top/bottom offset sums and the z-index
tiering from B59 are already correct and are NOT re-specified here. The fix must make all
sticky `<summary>` elements share a single containing block (the `.accordion` root) so
their existing offsets actually pin them into the two stacks.

### Chosen fix mechanism — `display: contents` on `.acc-item` in sticky mode only

Give the per-item `<details class="acc-item">` **`display: contents`** *only in sticky
mode*. With `display: contents`, the `<details>` element generates **no box of its own**;
its children (`<summary class="acc-trigger">` and `<div class="acc-body">`) become layout
children of `.accordion`. That reproduces the reference's flat-sibling structure: every
sticky `<summary>` now has `.accordion` as its containing block — one shared block
spanning the entire accordion — so the existing `top`/`bottom`/`z-index` offsets tile the
headers into a top stack and a bottom stack instead of trapping each in its own
`<details>`.

This preserves **D16** (native `<details>`, browser-owned open/close — no JS toggle, no
ARIA change) with the minimal possible surface: a single scoped rule keyed on
`.acc-item:has(> [data-sticky="true"])` (or an equivalent sticky-scoped selector). The
selector must NOT fire in non-sticky mode, so default-mode rendering stays byte-for-byte
identical (zero regression — every existing Accordion story must still pass).

Two structural consequences are accounted for by ACs below:

- **Borders.** When `.acc-item` has `display: contents`, its own `border-bottom: 1px solid
  var(--rule)` (and `:last-child` removal) **no longer paints** — an element with
  `display: contents` draws no border. This is fine in sticky mode: the section
  separators are already provided by the sticky `<summary>`'s top+bottom
  `--rule-strong` borders (B59 AC-12). The `.acc-item` border rules stay scoped to
  non-sticky mode (unchanged) and must not be relied on for separation in sticky mode.
- **Open/close + height animation.** The `<details>` element itself still exists in the
  DOM under `display: contents` and still owns its `open` state; native open/close stays
  browser-owned. The B17/B59 height-animation `@supports (interpolate-size: allow-keywords)`
  block and the closed-body hide must still work (see AC-7, AC-8) — verified explicitly
  because UA rendering of a `display: contents` `<details>` is the one risk here (OQ-1).

> Logged as a new ADR in `decisions.md` (Archive).

If `display: contents` proves unsound in the test browser (closed bodies leak, or
open/close breaks — see OQ-1), the fallback is a **flat sibling restructure**: render the
`<summary>` and `.acc-body` as direct children of `.accordion` and drive open/close from a
Svelte `$state` boolean instead of the native `<details>` slot. That fallback is
heavier (it abandons native `<details>` / D16 and reintroduces JS open state), so it is
the explicit second choice, not the default. The implementer should only fall back if
AC-7/AC-8 cannot be met with `display: contents`.

### Related wiki pages

- Item card: [backlog/doing/B66-accordion-sticky-stacking.md](../backlog/doing/B66-accordion-sticky-stacking.md)
- Original sticky spec (offset math, registry, story plan): [specs/B59-accordion-sticky-headers.md](B59-accordion-sticky-headers.md)
- [requirements.md](../requirements.md) — R10 (Accordion), SSR-safe, WCAG 2.1 AA, Svelte 5 runes, strict TS
- [architecture.md](../architecture.md) — component conventions, `pnpm test` play-function harness (Vitest browser mode)
- [decisions.md](../decisions.md) — D16 (native `<details>`), D45 (native CSS nesting), D52 (`$effect`-only SSR-safety, no `$app/environment`), D62 (only existing tokens), D68 (B59 sticky registry)
- Design reference (React, reference only): [_design-refs/B59/Accordion.jsx](_design-refs/B59/Accordion.jsx)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format, token-probe helpers, composition stories

---

## Acceptance criteria

The acceptance criteria are the contract. Tests are Storybook play functions run in
Playwright browser mode via `pnpm test` (D1), so **real `position: sticky` layout and real
programmatic scrolling are available**. Token-colour assertions use the probe helpers from
`$lib/storybook-utils.js` (`resolveTokenColor`). Sticky stories render the `<Accordion
sticky>` inside a fixed-height `overflow:auto` wrapper (sticky needs a real scroll ancestor
and breaks under `overflow:hidden` — B59).

### Stacking behaviour — the regression that defines the bug

1. **(Primary regression AC — fails today, passes after the fix.)** Render `<Accordion
   sticky>` inside a fixed-height `overflow:auto` scroll wrapper with **≥3 open,
   tall-bodied items** so the content is taller than the wrapper. Programmatically scroll
   the wrapper to (near) the **bottom** (set `wrapper.scrollTop = wrapper.scrollHeight`).
   After the scroll settles, the **first** header's `getBoundingClientRect()` is still
   **within the scroll wrapper's visible rect** — specifically its `top` is `>=` the
   wrapper's rect `top` (minus a small tolerance) and its `bottom` is `<=` the wrapper's
   rect `bottom`: the first header is pinned to the **top stack**, not scrolled out of
   view. Today the first header's rect `bottom` is **above** the wrapper's rect `top` (it
   has left the viewport); after the fix it stays pinned. The test asserts the first
   header is visible/pinned at the bottom scroll position.
2. At the bottom scroll position, **every** header's rect lies within the wrapper's visible
   rect (no header has fully left the viewport while the accordion is in view). The first
   headers are pinned to the top stack at their cumulative `top` offsets; the last
   header(s) sit naturally / pinned to the bottom stack at their cumulative `bottom`
   offsets. (Concretely: for every `<summary>`, `rect.bottom > wrapperRect.top` and
   `rect.top < wrapperRect.bottom`, within ±2px tolerance.)
3. Scrolling back to the **top** (`wrapper.scrollTop = 0`), every header is again within
   the wrapper's visible rect; the **last** header is pinned to the bottom stack (its rect
   `bottom` is `<=` the wrapper rect `bottom` and `>=` wrapperRect.bottom minus its own
   height − the sum of bottom-stack heights below it, within tolerance) rather than having
   scrolled below the fold. (At minimum: at `scrollTop = 0`, the last header's rect
   `top < wrapperRect.bottom` — it has not been pushed entirely below the viewport.)
4. The headers tile rather than overlap: at the bottom scroll position the pinned
   top-stack headers do not occupy the same vertical band — for consecutive pinned headers
   `i` and `i+1`, header `i`'s rect `bottom <= header i+1`'s rect `top` (within ±2px), i.e.
   they stack edge-to-edge using the cumulative `top` offsets, not all at `top: 0`.

### Containing-block / structure (the fix)

5. In sticky mode, the per-item `<details class="acc-item">` has computed `display:
   contents` (`getComputedStyle(details).display === 'contents'`), so the sticky
   `<summary>` and `.acc-body` are laid out as children of `.accordion` (one shared
   containing block). The CSS rule that applies `display: contents` is **scoped** and keyed
   so it fires only in sticky mode (e.g. `.acc-item:has(> [data-sticky="true"])`, or an
   equivalent sticky-only selector) — using native CSS nesting (D45).
6. In **non-sticky** (default) mode, the `<details class="acc-item">` does **not** have
   `display: contents` — `getComputedStyle(details).display` is its normal block value
   (`'block'`), exactly as today. No structural or display change leaks into default mode.

### Native open/close still works under `display: contents`

7. In sticky mode, with an item rendered **closed** (no `open`), its `.acc-body` content is
   **not visible** (`expect(body).not.toBeVisible()` / the body is hidden by the native
   `<details>` closed state and/or the height-animation block). Opening it (click the
   `<summary>`, or `details.open = true`) makes the `.acc-body` visible. This proves the
   native disclosure still hides/show the body under `display: contents`.
8. In sticky mode, clicking a `<summary>` toggles its `<details>` `open` attribute
   (`details.hasAttribute('open')` flips), and the open item's body becomes visible — i.e.
   browser-owned open/close (D16) is intact. The B17/B59 height-animation `@supports
   (interpolate-size)` block still applies to `.acc-body` (its rules are unaffected by the
   `<details>` display value).

### B59 contract preserved — no regression in sticky mode

9. Every B59 sticky AC still holds. Specifically, in sticky mode each `<summary
   class="acc-trigger">` still:
   - carries `data-sticky="true"` (B59 AC-5);
   - has computed `position: sticky` (B59 AC-6);
   - carries inline `top`/`bottom`/`z-index` matching the cumulative-sum arithmetic and
     `z-index = 10 + (n - i)` (B59 AC-7, AC-8, AC-9 — asserted via the cumulative-sum
     relationship from live `offsetHeight` per **D69**, ±1px tolerance);
   - has computed `background-color` resolving to `var(--bg-sunken)` (B59 AC-11);
   - has top + bottom borders `1px solid` resolving to `var(--rule-strong)` (B59 AC-12).
   The existing `Accordion.sticky.stories.svelte` stories ("Sticky Headers", "Custom
   Fallback Height", "Non-Sticky (regression guard)") must all still pass unchanged.
10. SSR safety is preserved: no component file imports from `$app/environment` (D52);
    all DOM measurement stays inside the existing `$effect` (browser-only). The
    `display: contents` change is pure scoped CSS — it adds no render-path browser access
    and nothing new throws during SSR / first paint (B59 AC-17, AC-18 still hold).
11. Accessibility: sticky mode still changes no disclosure semantics — each item remains a
    native `<details>`/`<summary>` with no added/removed `role` or `aria-*` (B59 AC-19);
    `display: contents` does not remove the element from the accessibility tree for
    `<details>`/`<summary>` (open/close announcement is unchanged). The a11y addon reports
    **zero violations** for the sticky stories (B59 AC-20), including the new stacking
    story.

### Non-sticky regression — default mode byte-identical

12. With `sticky` absent/false, the rendered DOM and computed styles are unchanged from
    today: no `<summary>` has `data-sticky`, no `<summary>` has computed `position:
    sticky`, no `<summary>` carries inline `top`/`bottom`/`z-index`, the `.acc-item`
    `<details>` keeps `display: block` with its `border-bottom: 1px solid var(--rule)`
    (and `:last-child` removal), and every existing non-sticky Accordion story ("Default",
    "All Closed", "Toggle Interaction", "Rich Body", "Wrapper Border", "Item Borders",
    "Animated", "No Inline Border Style", "Attribute Forwarding") still passes unchanged
    (B59 AC-16).

### API / types / build

13. No public API change. `Accordion`'s props remain `sticky?`, `fallbackHeaderHeight?`,
    `children`, plus `...rest`; `AccordionItem`'s public props remain `label`, `open?`,
    `children`. No new public prop is added to either component. `Accordion` and
    `AccordionItem` remain exported from `src/lib/components/data/index.ts` and re-exported
    from `src/lib/index.ts` (no rename/removal).
14. Strict TypeScript: `pnpm check` passes with **zero** errors. No `any`, no `@ts-ignore`.

---

## Story plan

The fix is CSS-structural with an observable behavioural outcome (headers staying pinned
under real scrolling), so this **is** test-writer territory — not a visual-only change
(the stacking is verifiable via `getBoundingClientRect()` after programmatic scroll, per
the stories-guide "Keep" rule for scroll-target behaviour).

Add **one new story** to the existing `src/lib/components/data/Accordion.sticky.stories.svelte`
(append; do not alter the existing three stories). It is a composition story (the file has
no `component:` in `defineMeta`), rendering the `<Accordion sticky>` directly inside a
fixed-height `overflow:auto` wrapper.

### Story — "Sticky Headers Stack While Scrolling" (AC-1..AC-8, AC-11)

Render `<Accordion sticky>` with **≥3** `AccordionItem`s (all `open`, each with a tall
body, e.g. `height:400px`) inside `<div style="height:160px;overflow:auto;">`. The wrapper
must be the scroll container; capture it via `canvasElement.querySelector` of the wrapper
or `summary.closest('[style*="overflow"]')`. Play function:

- Assert the `<details class="acc-item">` elements have computed `display: contents`
  (AC-5).
- Scroll the wrapper to the bottom (`wrapper.scrollTop = wrapper.scrollHeight`), then
  `await waitFor(...)` for layout to settle. Assert the **first** `<summary>`'s
  `getBoundingClientRect().bottom > wrapperRect.top` (it is still in view / pinned to the
  top stack) — this is the assertion that **fails on today's code** (AC-1). Assert all
  headers are within the wrapper rect (AC-2) and that consecutive pinned top-stack headers
  tile edge-to-edge, not overlapping (AC-4).
- Scroll back to the top (`wrapper.scrollTop = 0`), settle, and assert the **last**
  `<summary>` is still within view / pinned to the bottom stack (AC-3).
- Assert one closed-vs-open body visibility pair to cover native open/close under
  `display: contents` (AC-7) — e.g. include one closed item, assert its body is not
  visible, then open it and assert it is.

> Measurement note for the test-writer: use `getBoundingClientRect()` of each `<summary>`
> and the scroll wrapper, compare in viewport coordinates with a small tolerance (±2px) for
> sub-pixel rounding. Wait (`waitFor`) after each scroll mutation so sticky layout and the
> ResizeObserver-driven offsets have settled before asserting. Do **not** assert exact
> pixel positions of the pinned stack (those depend on measured header heights — assert the
> *relationships* in AC-1..AC-4, consistent with D69).

The existing "Sticky Headers", "Custom Fallback Height", and "Non-Sticky (regression
guard)" stories continue to cover AC-9, AC-10, AC-12 (and the offset arithmetic). The
non-sticky stories in `Accordion.stories.svelte` cover AC-12's default-mode contract.

---

## Out of scope

- **Offset arithmetic / z-index / measurement** — unchanged from B59 (D68/D69). This item
  does not touch the registry, the cumulative sums, or the ResizeObserver wiring.
- **The reference's `multiple` / controlled (`openIds`/`onToggle`) / `defaultOpenIds` /
  `flush` props** — still not adopted (B59 Out of scope). `flush` in particular is not
  needed: `position: sticky` is independent of body padding.
- **Sticky inside `overflow:hidden`** — still a documented limitation (sticky needs a real
  scroll ancestor); not handled.
- **Animating the tiling transition** — the stack is purely positional; no transition is
  added beyond the existing trigger background transition.
- **Glyph / header markup changes** — the rotating `›` and the existing `<summary>` markup
  are unchanged.
- **Public API changes** — no new prop; the fix is internal CSS structure only.

---

## Open questions

**OQ-1** (non-blocking, but the implementer must verify before relying on the default fix):
Browser rendering of a `<details>` element with `display: contents` is the one risk in the
chosen mechanism. In all current evergreen browsers the `<details>` element keeps its
`open` state and its children render as siblings of the parent under `display: contents`,
and the native closed-body hide continues to apply; the B17/B59 height-animation block
(`.acc-body { height: 0; opacity: 0 }` outside `[open]`) provides an explicit body-hide
that does **not** depend on UA `<details>` slot rendering, so closed bodies stay hidden
even if the UA rule were affected. AC-7/AC-8 verify this directly in the Playwright test
browser. If those ACs fail (closed bodies leak, or open/close breaks), fall back to the
flat-sibling restructure described in Context (drop native `<details>`, drive open/close
from `$state`) — that is the specified alternative, not a spec ambiguity.

**OQ-2** (non-blocking): The sticky-only selector form is the implementer's choice —
`.acc-item:has(> [data-sticky="true"])`, an item-level `data-sticky` mirror on the
`<details>`, or a sticky-scoped class. `:has()` is supported in all current evergreen
browsers and in the Playwright test browser. The ACs assert the resulting computed
`display` and behaviour, not the selector text, so any sticky-scoped form that leaves
non-sticky mode unchanged (AC-6, AC-12) satisfies the contract. If `:has()` is undesirable,
the implementer may instead add `data-sticky="true"` to the `<details>` itself (mirroring
the `<summary>`) and key the rule on `.acc-item[data-sticky="true"]`.
