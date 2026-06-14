# B56: Popover component

## Context

`@dxlbnl/ui` needs an anchored floating-panel primitive: a small layer that opens
relative to a trigger, dismisses on outside-click and Escape, and matches the
Dexterlabs terminal aesthetic (border + shadow on `var(--bg)`). It is the foundation
for menus, tooltips-with-content, and inline detail panels on dexterlabs.nl.

This spec ports the design-system `Popover` into a Svelte 5 component. Sources and
constraints:

- Item card: [`wiki/backlog/doing/B56-popover.md`](../backlog/doing/B56-popover.md)
- Vision / requirements: [`vision.md`](../vision.md), [`requirements.md`](../requirements.md)
  (SSR-safe, WCAG 2.1 AA, Svelte 5 runes, Chakra-style authoring, no external primitives).
- Architecture / conventions: [`architecture.md`](../architecture.md) (tests = Storybook
  `.stories.svelte` play functions; one stories file per component).
- Decisions: [`decisions.md`](../decisions.md) — D4 (`as` + `...rest` + strict TS),
  D42 (no play-fn assertions for visual-only changes), D43 (`string | Snippet` slots),
  D45 (native CSS nesting; `.x { :global { … } }` only — flat `.x :global(child)` banned),
  D51/D52 (Nav dismiss pattern: `$effect`-managed document listeners, SSR-safe via
  `$effect` only, **no `browser` import** — it breaks `pnpm check`).
- Composition limits: [`composition-limits.md`](../composition-limits.md) — `position:absolute`
  widget geometry is a genuine scoped-CSS case (see the `Select .select-panel` precedent).
- Design reference (downstream React/HTML, **reference only** — the Svelte library is
  canonical): `wiki/specs/_design-refs/B56/Popover.jsx`,
  `wiki/specs/_design-refs/B56/preview-23-popover.html`.
- Patterns to mirror: `src/lib/components/navigation/Nav.svelte` (outside-click + Escape
  via `$effect`), `src/lib/components/feedback/Modal.svelte` (controlled `open` + `onclose`
  callback, SSR-safe `$effect` lifecycle).

### Key design decisions (logged in decisions.md Archive as D53)

1. **Controlled, bindable `open`.** Popover does **not** manage its own open state. The
   consumer owns `open` (a `$bindable` boolean) and receives a dismiss request via an
   `onclose` callback — identical to the `Modal` idiom (D12 era). The reference's
   `Trigger` keeps `open` in the parent and conditionally mounts `<Popover>`; the Svelte
   component instead renders nothing when `open` is false and stays mounted, so listener
   lifecycle is driven by the `open` value inside the `$effect`. This matches Svelte 5
   `$bindable` idioms and the existing Modal contract.
2. **Anchored to a `position:relative` parent (consumer-provided trigger).** Like the
   reference, Popover renders a single absolutely-positioned panel and assumes its
   nearest positioned ancestor is the trigger wrapper. Popover does **not** ship a
   built-in trigger button or a `trigger` snippet — the trigger is the consumer's
   responsibility (any element, typically a `<Button>`), kept outside the panel so the
   outside-click logic can treat the trigger as "inside" via the wrapper. This keeps the
   component a pure layer primitive and avoids coupling it to a specific trigger element.

## Component API

```ts
// Popover.svelte
import type { HTMLAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

type PopoverAlign = 'left' | 'right'

interface Props extends HTMLAttributes<HTMLElement> {
  /** Whether the popover panel is rendered/visible. Bindable. @default false */
  open?: boolean
  /** Called when the popover requests dismissal (outside mousedown or Escape). */
  onclose?: () => void
  /** Which edge the panel aligns to within its positioned parent. @default 'right' */
  align?: PopoverAlign
  /** Panel width — number (px) or any CSS length string. @default 280 */
  width?: number | string
  /** Vertical offset of the panel top, relative to the parent. @default '100%' */
  top?: number | string
  /** Polymorphic root element of the panel. @default 'div' */
  as?: string
  /** Panel contents. */
  children?: Snippet
  [key: string]: unknown
}

let {
  open = $bindable(false),
  onclose,
  align = 'right',
  width = 280,
  top = '100%',
  as = 'div',
  children,
  ...rest
}: Props = $props()
```

Notes for the implementer (non-binding):

- `open` is `$bindable` so a consumer may `bind:open`; the canonical dismiss path is
  still the `onclose` callback (so consumers that do not bind can react). The component
  itself does **not** mutate `open` — it only calls `onclose`. (Mirrors Modal, which
  takes `open` + `onclose` and never self-closes.)
- `width`/`top` numbers map to `px`; strings pass through (e.g. `top="100%"`,
  `width="20rem"`). Resolve via a small `$derived` that appends `px` to numbers.
- The panel root needs a `bind:this` reference for the outside-click containment check.
- Listener lifecycle lives in a single `$effect` that early-returns when `!open` (or
  attaches only while open) — no `browser` import (D52). Cleanup must remove both
  listeners.

