# B50: StatusPill component

## Context

`@dxlbnl/ui` needs a compact status indicator that conveys a coloured status (label +
LED) and, on click, reveals a detail panel anchored to it. On dexterlabs.nl this is the
rail/health pill in the terminal aesthetic — e.g. `● ALL SYSTEMS · NOMINAL` opening a
key/value rail-detail Popover. StatusPill is a thin composite over two existing
components: it reuses the `Led` primitive for the status dot and the `Popover` feedback
component for the detail layer, and owns the open/closed state between them.

Sources and constraints:

- Item card: [`wiki/backlog/doing/B50-status-pill.md`](../backlog/doing/B50-status-pill.md)
- Vision / requirements: [`vision.md`](../vision.md), [`requirements.md`](../requirements.md)
  (R3 lists `Led`; SSR-safe, WCAG 2.1 AA, Svelte 5 runes, Chakra-style authoring, no
  external primitives).
- Architecture / conventions: [`architecture.md`](../architecture.md) (tests = Storybook
  `.stories.svelte` play functions; one stories file per component).
- Decisions: [`decisions.md`](../decisions.md) — D4 (`as` + `...rest` + strict TS),
  D38 (primitives first — compose `Led`/`Popover`, never raw equivalents), D42 (no
  play-fn assertions for visual-only changes), D43 (text-or-snippet slots as a single
  `string | Snippet` prop), D45 (native CSS nesting; flat `.x :global(child)` banned),
  D52 (SSR-safe via `$effect` only, no `browser` import), D53 (Popover is
  controlled/bindable, anchored to a `position:relative` parent).
- Components composed (read, real APIs noted below):
  - `src/lib/components/primitives/Led.svelte` — prop is **`color`** (`ok | amber |
    cyan | danger | off`) + `blink`. StatusPill's `tone` maps directly to Led's `color`.
    Led already supports every tone the reference needs (including `cyan`) and `blink`;
    **no Led change is required**.
  - `src/lib/components/feedback/Popover.svelte` + [`B56-popover.md`](B56-popover.md) —
    controlled/bindable `open`, `onclose`, `align: 'left' | 'right'` (default `'right'`),
    `width: number | string`, `top`, anchored to a `position:relative` parent. StatusPill
    owns the open state and renders the detail snippet inside a `<Popover>`. Dismissal
    (outside-click / Escape) is inherited from Popover.
  - `src/lib/components/primitives/Button.svelte` — authoring conventions; the trigger is
    a real `<button>`.
- Design reference (downstream React/HTML, **reference only** — the Svelte library is
  canonical): `wiki/specs/_design-refs/B50/StatusPill.jsx`,
  `wiki/specs/_design-refs/B50/preview-29-status-pill.html`,
  `wiki/specs/_design-refs/B50/base.jsx` (reference `Led` tone→colour + `blink`).

### Key design decisions (logged in decisions.md Archive as D54)

1. **Home category: `feedback/`.** StatusPill is a composite, not an atom — it owns
   disclosure state and composes `Popover` (which lives in `feedback/`) and `Led`. It is
   placed in `src/lib/components/feedback/` alongside `Popover`, its closest dependency
   and behavioural sibling. Story title: `Feedback/StatusPill`.
2. **Reuse `Popover` + `Led`, own the open state (D38, D53).** StatusPill renders a
   trigger `<button>` and a `<Popover>` inside one `position:relative` wrapper, and holds
   the `open` boolean in local `$state`. The trigger toggles it; `Popover`'s `onclose`
   sets it `false`. No bespoke floating-panel or LED code.
3. **`tone` → Led `color`, 1:1.** The reference's `tone` prop is forwarded to `Led` as
   `color`. The `off` tone is supported by Led but is not in the reference's pill matrix;
   it is permitted but untested here.
4. **`ok` uses neutral chrome.** Per the reference, the `ok` tone borders/labels with
   neutral tokens (`--rule-strong` border, `--ink-dim` label); non-`ok` tones colour both
   the label and the border with `var(--<tone>)`. The LED is always coloured by its tone.

