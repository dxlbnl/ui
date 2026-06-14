# B58: AppShell component

## Context

Port the design-system `AppShell` into `@dxlbnl/ui` — a full-height responsive
application frame that other content slots into. It is the most architecturally
significant component in this batch: a single component that presents a **desktop
sidebar rail** layout and a **mobile bottom tab-bar** layout, switching at a 760px
breakpoint.

- Item card: `wiki/backlog/doing/B58-app-shell.md`
- Vision / requirements / architecture: `wiki/vision.md`, `wiki/requirements.md`,
  `wiki/architecture.md` (Chakra-style authoring, WCAG 2.1 AA, SSR-safe, Svelte 5 runes).
- Design reference (React, reference ONLY — the Svelte library is canonical):
  `wiki/specs/_design-refs/B58/AppShell.jsx`, `.../base.jsx`,
  `.../preview-31-app-shell.html`.
- Decisions applied: D4 (polymorphic `as` + `...rest` + strict TS), D38 (primitives
  first — reuse `Led`), D43 (text-or-snippet single prop), D45 (native CSS nesting),
  D52 (SSR-safety via `$effect`, no `$app/environment`), D62 (only existing tokens;
  literal px allowed for micro sizes/widths).
- Existing precedents to mirror: `src/lib/components/primitives/Led.svelte` (used by the
  tab nav items), `src/lib/components/navigation/Nav.svelte` (responsive nav, a11y),
  `src/lib/components/layout/Container.svelte` + `Grid.collapse.stories.svelte`
  (the **container-query** pattern this spec adopts for the responsive switch).

### Responsive strategy — DECISION (container queries, option A variant)

Use **CSS-only container queries**, not a `matchMedia` rune (option B) and not viewport
`@media` (plain option A). Rationale, and why container queries specifically:

- **SSR-safe, no hydration flash** — the structure renders once on the server; CSS
  alone decides which layout is visible. No JS-driven re-structuring, no default-then-
  hydrate flash (rejects option B).
- **Deterministically testable** — a Storybook play function cannot reliably change the
  browser **viewport** width, so plain viewport `@media` (min-width) cannot be asserted
  at two widths in the same run. A **container query** (`@container (min-width: 760px)`)
  responds to a *container's* width, which the play function fully controls by setting a
  wrapper element's `width`. This is the exact, already-proven pattern in
  `Grid.collapse.stories.svelte` + `Container.svelte` (`container-type: inline-size`).
- **Single source of structure** — both navs render in the DOM; CSS toggles which is
  visible and the hidden one is removed from the a11y tree and tab order (see a11y ACs).

The breakpoint is **760px** (matches the reference `(min-width: 760px)`): at container
width ≥ 760px the desktop rail layout is shown; below 760px the mobile tab-bar layout is
shown. See the **ADR in `wiki/decisions.md`** (Archive) for the full record.

### Home category — DECISION

AppShell lives in **`src/lib/components/navigation/`** (not a new `layout`/`shell`
home). Justification: although it is a layout frame, its
defining behaviour and public API (`nav`, `current`, `onNavigate`, rail/tab NavItems,
`aria-current`) are navigation concerns, and it composes the nav-centric `Led`
primitive; `navigation/` already houses `Nav`, `Breadcrumb`, `Pager`. Keeping it beside
those keeps the responsive-nav precedent (`Nav.svelte`) co-located. The implementer adds
the export to `navigation/index.ts` and the package barrel `src/lib/index.ts`.

## API

```ts
interface NavItem {
  id: string
  label: string
  badge?: number | string
}

interface Props {
  /** Brand block (top of the rail). String or Snippet (D43). */
  brand?: string | Snippet
  /** Left side of the sticky top bar. String or Snippet (D43). */
  topLeft?: string | Snippet
  /** Right side of the sticky top bar. String or Snippet (D43). */
  topRight?: string | Snippet
  /** Optional rail footer (desktop only). String or Snippet (D43). */
  footer?: string | Snippet
  /** Navigation items rendered in both rail and tab bar. @default [] */
  nav?: NavItem[]
  /** id of the currently-active nav item. */
  current: string
  /** Called with the item id when a nav item is activated. */
  onNavigate: (id: string) => void
  /** Required main content. */
  children: Snippet
  /** Polymorphic root element. @default 'div' */
  as?: string
  [key: string]: unknown   // ...rest forwarding (D4)
}
```

