# B45: Text and Heading should default to color: inherit

## Context

`Text.svelte` has a scoped `<style>` block with variant CSS introduced in B26. Three
variants carry hardcoded `color` declarations:

- `.body-lede  { color: var(--ink-dim) }`
- `.mono-label { color: var(--ink-dim) }`
- `.eyebrow    { color: var(--ink-faint) }`

Because Svelte scoped styles add a unique data-attribute to every element rendered by
the owning component, their specificity is higher than a parent component's own scoped
rules. A parent's `.card-cta:hover { color: var(--bg) }` cannot override the `color`
on a child `<Text>` element. This breaks hover color inheritance in `ProjectCard` and
`ProductCard`, which both rely on that pattern.

`Heading.svelte` has no `color` declarations in its scoped `<style>` block — it already
inherits correctly. This spec confirms that and makes no change to it.

The fix is surgical: remove the three `color` declarations from `Text.svelte`'s scoped
CSS. The `color` prop (already implemented as an inline style) is unaffected. All
callsites that previously relied on the variant's built-in color must be audited and
updated to supply an explicit `color` prop or a wrapper-level color rule.

Related pages:
- [Item card](../backlog/doing/B45-text-heading-color-inherit.md)
- [composition-limits.md](../composition-limits.md) — Svelte scoping boundary context
- [specs/B14-typography-primitives.md](B14-typography-primitives.md) — original Text/Heading design
- [specs/B26-typography-size-prop.md](B26-typography-size-prop.md) — scoped CSS introduced here
- [architecture.md](../architecture.md) — D4/D5 composability decisions
- [decisions.md](../decisions.md) — D42 (visual-only changes: no play-fn assertions); D45 (native CSS nesting)

### Track

This item is **visual / CSS only** (D42). The `test-writer` pipeline stage is skipped.
The pipeline is `spec-writer → implementer → reviewer`. The reviewer verifies by reading
the diff and, where noted below, opening the affected stories in Storybook to confirm
hover colours.

---

## Acceptance criteria

### AC-1 — `Text.svelte` scoped CSS: no `color` on `.body-lede`, `.mono-label`, or `.eyebrow`

After the change, `Text.svelte`'s `<style>` block contains no `color` property on
`.body-lede`, `.mono-label`, or `.eyebrow`. The only source of color on a `<Text>`
element is (a) an explicit `color` prop (rendered as inline style) or (b) CSS
inheritance from the parent element. The reviewer verifies by reading the diff.

### AC-2 — `Heading.svelte` scoped CSS: still no `color` declarations (confirm/no change)

`Heading.svelte`'s `<style>` block contains no `color` declarations. No change is made
to this file. The reviewer confirms by reading the file.

### AC-3 — `Text color` prop still produces inline style

`<Text color="dim">` continues to render with `style` containing
`color: var(--ink-dim)`. `<Text color="faint">` renders with `color: var(--ink-faint)`.
All seven `color` prop values remain valid. No `color` prop = no inline color style,
no scoped color — the element inherits from its parent.

### AC-4 — ProjectCard: CTA label changes to amber on hover

`ProjectCard` has `.card-cta` with `&:hover { color: var(--bg) }` inside
`:global(.project-card) { … }`. After the fix, the `<Text variant="mono">` inside
`.card-cta` inherits this color change on hover. Reviewer opens the `ProjectCard`
story in Storybook and confirms the CTA label and arrow become `var(--bg)` colored on
hover (background turns amber, text turns bg, same as `ProductCard` behavior).

### AC-5 — ProductCard: CTA label changes to amber on hover

`ProductCard` has `.card-cta` with `:global(.product-card):hover .card-cta { color: var(--bg) }`.
After the fix, the `<Text variant="mono">` inside `.card-cta` inherits this color on
hover. Reviewer confirms in Storybook.

### AC-6 — ProductCard: CTA label default (non-hover) color is acceptable

Currently, without a `color` prop and without `.mono-label`'s hardcoded `var(--ink-dim)`,
the CTA label will inherit whatever `color` flows down from `.card-cta` / `.product-card`
/ `Card` / page context. The current `ProductCard` sets no explicit non-hover color on
`.card-cta`; the card sets `color: inherit`, so the label will receive the page's default
`var(--ink)`. This is visually correct (primary ink on the CTA bar is acceptable).
Reviewer confirms the non-hover CTA label color is visually correct in both themes.

### AC-7 — ProjectCard: description text remains `var(--ink-dim)`