## Acceptance criteria

The acceptance criteria are the contract. Each maps to a Storybook `play` function.
This is a **behaviour** component, so computed-CSS assertions are limited to the
load-bearing visual contract (anchoring, surface tokens) per D42 — the bulk of the ACs
assert interaction and lifecycle.

### Rendering & structure

1. When `open` is `false`, Popover renders **nothing** — `canvasElement` contains no
   panel element (querying the panel returns `null`). No document listeners are attached
   in this state (verified indirectly by AC-12/AC-13 no-op behaviour).
2. When `open` is `true`, Popover renders a single panel root element (default a `<div>`)
   containing the `children` snippet content. The children are visible.
3. The panel root forwards `...rest` attributes (e.g. `data-testid`, `aria-label`,
   `id`) onto the rendered element.
4. The `as` prop changes the panel's root element tag (e.g. `as="section"` renders a
   `<section>`), via `<svelte:element this={as}>`.

### Positioning & surface (visual contract)

5. The panel has `position: absolute`. (Anchoring is the component's load-bearing visual
   contract, so this is asserted.)
6. With `align="right"` (default), the panel's `right` offset resolves to `0px` and its
   `left` is `auto`. With `align="left"`, the panel's `left` resolves to `0px` and its
   `right` is `auto`.
7. The panel's `top` reflects the `top` prop: default `top="100%"` resolves to the parent
   height in px (assert via the inline style attribute containing `top: 100%` OR computed
   `top` equal to the positioned parent's height). A numeric `top={12}` yields `top: 12px`.
8. The panel width reflects the `width` prop: `width={220}` → computed `width` `220px`;
   `width="20rem"` → computed `width` `320px` (at default root font-size) or the inline
   style contains `width: 20rem`.
9. The panel background-color resolves to `var(--bg)`, its border is `1px solid` resolving
   to `var(--rule-strong)`, and it carries a non-`none` `box-shadow`. (Token assertions use
   the `resolveTokenColor` helper from `$lib/storybook-utils.js`.)
10. The panel has a `z-index` of at least `100` so it layers above adjacent content
    (reference uses `150`; any value `>= 100` satisfies the contract).

### Dismissal behaviour

11. **Outside mousedown dismisses.** While `open`, a `mousedown` dispatched on an element
    **not contained** by the panel calls `onclose` exactly once. (Test asserts the spy is
    called; with `bind:open` the panel then disappears.)
12. **Inside mousedown does not dismiss.** While `open`, a `mousedown` on an element
    **contained** by the panel does **not** call `onclose`.
13. **Escape dismisses.** While `open`, a `keydown` with `key === 'Escape'` on the
    document calls `onclose` exactly once.
14. **No-op when closed.** When `open` is `false`, an outside `mousedown` and an Escape
    `keydown` do **not** call `onclose` and do not throw (no listeners active / handlers
    early-return).
15. The dismiss handlers listen for `mousedown` (not `click`) for the outside check —
    matching the reference (`document.addEventListener('mousedown', …)`) so the popover
    closes on press, before a click completes. Escape is handled via a `keydown` listener.

### Lifecycle & SSR safety

16. Document/window listeners are attached only while `open` is `true` and are removed
    when `open` becomes `false` or the component unmounts. Toggling `open` true→false→true
    must not accumulate duplicate handlers: a single outside `mousedown` after a
    re-open calls `onclose` exactly once (not N times).
17. The component is SSR-safe: all `document`/`window` access is inside an `$effect`
    (which runs only in the browser after hydration) and inside event handlers. There is
    **no** `browser` import from `$app/environment` (per D52 — it fails `pnpm check`).
    `pnpm check` reports 0 type errors for the new files.

### Accessibility

18. The popover is **non-modal**: it does **not** set `aria-modal`, does **not** trap
    focus, and does **not** render a backdrop (distinguishing it from `Modal`). Background
    content remains interactive.
19. The panel does not impose a `role` that conflicts with its content — the default root
    is a generic `<div>` with no implicit role. A consumer may pass an appropriate `role`
    (e.g. `role="menu"`, `role="dialog"`) and `aria-label` via `...rest`; when passed,
    those attributes appear on the panel (covered by AC-3).
20. Every Story passes the `@storybook/addon-a11y` audit with no violations (including
    the variant stories and the dismissal stories).

### Authoring conventions

21. Scoped CSS only: the panel's static styles (`position`, `background`, `border`,
    `box-shadow`, `z-index`) live in the component `<style>` block using design tokens
    (`--bg`, `--rule-strong`). Per-instance values that depend on props (`width`, `top`,
    `align` edge offset) are applied via inline `style` / attribute selectors, not global
    CSS. Any nesting uses native CSS nesting (D45); no flat `.x :global(child)` selectors.
22. Props extend `HTMLAttributes` and forward `...rest`; strict TS, no `any`, no
    `@ts-ignore` (D4).
