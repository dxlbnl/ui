# B65: AccordionItem actions snippet

## Context

`AccordionItem` (`src/lib/components/data/AccordionItem.svelte`) renders a native
`<details>`/`<summary>` row (D16) with a `label` title and a `›` chevron. Today the
`<summary>` only holds `.acc-title` + `.acc-icon`; there is no way to put inline
controls (a delete button, a count badge, a kebab menu) in the row header.

The design reference (`wiki/specs/_design-refs/B59/Accordion.jsx`) already models this:
each section accepts `s.controls`, rendered in a wrapper next to the title with a
click-guard (`onClick={(e) => e.stopPropagation()}`) and a title that flexes to fill
the row (`flex: 1 1 auto`) so the controls + chevron hug the right edge. Visual order is
`title … [controls] ›`.

This item ports that concept to our component as an optional `actions?: Snippet` prop.
The one load-bearing difference from the reference: the reference toggles via a
`<button>` (so `stopPropagation` suffices), whereas our component uses a native
`<summary>`. Toggling a `<details>` is the `<summary>`'s **own default action**, not a
side effect of a bubbling click on an ancestor — so `stopPropagation` does **not**
prevent the toggle. The actions wrapper must instead **`preventDefault`** the click to
cancel the summary's default toggle.

The component has TWO `<summary>` branches — a sticky branch (`data-sticky="true"` with
inline `top`/`bottom`/`z-index` offsets) and a non-sticky branch. `actions` must render
in both. Because `actions` is just extra content inside the same `<summary>` the
ResizeObserver already measures, the B59/B66 sticky offset math (D68, D78) is unaffected.

Relevant wiki pages:
- Item card: `wiki/backlog/doing/B65-accordionitem-actions-snippet.md`
- `wiki/requirements.md` — R10 (Accordion), constraints: WCAG 2.1 AA, strict TS, Svelte 5 runes/snippets, no `any`/`@ts-ignore`.
- `wiki/architecture.md` — "Snippets for slots" (`{#snippet}`/`{@render}`), `...rest` forwarding, test harness = Storybook play functions via `pnpm test`.
- `wiki/stories-guide.md` — Svelte CSF story + play-function conventions.
- `wiki/decisions.md` — D16 (native `<details>`), D68 + D78 (sticky offset model + `display: contents` structure), D43 (text-or-snippet slot convention), D45 (native CSS nesting).
- Design reference: `wiki/specs/_design-refs/B59/Accordion.jsx`.

## Acceptance criteria

### API

1. **`actions?: Snippet` prop.** `AccordionItemProps` gains an optional
   `actions?: Snippet` field (imported `Snippet` type from `'svelte'`). It is destructured
   from `$props()` alongside the existing props. Strict TS: no `any`, no `@ts-ignore`,
   `pnpm check` clean.

2. **Existing props unchanged.** `label: string`, `open?: boolean` (default `false`), and
   `children: Snippet` keep their current types and defaults. The component's exports are
   unchanged (`AccordionItem` is still the default export of the file; `index.ts`
   re-export line is untouched).

### Rendering & structure

3. **Actions render inside the `<summary>` when provided.** When `actions` is passed, the
   snippet content is rendered inside the `<summary>` via `{@render actions()}`, wrapped in
   a single element `<span class="acc-actions">`. This applies to **both** `<summary>`
   branches (sticky and non-sticky) — identical markup in each.

4. **No actions wrapper when omitted (zero regression).** When `actions` is not passed, no
   `.acc-actions` element exists in the DOM, and the rendered output and behaviour are
   byte-for-byte identical to the pre-B65 component. All existing Accordion stories
   (`Accordion.stories.svelte`, `Accordion.sticky.stories.svelte`) continue to pass
   unchanged.

5. **Title is in a `flex: 1` wrapper.** The title `.acc-title` is wrapped (or itself
   carries) a `flex: 1` rule so it takes the remaining horizontal space, pushing the
   actions + chevron to the right edge. The `.acc-trigger` keeps `display: flex` /
   `align-items: center`. (`justify-content: space-between` may be retained or removed; the
   `flex: 1` title is what drives the layout. Whichever is chosen must satisfy the DOM-order
   and right-hug requirements below.)

6. **DOM order: title, actions, icon.** Within the `<summary>`, the element order is:
   the title (flexed), then `.acc-actions` (when present), then `.acc-icon`. The actions
   wrapper sits **between** the title and the chevron. Testable: within a `<summary>` that
   has all three, the index of `.acc-actions` is greater than the title element's index and
   less than `.acc-icon`'s index.

7. **Chevron unchanged.** `.acc-icon` is still the last child of the `<summary>`, still
   `aria-hidden="true"` with the `›` glyph, and still rotates / recolours on
   `details[open]` exactly as today.

### Click guard (load-bearing behaviour)

8. **The actions wrapper cancels the summary's default toggle on click.** `.acc-actions`
   carries `onclick={(e) => e.preventDefault()}`. Because toggling `<details>` is the
   `<summary>`'s default action (not an ancestor click side effect), `preventDefault()` on a
   click that originates inside the actions subtree cancels the toggle. Testable: with an
   interactive control (a `<button>`) inside `actions`, a `userEvent.click` on that control
   leaves `details.open` **unchanged** (whatever it was before the click — open stays open,
   closed stays closed).

9. **The control's own handler still fires.** The same click that does not toggle the
   accordion **does** still invoke the control's own `onclick` handler. Testable: the
   button inside `actions` has a handler that flips a flag / increments a counter; after
   `userEvent.click` on it, the flag/counter shows the handler ran (and `details.open` is
   unchanged per AC-8).