- `brand`, `topLeft`, `topRight`, `footer` follow D43: typed `string | Snippet`, the
  template discriminates with `typeof prop === 'function'`. A plain string renders as
  text; a snippet renders via `{@render}`.
- `...rest` is spread onto the root element; `as` defaults to `'div'`.
- The component is **stateless** for navigation: `current` and `onNavigate` are owned by
  the consumer (controlled). AppShell never mutates `current`.

## Acceptance criteria

Terminology: **CQ root** = the AppShell root element, which carries
`container-type: inline-size`. Stories wrap it in a width-controlled element so play
functions can set the container width to assert either layout (see Story plan).

### Structure — shared

1. The component renders a single root element (default `<div>`, overridable via `as`)
   that has `container-type: inline-size` (computed `containerType` is `inline-size` or
   `size`), so descendant `@container` rules resolve against the root's width.
2. `...rest` attributes are forwarded onto the root element (e.g. a passed
   `data-testid` appears on the root).
3. The main content is rendered inside a `<main>` element; the `children` snippet output
   appears inside it. `<main>` has `overflow-y: auto` (scrollable) in both layouts.
4. The sticky top bar is present in both layouts: it contains the `topLeft` content on
   the start side and the `topRight` content on the end side, has
   `position: sticky`, `top: 0`, `z-index: 50`, `background` = `--bg`, and
   `border-bottom-color` = `--rule`.
5. There are exactly **two** `<nav>` landmarks in the DOM (rail nav + tab nav); each has
   a distinguishing `aria-label` (e.g. rail `"Primary"`, tab `"Primary"` — the labels
   must differ enough to disambiguate, e.g. `aria-label="Primary"` on one and the other
   marked `aria-hidden` per AC-22 so only one is exposed at a time).

### Desktop layout (container width ≥ 760px)

6. At container width ≥ 760px, the desktop **`<aside>` rail** is visible
   (`getComputedStyle(aside).display` is not `none`) and the mobile tab `<nav>` is
   hidden (`display: none`).
7. The `<aside>` rail has `width: 212px`, `border-right-color` = `--rule`,
   `background` = `--bg-rail`, and `display: flex` with `flex-direction: column`.
8. The rail's brand block is the first child region, has `border-bottom-color` = `--rule`,
   and renders the `brand` content.
9. The rail contains a `<nav>` with one rail NavItem per `nav[]` entry, in order.
10. When `footer` is provided, a footer region renders at the bottom of the rail with
    `border-top-color` = `--rule` and the `footer` content. When `footer` is omitted, no
    footer region is rendered.
11. To the right of the rail, a column holds the sticky top bar above the scrollable
    `<main>`; the overall desktop frame is full height (root or frame has
    `height: 100vh`/`100%` and `overflow: hidden` so only `<main>` scrolls).

### Mobile layout (container width < 760px)

12. At container width < 760px, the desktop `<aside>` rail is hidden
    (`getComputedStyle(aside).display === 'none'`) and the mobile tab `<nav>` is visible
    (`display` not `none`).
13. The mobile layout is a column: sticky top bar, then scrollable `<main>`, then the
    bottom tab `<nav>`. The bottom tab `<nav>` has `border-top-color` = `--rule` and
    `background` = `--bg-rail`, and is laid out `display: flex` (tabs share the row).
14. The bottom tab `<nav>` contains one tab NavItem per `nav[]` entry, in order.

### Rail NavItem (desktop)

15. Each rail NavItem is a real `<button>` with an accessible name equal to its `label`.
16. The **active** rail NavItem (its id === `current`) has `border-left-color` = `--amber`
    and `color` = `--amber`; an **inactive** rail NavItem has a transparent
    `border-left-color` (`rgba(0, 0, 0, 0)`) and `color` = `--ink-dim`.
17. The active rail NavItem has `aria-current="page"`; inactive rail NavItems do not have
    `aria-current`.
18. A rail NavItem whose `nav[]` entry has a `badge` renders a badge pill containing the
    badge text, with `background` = `--amber` and text `color` = `--bg`. A NavItem with no
    `badge` renders no pill.
19. Clicking a rail NavItem calls `onNavigate` exactly once with that item's `id` (a
    `fn()` spy receives the id).
20. The rail NavItem label uses the mono font (`font-family` resolves to the `--mono`
    stack) and is uppercase (`text-transform: uppercase`).

### Tab NavItem (mobile)

21a. Each tab NavItem is a real `<button>` with an accessible name equal to its `label`.
21b. The **active** tab NavItem (id === `current`) has `aria-current="page"`; inactive
    tab NavItems do not.
