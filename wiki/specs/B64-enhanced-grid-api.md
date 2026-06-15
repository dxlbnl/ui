# B64: Enhanced Grid API — template, stackBelow, align

## Context

`<Grid>` today only does symmetric `cols={1|2|3|4|'auto'}` plus the B42 responsive
collapse (cols 3/4→2 at ≤900px, cols 2/3/4→1 at ≤720px, container-query-driven).
Downstream apps need three things the constrained API cannot express:

- **Asymmetric track lists** — e.g. `minmax(min-content, 0.9fr) minmax(0, 1.1fr)` —
  which `cols` (equal columns only) can never produce.
- **Collapse-to-one for any layout** — including a `template` grid and including `cols`
  grids that want a *different* collapse point than B42's fixed schedule.
- **Cross-axis alignment** (`align-items`) control, currently impossible.

This item adds these as a **backward-compatible superset**: the existing props (`as`,
`cols`, `gap`, `minColWidth`), the B42 collapse behaviour, and every B42 acceptance
criterion remain intact. The one intentional behaviour change is the latent gap-scale
bug fix below.

The implementation reuses B42's two load-bearing mechanisms verbatim:

- The column value lives in the `--grid-cols` custom property (not inline
  `grid-template-columns`), so scoped `@container` rules can override it without
  `!important`. (B42 AC-2.)
- Collapse is a pure CSS `@container (max-width: …)` rule keyed on a `data-*` attribute,
  tracking the parent `<Container>` (which sets `container-type: inline-size`) — never
  the viewport, never JS. (B42 AC-3, AC-4, AC-5.)

