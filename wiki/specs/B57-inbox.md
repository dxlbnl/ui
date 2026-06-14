# B57: Inbox component

## Context

`Inbox` is the design-system notification centre: a 34×34 bell button (with an unread
count badge) that toggles a right-aligned `Popover` containing a header row and a
scrollable list of notification rows. It is the most composite component in this batch
but is structurally the **same shape as `StatusPill`** (D54/D56): an anchor that owns its
own `open` state and toggles a `Popover`, composing `Led` for the per-row status dot.

This spec is the contract for B57. Background:

- Item card: `wiki/backlog/doing/B57-inbox.md`
- Reference (downstream React, reference-only — the Svelte library is canonical):
  `wiki/specs/_design-refs/B57/Inbox.jsx`, `.../base.jsx` (reference `Led`),
  `.../preview-30-inbox.html`
- Composes existing library components (READ, do not modify):
  - `src/lib/components/feedback/Popover.svelte` (`wiki/specs/B56-popover.md`, D53) —
    controlled/bindable `open`, `onclose`, `align`, `width`. Inbox owns `open` and renders
    the panel via `Popover`.
  - `src/lib/components/primitives/Led.svelte` — prop is **`color`** (map `item.tone` →
    `color`); supports `blink` and tones `ok | amber | cyan | danger | off`.
  - `src/lib/components/feedback/StatusPill.svelte` (D54/D56) — the closest precedent
    (bell/trigger toggles a Popover-with-Led); Inbox mirrors its structure including the
    **D56 `onmousedown` stopPropagation guard** on the trigger.
- Constraints: Svelte 5 runes; Chakra-style authoring (D4); WCAG 2.1 AA; tests are
  Storybook `.stories.svelte` play functions using `storybook/test` (D1) — **never**
  `vitest`. Use **only existing tokens** (D62 — do NOT invent tokens); micro font-sizes
  (9/11/12/13/15px) and badge geometry are literal px (no matching token exists), per the
  house convention for mono micro-labels (StatusPill 11px, Pager 14px).

### Home category

