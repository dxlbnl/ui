---
id: B68
title: Align AccordionItem header with the design
type: feature
priority: high
flags: []
created: 2026-06-16
spec: wiki/specs/B68-accordion-header-design-alignment.md
---

## Description
The AccordionItem header diverges from the Dexterlabs design
(`ui_kits/components/Accordion.jsx` in the claude.ai/design project, read live via
DesignSync 2026-06-16; identical to `wiki/specs/_design-refs/B59/Accordion.jsx`). Align
it. This also fixes the user's report that the `actions` (B65) look cramped beside the
open/close icon — caused by the chevron being trailing; in the design the glyph is
leading so the actions sit cleanly at the right edge.

Authoritative design header (the row, per the live JSX):
- Row: `display:flex; align-items:center; gap:12px; padding:12px 16px`.
- **Leading disclosure glyph** before the title: `▸` (closed) / `▾` (open), `var(--mono)`,
  `font-size:12px`, `width:12px`, color `var(--amber)` when open / `var(--ink-faint)`
  when closed. **No rotation** (the design swaps the glyph, it does not rotate `›`).
- **Title**: `var(--mono)`, `font-size:13px`, `letter-spacing:0.06em`, uppercase,
  `color:var(--ink)`, single-line with ellipsis (`overflow:hidden; white-space:nowrap;
  text-overflow:ellipsis`), `flex:1 1 auto; min-width:0`.
- **Actions** (B65 `actions` snippet): rendered as the **rightmost** element, after the
  title, `display:flex; align-items:center; gap:8px; flex-shrink:0` — nothing after them.
  Keep the existing `onclick` preventDefault click-guard (D79).

## Notes
- Visual/structural alignment → visual-only track (spec-writer → implementer → reviewer,
  no test-writer, per stories-guide / D42). The reviewer opens the story + runs the full
  suite.
- Glyph swap with native `<details>` must be CSS-driven off `details[open]` (the native
  toggle changes the `[open]` attribute, not the Svelte `open` var) — e.g. a pseudo-element
  `content` swap, no JS. Reverses B59's deliberate keep-the-rotating-`›` (out-of-scope
  then); the user now wants design alignment → spec-writer logs a decision superseding that
  B59 note.
- Applies to BOTH `<summary>` branches (sticky + non-sticky) in `AccordionItem.svelte`.
- The B65 "With Actions" story asserts DOM order title → actions → icon; that order
  changes to **icon → title → actions**. The existing assertion must be UPDATED to the new
  intended order (not weakened) — call this out in the spec.
- OUT OF SCOPE (design has them, but separate API features, not part of this visual
  alignment): `count` badge, `multiple`, controlled mode, and `flush` (no-body-padding in
  sticky mode). Note as possible follow-ups; do not implement here.
- Builds on B65 (actions), B66 (sticky display:contents). Does not change sticky offset
  math. After this lands, the parked B67 (smart scroll) resumes on the new layout.
