---
id: B26
title: Typography primitive size prop and scoped CSS
type: bug
priority: high
flags: [review]
created: 2026-05-17
---

## Description
`Text` and `Heading` are zero-CSS components that only apply global typography class
strings. Because the global classes cover a limited set of sizes, callers throughout
the design system (NoteCard, ProductCard, StatCard, ProgressBar, Modal, …) work around
the gap with inline `style="font-size: var(--t-xxx); letter-spacing: …"` — bypassing
the token system and creating inconsistency. The fix is: (1) add a `size` prop
(`xs | sm | md | lg | xl`) to both `Text` and `Heading` that maps to the token scale;
(2) add a `case` prop (`upper | lower | none`) to `Text` to allow suppressing the
forced uppercase on `mono` and `eyebrow` variants; (3) move typography class CSS into
each component's scoped `<style>` block so the primitives own their styles. Once the
primitives are fixed, all inline `style=` font-size overrides in higher-order
components are replaced with the appropriate `size` or `case` prop.

## Finalized API

### `size` scale (both `Text` and `Heading`)

| `size` | Token       | Resolved |
|--------|-------------|----------|
| `xs`   | `--t-micro` | 12px     |
| `sm`   | `--t-mono`  | 14px     |
| `md`   | `--t-body`  | 16px     |
| `lg`   | `--t-lede`  | 19px     |
| `xl`   | `--t-h3`    | 24px     |

Each `Text` variant has a natural default size (no prop needed in the common case):
- `eyebrow` → `xs`, `mono` → `sm`, `body` → `md`, `lede` → `lg`

`Heading` default size comes from its `variant` (h3→xl, h2→larger, etc.). `size` only
overrides font-size; all other variant properties (letter-spacing, line-height,
font-weight) remain.

### `case` prop (`Text` only)

`upper | lower | none` — overrides `text-transform`. `mono` and `eyebrow` variants
default to `upper`; all others default to `none`.

### No `weight` or `tracking` props

No current callers override font-weight on Text/Heading. The one letter-spacing
deviation (StatCard sublabel `0.04em` vs mono's `0.08em`) should be normalized to
`0.08em` in StatCard — design fix, not a new prop.

### CSS ownership

Typography class rules move into each component's scoped `<style>` block (using
`data-size` attribute for the size mapping, same pattern as layout primitives).
The global classes in `typography.css` are retained as-is — `Prose` and raw HTML
still depend on them; components just no longer depend on them being global.

## Callers fixed by this item (15 style= overrides)

| File | Before | After |
|------|--------|-------|
| NoteCard:41–42 | `variant="mono" style="font-size:var(--t-micro);letter-spacing:0.1em"` | `variant="mono" size="xs"` |
| NoteCard:51–52 | `variant="mono" style="font-size:var(--t-micro);letter-spacing:0.08em"` | `variant="mono" size="xs"` |
| NoteCard:44 | `<Heading level={3} style="font-size:var(--t-lede)">` | `<Heading level={3} size="lg">` |
| ProductCard:73 | `<Heading level={3} style="font-size:var(--t-lede)">` | `<Heading level={3} size="lg">` |
| ProductCard:79 | `variant="mono" color="amber" style="font-size:var(--t-body)"` | `variant="mono" size="md" color="amber"` |
| ProductCard:80 | `variant="mono" style="font-size:var(--t-micro);text-transform:lowercase;…"` | `variant="mono" size="xs" case="lower"` |
| ProductCard:85 | `variant="mono" style="font-size:var(--t-micro)"` | `variant="mono" size="xs"` |
| ProjectCard:52 | `<Heading level={3} style="font-size:var(--t-lede)">` | `<Heading level={3} size="lg">` |
| Modal:84 | `variant="mono" style="font-size:var(--t-lede);letter-spacing:0.08em;flex:1"` | `variant="mono" size="lg"` — `flex:1` → scoped CSS |
| ProgressBar:31–32 | `variant="mono" style="font-size:var(--t-micro)"` | `variant="mono" size="xs"` |
| StatCard:31 | `variant="mono" style="font-size:var(--t-micro);letter-spacing:0.1em"` | `variant="mono" size="xs"` |
| StatCard:34 | `variant="mono" style="font-size:var(--t-micro);letter-spacing:0.04em"` | `variant="mono" size="xs"` + normalize tracking to 0.08em |

## Notes
- Consistent with the gap API pattern (`xs/sm/md/lg/xl` naming, `data-size` attribute
  on root element, scoped CSS rules).
- Layout style props (margins, padding, flex) are NOT in scope here — those are handled
  by B27.
- `Inline align` prop is NOT in scope here — handled by B27.
- ProductCard `.card-desc` scoped class ("mono prose without uppercase") is a separate
  concern; after B26, `<Text variant="mono" case="none">` could replace it — spec-writer
  to decide.