23. Popover is exported from `src/lib/components/feedback/index.ts` and re-exported from
    `src/lib/index.ts` (alongside `Alert`, `Modal`, `Toast`, `ToastRegion`). *(Implementer
    task — noted here so it is not missed; the test-writer may assert the import resolves.)*

## Storybook story plan

File: `src/lib/components/feedback/Popover.stories.svelte`, `title: 'Feedback/Popover'`,
`component: Popover`, `tags: ['autodocs']`.

Because Popover must sit inside a `position:relative` wrapper and is controlled, most
stories use a `{#snippet template(args)}` that renders a relative wrapper + trigger +
`<Popover bind:open … onclose=…>`, with a local `$state` for `open`. Stories that only
assert structure/positioning may render the panel `open` directly.

1. **Align Right** (default) — `open: true`, `align: 'right'`. Asserts AC-2, AC-5,
   AC-6 (right=0/left=auto), AC-9 (surface tokens), AC-10 (z-index). Mirrors the
   reference `align="right"` variant.
2. **Align Left** — `open: true`, `align: 'left'`. Asserts AC-6 (left=0/right=auto).
   Mirrors the reference `align="left"` variant.
3. **Closed** — `open: false`. Asserts AC-1 (panel absent) and AC-14 (outside mousedown
   + Escape are no-ops; `onclose` spy never called).
4. **Width And Top** — `open: true`, `width: 220`, `top: 12`. Asserts AC-7 (top px) and
   AC-8 (width px). A second instance or assertion covers a string `width="20rem"`.
5. **Dismiss On Outside Click** — controlled via template + `vi.fn()` `onclose`. Opens
   the popover, dispatches a `mousedown` on `document.body` (outside the panel), asserts
   the spy is called once (AC-11) and — with `bind:open` — the panel disappears (AC-16
   single-call after the lifecycle).
6. **Keep Open On Inside Click** — dispatches a `mousedown` on an element inside the panel,
   asserts `onclose` is **not** called (AC-12).
7. **Dismiss On Escape** — dispatches `keydown` Escape on `document`, asserts `onclose`
   called once (AC-13); also asserts a no-op Escape while closed (AC-14).
8. **No Duplicate Listeners** — toggles `open` true→false→true (via the template's local
   state and a re-render), then a single outside `mousedown` calls `onclose` exactly once
   (AC-16). *(If reliably toggling within one play fn proves awkward, the test-writer may
   split this into a focused interaction; flagged as OQ-1.)*
9. **Polymorphic As / Rest Forwarding** — `as: 'section'`, `'data-testid': 'pop'`,
   `role: 'dialog'`, `'aria-label': 'Details'`. Asserts AC-3 and AC-4 (section tag,
   forwarded attrs present).

Story count: **9**. Acceptance criteria count: **23**.

Test-writer guidance (mirrors `Nav.stories.svelte` dismissal stories):

- Use `vi.fn()` for `onclose` and assert `toHaveBeenCalledTimes(...)` rather than
  relying solely on DOM disappearance — this isolates the dismiss contract from the
  bindable-state plumbing.
- Dispatch events with `new MouseEvent('mousedown', { bubbles: true })` /
  `new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })` on `document.body` /
  `document`, with a `await new Promise(r => setTimeout(r, 0))` tick before asserting
  (the Nav stories do exactly this).
- For token colours, use `resolveTokenColor('--bg')` / `resolveTokenColor('--rule-strong')`
  from `$lib/storybook-utils.js`.
- All dismissal stories must run at the default (wide) viewport — there is no media query
  gating Popover visibility, so no viewport setup is needed.

## Out of scope

- **Auto-positioning / collision detection** (flipping when near a viewport edge). The
  panel anchors to `align` + `top` only, exactly like the reference. A future item may add
  a `placement`/flip strategy.
- **Built-in trigger element or `trigger` snippet.** The trigger is consumer-provided and
  lives outside the panel (anchored-to-parent model). A compound `Popover.Trigger` could be
  a later enhancement.
- **Focus management** (moving focus into the panel on open, restoring on close, focus
  trapping). Popover is explicitly non-modal (AC-18); focus stays where the user left it.
  A `role="menu"`/arrow-key roving pattern is a future item if Popover is used to build a
  Menu.
- **Open/close animation / transition.** Reference has none; the panel mounts/unmounts
  instantly.
- **`Modal`-style backdrop or scroll-lock.** Non-modal by design.
- **Self-managed (uncontrolled) `open` state.** Controlled/bindable only (D53).

## Open questions

- **OQ-1 (non-blocking):** The "No Duplicate Listeners" story (AC-16) depends on toggling
  `open` within a single play function. If re-opening within one play fn is unreliable in
  Vitest browser mode, the test-writer may instead assert the listener cleanup indirectly
  (e.g. unmount via `open=false` then confirm a subsequent outside mousedown does not call
  the spy — already AC-14) and drop the explicit re-open assertion. AC-16's "no duplicate
  handlers" intent is still covered by AC-14 + the single-call assertions in AC-11/AC-13.
  Does not block implementation.

No blocking open questions.
