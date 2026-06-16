# B67: Accordion smart scroll-to-content on header click

## Context

In a **sticky** `Accordion` (the opt-in `sticky` prop from B59/D68, with the
header-stacking fix from B66/D78), the headers tile into a top + bottom stack inside a
scroll container. With tall sections, opening a section often leaves its body below the
fold or hidden behind the pinned header stack. B67 makes clicking a section header
**smart-scroll** that section's content into a readable position — landing the header in
its top-stack slot with the body revealed below — instead of merely toggling.

This is a deliberate, **conditional** override of the native `<details>` close-on-click
toggle (D16): in the one case where an open section's content is off-screen, a click
scrolls to it and keeps it open rather than collapsing it. Collapsing still works once
you are looking at the content. The override is logged as an ADR (D80) because it touches
D16's "browser-owned open/close, no JS toggle" rule.

**Scope: sticky mode only.** When `sticky` is absent/false, behaviour is byte-for-byte
unchanged — native toggle, no scroll, no new listeners. No new public prop is added to
either component; no public API changes.

### Related wiki pages

- Item card: [backlog/doing/B67-accordion-scroll-to-content.md](../backlog/doing/B67-accordion-scroll-to-content.md)
- [specs/B59-accordion-sticky-headers.md](B59-accordion-sticky-headers.md) — the sticky
  registry, `topOffset(i)`/`bottomOffset(i)`/`zIndex(i)`, the `$effect`-only measurement
  model, the `data-sticky="true"` + inline-offset markup.
- [specs/B66-accordion-sticky-stacking.md](B66-accordion-sticky-stacking.md) — the
  `display: contents` stacking fix; the scroll-wrapper test pattern.
- [requirements.md](../requirements.md) — R10 (Accordion), **WCAG 2.1 AA**, SSR-safe,
  Svelte 5 runes, strict TS.
- [architecture.md](../architecture.md) — component conventions; tests = Storybook play
  functions via `pnpm test` (Vitest browser mode), so real scrolling and
  `getBoundingClientRect()` are available.
- [stories-guide.md](../stories-guide.md) — Svelte CSF + play-function conventions;
  scroll-target behaviour is assertable/keepable ("When NOT to assert" → "Keep").
- [decisions.md](../decisions.md) — **D16** (native `<details>`, browser-owned
  open/close), **D45** (native CSS nesting), **D52** (`$effect`-only SSR-safety, no
  `$app/environment`), **D68** (B59 registry/offsets), **D69** (cumulative-sum offset
  tests), **D78** (B66 `display: contents`), **D79** (B65 `.acc-actions` `onclick`
  preventDefault guard), and **D80** (this item — logged in the Archive).

---

## Mechanism (informative — the ACs below are the contract)

The current state at the moment the user activates a `<summary>`:

- The browser fires **one** `click` event on the `<summary>` for **all** activation
  paths — mouse click, keyboard **Enter**, and keyboard **Space** on the focused
  `<summary>` (Space/Enter on a `<summary>` synthesise a `click`; D79 relies on the same
  fact for the actions guard). A single `onclick` on the `<summary>` therefore intercepts
  every activation path uniformly — **no separate `keydown` handler is required**.
- The native `<details>` open/close toggle is the **default action** of that click. It
  runs *after* the click handlers, and can be cancelled with `e.preventDefault()`.
  Consequently, inside the handler `details.open` still reflects the state **before** this
  activation: `open === false` ⇒ about to open; `open === true` ⇒ about to close (unless
  prevented).

B67 adds an `onclick` to the **sticky** `<summary>` only (the non-sticky `<summary>`
branch is unchanged). The handler:

1. **Defers to the actions guard.** If `e.defaultPrevented` is already true (the inner
   `.acc-actions` `onclick` ran first and cancelled the toggle — D79), the handler does
   nothing: no scroll, no toggle. Equivalently it may bail when the activation originates
   inside `.acc-actions` (`(e.target as Element).closest('.acc-actions')`). Either form
   satisfies AC-9.
2. **Closed → open + scroll.** If `details.open === false`, let the native open proceed
   (do **not** preventDefault), then schedule a scroll-into-pinned-position after the open
   has taken effect (next frame / microtask, inside the handler — browser-only).
