# B40: Responsive vertical padding for PageHero and Container

## Context

Every page on dexterlabs.nl uses `<Container>` (R9) and most use `<PageHero>` (R8).
The horizontal side padding on `Container` is already responsive — it drops from 32 px
to 16 px at `≤720 px` — but vertical padding is fixed at all viewport widths.

On a 375 px mobile viewport this means 80 px of top padding on `PageHero` plus 80 px of
`padding-bottom` on `Container size="lg"` consumes ~160 px of vertical real estate before
any content is visible. The production equivalent surfaces (e.g. `/legal/`) used lighter
bottom padding at mobile widths.

This is a **visual-only CSS bug**. Per D42, `test-writer` is skipped; the pipeline is
`spec-writer → implementer → reviewer`. No play-fn assertions are added.

Relevant wiki pages: [requirements.md](../requirements.md) (R8, R9),
[architecture.md](../architecture.md), [decisions.md](../decisions.md) (D42).
Item card: [B40](../backlog/doing/B40-responsive-vertical-padding.md).

## Acceptance criteria

### PageHero.svelte

1. The `.page-hero` rule in `src/lib/components/patterns/PageHero.svelte` retains its
   current desktop padding exactly:
   `padding: var(--u10) 0 var(--u5)` (80 px top, 0 sides, 40 px bottom).

2. A `@media (max-width: 720px)` block is added to the component's `<style>` that
   overrides `.page-hero` padding to:
   `padding: var(--u6) 0 var(--u4)` (48 px top, 0 sides, 32 px bottom).

3. No other CSS properties on `.page-hero` — including side padding (already `0`) and
   any child element rules — are changed by this item.

### Container.svelte

4. The existing `@media (max-width: 720px)` block in
   `src/lib/components/layout/Container.svelte` already sets
   `padding-left: 16px; padding-right: 16px` on `.container-wrap`. That rule is
   preserved unchanged.

5. Within that same `@media (max-width: 720px)` block (or as a new block at the same
   breakpoint), `padding-bottom` overrides are added for each size variant:

   | Selector                          | `padding-bottom` value |
   | --------------------------------- | ---------------------- |
   | `.container-wrap[data-size="lg"]` | `56px`                 |
   | `.container-wrap[data-size="md"]` | `48px`                 |
   | `.container-wrap[data-size="sm"]` | `40px`                 |

6. The desktop (non-media) `padding-bottom` values on each size variant are preserved
   exactly: `lg` → 80 px, `md` → 64 px, `sm` → 48 px.

7. No other properties of `Container.svelte` — props, TypeScript types, rendered HTML
   structure, or non-padding CSS — are changed by this item.

### Verification (reviewer)

8. Opening `/legal/` or `/order/cancel/` in Storybook or the dev server at a 375 px
   viewport width (DevTools device emulation) shows the `PageHero` top padding visually
   proportional to the 16 px side padding — the page no longer looks "pushed away" from
   the top of the screen.

9. At a 800 px viewport (above the breakpoint) the layout is pixel-identical to the
   pre-fix state.

## Out of scope

- Responsive padding for any component other than `PageHero` and `Container`.
- Changes to the `≤720 px` breakpoint value itself.
- Introducing new props, tokens, or size variants.
- Any change to horizontal (side) padding — that is already correct.
- Play-fn assertion tests (D42 — visual-only change).

## Open questions

None. The fix values are fully specified in the item card findings.