10. **The guard is scoped to the actions area, not the whole summary.** A click on the
    title / summary area **outside** `.acc-actions` (e.g. on `.acc-title`) still toggles the
    `<details>` normally. Testable: clicking the title flips `details.open`; clicking inside
    `.acc-actions` does not. This proves the `preventDefault` is on the actions wrapper only,
    not on the summary.

11. **Keyboard activation of a control inside actions does not toggle.** Activating an
    interactive control inside `actions` via the keyboard (focus the button, press Enter or
    Space) must **not** toggle `details.open`, while still activating the control (AC-9
    behaviour holds for keyboard too). The mechanism: a keyboard button activation dispatches
    a synthetic `click` event that bubbles, so the **same** `onclick={(e) => e.preventDefault()}`
    on the wrapper covers keyboard activation — no separate `keydown` guard is required.
    Testable: focus the button inside `actions`, fire keyboard activation (Enter and/or
    Space) via `userEvent.keyboard`, assert `details.open` is unchanged and the button's
    handler fired. (If the implementer finds the single `onclick` guard is insufficient in
    the Playwright test browser, a `keydown` guard may be added — but the test must confirm
    keyboard activation does not toggle, by whatever mechanism.)

### Sticky / measurement

12. **Sticky behaviour and offsets are unaffected.** `actions` renders inside the same
    sticky `<summary>` the ResizeObserver already observes (D68/D78), so the offset
    arithmetic (`top` = Σ heights above, `bottom` = Σ heights below, `z-index = 10 + (n-i)`)
    and the `display: contents` structural fix continue to work with no change. Testable in
    sticky mode: a `<summary>` with `actions` still carries `data-sticky="true"`, computed
    `position: sticky`, and numeric inline `top`/`bottom`/`z-index` offsets; the
    `.acc-actions` wrapper is present in the sticky `<summary>`.

### Quality gates

13. **`pnpm check` clean** (strict TS, lint conventions per D75) and **`pnpm test` green**
    (all existing + new play functions pass).

14. **A11y: zero violations.** The `@storybook/addon-a11y` audit reports zero violations on
    the new story. The interactive control inside `actions` must have an accessible name
    (e.g. visible text or `aria-label`).

## Story plan

Append a new story to `src/lib/components/data/Accordion.stories.svelte` (the primary file
keeps `component: Accordion`; a single `<Accordion>` instance with one `<AccordionItem>`
in the slot is the standard single-instance pattern, so no composition file is needed).
Keep it lean and demo-first per `wiki/stories-guide.md` — one story carrying the full
click-guard contract in its play function.

- **Story "With Actions"** — renders one `<AccordionItem label="..." open={...}>` whose
  `actions` snippet contains a real `<button>` with an accessible name and an `onclick`
  handler that records activation (e.g. increments a count rendered into the DOM, or sets a
  `data-*`/text marker the play function can read). The body holds realistic content.
  Play function asserts:
  1. The actions render: `.acc-actions` exists in the `<summary>`, and the button is
     queryable by role + name (AC-3, AC-6).
  2. DOM order title → actions → icon (AC-6).
  3. `userEvent.click` on the button leaves `details.open` unchanged AND the button's
     handler fired (AC-8, AC-9).
  4. Keyboard activation (focus button, Enter and/or Space) leaves `details.open`
     unchanged AND the handler fired (AC-11, AC-9).
  5. `userEvent.click` on the title area (outside actions) DOES toggle `details.open`
     (AC-10).

Recommend rendering the item **open** initially so the "click does not close it" assertion
and the "title click toggles it (to closed)" assertion are both observable from a known
start state; the play function should read the start state and assert it is unchanged after
the actions click rather than hard-coding open/closed.

Optionally add a sticky-mode coverage point for AC-12 — either a small dedicated story in
`Accordion.sticky.stories.svelte` (an `<AccordionItem actions={...}>` inside a
`height/overflow:auto` scroll wrapper, asserting the sticky `<summary>` still has
`data-sticky` + inline offsets AND contains `.acc-actions`), or fold an `actions` snippet
into one existing sticky item if that keeps the existing sticky assertions intact. Prefer
the smallest change that proves AC-12 without disturbing the existing sticky offset tests.

## Out of scope

- Any change to `Accordion.svelte` (the parent), the sticky registry, or the offset
  arithmetic. This item adds content to `<summary>`; the sticky model (D68/D78) is untouched.
- An `actions` API on the `Accordion` parent (e.g. per-section `controls` array). This is a
  per-item snippet only, matching the existing `AccordionItem` composition model.
- A `count`/badge prop (the reference's `s.count`). A count badge can be rendered by the
  caller inside `actions` or `label`; no dedicated prop is added here.
- Restyling the actions content (button variants, spacing tokens, hover states beyond a
  minimal flex layout for the wrapper). The wrapper provides layout only; the caller styles
  the controls (e.g. by passing design-system `<Button>`s into the snippet).
- Programmatic focus management or roving tabindex within the actions area. Native focus
  order (title summary, then each control) is sufficient.
- Polymorphic `as` on `AccordionItem` and `...rest` forwarding onto `<details>` — neither
  exists today and B65 does not add them.

## Open questions

None blocking. Two notes carried into implementation rather than left open:

- The single `onclick={(e) => e.preventDefault()}` wrapper guard is the specified design and
  is expected to cover both mouse and keyboard activation (a keyboard button activation
  dispatches a bubbling `click`). The test (AC-11) confirms this in the Playwright browser;
  if it does not hold there, the implementer may add a `keydown` guard, but the observable
  contract (no toggle on keyboard activation, control still activates) is unchanged.
- Whether `.acc-trigger` keeps `justify-content: space-between` once the title is `flex: 1`
  is an implementation detail (AC-5); either choice that satisfies the DOM-order and
  right-hug ACs is acceptable.