3. **Open + content not fully visible → scroll, do not close.** If `details.open === true`
   and the section's content is **not** fully visible (definition below), call
   `e.preventDefault()` to cancel the native collapse, leave it open, and scroll into the
   pinned position.
4. **Open + content fully visible → native close.** If `details.open === true` and the
   content **is** fully visible, do nothing — the native toggle collapses the section.

**Scroll-into-pinned-position** target (see AC-2 for the precise definition): scroll the
nearest scrollable ancestor so the section's `<summary>` top edge lands at its pinned
top-stack slot, i.e. at `containerVisibleTop + topOffset(index)`. The registry's
`topOffset(index)` (already exposed per D68) is the cumulative height of the headers
pinned above this one, so the body is revealed *below* the pinned header stack.

**Scroll-ancestor lookup** is done at activation time (inside the handler / a browser-only
`$effect`), never in the render path (D52): walk up from the `<summary>` to the nearest
ancestor whose computed `overflow-y` is `auto`/`scroll`/`overlay` (or `document
.scrollingElement`). If none exists, the behaviour degrades to native toggle only and
nothing throws.

**Motion:** `prefers-reduced-motion: reduce` ⇒ instant scroll; otherwise smooth is
acceptable. The reduced-motion query is read at activation time (browser-only).

---

## Acceptance criteria

The acceptance criteria are the contract. Tests are Storybook play functions run in
Playwright browser mode via `pnpm test`, so real `position: sticky` layout, real
programmatic scrolling, and `getBoundingClientRect()` are available. Assert
**relationships** (within a small `±2px` tolerance), not exact pixel positions, since
header heights are measured live (D69). After each scroll/activation, `await waitFor(...)`
for layout to settle before asserting; if smooth scrolling makes settling flaky, the
test-writer may rely on the reduced-motion (instant) path.

### Definitions