`align` follows the **`Inline` component's `data-align` pattern** (`src/lib/components/
layout/Inline.svelte`, lines 41–45): a constrained union forwarded as a `data-align`
attribute, resolved by scoped CSS attribute selectors. The gap fix brings Grid's
`gapMap` into line with `Inline`'s already-correct scale.

Related pages: [architecture.md](../architecture.md) (component authoring conventions),
[stories-guide.md](../stories-guide.md) (composition-stories pattern),
[B42 spec](B42-grid-responsive-collapse.md) (the contract this item must not break),
[decisions.md](../decisions.md) (D5, D45 native nesting; D32 the B25 gap-scale decision),
item card [B64](../backlog/done/B64-enhanced-grid-api.md).

Source under change: `src/lib/components/layout/Grid.svelte`.
Existing tests that must stay green: `src/lib/components/layout/Grid.collapse.stories.svelte`
(all eight B42 collapse stories) and `src/lib/components/layout/Grid.stories.svelte`
(the five B42 prop stories), except where an AC below mandates an update.

---

## Rationale / Decision

**Why `stackBelow` is container-query-native + tokenized, not a viewport
`useMediaQuery`.** Three independent reasons, each disqualifying on its own:

1. **Viewport-coupling regresses B42.** B42's entire point is that `<Grid>` tracks its
   *parent container's* inline size, so a grid nested in a narrow sidebar collapses even
   when the viewport is wide. A `useMediaQuery`/`matchMedia` viewport check would make
   `stackBelow` collapse on viewport width instead, contradicting the collapse model the
   rest of `Grid` uses and producing inconsistent behaviour between `cols` collapse
   (container) and `stackBelow` collapse (viewport).
2. **JS adds an SSR layout flash.** A `$effect`/`matchMedia` collapse cannot run during
   SSR; the first paint renders the un-collapsed grid, then JS hydrates and snaps to one
   column — a visible reflow. The architecture mandates SSR-safe-by-default (architecture.md
   "SSR-safe by default"). A pure CSS `@container` rule has no flash: it is correct on the
   very first paint, server or client.
3. **Arbitrary px thresholds are a design-system anti-pattern.** Exposing a raw pixel
   prop pushes layout decisions onto every caller and fragments the breakpoint scale.
   A tokenized `'sm' | 'md' | 'lg'` union keeps the breakpoints centralised and anchored
   to the lib's existing scale (`md` = 720px, the B42 single-column breakpoint; `lg` =
   900px, the B42 tablet breakpoint).

An ADR recording this decision must be appended to the **Archive** section of
`decisions.md` **when the item is implemented** (the spec-writer notes it here; the
implementer/manager logs the ADR with the final px scale).

---

## API summary (the new surface)

```ts
type GridCols = 1 | 2 | 3 | 4 | 'auto'                 // unchanged
type GapSize  = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'  // unchanged union
type StackBelow = 'sm' | 'md' | 'lg'                   // NEW
type GridAlign  = 'start' | 'center' | 'end' | 'stretch'   // NEW

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: string                 // unchanged, default 'div'
  cols?: GridCols             // unchanged, default 3
  gap?: GapSize              // unchanged, default 'sm'  (gapMap.md fixed — see AC-G1)
  minColWidth?: string       // unchanged, default '240px'
  template?: string          // NEW — raw grid-template-columns escape hatch
  stackBelow?: StackBelow    // NEW — tokenized collapse-to-1 breakpoint
  align?: GridAlign          // NEW — align-items, default 'stretch'
}
```

**`stackBelow` token → container max-width** (chosen scale, recorded here):

| token | container `max-width` | source |
| ----- | --------------------- | ------ |
| `sm`  | `480px`               | new, between md and the small end |
| `md`  | `720px`               | reuses B42's single-column breakpoint |
| `lg`  | `900px`               | reuses B42's tablet breakpoint |

`md` is anchored to 720px for consistency with B42 AC-5. `lg` reuses the existing 900px
breakpoint. `sm` is set to 480px (a new value below md, for tight nested contexts;
finalised by the user at the B64 review checkpoint). These three px values are the
contract for the collapse ACs below.

---

## Acceptance criteria

Numbering continues the B42 namespace with a `B64-` prefix so there is no collision with
B42's `AC-1..AC-18`. Every AC below is verifiable by a Storybook play function asserting
resolved `getComputedStyle(...).gridTemplateColumns` / `.alignItems` / `--grid-cols`, and
(for collapse ACs) by wrapping the grid in a `<Container>` at a fixed width above and
below the threshold — exactly the pattern in `Grid.collapse.stories.svelte`.

### Group T — `template` (escape hatch)

**B64-T1 — `template` renders the given track list**
When `template="minmax(0, 0.9fr) minmax(0, 1.1fr)"` is passed (and no width forces a
collapse), `getComputedStyle(root).gridTemplateColumns` resolves to two tracks whose
widths reflect the asymmetric ratio (the second wider than the first — assert two
whitespace-separated tokens and that they are **not** equal, i.e. `/^(\S+)\s+(\S+)$/`
matches with token 1 ≠ token 2). `getComputedStyle(root).getPropertyValue('--grid-cols')`
contains the supplied template string (e.g. contains `'minmax'`).

**B64-T2 — `template` overrides `cols`**
When both `template` and `cols` are passed (e.g. `cols={3} template="60px 1fr"`), the
rendered columns come from `template`, not `cols`. `--grid-cols` contains `'60px'` and
the resolved `gridTemplateColumns` is two tracks, not three.

**B64-T3 — `template` neutralises `data-cols` so cols-collapse rules cannot match**
When `template` is set, `root` does **not** carry a `data-cols` value that any B42
`@container` rule targets. Concretely: `root.dataset.cols` is `undefined` (attribute
omitted) **or** set to a value (e.g. `"template"`) that no `@container` selector in the
`<style>` block matches. The chosen approach is **omit `data-cols` entirely when
`template` is set** (recommended); the implementer may instead emit a non-matching
sentinel, provided no `[data-cols="1|2|3|4"]` rule fires. The test asserts that a
`template` grid in a `<Container style="width: 680px">` (below the 720px B42 rule) keeps
its two `template` tracks and does **not** collapse to one column from the cols rules.

**B64-T4 — `template` collapse is governed solely by `stackBelow`**
With `template` set and **no** `stackBelow`, the grid never collapses at any container
width (no cols-collapse rule applies, no stack rule applies). A `template` grid in a
`<Container style="width: 400px">` still renders its full multi-track template (assert
≥2 tracks resolved). (Combined `template` + `stackBelow` behaviour is covered by B64-S4.)

### Group S — `stackBelow` (tokenized collapse)

For every S-AC, "collapses to one column" means
`getComputedStyle(root).gridTemplateColumns` is a single whitespace-free token
(`/^\S+$/`, the resolved `1fr`); "does not collapse" means it has ≥2 whitespace-separated
tokens. All widths are set via an inline `style="width: <n>px; max-width: 100%;"` on the
wrapping `<Container>`, per `Grid.collapse.stories.svelte`.

**B64-S1 — `stackBelow="md"` collapses a `cols` grid below 720px**
`<Grid cols={2} stackBelow="md">` in `<Container style="width: 680px">` → one column.
(680 ≤ 720, so the stack rule fires.)

**B64-S2 — `stackBelow="md"` does NOT collapse above 720px**
`<Grid cols={2} stackBelow="md">` in `<Container style="width: 800px">` → two columns.
(800 > 720, stack rule does not fire; and 800 is above B42's 720 cols rule, so cols={2}
also stays at two — confirming the un-collapsed baseline.)

**B64-S3 — `stackBelow="lg"` collapses below 900px**
`<Grid cols={2} stackBelow="lg">` in `<Container style="width: 800px">` → one column.
(800 ≤ 900, stack rule fires.) Contrast with B64-S2: same width, same `cols`, different
token → different outcome, proving the token controls the threshold.

**B64-S4 — `stackBelow` collapses a `template` grid below its breakpoint**
`<Grid template="minmax(0,1fr) minmax(0,2fr)" stackBelow="md">` in
`<Container style="width: 680px">` → one column (resolved `gridTemplateColumns` is a
single token). At `<Container style="width: 800px">` the same grid renders its two
`template` tracks (≥2 tokens). This proves `stackBelow` works for `template` grids, which
the cols-collapse rules deliberately do not.

**B64-S5 — `stackBelow` is keyed on its own `data-*` attribute, not `data-cols`**
The collapse is implemented as a CSS `@container (max-width: <token-px>)` rule selecting
on a dedicated attribute (`data-stack`, recommended: `data-stack="sm|md|lg"`), independent
of `data-cols`. Verifiable: `root.dataset.stack === 'md'` when `stackBelow="md"`, and the
collapse fires for a `template` grid (which has no `data-cols`) — confirming the rule does
not depend on `data-cols`.

**B64-S6 — `stackBelow` wins over cols collapse (single-column wins below threshold)**
When both could apply, the result below the `stackBelow` threshold is a single column.
`<Grid cols={3} stackBelow="lg">` in `<Container style="width: 800px">` (800 ≤ 900 →
stack fires for one column; B42's 900 rule would otherwise give cols=3 → two columns) →
**one** column. The additive rule (single-column) takes precedence.

**B64-S7 — no `stackBelow` ⇒ B42 collapse schedule is unchanged**
A grid with no `stackBelow` prop behaves exactly as B42 specifies. This is covered by the
existing `Grid.collapse.stories.svelte` stories remaining green (see B64-C1) — no new
story required, but the implementer must not regress them.

### Group A — `align`

**B64-A1 — `align` sets `align-items`**
For each token, `getComputedStyle(root).alignItems` resolves to:
`align="start"` → `'start'` (or the browser-normalised `'flex-start'` — accept either, as
`Grid` is a CSS grid, not flex; grid resolves `start` to `start`), `align="center"` →
`'center'`, `align="end"` → `'end'`, `align="stretch"` → `'stretch'`. The implementer
applies it via a `data-align` attribute + scoped CSS attribute selectors, mirroring
`Inline.svelte` (lines 41–45). Test asserts `root.dataset.align` matches the prop and
`getComputedStyle(root).alignItems` matches the expected value for at least `start`,
`center`, and `stretch`.

**B64-A2 — `align` defaults to `stretch` (existing grids unaffected)**
A grid with no `align` prop resolves `getComputedStyle(root).alignItems` to `'stretch'`
(or the empty/`normal` CSS default that renders as stretch for grid items — assert it is
**not** `'center'`/`'start'`/`'end'`). The default must not change the rendered layout of
any existing grid: the constrained API stays additive. The implementer may omit
`data-align` entirely when `align` is the default to keep the markup clean (in which case
the assertion is that no non-default `align-items` is applied).

### Group G — gap-scale fix

**B64-G1 — `gap="md"` resolves to 24px**
`gapMap.md` changes from `var(--u2)` (16px) to `var(--u3)` (24px). The full scale becomes
`none=0 / xs=8 / sm=16 / md=24 / lg=32 / xl=40`, matching the B25-established scale and
`Inline.svelte`'s `data-gap` map. For `<Grid gap="md">`,
`getComputedStyle(root).gap` (or `.rowGap`/`.columnGap`) resolves to `'24px'`.

**B64-G2 — `gap="md"` differs from `gap="sm"`**
`<Grid gap="sm">` resolves to `16px` and `<Grid gap="md">` resolves to `24px` — they are
no longer equal. (Before this fix both were 16px.) This may be asserted in a single story
rendering two grids, or two stories, per stories-guide consolidation guidance.

> **Breaking-change call-out (intentional, B25-aligned):** any existing `gap="md"` Grid
> renders at 24px instead of 16px after this change. No current Grid story asserts the md
> value (the `Single Column` story passes `gap: "md"` but makes no gap assertion — see
> `Grid.stories.svelte` line 111), so no existing test breaks. Any *future* or
> downstream test asserting the old 16px md value must be updated to 24px.

### Group C — backward compatibility (the B42 contract)

**B64-C1 — every B42 AC and existing story stays green**
All five B42 prop stories in `Grid.stories.svelte` (`Three Column`, `Two Column`,
`Four Column`, `Auto Fill`, `Single Column`) and all eight collapse stories in
`Grid.collapse.stories.svelte` (B42 AC-13..AC-18) pass unchanged after this item.
Specifically: `--grid-cols` still carries the column template; `grid-template-columns`
is still empty in the inline `style` for `cols` grids; `data-cols` is still emitted for
`cols` grids (1/2/3/4/auto); the 900px (3/4→2) and 720px (2/3/4→1) cols-collapse rules
still fire for `cols` grids that have no `template` and no `stackBelow`; `cols="auto"`
and `cols={1}` are still untouched by any cols-collapse rule.

**B64-C2 — `minColWidth` + `cols="auto"` unchanged**
`<Grid cols="auto" minColWidth="160px">` still emits `--grid-cols` containing
`auto-fill` and `160px`, at all container widths (no new rule targets `data-cols="auto"`).

### Group X — SSR / no-JS constraint

**B64-X1 — no JS introduced for `stackBelow` (or any new prop)**
`Grid.svelte` introduces **no** `$effect`, **no** `matchMedia`, **no** `useMediaQuery`,
**no** viewport media query (`@media`), and **no** `onMount`/`browser`-gated layout code
for `stackBelow`, `template`, or `align`. All three new behaviours are pure
declarative output: custom properties + `data-*` attributes + scoped CSS
(`@container` rules and attribute selectors). Verifiable two ways: (1) a source-level
check — the diff adds no `$effect`/`matchMedia`/`useMediaQuery`/`@media` to
`Grid.svelte`; (2) the collapse ACs (B64-S1..S6) pass in Vitest browser mode purely
from CSS with no script-driven class toggling. The reviewer confirms the source check;
the play functions confirm the behaviour.

---

## Test placement

Per `stories-guide.md` and the B42 precedent:

- **Prop-level ACs** (T1–T4 where width is not forced, A1–A2, G1–G2) extend
  **`Grid.stories.svelte`** (the file with `component: Grid` in `defineMeta`). New
  stories: `"Template — Asymmetric"`, `"Align"` (one story carrying A1+A2 across a few
  rendered grids, or two stories — consolidate per stories-guide), and a gap story or
  fold G1/G2 into existing/new prop stories. Drive props via `args` where the story uses
  a single `<Grid>`; for the multi-grid `align`/`gap` comparison use the
  composition-in-slot pattern (D33: multiple `<Grid data-testid>` children inside a slot
  with an innocuous outer grid, query by `data-testid`).
- **Container-query / collapse ACs** (T3, T4-at-width, S1–S6, and any `template` story
  whose width forces or forbids collapse) extend
  **`Grid.collapse.stories.svelte`** (the composition-stories file with **no
  `component:`** in `defineMeta`). Each new story instantiates `<Container style="width:
  …px; max-width: 100%;">` wrapping the `<Grid>`, reads
  `root = container.firstElementChild`, and asserts via `getComputedStyle(root)` inside a
  `waitFor` (the container query needs a layout tick), exactly like the existing AC-13..18
  stories.