`ProjectCard.svelte` uses a raw `<p class="card-desc">` (not a `<Text>`) for the
description. The `:global(.project-card) .card-desc { color: var(--ink-dim) }` rule
continues to apply. This callsite is unaffected by the Text change and requires no
modification. Reviewer confirms by reading the source.

### AC-8 — NoteCard: lede text still renders as `var(--ink-dim)`

`NoteCard.svelte` renders the lede as `<Text variant="body" class="note-lede">`. The
component's existing scoped rule `.card-body { :global { .note-lede { color: var(--ink-dim) } } }`
continues to apply the `--ink-dim` color, because that rule targets the class on the
rendered DOM element (not through a child component's style boundary). After the fix,
removing `.body-lede`'s hardcoded color does not break this — the `.note-lede` `:global`
rule takes effect instead.

**Alternative if the `:global` rule proves insufficient**: add `color="dim"` directly to
the lede `<Text>` element. Either approach satisfies AC-8; the implementer should verify
the existing `:global` mechanism works first and fall back to the explicit prop if needed.

Reviewer confirms the lede text in the `NoteCard` story is visually dim.

### AC-9 — Modal: title and close button colors are unaffected

`Modal.svelte` uses `:global(.modal-title) { color: var(--ink) }` and
`:global(.modal-close) { color: var(--ink-faint) }` rules, both targeting
class-named elements on the rendered DOM. These rules are parent-scoped `:global`
selectors on wrapper elements within `Modal`'s own scoped tree — they are not fighting
against `Text`'s scoped `.mono-label` color. After the fix, both rules continue to
apply correctly (they already override any color that might have come from `.mono-label`).
No change needed in `Modal.svelte`. Reviewer confirms Modal stories pass visually.

### AC-10 — CtaBlock: eyebrow text gets explicit `color="faint"` prop

`CtaBlock.svelte` renders `<Text variant="eyebrow" class="cta-eyebrow">{eyebrow}</Text>`.
Currently the eyebrow color comes from `.eyebrow`'s hardcoded `var(--ink-faint)`. After
removing that rule, the eyebrow will inherit from `.cta-block { color: inherit }`.

The fix: add `color="faint"` to the eyebrow `<Text>` in `CtaBlock.svelte`. This produces
an inline `style="color: var(--ink-faint)"` on the rendered element, which is equivalent
to the old scoped rule and is the canonical prop-based pattern.

Reviewer confirms the eyebrow in the `CtaBlock` story remains visually faint.

### AC-11 — StatCard: Text elements with `color="faint"` are unaffected

`StatCard.svelte` uses `<Text variant="mono" color="faint" size="xs">` for both label
and sublabel. These already pass an explicit `color` prop; the inline style is the source
of their color. The stat value is a raw `<span>` with scoped `.stat-value` rules — not a
`<Text>`. No changes to `StatCard.svelte` are needed. Reviewer confirms.

### AC-12 — No regression in `pnpm check` (TypeScript)

`pnpm check` reports zero TypeScript errors after all changes. The only modified files
are `Text.svelte` (remove three `color` declarations) and `CtaBlock.svelte` (add
`color="faint"` prop). No type changes.

### AC-13 — All Storybook stories continue to render without console errors

`pnpm dev` (or the Storybook server) starts cleanly. Opening `Text`, `Heading`,
`ProjectCard`, `ProductCard`, `NoteCard`, `Modal`, `CtaBlock`, and `StatCard` stories
produces no browser console errors. Story play functions that previously passed continue
to pass (no computed-color assertions exist for variant defaults; D42 bars adding new
ones here).

---

## Out of scope

- **Adding new `color` prop values.** The seven-value `TextColor` union is unchanged.
- **Heading refactoring.** `Heading.svelte` is confirmed clean; no change.
- **ProjectCard `<p class="card-desc">` migration.** The raw `<p>` with scoped color is
  left as-is; it is not a `<Text>` and is not broken by this change.
- **Other components with `<Text>` but already passing `color=`.** Anywhere an explicit
  `color` prop is already passed (NoteCard hex/kind/date/arrow, ProductCard price,
  StatCard label/sublabel, etc.) there is no behavioral change from this fix.
- **Play-function assertions for color values** (D42 — visual-only track).
- **`typography.css` global classes.** The global `.body-lede`, `.mono-label`, and
  `.eyebrow` classes are not modified. They exist for Prose and non-component contexts.

---

## Open questions

None. This item is ready for the implementer.