21c. The active tab NavItem shows a top active-bar element (the `22×2` indicator) with
    `background` = `--amber`; on an inactive tab that bar's background is transparent
    (`rgba(0, 0, 0, 0)`).
21d. Each tab NavItem contains a `Led` primitive: `color="amber"` when active, `color="off"`
    when inactive. (Assert via the `Led`'s class — `led-amber` on active, `led-off` on
    inactive — since `Led` renders `class="led led-{color}"`.)
21e. The active tab NavItem label `color` = `--amber`; an inactive tab NavItem label
    `color` = `--ink-faint`.
21f. A tab NavItem whose entry has a `badge` renders a small dot indicator with
    `background` = `--amber`; a NavItem with no `badge` renders no dot. (The mobile badge
    is a dot, not the numeric pill.)
21g. Clicking a tab NavItem calls `onNavigate` exactly once with that item's `id`.

### Slots (snippets / strings — D43)

22a. `brand`, `topLeft`, `topRight`, `footer` each accept a plain string: the string text
    appears in the corresponding region.
22b. The same props each accept a Snippet: the snippet's rendered markup appears in the
    corresponding region (assert by a marker element inside the snippet, e.g. a
    `data-testid`).
22c. `children` (required) renders inside `<main>` (covered by AC-3, asserted here with a
    marker element).

### Accessibility

23. Only **one** nav landmark is exposed to assistive tech at a time: at a given
    container width, the hidden nav (`display: none` per AC-6/AC-12) is also marked
    `aria-hidden="true"` and its buttons are not focusable (the hidden subtree is removed
    from the tab order — either via `display:none` alone, which removes focusability, or
    an explicit `tabindex="-1"`; assert the hidden nav has `aria-hidden="true"`).
24. The main content region is a `<main>` landmark.
25. The active nav item is marked with `aria-current="page"` (AC-17 / AC-21b); this is the
    programmatic active indicator, independent of the colour styling.
26. The component passes the Storybook a11y audit (no violations) in both desktop and
    mobile stories. In particular, every nav `<button>` has a non-empty accessible name
    (its `label`); badge pills/dots are decorative (`aria-hidden` or visually-only) and do
    not break the button's name.

### Tokens & CSS

27. Only existing tokens are referenced (`--bg`, `--bg-rail`, `--ink-dim`, `--ink-faint`,
    `--amber`, `--rule`, `--mono`, and the `--ok`/etc. tones via `Led`). No new tokens are
    invented. Literal px values are permitted only for micro sizes/structural widths
    (`212px` rail width, `2px` borders/active bars, `22px` tab bar width, `16px`/`7px`
    badge sizes, `760px` breakpoint, paddings). (D62)
28. All CSS is scoped to the component (Svelte `<style>` block) and uses **native CSS
    nesting** (D45); the responsive switch uses `@container (min-width: 760px)` rules, not
    viewport `@media`. No flat `.host :global(child)` selectors.
29. `Led` is used via the existing primitive (D38) for the tab NavItem indicator — the tab
    item does not re-implement an LED dot.

## Story plan (Storybook play functions)

Tests are Storybook `.stories.svelte` play functions only (D1). Imports from
`storybook/test` (`expect`, `within`, `fn`, `waitFor`), token helpers from
`$lib/storybook-utils.js` (`resolveTokenColor` for background/border channels,
`resolveTokenFgColor` for `color`). **Never** import from `vitest` (B61).

**Driving both breakpoints deterministically:** because the responsive switch is a
**container query** on the AppShell root (`container-type: inline-size`), each story
renders `<AppShell>` inside a width-controlled wrapper (e.g.
`<div style="width: 940px; height: 600px;">…</div>` for desktop,
`<div style="width: 600px; height: 600px;">…</div>` for mobile). The play function then
asserts `getComputedStyle(aside).display` / `getComputedStyle(tabNav).display` at that
fixed width. Stories that need to assert *both* layouts may keep two wrappers in the slot
(desktop-width and mobile-width) and query each. Use `waitFor` around the first
`display` read so the container query has resolved (mirrors `Grid.collapse.stories.svelte`).
Because `component:` wraps the slot once, these are **composition-style** stories: set
`component: AppShell` for the primary single-instance stories, and place any
multi-instance / explicit-wrapper stories in a sibling
`AppShell.composition.stories.svelte` with no `component:` (precedent D9/D46), OR render
the single AppShell inside one width wrapper in the slot without `component:`. The
test-writer chooses; the key requirement is that the width wrapper is the controllable
container.

