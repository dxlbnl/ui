# B13: Composition refactor

## Context

Higher-order components (patterns, cards, nav, forms, feedback, data) were implemented
with raw `display: flex` / `flex-direction: column` / `justify-content: space-between`
CSS inline in their `<style>` blocks, and in several cases with raw `<button>` HTML
elements, because the layout primitives (`Stack`, `Inline`, `Spread`) and the `Button`
primitive did not yet exist when those components were first written (they were built
bottom-up across B4–B10).

Now that B3 (layout primitives) and B4 (`Button`) are done, the rule is enforced
retroactively:

> **Higher-order components assemble primitives — they do not write layout CSS.**
> Any `display: flex`, `flex-direction`, `flex-wrap`, or `justify-content` in a
> higher-order component's `<style>` block is a red flag. Any raw `<button>` in a
> higher-order component is a red flag.

This refactor removes approximately 150 lines of duplicated layout CSS and ensures
ARIA attributes (forwarded via `{...rest}` on `Button`) remain unchanged.

Related wiki pages:
- [architecture.md](../architecture.md) — component authoring conventions (D4, D5)
- [decisions.md](../decisions.md) — D4 (Chakra-style composability), D5 (no global
  utility classes)
- [specs/B3-layout-components.md](B3-layout-components.md) — `Stack`, `Inline`,
  `Spread` props, gap token mapping, Svelte scoping constraints
- [specs/B4-primitive-components.md](B4-primitive-components.md) — `Button` variants
  and `...rest` forwarding
- [backlog.md](../backlog.md) — B13 item

Implementation plan (approved): `/home/dexter/.claude/plans/sprightly-wondering-lerdorf.md`

---

## Files modified by this item

| File | Category |
|------|----------|
| `src/lib/components/patterns/SectionFoot.svelte` | patterns |
| `src/lib/components/patterns/SectionHead.svelte` | patterns |
| `src/lib/components/patterns/Alert.svelte` | patterns |
| `src/lib/components/patterns/CtaBlock.svelte` | patterns |
| `src/lib/components/patterns/StatCard.svelte` | patterns |
| `src/lib/components/patterns/KvList.svelte` | patterns |
| `src/lib/components/patterns/ActivityRow.svelte` | patterns |
| `src/lib/components/patterns/PageHero.svelte` | patterns |
| `src/lib/components/patterns/ProgressBar.svelte` | patterns |
| `src/lib/components/cards/ProductCard.svelte` | cards |
| `src/lib/components/cards/ProjectCard.svelte` | cards |
| `src/lib/components/cards/NoteCard.svelte` | cards |
| `src/lib/components/feedback/Modal.svelte` | feedback |
| `src/lib/components/forms/Field.svelte` | forms |
| `src/lib/components/forms/InputWrap.svelte` | forms |
| `src/lib/components/navigation/Nav.svelte` | navigation |
| `src/lib/components/data/Tabs.svelte` | data |
| `src/lib/components/forms/Select.svelte` | forms |
| `src/lib/components/data/Accordion.svelte` | data |

No new files are created. No story files are modified (composition changes are
transparent to semantic DOM queries used in play functions).

---

## Svelte scoping strategy

Svelte's scoped CSS cannot style elements rendered by a child component — styles
defined in a parent's `<style>` block do not reach into children's rendered markup.
Three patterns apply, in order of preference:

| Situation | Pattern |
|-----------|---------|
| Layout primitive defaults are sufficient (no extra styles needed on the container) | Use the primitive directly and drop the custom class entirely |
| Extra static styles needed (border, padding, background — no hover/pseudo-element) | Pass a `style=` prop directly on the primitive (CSS custom properties work in inline styles) |
| Hover, pseudo-element, or descendant-selector styles must target the container | Keep a wrapper `<div class="my-class">` for the scoped CSS; put the layout primitive inside it |

The implementer must choose the correct pattern per element. Where a container needs
only padding or a border, prefer the `style=` prop on the primitive. Where the
container participates in a `:hover` rule or a descendent cascade (`parent:hover .child`),
a named wrapper div is required.

---

## Justified exceptions

These three components are explicitly excluded from the refactor. Their current
implementation must not be changed by this item.