1. **"Content fully visible"** — for an open section, given its `.acc-body` element, its
   `<summary>` (`s`), the scroll container's visible rect (`c = container
   .getBoundingClientRect()`), and the pinned header stack above this section
   (`topOffset(index)` from the registry), the content is **fully visible** iff **both**:
   - the body's top edge is at or below the bottom of the pinned header stack:
     `body.getBoundingClientRect().top >= c.top + topOffset(index) − TOL`, **and**
   - the body's bottom edge is at or above the container's visible bottom:
     `body.getBoundingClientRect().bottom <= c.bottom + TOL`.
   Otherwise the content is **not fully visible** (body top hidden behind the stack, or
   body bottom below the fold). A body taller than the available viewport region (so it
   cannot fit) counts as **not fully visible** until its top is parked at the stack — see
   AC-2 (the scroll lands the header in its slot regardless; the "fully visible" test is
   what decides close-vs-scroll on the *next* activation).

2. **Scroll target (pinned position)** — scrolling into the pinned position sets the
   scroll container's `scrollTop` so that, after settle, the section's `<summary>` top edge
   sits at the container's visible top **plus** the cumulative top-offset of the headers
   pinned above it:
   `summary.getBoundingClientRect().top ≈ container.getBoundingClientRect().top
   + topOffset(index)` (within `±2px`). Equivalent imperative form:
   `container.scrollTop += (summary.getBoundingClientRect().top
   − container.getBoundingClientRect().top) − topOffset(index)`. After the scroll, the
   section's `.acc-body` top edge is at or below the pinned header stack and visible inside
   the container (`body rect.top >= c.top + topOffset(index) − TOL` and
   `body rect.top < c.bottom`).

### Closed → open + scroll

3. **(Primary AC.)** Render `<Accordion sticky>` in a fixed-height `overflow:auto` wrapper
   with several tall sections, at least one of which starts **closed** and is positioned so
   that activating it would otherwise leave its body off-screen. Activate the closed
   section's `<summary>` by **mouse click**. After settle:
   - the section's `<details>` is **open** (`details.hasAttribute('open') === true`); and
   - the section's `<summary>` is pinned at/near its top-stack slot — its rect `top ≈
     container rect.top + topOffset(index)` within `±2px` (AC-2); and
   - the section's `.acc-body` is within the container's visible rect (its rect `top >=
     c.top + topOffset(index) − TOL` and `top < c.bottom`), i.e. the body has been
     scrolled into view below the pinned header stack.

### Open + content off-screen → scroll, do not close

4. Starting from a state where a section is **open** but its content is **not fully
   visible** (AC-1) — e.g. the container is scrolled so the body is below the fold or the
   header is the only part on screen — activate that section's `<summary>` by **mouse
   click**. After settle:
   - the section stays **open** (`details.hasAttribute('open') === true`) — the native
     collapse was cancelled; and
   - `e.preventDefault()` was called for this activation (the toggle did not run); and
   - the section's content is scrolled into the pinned position (AC-2): `.acc-body` is now
     within the container's visible rect, the `<summary>` at/near its top-stack slot.

### Open + content fully visible → native close

5. Starting from a state where a section is **open** and its content **is fully visible**
   (AC-1) inside the container, activate that section's `<summary>` by **mouse click**.
   After the activation:
   - the section **closes** (`details.hasAttribute('open') === false`) — the native toggle
     is allowed to proceed (no `preventDefault`), so collapsing still works.

### Keyboard parity (Enter and Space)

6. Each of the three cases (AC-3 closed→open+scroll, AC-4 open-off-screen→scroll-no-close,
   AC-5 open-visible→close) behaves **identically** when the focused `<summary>` is
   activated via the keyboard **Enter** key, and identically again via the **Space** key,
   as it does for a mouse click. Concretely, for a focused `<summary>`:
   - **Enter** and **Space** on a **closed** section open it and scroll to it (AC-3
     outcome);
   - **Enter** and **Space** on an **open, off-screen** section keep it open and scroll to
     it (AC-4 outcome — `details.open` stays `true`);
   - **Enter** and **Space** on an **open, fully-visible** section close it (AC-5 outcome).
   No separate `keydown` handler is needed; the single `<summary>` `onclick` intercepts the
   synthetic click that Enter/Space dispatch (consistent with D79).

### Screen-reader / disclosure semantics stay truthful

7. The disclosure state announced to assistive tech stays in sync with reality: whenever
   the model **prevents a close** (AC-4), the section genuinely remains open — the
   `<details>` keeps its `open` attribute and the `.acc-body` stays visible, so the
   announced expanded/collapsed state matches the rendered state. No `aria-*` attribute is
   added, removed, or desynchronised by B67: the element remains a native
   `<details>`/`<summary>`, whose disclosure semantics the browser owns. (Justification:
   because we never visually open/close out of step with the `open` attribute — we only
   *suppress* a close — native `aria-expanded` semantics remain correct without manual
   ARIA. See D80.)

### Actions click-guard (B65/D79) still holds

8. With an `actions` snippet present in a sticky `<summary>`, clicking inside the
   `.acc-actions` area (mouse, and keyboard Enter/Space on a control inside it) **neither
   toggles the `<details>` nor triggers a scroll**: `details.open` is unchanged and the
   container's `scrollTop` is unchanged by the actions activation, while the control's own
   handler still fires. The B67 summary handler must bail when the activation originated in
   `.acc-actions` (e.g. `e.defaultPrevented` is already true from the D79 guard, or the
   event target is inside `.acc-actions`).

### Scroll-ancestor lookup + graceful degradation

9. The nearest scrollable ancestor is found at **activation time** (inside the event
   handler / a browser-only `$effect`), SSR-safe — no `$app/environment` import (D52), no
   DOM/`window` access in the render or initialisation path. If **no** scrollable ancestor
   exists for a sticky `<summary>`, activating the header degrades gracefully: the native
   toggle runs (open or close as normal) and **nothing throws**. (Testable: a sticky
   accordion rendered with no `overflow:auto` wrapper still toggles open/closed on click
   without error.)

### Reduced motion

10. When `prefers-reduced-motion: reduce` is set, the scroll is **instant** (the final
    pinned position is reached without an animated transition). When reduced motion is not
    requested, smooth scrolling is acceptable. The reduced-motion preference is read at
    activation time (browser-only), not in the render path.

### Non-sticky mode unchanged

11. With `sticky` absent/false, **no** scroll behaviour occurs on header activation and the
    native toggle is unchanged: clicking (or Enter/Space on) a non-sticky `<summary>`
    toggles `details.open` exactly as today, no `preventDefault` is called by B67, no
    scroll-ancestor lookup runs, and the container's `scrollTop` is not mutated by the
    component. The non-sticky `<summary>` branch carries **no** B67 `onclick` scroll
    handler. Every existing non-sticky Accordion story
    (`Accordion.stories.svelte`: "Default", "All Closed", "Toggle Interaction", "Rich
    Body", "Wrapper Border", "Item Borders", "Animated", "No Inline Border Style",
    "Attribute Forwarding", "With Actions") still passes unchanged.

### No API change / SSR / build / a11y

12. No public API change: `Accordion`'s props remain `sticky?`, `fallbackHeaderHeight?`,
    `children`, plus `...rest`; `AccordionItem`'s public props remain `label`, `open?`,
    `actions?`, `children`. **No new public prop** is added to either component. Both stay
    exported from `src/lib/components/data/index.ts` and re-exported from
    `src/lib/index.ts` (no rename/removal).

13. SSR-safe: no component file imports from `$app/environment` (D52). All DOM measurement,
    scroll-ancestor lookup, `getBoundingClientRect`, `matchMedia('prefers-reduced-motion')`,
    and scroll mutation happen **only** inside event handlers or a browser-only `$effect` —
    never in the render/initialisation path. Nothing new throws during SSR / first paint.

14. Strict TypeScript: `pnpm check` passes with **zero** errors. No `any`, no `@ts-ignore`,
    no `as any`.

15. Accessibility: the a11y addon reports **zero** violations for the new/updated sticky
    stories. The existing B59/B66 sticky ACs (`data-sticky`, `position: sticky`, offset
    arithmetic, `--bg-sunken`/`--rule-strong` tokens, `display: contents` stacking, native
    open/close under `display: contents`) all still hold — B67 adds an `onclick` to the
    sticky `<summary>` and does not alter the offset registry, the `display: contents` rule,
    or the sticky surface/border CSS.

---

## Story plan

Append the B67 coverage to `src/lib/components/data/Accordion.sticky.stories.svelte` (the
existing composition file — no `component:` in `defineMeta`). Reuse the established
scroll-wrapper pattern (a fixed-height `<div style="height:…px;overflow:auto;">` wrapping
`<Accordion sticky>` with several tall sections). Locate the scroll container via
`summaries[0].closest('[style*="overflow"]')`, as the existing "Sticky Headers Stack While
Scrolling" story does. Keep the story set **lean** (stories-guide): prefer **one** new
story carrying all three activation cases plus keyboard parity and the actions/no-scroll
guard in its play function, rather than many single-fact stories. A second small story may
be added for the **graceful-degradation** case (no scroll ancestor) if it does not fit
cleanly in the main story.

### Story — "Smart Scroll On Header Click" (AC-1..AC-8, AC-10, AC-15)

`<Accordion sticky>` with several tall sections (e.g. four `AccordionItem`s with
`height:400px` bodies; mix of `open` and one `closed`) inside `<div
style="height:200px;overflow:auto;">`. The play function exercises, reading/writing
`wrapper.scrollTop` and asserting `details.hasAttribute('open')` + `.acc-body` visibility
via `getBoundingClientRect()` after `waitFor` settle:

- **Closed → click → open + scrolled to pinned slot** (AC-3): assert `details.open` true
  and the `<summary>` rect top ≈ `wrapperRect.top + topOffset` and `.acc-body` within the
  visible rect.
- **Open + off-screen → click → still open + scrolled in** (AC-4): scroll the wrapper so an
  open section's body is below the fold, click its header, assert `details.open` stays
  `true` (collapse prevented) and the content is now in the pinned position.
- **Open + fully visible → click → closes** (AC-5): with a section's content fully in view,
  click its header and assert `details.open` becomes `false`.
- **Keyboard parity** (AC-6): repeat the three cases driving `userEvent.keyboard('{Enter}')`
  and `userEvent.keyboard(' ')` on the focused `<summary>`; assert the same `details.open`
  outcomes.
- **Actions no-scroll guard** (AC-8): include one section with an `actions` snippet
  containing a real `<button>`; record `wrapper.scrollTop`, click the button (and activate
  via Enter/Space), assert `details.open` unchanged AND `wrapper.scrollTop` unchanged AND
  the button's own handler fired (counter increments), reusing the B65/D79 pattern.

> Measurement notes for the test-writer: compute the pinned-slot target from each
> `<summary>`'s live `offsetHeight`/cumulative `topOffset` (the inline `style.top` already
> carries `topOffset(index)` — `parseFloat(summary.style.top)`), per D69 — do not hard-code
> pixel positions. Use `±2px` tolerance. Wait (`waitFor`) after each scroll/activation so
> sticky layout and the smooth/instant scroll settle before asserting. If smooth scrolling
> is flaky to settle in the harness, assert against the reduced-motion (instant) path or
> poll `getBoundingClientRect()` inside `waitFor`.

### Story — "Smart Scroll Degrades Without A Scroll Ancestor" (AC-9, AC-11 partial)

`<Accordion sticky>` rendered **without** an `overflow:auto` wrapper. Play function clicks
a header and asserts the native toggle still flips `details.open` and nothing throws (no
scroll-ancestor present → degrade to native toggle only). Optional — may be folded into the
main story if cleaner.

The existing non-sticky stories in `Accordion.stories.svelte` (incl. "Toggle Interaction",
"Animated", "With Actions") cover AC-11's non-sticky contract; the existing sticky stories
in `Accordion.sticky.stories.svelte` continue to cover the B59/B66 ACs referenced by AC-15.

---

## Out of scope

- **Offset arithmetic / registry / `display: contents` stacking** — unchanged from
  B59/B66 (D68/D69/D78). B67 reads `topOffset(index)` but does not modify the registry,
  the cumulative sums, the ResizeObserver wiring, or the stacking CSS.
- **A new public prop / configurability** — no prop to toggle, disable, or tune the
  scroll behaviour; it is the default in sticky mode (per the item card). No
  `scrollBehavior`/`scrollOffset` prop.
- **Non-sticky scroll behaviour** — non-sticky mode gains nothing; it is untouched.
- **Scrolling the page/window when the accordion is not inside a scroll container** —
  graceful degradation to native toggle only (AC-9); B67 does not scroll the document
  viewport to bring a header into view in that case.
- **Focus management** — B67 does not move DOM focus on scroll; the activated `<summary>`
  keeps focus per native behaviour. No roving focus / focus-into-body.
- **Animating the tiling/stack transition** — only the scroll itself moves; no new CSS
  transition on the headers (B59/B66 out-of-scope item, still excluded).
- **`multiple` / controlled (`openIds`/`onToggle`) / `defaultOpenIds` / `flush`** — still
  not adopted (B59/B66 Out of scope).
- **Horizontal scrolling** — only the vertical scroll axis is handled.

---

## Open questions

None blocking. The interaction model, the "fully visible" definition, the scroll-target
math, and the keyboard/SR handling are fully specified above; the manager + user already
fixed the three-case interaction model in the item card.

**OQ-1** (non-blocking, implementer's choice): the exact way the handler defers to the
D79 actions guard — checking `e.defaultPrevented` (the `.acc-actions` `onclick` runs first
and cancels the toggle) versus `(e.target as Element).closest('.acc-actions')`. AC-8
asserts the **outcome** (no toggle, no scroll, control handler still fires), not the
mechanism, so either is acceptable. Recommended: `e.defaultPrevented` — it composes with
D79 without re-deriving the actions boundary.

**OQ-2** (non-blocking, implementer's choice): how to schedule the scroll *after* a
closed→open native open takes effect (AC-3) — `requestAnimationFrame`, a microtask
(`queueMicrotask`/`Promise.resolve()`), or measuring against the post-open layout. AC-3
asserts the final settled position, not the scheduling primitive. The test-writer should
`waitFor` the settled state regardless.

**OQ-3** (non-blocking, harness detail): whether smooth scrolling settles deterministically
in the Playwright browser. If not, the test-writer asserts against the reduced-motion
(instant) path (AC-10) or polls `getBoundingClientRect()` inside `waitFor`. This is a
test-strategy detail, not a spec ambiguity.