Inbox lives in **`src/lib/components/feedback/`** — it is a notification surface that
owns disclosure state and depends on `Popover` (which lives in `feedback/`), exactly like
`StatusPill` (D54). Story title `Feedback/Inbox`. Exports are added to
`feedback/index.ts` and `src/lib/index.ts` (implementer's job).

## API

```ts
interface InboxItem {
  id: string | number
  tone: string          // Led colour token name: 'ok' | 'amber' | 'cyan' | 'danger' | 'off'
  title: string
  body: string
  time: string          // pre-formatted, e.g. 't.04' / '12:40'
  unread: boolean
}

interface Props extends HTMLButtonAttributes {
  /** Notification items rendered in the panel list. @default [] */
  items?: InboxItem[]
  /** Called with the clicked item when a list row is activated. */
  onOpen?: (item: InboxItem) => void
  /** Called when "Mark all read" is clicked (only shown when unread > 0). */
  onMarkAll?: () => void
  /** Glyph shown inside the bell button. @default '◔' */
  glyph?: string
  /** Accessible base name for the bell trigger. @default 'Notifications' */
  label?: string
  /** Popover edge alignment, forwarded to Popover. @default 'right' */
  align?: 'left' | 'right'
  /** Popover panel width, forwarded to Popover. @default 320 */
  width?: number | string
  /** Polymorphic trigger element. @default 'button' */
  as?: string
  [key: string]: unknown
}
```

- `tone` is typed as `string` (not a closed union) to match the reference, but a valid
  Led colour token is expected; the implementer forwards it 1:1 to `Led`'s `color` prop.
- Inbox owns `open` in local `$state` (mirrors StatusPill). The trigger toggles it; the
  `Popover`'s `onclose` clears it.
- `...rest` is spread onto the trigger element (StatusPill idiom — `aria-label`, `id`,
  `data-testid`, etc.).

## Acceptance criteria

Derived state (unread):

1. **Unread count is derived.** `unread === items.filter((i) => i.unread).length`. With
   the canonical 3-item fixture where 2 items have `unread: true`, the derived unread
   count is `2`.

2. **Bell glyph colour reflects unread.** The glyph `<span>` inside the bell has computed
   `color` resolving to `--amber` when `unread > 0`, and to `--ink-dim` when `unread === 0`.

3. **Badge shown only when unread > 0.** When `unread > 0` an unread-count badge element
   (`[data-part="badge"]`) is rendered and its text content equals the unread count
   (e.g. `"2"`). When `unread === 0` no `[data-part="badge"]` element exists in the DOM.

4. **"Mark all read" shown only when unread > 0.** When the panel is open and `unread > 0`,
   a button with accessible name `"Mark all read"` is present in the panel. When
   `unread === 0` and the panel is open, no such button exists.

Behaviour (disclosure):

5. **Closed by default.** On initial render no `.popover` panel exists and the trigger's
   `aria-expanded` is `"false"`.

6. **Click opens the Popover.** Clicking the bell renders a `.popover` panel containing the
   `"NOTIFICATIONS"` header and one list row per item; `aria-expanded` becomes `"true"`.

7. **Second click toggles closed.** A second click on the bell removes the `.popover`
   panel and sets `aria-expanded` back to `"false"`. (The D56 stopPropagation guard on the
   trigger is required so the trigger's own `mousedown` is not seen by Popover's document
   dismissal listener — without it the toggle-closed breaks.)

8. **Outside click dismisses.** With the panel open, an outside `mousedown` (dispatched on
   `document.body`) removes the `.popover` panel and sets `aria-expanded` to `"false"`
   (inherited from Popover, asserted here).

9. **Escape dismisses.** With the panel open, an `Escape` keydown on `document` removes the
   `.popover` panel and sets `aria-expanded` to `"false"`.

Behaviour (list actions):

10. **Clicking an item fires `onOpen` with that item.** With the panel open, clicking a
    notification row calls `onOpen` exactly once with the corresponding `InboxItem`
    (assert `onOpen` is called with an object whose `id`/`title` match the clicked row).

11. **Clicking "Mark all read" fires `onMarkAll`.** With the panel open and `unread > 0`,
    clicking the "Mark all read" button calls `onMarkAll` exactly once.

Per-item rendering:

12. **Each row is a button with an accessible name.** Each list row is a `<button>` whose
    accessible name includes its `title` (so it is reachable via
    `getByRole('button', { name: /<title>/ })`); the row also renders the item `body` and
    `time` text.

13. **Row LED colour = tone, blink when unread and tone ≠ 'ok'.** Each row renders a `Led`
    whose colour class matches `led-{tone}` (1:1 `tone`→`color`). A row that is `unread`
    and whose `tone !== 'ok'` carries the Led `blink` class; a row that is read, or whose
    `tone === 'ok'`, does not.

14. **Unread row weight + background.** An unread row's title span has computed
    `font-weight` `500`; a read row's title span has `400`. An unread row's row element has
    computed `background-color` resolving to `--bg-rail`; a read row's is `transparent`
    (`rgba(0, 0, 0, 0)`).

Accessibility:

15. **Bell accessible name carries the unread count.** The bell trigger's accessible name
    includes the count when `unread > 0` — its `aria-label` is
    `` `${label}, ${unread} unread` `` (e.g. `"Notifications, 2 unread"`). When
    `unread === 0` the `aria-label` is just `label` (e.g. `"Notifications"`). This ensures
    unread is **not conveyed by colour/badge alone** — it is in the accessible name as text.
    A consumer-supplied `aria-label` via `...rest` overrides this default.

16. **Disclosure semantics on the trigger.** The bell trigger has
    `aria-haspopup="dialog"` and `aria-expanded` reflecting the open state
    (`"false"` closed, `"true"` open).

17. **Unread is not colour/weight-only at the row level.** The unread state is exposed to
    AT as text, not only via LED colour, font-weight, and background: each unread row's
    button accessible name includes the word `"unread"` (e.g. via a visually-hidden
    span or an appended segment in the row's `aria-label`). A read row's accessible name
    does not include `"unread"`. (Implementer choice of mechanism: a visually-hidden
    `<span>` using the established clip pattern from D29, or an `aria-label` on the row
    button — either satisfies this AC.)

18. **"Mark all read" has an accessible name.** The mark-all control is a `<button>`
    reachable via `getByRole('button', { name: 'Mark all read' })`.

Visual (load-bearing tokens + literal geometry — assert only these):

19. **Bell button chrome.** The bell trigger is a `<button>` 34×34 px with computed
    `border` `1px solid` resolving to `--rule-strong` and `background-color` resolving to
    `--bg-rail`.

20. **Badge geometry/colour.** When rendered, the badge has computed `background-color`
    resolving to `--amber`, text `color` resolving to `--bg`, `min-width` `15px`,
    `height` `15px`, and `border-radius` `8px`; it is positioned absolutely
    (`position: absolute`).

21. **Header label.** The panel header contains an element with text `"NOTIFICATIONS"`
    whose computed `text-transform` is `uppercase` and whose `font-family` is the mono
    stack (contains `jetbrains mono`), `color` resolving to `--ink-faint`.

22. **List scroll bound.** The list container (`[data-part="list"]`) has computed
    `max-height` `360px` and `overflow-y` `auto`.

### Notes on token/px usage

- Tokens used (all exist in `tokens.css`): `--rule-strong`, `--bg-rail`, `--amber`,
  `--ink-dim`, `--bg`, `--rule`, `--ink-faint`, `--ink`, `--mono`. Led colours come from
  the `Led` primitive's own classes.
- Literal px (no matching token; per house convention for mono micro-labels): bell 34×34,
  glyph `15px`, badge `min-width 15` / `height 15` / `radius 8` / `top -5` / `right -5` /
  `font-size 9`, header `font-size 11` + `letter-spacing 0.12em`, mark-all `font-size 10`,
  row gap `11`, padding `12px 14px` / header `11px 14px`, title `13px`, time `9px`,
  body `12px` + `line-height 1.45`, list `max-height 360`, popover `width 320`. Do NOT
  invent tokens (D62).
- CSS is scoped with native nesting (D45). `Led` and `Popover` own their own classes
  (`.led*`, `.popover`); Inbox styles only its own markup (bell, badge, glyph, header,
  mark-all, list, rows). Per D38 the bell is the polymorphic trigger and the rows are
  `<button>`s; `Led`/`Popover` primitives are reused rather than re-implemented. The row
  `<button>`s and mark-all are bespoke styled buttons (not the `Button` primitive — none
  of its variants match), a narrow D38 exception on the same footing as D54 (StatusPill
  native trigger) and D63 (Pager native arrows).

### Test contract — `data-part` hooks

Non-role-bearing internal elements carry stable `data-part` hooks (house convention,
D55/D59/D60/D63). The implementer MUST render:

- `[data-part="glyph"]` on the glyph `<span>` (AC 2).
- `[data-part="badge"]` on the unread-count badge `<span>` (AC 3, 20); absent when
  `unread === 0`.
- `[data-part="list"]` on the scrollable list container (AC 22).
- `[data-part="row"]` on each notification `<button>`; `[data-part="title"]` on each row's
  title span (AC 14).
- `[data-part="header-label"]` on the `"NOTIFICATIONS"` header element (AC 21).

The bell trigger is reached via `getByRole('button', { name })`; the row buttons via
`getByRole('button', { name: /<title>/ })`; the mark-all button via
`getByRole('button', { name: 'Mark all read' })`; the Popover panel via its `.popover`
class; the Led via `.led` / `led-{tone}` / `.blink` classes.

## Story plan (play functions, `storybook/test`)

`Inbox.stories.svelte`, title `Feedback/Inbox`, `component: Inbox`, `tags: ['autodocs']`.
Spies via `fn()` from `storybook/test`. Canonical 3-item fixture: 2 unread (one `amber`,
one `danger`), 1 read (`ok`).

1. **Closed With Unread** — default (closed) state with the 3-item fixture. Asserts AC 1
   (count 2), AC 2 (glyph `--amber`), AC 3 (badge present, text `"2"`), AC 5 (no panel,
   `aria-expanded="false"`), AC 15 (`aria-label` `"Notifications, 2 unread"`), AC 16
   (`aria-haspopup="dialog"`), AC 19 (bell chrome), AC 20 (badge geometry/colour).

2. **Opens On Click** — clicks the bell. Asserts AC 6 (panel + header + N rows render,
   `aria-expanded="true"`), AC 21 (header `"NOTIFICATIONS"` uppercase mono faint), AC 22
   (list `max-height 360` / `overflow-y auto`), AC 12 (each row a button with title),
   AC 7 (second click toggles closed — the D56 guard path).

3. **Item Rendering** — opens, then inspects rows. Asserts AC 13 (per-row `led-{tone}` +
   blink on unread non-ok, no blink on read/ok), AC 14 (unread title weight 500 +
   `--bg-rail` bg; read title weight 400 + transparent bg), AC 17 (unread row accessible
   name includes `"unread"`, read row does not).

4. **Click Item Fires onOpen** — `onOpen: fn()`; opens, clicks the first row. Asserts
   AC 10 (`onOpen` called once with the matching item — assert `id`/`title`).

5. **Mark All Fires onMarkAll** — `onMarkAll: fn()`; opens, clicks "Mark all read".
   Asserts AC 4 (button present, `unread > 0`), AC 11 (`onMarkAll` called once), AC 18
   (reachable by accessible name).

6. **All Read** — fixture where every item has `unread: false`. Asserts AC 1 (count 0),
   AC 2 (glyph `--ink-dim`), AC 3 (no badge), AC 15 (`aria-label` `"Notifications"`).
   Then opens and asserts AC 4 (no "Mark all read" button).

7. **Dismiss On Outside Click** — opens, then `document.body` `mousedown`. Asserts AC 8
   (panel removed, `aria-expanded="false"`). Includes the positive control (the panel
   actually opened first) per the B56 positive-control ADR.

8. **Dismiss On Escape** — opens, then `Escape` keydown on `document`. Asserts AC 9.

9. **Polymorphic As / Rest Forwarding** — passes `id`, `data-testid`, and an explicit
   `aria-label`. Asserts AC 15's override path (consumer `aria-label` wins) and `...rest`
   forwarding onto the trigger (StatusPill Story 12 idiom).

Total: **22 acceptance criteria**, **9 stories**.

## Out of scope

- An externally bindable `open` prop / `bind:open` — Inbox owns `open` internally
  (StatusPill precedent); a future item can add a bindable variant.
- A compound `Inbox.Item` / `Inbox.Header` API.
- Grouping, "load more"/pagination, empty-state messaging when `items` is `[]` (an empty
  list simply renders an empty scroll container), per-item read/unread mutation (Inbox is
  presentational — `onOpen`/`onMarkAll` are callbacks; the consumer owns the data).
- Auto-positioning/flipping of the Popover, focus management into the panel, and keyboard
  arrow-navigation within the list (inherited Popover behaviour only).
- Animation of badge/panel.

## Open questions

None blocking.

- **OQ-1 (non-blocking):** AC 17 mechanism for surfacing "unread" as text is left to the
  implementer (visually-hidden span via the D29 clip pattern, or an `aria-label` on the
  row button). The story queries by accessible name, so either implementation satisfies
  it. Recommendation: a visually-hidden span keeps the visible row markup untouched.
- **OQ-2 (non-blocking):** Whether row buttons should announce `body`/`time` as part of
  the accessible name or rely on visible text alone. The spec only requires the `title`
  (+ "unread") in the accessible name (AC 12, 17); `body`/`time` are visible text and need
  not be in the name. A consumer needing richer announcements can pass `aria-label` later.