| Component | Reason |
|-----------|--------|
| `AccordionItem.svelte` | Uses `<summary>` which is semantically required by the native `<details>` element. The browser renders `<summary>` with its own UA flex layout; overriding it requires component-specific CSS that cannot be replaced by a layout primitive. The close button is part of `<summary>` markup, not a standalone `<button>`. |
| `Table.svelte` | Uses semantic `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` HTML. No flex or grid CSS; no raw `<button>` elements. No changes needed. |
| `Card.svelte` | The base card primitive defines `display: flex; flex-direction: column` as its own root layout — this is the card layer's self-layout definition, equivalent to what Stack provides, and is the correct place for it. Higher-order cards (`ProductCard`, `ProjectCard`, `NoteCard`) are refactored; `Card.svelte` itself is not. |

---

## Layout primitive props reference

From [B3-layout-components.md](B3-layout-components.md):

**Stack** — `as?: string` (default `"div"`), `gap?: 'none'|'xs'|'sm'|'md'|'lg'|'xl'`
(default `'sm'`), plus `...rest`. Renders: `display:flex; flex-direction:column`.

**Inline** — same props as Stack. Renders: `display:flex; flex-wrap:wrap; align-items:center`.

**Spread** — `as?: string` (default `"div"`), plus `...rest` (no `gap` prop). Fixed
`display:flex; align-items:center; justify-content:space-between; gap:var(--u2)`.

**Button** — `as?: string` (default `"button"`), `variant?: 'primary'|'cta'|'ghost'|'back'|'del'`
(default `'primary'`), plus `...rest`. All ARIA attributes and event handlers forward
cleanly via `{...rest}`.

---

## Per-component changes

Each entry states: what element is replaced, what replaces it, and what CSS is
removed from the `<style>` block. The implementer must make exactly these changes —
no other structural changes.

### `SectionFoot.svelte`

- `<footer class="section-foot">` (flex row, `justify-content: space-between`) →
  `<Spread as="footer" style="border-top: 1px solid var(--rule); padding: 12px 0;">`
- Remove `.section-foot` flex CSS from `<style>` (keep only styles not expressible
  as a `style=` prop, if any remain)

### `SectionHead.svelte`

- `<section class="section-head">` root stays (it carries `border-bottom` + component-
  specific styles that participate in scoped CSS rules — wrapper pattern applies)
- Inner `<div class="section-row">` (flex row, `align-items: baseline`) →
  `<Inline style="align-items: baseline;">`
- Remove `.section-row` flex CSS from `<style>`

### `Alert.svelte`

- `<div class="alert-body">` (flex column + gap) →
  `<Stack gap="sm">`
- Remove `.alert-body` flex CSS from `<style>`

### `CtaBlock.svelte`

- `.cta-body` div (flex column + gap) →
  `<Stack gap="xs">`
- Remove `.cta-body` flex CSS from `<style>`

### `StatCard.svelte`

- Outer container div (flex column) →
  `<Stack gap="xs">`
- Remove outer flex CSS from `<style>`; retain all color-variant CSS untouched

### `KvList.svelte`

- Outer flex column container →
  `<Stack>` (default gap)
- Each `.kv-row` div (flex row, `justify-content: space-between`) → wrapper pattern:
  `<div class="kv-row"><Spread>{…}</Spread></div>` — the `.kv-row` div keeps its
  `border-bottom` and `padding` scoped CSS; `Spread` handles the space-between layout
- Remove `.kv-row` flex CSS from `<style>`; retain `.kv-row` border/padding rules

### `ActivityRow.svelte`

- `<div class="activity-row">` (flex row + border-bottom + padding) → wrapper pattern:
  keep `<div class="activity-row">` for border/padding scoped CSS, replace inner
  layout content with `<Inline gap="sm">`
- Remove flex CSS from `.activity-row` in `<style>`; retain border and padding rules

### `PageHero.svelte`

- `.page-hero-actions` div (flex row + gap + `flex-wrap`) →
  `<Inline gap="sm">`
- Remove `.page-hero-actions` flex CSS from `<style>`

### `ProgressBar.svelte`

- Outer div (flex column) →
  `<Stack gap="xs">`
- Remove outer flex CSS from `<style>`; retain `.progress-track` and `.progress-fill`
  CSS untouched

### `ProductCard.svelte`

- `.card-body` div (flex column + gap) →
  `<Stack gap="xs">` with `style="padding: 12px 14px 10px; flex: 1;"` (inline style
  because the padding/flex are static layout details, not hover-dependent)