Suggested stories (each a `play` test):

1. **Desktop Layout** (wrapper width ≥ 760px) — `<aside>` rail visible (AC-6), tab nav
   `display:none` (AC-6), rail width `212px` + rail token borders/bg (AC-7), brand block
   renders `brand` + bottom rule (AC-8), one rail button per item in order (AC-9), full
   height + only `<main>` scrolls (AC-11), top bar sticky/z-index/tokens (AC-4), `<main>`
   landmark present (AC-24).
2. **Desktop Active + Badge** (≥ 760px) — active rail item has `--amber`
   border-left/colour + `aria-current="page"` (AC-16, AC-17), inactive item transparent
   border + `--ink-dim` (AC-16) + no `aria-current`, badge pill present with `--amber`
   bg / `--bg` text on the badged item and absent on others (AC-18), label mono+uppercase
   (AC-20).
3. **Desktop Navigate** (≥ 760px) — `onNavigate: fn()`; click a rail button →
   `toHaveBeenCalledTimes(1)` with that item's id (AC-19).
4. **Desktop Footer Present / Absent** — with `footer` set, footer region renders with
   top rule + content (AC-10); a second wrapper/story with `footer` omitted asserts no
   footer region (AC-10).
5. **Mobile Layout** (wrapper width < 760px) — tab `<nav>` visible + bottom rule + bg
   tokens + `display:flex` (AC-12, AC-13), `<aside>` `display:none` (AC-12), one tab
   button per item in order (AC-14), `<main>` scrollable (AC-3).
6. **Mobile Active + Led + Badge** (< 760px) — active tab top-bar `--amber` / inactive
   transparent (AC-21c), active tab `Led` has class `led-amber` and inactive `led-off`
   (AC-21d), active label `--amber` / inactive `--ink-faint` (AC-21e), `aria-current`
   on active (AC-21b), badge dot `--amber` present on badged item / absent otherwise
   (AC-21f).
7. **Mobile Navigate** (< 760px) — `onNavigate: fn()`; click a tab button →
   `toHaveBeenCalledTimes(1)` with id (AC-21g).
8. **A11y — One Nav Exposed** — at desktop width assert the tab nav is `aria-hidden`
   (and not focusable), at mobile width assert the rail nav is `aria-hidden` (AC-23); both
   widths pass the a11y audit (AC-26). May use two wrappers in one story or two stories.
9. **Snippet & String Slots** — render `brand`/`topLeft`/`topRight`/`footer` once as
   plain strings (assert text present, AC-22a) and once as snippets containing a
   `data-testid` marker (assert marker present, AC-22b); `children` marker inside `<main>`
   (AC-22c).

Target: ~9 stories (the test-writer may split or merge; the AC coverage above is the
contract). Use semantic queries first (`getByRole('button', { name })`,
`getByRole('navigation')`, `getByRole('main')`); fall back to `querySelector`/
`data-testid` only for the active-bar, badge, and Led indicators that have no accessible
handle (justified per the stories guide).

## Out of scope

- Programmatic/controlled responsiveness via `matchMedia` or a viewport `@media` switch
  (rejected in favour of container queries).
- Keyboard arrow-key roving between nav items (buttons are individually Tab-focusable;
  WAI-ARIA tablist roving navigation is not implemented — the nav is a list of buttons,
  not a `tablist`).
- Persisting `current`, route integration (`$app/*`), or any internal navigation state —
  AppShell is controlled.
- Collapsible/resizable rail, drawer overlays, multi-level nav, nav icons beyond the tab
  `Led`, breadcrumb in the top bar.
- Animated layout transitions between rail and tab bar.
- Theming beyond the existing two-palette token system (works automatically via tokens).

## Open questions

- **OQ-1 (non-blocking):** Exact `aria-label` strings for the two `<nav>` landmarks. The
  spec requires each `<nav>` to have an `aria-label` and the hidden one to be
  `aria-hidden`; the precise text (e.g. `"Primary"`) is the implementer's choice and does
  not change behaviour. The test-writer asserts presence of a non-empty label and the
  `aria-hidden` state, not a specific string.
- **OQ-2 (non-blocking):** Whether the hidden nav needs an explicit `tabindex="-1"` on its
  buttons in addition to `display:none`. `display:none` already removes elements from the
  tab order, so the AC asserts `aria-hidden` + non-focusability; the implementer may add
  `tabindex="-1"` defensively. The test-writer should verify focusability via the hidden
  nav not receiving focus, or simply assert `aria-hidden="true"` (AC-23).