## Component API

```ts
// StatusPill.svelte
import type { HTMLButtonAttributes } from 'svelte/elements'
import type { Snippet } from 'svelte'

type StatusTone = 'ok' | 'amber' | 'cyan' | 'danger' | 'off'
type PopoverAlign = 'left' | 'right'

interface Props extends HTMLButtonAttributes {
  /** Status tone — drives the LED colour and (for non-ok tones) the label + border. @default 'ok' */
  tone?: StatusTone
  /** Pill label text — rendered uppercase mono. */
  label: string
  /** Optional ` · <detail>` suffix after the label, in faint ink. */
  detail?: string
  /** Whether the LED blinks. Forwarded to Led. @default false */
  blink?: boolean
  /** Detail panel contents — a Snippet (D43). When absent, clicking does not open a Popover. */
  children?: Snippet
  /** Popover edge alignment, forwarded to Popover. @default 'right' */
  align?: PopoverAlign
  /** Popover panel width, forwarded to Popover. @default 300 */
  width?: number | string
  /** Polymorphic trigger element. @default 'button' */
  as?: string
  [key: string]: unknown
}

let {
  tone = 'ok',
  label,
  detail,
  blink = false,
  children,
  align = 'right',
  width = 300,
  as = 'button',
  ...rest
}: Props = $props()
```

Notes for the implementer (non-binding):