- `.card-meta` div (flex row, `justify-content: space-between`, `align-items: baseline`) →
  `<Spread style="align-items: baseline; margin-top: auto; padding-top: 8px; ...">` or
  keep a `.card-meta` wrapper div for the font/letter-spacing scoped styles and put
  `<Spread>` inside — implementer chooses whichever pattern is cleaner
- `.card-cta` div (flex row, `justify-content: space-between`) →
  `<Spread>` inside a `.card-cta` wrapper div (the wrapper is required because
  `.product-card:hover .card-cta` is a descendent hover rule that needs a scoped class)
- Remove flex CSS from `.card-body`, `.card-meta`, `.card-cta` in `<style>`; retain
  all border, color, font, hover, and transition rules

### `ProjectCard.svelte`

- `.card-body` div (flex column) →
  `<Stack gap="xs">`
- `.card-tags` div (flex row + `flex-wrap`) →
  `<Inline gap="xs">`
- `.card-cta` div (flex row, `justify-content: space-between`) →
  `<Spread>` inside a `.card-cta` wrapper div (wrapper required for hover descendent rule)
- Remove flex CSS from `.card-body`, `.card-tags`, `.card-cta`; retain all other rules

### `NoteCard.svelte`

- `.note-head` div (flex row, `justify-content: space-between`) →
  `<Spread>` (or inside a `.note-head` wrapper if hover/pseudo rules apply to it)
- `.note-foot` div (flex row, `justify-content: space-between`) →
  `<Spread>` (same consideration)
- Outer flex-column container →
  `<Stack gap="xs">` (use `as="a"` if the root element is an anchor)
- Remove flex CSS from all three; retain border, color, and hover rules

### `Modal.svelte`

- `<button class="modal-close">` raw button →
  `<Button variant="ghost" aria-label="Close dialog" onclick={handleClose}>×</Button>`
  (the existing `type="button"` is the default and need not be forwarded explicitly)
- `.modal-inner` div (`display:flex; flex-direction:column`) →
  `<Stack>` (the `background`, `border`, `width`, `max-width`, `max-height`,
  `overflow-y` CSS on `.modal-inner` must remain — use `style=` prop on `<Stack>` or
  keep a `.modal-inner` wrapper div around `<Stack>`)
- `.modal-footer` footer (`display:flex; justify-content:flex-end`) →
  `<Spread as="footer">` with a `style="justify-content: flex-end;"` override
  (Spread is `space-between` by default; the footer uses `flex-end` — the `style=`
  prop overrides this inline); retain `padding` and `border-top` via `style=` prop
  or keep `.modal-footer` wrapper
- Remove layout flex CSS for `.modal-inner` and `.modal-footer` from `<style>`; retain
  all other rules (`.modal`, `.modal[open]`, `::backdrop`, `.modal-header`,
  `.modal-title`, `.modal-icon`, `.modal-body`, variant rules)

### `Field.svelte`

- Outer flex-column (label + input + hint/error stacking) →
  `<Stack gap="xs">`
- Remove flex CSS from `<style>`; retain label/hint/error color and font rules

### `InputWrap.svelte`

- Raw `<button class="clear-btn">` (the × clear button) →
  `<Button variant="ghost">` with the same `aria-label`, `onclick`, and `type`
  attributes forwarded
- Flex layout containers inside `InputWrap` → `<Inline>` or `<Stack>` as appropriate
  for each container's axis
- Remove layout flex CSS; retain icon/addon/clear positioning CSS that is specific to
  this widget (absolute positioning, width percentages, z-index, etc.)

### `Nav.svelte`

- Palette toggle raw `<button>` →
  `<Button variant="ghost">` with the same `onclick` and `aria-label`
- Hamburger raw `<button>` →
  `<Button variant="ghost">` with the same `onclick` and `aria-label`
- Inner flex containers (`.nav-inner`, `.nav-brand`, `.nav-links`, `.nav-actions`) →
  `<Inline>` with appropriate `gap` prop for each
- `.nav-drawer` flex-column container →
  `<Stack>`
- Retain in `<style>`: fixed positioning, `z-index`, `width: 100%`, media query
  visibility rules, all `a` link styles, active/hover states — these are
  component-specific and cannot be expressed as layout primitive props

### `Tabs.svelte`