No blocking open questions — the spec is implementable as written.

## Notes / amendments

- **2026-06-14 — design-system alignment pass (D73).** Visual-only tightening of
  `AppShell.svelte` against `_design-refs/B58/AppShell.jsx`; no AC changed, all 29 ACs and
  the 9 stories still green.
  - Rail + tab labels: added `letter-spacing: 0.08em` (the mono/uppercase tracking the rest
    of the system uses); tab label `font-size` 12px → 10px.
  - Rail count badge: rounded count **pill** — `border-radius: 8px` (deliberately not the
    sharp `--radius`, matching the Inbox count badge), `font-family: var(--mono)`,
    `font-size: 10px`, `padding: 0 4px`. AC-18 only asserts amber bg / `--bg` text, unchanged.
  - Tab active indicator: horizontally centred over the item (`left: 50%;
    transform: translateX(-50%)`) — was top-left anchored. AC-21c (colour) unchanged.
  - Tab badge dot: now an absolute 7px amber dot with an `0 0 5px var(--amber)` glow,
    positioned top-right of the item, instead of an in-flow 6px dot. AC-21f (amber bg /
    presence) unchanged.
  - Rail nav: `padding-top: var(--u)` for a small gap below the brand block.
  - Top bar: roomier desktop gutter — `padding: 0 var(--u3)` (24px) inside the ≥760px
    container query (mobile stays `0 var(--u2)`). AC-4 asserts position/sticky/tokens, not
    padding, so unchanged.
  - Within D62/AC-27: the literal `8px` radius and `7px`/glow dot are micro visual sizes;
    all colours remain tokens.
- **2026-06-14 — desktop layout bug fix (D74).** Found while reviewing the rendered story:
  on desktop the rail stacked *above* the content instead of sitting *beside* it. Root cause:
  `container-type: inline-size` lived on `.app-shell` **and** the `@container (min-width:760px)`
  rule tried to switch `.app-shell`'s own `flex-direction: column → row`. An element cannot
  match an `@container` query against its **own** `container-type` (the query resolves against
  an *ancestor* container), so that rule never fired and the root stayed `column`. The rail's
  own rules (display/width) *did* apply because the rail is a descendant — which is why the
  original tests (asserting the rail, never the root's direction) stayed green and the bug
  shipped in B58. Fix: the column→row switch moved to a new inner `.app-shell-layout` wrapper
  (a descendant of the container); the root keeps `container-type` (AC-1 intact). Added a
  regression assertion to the **Desktop Layout** story — the rail's right edge must be ≤ the
  frame's left edge and the two share a top (side-by-side, not stacked) — and gave the content
  column a stable `data-part="frame"` selector. This refines AC-1/AC-6/AC-7: the container
  context (AC-1) and the responsive switch must live on **different** elements.
- **2026-06-14 — stories rebuilt to the design reference + consolidated 9 → 6.** The stories
  used sparse placeholder slots (`DXLB` / `Workspace` / `Account`, no footer) so the rendered
  frame didn't look like the design and read as "missing the top bar / rail footer". Every demo
  story now renders the `preview-31-app-shell` content via shared top-level snippets: brand =
  `Led` + `DEXTERLABS`, `topLeft` = `// Rails`, `topRight` = `v3.0`, `footer` =
  `Est. 2019 · Delft`, body = the `// Rails` eyebrow + "Resize me" `h1` + paragraph, over the
  design's nav fixture `Home / Rails (badge 3) / Orders / You` with `current="rails"`. No AC
  changed; the 29 ACs are now covered by **6** lean stories (each carrying a full play test) —
  *Desktop* (folds AC-1/3/4/6/7/8/9/10/11/16/17/18/20/24 + the D74 rail-beside-frame
  regression), *Desktop — Navigate* (AC-19), *Mobile* (AC-3/12/13/14/21b-f), *Mobile —
  Navigate* (AC-21g), *A11y — One Nav Exposed* (AC-5/23), *Slots — Strings & Snippets*
  (AC-10 absent/AC-22a/b/c) — superseding the "~9 stories" suggestion in the Story plan above
  (that list remains the AC-coverage contract, not a story count). Play assertions track the
  new fixture text (`DEXTERLABS`, `Home/Rails/Orders/You`, `// Rails`, `v3.0`, `Delft`).