- **B64-X1** is verified by the reviewer reading the `Grid.svelte` diff (source check)
  plus the green S-ACs; no dedicated story is required for the source check.

Do not duplicate the existing B42 stories — extend, don't rewrite. The existing eight
collapse stories and five prop stories must remain in place and green (B64-C1).

---

## Out of scope

- New `cols` values beyond `1|2|3|4|'auto'` (e.g. `cols={5}`) — `GridCols` is unchanged.
- Intent primitives `Split` / `Sidebar` — explicitly parked (item card Notes; Direction #1).
- Per-track or named grid areas, `grid-template-rows`, `grid-auto-flow`, `justify-items`,
  `place-items` — only `align-items` is added in this item.
- Asymmetric *responsive* schedules for `template` (e.g. a different track list per
  breakpoint beyond collapse-to-1) — `template` collapses only via `stackBelow` to a
  single `1fr`; intermediate template re-flows are out of scope.
- A `stackBelow`-style override for the B42 cols collapse *points* (i.e. retuning when
  cols={3} drops to 2) — B64 adds collapse-to-**one**, not a configurable cols schedule.
- Any change to `Container.svelte` — it already sets `container-type: inline-size`.
- Per-token visual gap tuning beyond the `md` fix — `xs/sm/lg/xl` are already correct.

---

## Open questions

None blocking. Decisions taken during speccing (and the reasons) are recorded inline:

- `data-cols` when `template` is set → **omit the attribute** (B64-T3). Implementer may
  use a non-matching sentinel instead, provided no cols-collapse rule fires.
- `stackBelow` token px scale → **sm=480, md=720, lg=900** (recorded in API summary;
  `sm` finalised at 480px by the user at the review checkpoint). These px values are the
  contract.
- `align` default → **`stretch`** (CSS grid default) so existing grids are unaffected
  (B64-A2). `data-align` may be omitted at the default to keep markup clean.

This item was `flags: [review]`: the manager paused for user approval after this spec.
**Approved as-specced at the 2026-06-15 checkpoint**, with two confirmations: the
`gap="md"` 16→24px fix is applied (B64-G1/G2 stand), and the `stackBelow` `sm`
breakpoint is finalised at **480px**.