- Each `<button class="tab" role="tab" ...>` →
  `<Button variant="ghost" role="tab" id="tab-{tab.id}" aria-selected={activeId === tab.id} aria-controls="panel-{tab.id}" onclick={() => activeId = tab.id}>`
- ARIA attributes forward unchanged via `{...rest}` on Button
- Remove `.tab` raw button base CSS from `<style>`; retain `.tab--active` state styles,
  `.tab-bar` container, `.tab-panel` panel, and pill-variant CSS (all component-specific)

### `Select.svelte`

- Raw `<button class="select-trigger">` →
  `<Button variant="ghost">` with the same ARIA attributes (`aria-haspopup`,
  `aria-expanded`, `aria-controls`, `id`) and event handlers forwarded
- Remove `.select-trigger` raw button CSS from `<style>`; retain dropdown panel,
  option list, and open/close animation CSS (all component-specific widget styles)

### `Accordion.svelte`

- `<div class="accordion" {...rest}>` (flex column + border wrapper) →
  `<Stack style="border: 1px solid var(--rule);" {...rest}>`
- Remove `.accordion` CSS class entirely from `<style>`

---

## Acceptance criteria

Each AC is verifiable by inspecting the rendered DOM in a Storybook play function.
The check strategy is noted in brackets after each criterion.

**Global (all modified files)**

AC-1. `pnpm check` reports zero TypeScript errors after all changes are applied.
[run `pnpm check` in CI / reviewer shell]

AC-2. All existing Storybook play functions pass after the refactor (`pnpm test`
returns green). No play function may be modified to make it pass — the refactor
is composition-only; external behaviour is unchanged.
[run `pnpm test`]

**SectionFoot**

AC-3. The root element of `SectionFoot` has `tagName === "FOOTER"` and computed style
`justify-content: space-between` (supplied by `Spread`). No `.section-foot` element
exists in the rendered DOM.
[`getComputedStyle(root).justifyContent === 'space-between'`; `querySelector('.section-foot')` is null]

AC-4. The `SectionFoot` root element has `border-top-style: solid` and non-zero
`padding-top` (from the `style=` prop).
[`getComputedStyle(root).borderTopStyle === 'solid'`]

**SectionHead**

AC-5. The `.section-row` class does not appear in the rendered DOM of `SectionHead`.
[`querySelector('.section-row')` is null]

AC-6. The inner row element of `SectionHead` has `display: flex` and `flex-wrap: wrap`
(supplied by `Inline`) and computed `align-items: baseline`.
[`getComputedStyle(innerRow).display === 'flex'`; `getComputedStyle(innerRow).alignItems === 'baseline'`]

**Alert**

AC-7. The `.alert-body` class does not appear in the rendered DOM of `Alert`.
[`querySelector('.alert-body')` is null]

AC-8. The content container inside `Alert` has computed `display: flex` and
`flex-direction: column` (supplied by `Stack`) and has the class `stack`.
[`querySelector('.stack')` is not null; `getComputedStyle(stack).flexDirection === 'column'`]

**CtaBlock**

AC-9. The `.cta-body` class does not appear in the rendered DOM of `CtaBlock`.
[`querySelector('.cta-body')` is null]

AC-10. The content container inside `CtaBlock` has class `stack` and computed
`flex-direction: column`.
[`querySelector('.stack')` is not null]

**StatCard**

AC-11. The outer container of `StatCard` has class `stack` and computed `display: flex`
and `flex-direction: column`.
[`getComputedStyle(querySelector('.stack')).flexDirection === 'column'`]

**KvList**

AC-12. The outer container of `KvList` has class `stack` (supplied by `Stack`).
[`querySelector('.stack')` is not null]

AC-13. Each `.kv-row` element inside `KvList` contains an element with class `spread`
that has computed `justify-content: space-between`.
[for each `.kv-row`: `querySelector('.spread')` is not null; `getComputedStyle(spread).justifyContent === 'space-between'`]

**ActivityRow**

AC-14. The `.activity-row` element remains in the rendered DOM (wrapper pattern) and
retains its border styles. Inside it, an element with class `inline` exists and has
computed `display: flex` and `flex-wrap: wrap`.
[`.activity-row` exists; `querySelector('.inline')` inside it is not null]

**PageHero**

AC-15. The `.page-hero-actions` class does not appear in the rendered DOM of `PageHero`.
[`querySelector('.page-hero-actions')` is null]

