---
id: B27
title: Layout style prop cleanup — Inline align prop + scoped CSS pass
type: bug
priority: medium
flags: []
created: 2026-05-17
spec: wiki/specs/B27-layout-style-prop-cleanup.md
---

## Description
After B26 eliminates typography `style=` overrides, a second wave of layout-only
`style=` props remains across seven components. Two are `align-items: baseline` on
`<Inline>` — which need a new `align` prop on the Inline primitive. The rest are
single-concern overrides (margins, padding, border, flex, width) on layout primitives
acting as containers inside higher-order components; these move to scoped CSS within
each component using native elements or `.component :global(...)` selectors where the
target is an internal child.

## Inline `align` prop (new primitive API)

`Inline` needs `align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch'`
mapping to `align-items`. Default `center` (current hardcoded value — no callers
break). Two call sites use `style="align-items: baseline"`:
- `ProductCard:78` — `<Inline gap="xs" style="align-items: baseline;">`
- `SectionHead:33` — `<Inline gap="sm" style="align-items: baseline;">`

Both become `<Inline gap="xs" align="baseline">` and `<Inline gap="sm" align="baseline">`.

## Scoped CSS fixes by file

| File | Current | Fix |
|------|---------|-----|
| `SectionHead` | `<Stack style="gap: 6px;">` | `<Stack gap="xs">` (8px — on-scale) |
| `SectionHead` | `<Text variant="mono" style="margin-left: auto;">` | scoped CSS on sublabel wrapper |
| `PageHero` | `<Text variant="eyebrow" style="margin-bottom: 12px;">` | scoped CSS in `.page-hero` |
| `PageHero` | `<Text variant="lede" style="margin-top: 20px; max-width: 62ch;">` | scoped CSS in `.page-hero` |
| `PageHero` | `<Inline gap="sm" style="margin-top: 24px;">` | scoped CSS in `.page-hero` |
| `Modal` | `<Text … style="…; flex: 1;">` (after B26 removes font-size) | scoped CSS — `.modal-header :global(.modal-title) { flex: 1 }` or native element |
| `StatCard` | `<Stack gap="xs" style="padding: 16px 20px;">` | scoped CSS in `.stat-card` |
| `ProgressBar` | `<Stack gap="xs" style="width: 100%;">` | scoped CSS in `.progress-bar` wrapper |
| `Nav` | `<Inline gap="xs" style="flex-shrink: 0;">` | scoped CSS in `.nav-actions` |
| `Accordion` | `<Stack style="border: 1px solid var(--rule);">` | scoped CSS — `.accordion` already exists on Stack via `class=` |
| `NoteCard` | `<Text variant="body" … style="flex: 1;">` | scoped CSS — `.note-lede { flex: 1 }` (class already on Text) |
| `Field` | `<Stack gap="xs" style="min-width: 0;">` | keep as-is — single-prop flex overflow guard, no cleaner expression |

## Notes
- All scoped CSS fixes follow the D31 / B24 pattern: single-element native wrapper +
  scoped rule. `:global` only where the target is a child component's root element
  (e.g. `.modal-header :global(.modal-title)`).
- `Field min-width: 0` is intentionally kept — it is a defensive single-prop override
  with no prop equivalent on Stack, and moving it to scoped CSS inside Field would
  require wrapping Stack in another element unnecessarily.
- Depends on B26 (Modal fix requires typography style= to be removed first so only
  the layout portion remains).