- Local state: `let open = $state(false)`. The trigger's `onclick` flips it; `<Popover
  bind:open onclose={() => (open = false)}>` closes it. Do **not** add a second source of
  truth — StatusPill owns `open`.
- Structure mirrors the reference: a `position:relative` wrapper containing the trigger
  `<button>` (LED + label span) and the `<Popover>`. The wrapper is the
  positioned ancestor Popover anchors to (D53).
- Accent colour: `tone === 'ok' ? 'var(--rule-strong)' : 'var(--<tone>)'` for the border;
  label colour `tone === 'ok' ? 'var(--ink-dim)' : 'var(--<tone>)'`. Resolve per-tone via
  scoped attribute selectors (`.pill[data-tone="amber"] { … }`), not inline `style`.
- `tone` forwards to `<Led color={tone} {blink} />` — note Led's prop is `color`, not
  `tone`.
- Gate the Popover on `open && children` (mirrors the reference `open && children`):
  with no detail snippet, clicking must **not** open an empty Popover.
- `width` defaults to `300` to match the reference `popoverWidth` (Popover's own default
  is `280`; StatusPill overrides it).

## Acceptance criteria

The acceptance criteria are the contract. Each maps to a Storybook `play` function. This
is a **behaviour + structure** component; computed-CSS assertions are limited to the
load-bearing visual contract (tone→colour mapping, mono/uppercase label, surface token)
per D42. Token colours use `resolveTokenColor` (backgrounds/borders) /
`resolveTokenFgColor` (text/foreground) from `$lib/storybook-utils.js` (D37).

### Structure & content

1. The trigger is a real `<button>` element (default `as="button"`); it is queryable via
   `getByRole('button')`.
2. The button contains a `Led` element (the `.led` status dot, `role="status"`) followed
   by the label text. With `tone="amber"`, the LED carries the `led-amber` class; the
   same 1:1 mapping holds for `ok`, `cyan`, `danger` (LED class is `led-<tone>`).
3. The label text renders the `label` prop verbatim and is visible.
4. When `detail` is provided, a ` · <detail>` suffix is rendered after the label (e.g.
   `label="All systems"`, `detail="nominal"` → the button's accessible/visible text
   contains both `All systems` and `nominal`, separated by a `·`). When `detail` is
   omitted, no `·` separator appears.
5. The `blink` prop forwards to the LED: with `blink`, the LED element carries the
   `blink` class; without it, it does not.
6. `...rest` attributes (e.g. `data-testid`, `aria-label`, `id`) are forwarded onto the
   trigger `<button>`. The `as` prop changes the trigger's element tag via
   `<svelte:element this={as}>` (e.g. `as="a"` renders an anchor — covered structurally).

### Tone → colour (visual contract)

7. **Non-ok label colour.** With `tone="amber"`, the label text `color` resolves to
   `var(--amber)`; with `tone="cyan"` → `var(--cyan)`; with `tone="danger"` →
   `var(--danger)`.
8. **Non-ok border colour.** With `tone="amber"`, the button's border colour resolves to
   `var(--amber)` (`1px solid`); same pattern for `cyan` (`var(--cyan)`) and `danger`
   (`var(--danger)`).
9. **ok tone is neutral.** With `tone="ok"`, the label `color` resolves to `var(--ink-dim)`
   and the button border colour resolves to `var(--rule-strong)` — **not** `var(--ok)`.
   (The LED itself is still `led-ok`, i.e. coloured — AC-2.)
10. The button background resolves to `var(--bg-rail)` for every tone.

### Label typography (visual contract)

11. The label uses the mono font stack: its computed `font-family` resolves to
    `var(--mono)` (assert the resolved family contains the mono stack, e.g. matches the
    `--mono` probe, or `text-transform` + family together prove it).
12. The label is uppercased: its computed `text-transform` is `uppercase`.
13. The `detail` suffix (when present) renders in faint ink: the ` · detail` span's
    computed `color` resolves to `var(--ink-faint)`.

### Disclosure behaviour

14. **Closed by default.** On initial render, no Popover panel is present in the DOM
    (querying the popover panel returns `null`), and the trigger button has
    `aria-expanded="false"`.
15. **Click opens (with detail).** When `children` (detail content) is supplied, clicking
    the trigger renders the `Popover` panel containing the detail content (the content is
    visible), and sets `aria-expanded="true"` on the trigger.
16. **Click toggles closed.** A second click on the trigger (while open) removes the
    Popover panel and returns `aria-expanded` to `"false"`.
17. **No empty Popover.** When **no** `children` are supplied, clicking the trigger does
    **not** render a Popover panel (the `open && children` guard). `aria-expanded` may
    still reflect the trigger's open state, but no panel element appears.
18. **Outside-click dismisses (inherited from Popover).** While open (with detail), a
    `mousedown` on an element outside the pill/panel closes the Popover (panel removed,
    `aria-expanded="false"`). Asserted at the StatusPill level even though the mechanism
    lives in Popover.
19. **Escape dismisses (inherited from Popover).** While open, a `keydown` with
    `key === 'Escape'` closes the Popover (panel removed, `aria-expanded="false"`).
20. **align / width forwarded.** With `align="left"`, the rendered Popover panel anchors
    left (computed `left` is `0px`, `right` is `auto` via the inline-style fallback —
    mirrors B56 AC-6). With `width={220}`, the panel's computed `width` is `220px`.
    (Asserted on an open, with-detail instance.)

### Accessibility

21. The trigger exposes disclosure semantics: `aria-haspopup` is set to a dialog-ish value
    (`"dialog"` — the detail panel is a content panel, not a menu) and `aria-expanded`
    reflects the open state (`"false"` closed, `"true"` open). When `children` is absent,
    `aria-haspopup`/`aria-expanded` need not be present (there is nothing to disclose);
    the implementer may omit them in that case — the test for AC-17 only asserts no panel.
22. Every Story passes the `@storybook/addon-a11y` audit with no violations (all tone
    variants, blink, with-detail, without-detail, and the open/dismiss stories).

### Authoring conventions

23. Scoped CSS only, design tokens only: the pill chrome (flex layout, gap, padding,
    `var(--bg-rail)` background, `1px solid` border, mono/uppercase label, `--ink-faint`
    detail) lives in the component `<style>` block. Per-tone border/label colours are
    resolved via scoped attribute selectors (`.pill[data-tone="…"]`) using design tokens,
    not inline `style`. Any nesting uses native CSS nesting (D45); no flat
    `.x :global(child)` selectors.
24. Composes the `Led` and `Popover` components (D38) — no bespoke LED markup and no
    bespoke floating panel. Props extend `HTMLButtonAttributes` and forward `...rest`;
    strict TS, no `any`, no `@ts-ignore` (D4). `tone` forwards to `Led` as `color`.
25. StatusPill is exported from `src/lib/components/feedback/index.ts` and re-exported
    from `src/lib/index.ts` (alongside `Alert`, `Modal`, `Popover`, `Toast`,
    `ToastRegion`). *(Implementer task — noted so it is not missed; the test-writer may
    assert the import resolves.)*

## Storybook story plan

File: `src/lib/components/feedback/StatusPill.stories.svelte`,
`title: 'Feedback/StatusPill'`, `component: StatusPill`, `tags: ['autodocs']`.

The detail content is a `{#snippet}` passed as `children`. Disclosure stories use
`userEvent.click` on the trigger; dismissal stories dispatch `mousedown` / `keydown` and
tick (`await new Promise(r => setTimeout(r, 0))`) before asserting, mirroring the Popover
and Nav dismissal stories. Stories that show multiple tone instances side by side follow
the composition-in-slot precedent (D21) and may omit assertions that need a single
component instance.

1. **OK** — `tone: 'ok'`, `label: 'All systems'`, `detail: 'nominal'`, with detail
   snippet. Asserts AC-1 (button), AC-2 (`led-ok`), AC-3/AC-4 (label + `· nominal`),
   AC-9 (neutral `--ink-dim` label + `--rule-strong` border), AC-10 (`--bg-rail` bg),
   AC-11/AC-12 (mono uppercase), AC-13 (faint detail). Mirrors reference `tone="ok"`.
2. **Amber** — `tone: 'amber'`, `label: 'Load high'`, `detail: '88%'`. Asserts AC-7
   (`--amber` label), AC-8 (`--amber` border), AC-2 (`led-amber`). Mirrors reference.
3. **Cyan** — `tone: 'cyan'`, `label: 'Sync'`, `detail: 't.04'`, **no** detail snippet.
   Asserts AC-7/AC-8 (`--cyan` label + border) and AC-17 (clicking does not open a
   Popover — no detail). Mirrors reference `tone="cyan"` (which had no children).
4. **Danger** — `tone: 'danger'`, `label: 'Fault'`, `detail: 'rail −12V'`. Asserts AC-7
   (`--danger` label), AC-8 (`--danger` border). Mirrors reference.
5. **Blinking** — `tone: 'amber'`, `blink: true`. Asserts AC-5 (LED has `blink` class).
6. **Without Detail Suffix** — `tone: 'ok'`, `label: 'Idle'`, no `detail`. Asserts AC-4
   negative (no `·` separator in the button text).
7. **Opens On Click** — with detail snippet. Starts closed: asserts AC-14 (no panel,
   `aria-expanded="false"`), then `userEvent.click` the trigger → asserts AC-15 (panel +
   detail visible, `aria-expanded="true"`), then click again → asserts AC-16 (panel gone,
   `aria-expanded="false"`). Also asserts AC-21 (`aria-haspopup="dialog"`).
8. **No Popover Without Detail** — no `children`. Click the trigger → asserts AC-17 (no
   panel rendered) and the play does not throw. Positive-control note: this story should
   also confirm a *with-detail* sibling DOES open, OR rely on Story 7 as the positive
   control, so AC-17 is not vacuously passing (flag to test-writer).
9. **Dismiss On Outside Click** — with detail. Open via click, then dispatch a `mousedown`
   on `document.body`; asserts AC-18 (panel removed, `aria-expanded="false"`). Mirrors
   Popover Story 5.
10. **Dismiss On Escape** — with detail. Open via click, then dispatch `keydown` Escape on
    `document`; asserts AC-19 (panel removed, `aria-expanded="false"`). Mirrors Popover
    Story 7.
11. **Align And Width Forwarded** — with detail, `align: 'left'`, `width: 220`. Open via
    click; asserts AC-20 (panel `left: 0px` / `right: auto` fallback; computed `width`
    `220px`).
12. **Polymorphic As / Rest Forwarding** — `as: 'button'`, `'data-testid': 'pill'`,
    `'aria-label': 'Power rail status'`. Asserts AC-6 (forwarded attrs present on the
    trigger; queryable by `data-testid` / accessible name).

Story count: **12**. Acceptance criteria count: **25**.

Test-writer guidance:

- Probe tokens with `resolveTokenFgColor('--amber' | '--cyan' | '--danger' | '--ink-dim'
  | '--ink-faint')` for label/detail `color`, `resolveTokenColor('--bg-rail')` for the
  button `backgroundColor`, and `resolveTokenColor('--amber' | '--cyan' | '--danger' |
  '--rule-strong')` for `borderTopColor` (D37).
- Query the LED via `canvasElement.querySelector('.led')` (it has `role="status"` but so
  may other elements; class is the stable handle here). Assert `classList.contains(
  'led-<tone>')` / `classList.contains('blink')`.
- For the detail suffix colour, query the suffix span (give it a stable hook if needed,
  e.g. a structural selector) and assert its `color`.
- Disclosure stories: query the Popover panel by a `data-testid` forwarded to the detail
  snippet's root, or by the panel's content text (`getByText`). The panel is absent when
  closed (Popover renders nothing — B56 AC-1).
- Dismissal: dispatch `new MouseEvent('mousedown', { bubbles: true })` on
  `document.body` and `new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })`
  on `document`, with a `setTimeout(r, 0)` tick before asserting (Popover/Nav idiom).

## Out of scope

- **Changing `Led` or `Popover`.** Led already provides every tone (`cyan` included) and
  `blink`; Popover provides controlled open + dismissal. StatusPill only composes them.
  If a gap is found during implementation it is a separate item, not part of B50.
- **Uncontrolled Popover or a second open-state source.** StatusPill owns `open` in local
  `$state`; the Popover is controlled by it.
- **Auto-positioning / flip, focus management into the panel, panel animation.** Inherited
  Popover limitations (B56 Out of scope) — not added here.
- **A `tone="off"` pill in the matrix.** Led supports `off`, and StatusPill permits it,
  but it is not part of the reference variant set and is not a required tested story.
- **Compound `StatusPill.Trigger` / custom trigger element beyond `as`.** The trigger is
  the built-in `<button>` (polymorphic via `as`); no compound sub-components.
- **Programmatic/bindable external `open` prop.** The disclosure is self-managed (it is a
  single trigger-and-panel unit, unlike Popover which is a reusable layer). A bindable
  `open` could be a later enhancement if a consumer needs to drive it.

## Open questions

- **OQ-1 (non-blocking):** AC-21 sets `aria-haspopup="dialog"`. The detail panel is a
  content disclosure, so `"dialog"` is the closest fit; `"true"` is also acceptable to the
  a11y addon. If the addon flags `"dialog"` because the Popover panel does not carry
  `role="dialog"`, the implementer may either add `role="dialog"` + `aria-label` to the
  Popover (via `...rest` — B56 AC-3/AC-19 allow this) or relax `aria-haspopup` to `"true"`.
  Does not block implementation.
- **OQ-2 (non-blocking):** AC-17 ("no empty Popover") plus AC-21's "aria may be omitted
  when no detail" leaves the no-detail trigger's exact ARIA loosely specified on purpose —
  a pill with no detail is effectively a non-interactive status badge. The test only
  asserts no panel opens. If the reviewer prefers the no-detail trigger be a non-button
  (e.g. a `<span>`), that is a design tweak, not a blocker for B50.

No blocking open questions. Led and Popover both expose everything StatusPill needs; the
only dependency note is the prop-name mapping (`tone` → Led `color`), which is handled in
the component, not a gap.