AC-16. The actions container inside `PageHero` has class `inline` and computed
`flex-wrap: wrap`.
[`querySelector('.inline')` is not null; `getComputedStyle(inline).flexWrap === 'wrap'`]

**ProgressBar**

AC-17. The outer container of `ProgressBar` has class `stack` and computed
`flex-direction: column`.
[`querySelector('.stack')` is not null; `getComputedStyle(stack).flexDirection === 'column'`]

AC-18. The `.progress-track` and `.progress-fill` elements remain in the DOM untouched.
[`querySelector('.progress-track')` is not null; `querySelector('.progress-fill')` is not null]

**ProductCard**

AC-19. The `.card-body` element inside `ProductCard` has class `stack`.
[`querySelector('.stack')` is not null inside `.product-card`]

AC-20. The `.card-meta` area inside `ProductCard` contains an element (or is itself an
element) with `justify-content: space-between`.
[`getComputedStyle(meta).justifyContent === 'space-between'`]

AC-21. The `.card-cta` area inside `ProductCard` contains a `spread` element with
`justify-content: space-between`.
[`querySelector('.card-cta .spread')` or `querySelector('.spread')` inside `.card-cta` is not null]

**ProjectCard**

AC-22. The `.card-body` element inside `ProjectCard` has class `stack`.
[`querySelector('.stack')` inside `.project-card` is not null]

AC-23. The tags area inside `ProjectCard` contains an element with class `inline`.
[`querySelector('.inline')` is not null]

AC-24. The `.card-cta` area contains an element with `justify-content: space-between`.
[`getComputedStyle(querySelector('.spread')).justifyContent === 'space-between'`]

**NoteCard**

AC-25. The `.note-head` area inside `NoteCard` contains an element with
`justify-content: space-between`.
[`querySelector('.spread')` inside `.note-head` or the element itself has `justifyContent === 'space-between'`]

AC-26. The `.note-foot` area inside `NoteCard` contains an element with
`justify-content: space-between`.
[same check for `.note-foot`]

AC-27. The outer container of `NoteCard` has class `stack` (or the root element is
`<a class="stack ...">` when `as="a"` is used).
[`querySelector('.stack')` or root element has class `stack`]

**Modal**

AC-28. The close button inside `Modal` has class `btn` (applied by `Button`) and does
NOT have the class `modal-close` (the raw button class is replaced).
[`querySelector('.btn')` is not null; `querySelector('.modal-close')` is null]

AC-29. The `.modal-inner` container has computed `display: flex` and
`flex-direction: column` (supplied by `Stack`). If a wrapper div is used, it has
class `stack` or the wrapper itself contains a `stack` child.
[`querySelector('.stack')` inside `.modal` is not null; `getComputedStyle(stack).flexDirection === 'column'`]

AC-30. The modal footer element (`<footer>`) has computed `display: flex`.
[`getComputedStyle(querySelector('footer')).display === 'flex'`]

**Field**

AC-31. The outer container of `Field` has class `stack` and computed
`flex-direction: column`.
[`querySelector('.stack')` inside the Field root is not null]

**InputWrap**

AC-32. The clear button inside `InputWrap` (when rendered) has class `btn` and does
NOT have the class `clear-btn`.
[`querySelector('.btn')` is not null; `querySelector('.clear-btn')` is null]

**Nav**

AC-33. The palette toggle button inside `Nav` has class `btn` (applied by `Button`)
and does NOT have a class that is the raw button class name from before the refactor.
[`querySelector('.btn')` matching the toggle exists]

AC-34. The hamburger button inside `Nav` has class `btn`.
[same check]

AC-35. Inner row containers in `Nav` (`.nav-inner`, `.nav-brand`, etc.) that were
replaced by `Inline` have computed `display: flex` and `flex-wrap: wrap`.
[`getComputedStyle(navInner).display === 'flex'` etc.]

AC-36. The nav drawer container that was replaced by `Stack` has computed
`flex-direction: column`.
[`getComputedStyle(drawer).flexDirection === 'column'`]

**Tabs**

AC-37. Each tab button inside `Tabs` has class `btn` (applied by `Button`).
[`querySelectorAll('.btn')` within the tab list has the same count as the number of tabs]

