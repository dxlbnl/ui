---
id: B45
title: "Text and Heading should default to color: inherit"
type: feature
priority: high
flags: []
created: 2026-05-19
spec: wiki/specs/B45-text-heading-color-inherit.md
---

## Description

`Text` and `Heading` currently set an explicit color token unconditionally, breaking
CSS color inheritance. When a parent component sets `color: var(--bg)` (e.g. on hover
in `ProjectCard`, `ProductCard`) the child `Text` elements ignore it and render
`var(--ink)` instead. The fix: make `color: inherit` the default; only apply a token
when a `color` prop is explicitly passed.

## Affected callsites (visual review needed)

### Components that set a non-standard root/descendant color

- `cards/NoteCard.svelte` — `.note-lede { color: var(--ink-dim) }` applied via class on `<Text>`
- `cards/ProductCard.svelte` — `.card-cta:hover { color: var(--bg) }` — `<Text variant="mono">` inside `.card-cta` won't pick it up
- `cards/ProjectCard.svelte` — `.card-cta:hover { color: var(--bg) }` — same; `<Text variant="mono">` in `.card-cta`
- `feedback/Modal.svelte` — `.modal-body { color: var(--ink-dim) }`, `.modal-close { color: var(--ink-faint) }`
- `patterns/CtaBlock.svelte` — `.cta-desc { color: var(--ink-dim) }`
- `patterns/StatCard.svelte` — `.stat-value--ok/amber/danger` color variants

### Text / Heading callsites to check after the change

- `NoteCard` L56–67: idx, kind, title, lede (class sets dim), date, READ arrow — several use explicit `color=` props so unaffected; lede class-color needs audit
- `ProductCard` L68–93: sku, name, desc, price, VAT, stock, cta label — cta label at L93 is the primary broken case
- `ProjectCard` L41–58: eyebrow, title, cta label at L58 — primary reported case
- `Modal` L78: modal title in header
- `CtaBlock` L34: eyebrow inside cta block

## Notes