AC-38. Each tab button inside `Tabs` has `role="tab"`, `aria-controls`, and
`aria-selected` attributes (forwarded via `{...rest}` on `Button`).
[`tabBtn.getAttribute('role') === 'tab'`; `tabBtn.hasAttribute('aria-controls')`; `tabBtn.hasAttribute('aria-selected')`]

**Select**

AC-39. The trigger button inside `Select` has class `btn` (applied by `Button`) and
does NOT have class `select-trigger`.
[`querySelector('.btn')` is not null; `querySelector('.select-trigger')` is null]

AC-40. The trigger button retains its ARIA attributes (`aria-haspopup`, `aria-expanded`,
`aria-controls`) after refactor.
[`trigger.hasAttribute('aria-haspopup')`; `trigger.hasAttribute('aria-expanded')`]

**Accordion**

AC-41. The `Accordion` root element has class `stack` (applied by `Stack`). The
`.accordion` class does not appear in the rendered DOM.
[`querySelector('.stack')` at root is not null; `querySelector('.accordion')` is null]

AC-42. The `Accordion` root element has computed `display: flex` and
`flex-direction: column` (from `Stack`) and a `border: 1px solid` (from `style=` prop).
[`getComputedStyle(root).display === 'flex'`; `getComputedStyle(root).borderTopStyle === 'solid'`]

---

## Out of scope

- **Story file changes** — no `.stories.svelte` files are modified. The refactor is
  composition-only; play functions query semantic roles and element types that are
  unchanged.
- **New story coverage** — B13 does not add new stories. B11 is the dedicated story
  expansion item.
- **AccordionItem, Table, Card.svelte** — explicitly excluded (see Justified exceptions).
- **Visual regression testing** — the refactor must not change rendered appearance.
  Visual spot-check in Storybook is the implementer's responsibility; there is no
  automated snapshot assertion.
- **Gap value matching** — the refactor does not require that gap token values match
  the exact pixel values of the old hand-written CSS. The purpose is composition
  correctness, not pixel-perfect preservation. Visual spot-check covers this.
- **`Modal.svelte` footer `justify-content: flex-end`** — the footer currently uses
  `flex-end` not `space-between`. Overriding `Spread`'s default via the `style=` prop
  is acceptable; alternatively a wrapper div with `.modal-footer` retaining the scoped
  `justify-content: flex-end` is equally valid. Either implementation satisfies AC-30.
- **TypeScript type narrowing for ARIA on Button** — forwarding `role="tab"` and
  `aria-selected` via `{...rest}` on `Button` may produce TypeScript warnings if Button
  extends `HTMLButtonAttributes` strictly. If `pnpm check` reports errors on ARIA
  attribute forwarding, the implementer may add `[key: string]: unknown` to Button's
  Props interface — but this must not break existing Button tests.

---

## Open questions

**OQ-1 (non-blocking): `Modal.svelte` footer is `justify-content: flex-end`, not `space-between`.**
`Spread` always renders `justify-content: space-between`. The modal footer currently
uses `justify-content: flex-end`. Two approaches: (a) use `<Spread as="footer" style="justify-content: flex-end; ...">`  — the inline style overrides Spread's scoped CSS; (b) keep a `.modal-footer` wrapper div and put the Spread inside with `style="width:100%; justify-content:flex-end"`. Either is valid for this spec. AC-30 only asserts `display: flex`, not a specific justification value.

**OQ-2 (non-blocking): `InputWrap` flex containers may be widget-specific.**
The `InputWrap` component positions icon/addon/clear overlays using CSS that is tightly
coupled to the input box geometry. Some of these containers may be using flex for
positioning (e.g. icon centering inside a fixed-width prefix) rather than content
layout. The implementer should audit each flex container inside `InputWrap` and apply
primitives only to genuine content-flow containers; widget-internal positioning CSS may
remain in `<style>` if it is not a simple row/column flow.

**OQ-3 (non-blocking): `Nav.svelte` flex containers may include fixed-position or width-100% constraints.**
Several Nav flex containers (`.nav-inner`, `.nav-brand`) combine flex layout with
width-100%, padding, and fixed positioning. Replacing the flex root with `<Inline>`
must not remove the width/padding/position rules. The implementer must verify that
replacing the element with `<Inline>` and passing static styles via `style=` prop
(or retaining a named wrapper) does not cause layout regressions in the fixed topbar.
