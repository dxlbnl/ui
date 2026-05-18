---
id: B36
title: PageHero — snippet-based heading with mixed ink colors
type: feature
priority: high
flags: [review]
created: 2026-05-17
---

## Description

The production homepage uses a PageHero heading with multi-line text across three lines at different colors (normal ink, faded ink-faint). The design system's `PageHero` currently only accepts a plain `heading` string rendered via `<Heading level={1} variant="hero">`. It needs a `headingContent` snippet prop so callers can compose richer headings, while staying within the design system's own primitives.

The pattern from the website homepage:
```
Dexter.          ← color: var(--ink)
Things built     ← color: var(--ink-faint)  [via <em>]
in the lab.      ← color: var(--ink)
```

## Changes to `PageHero.svelte`

1. **`headingContent` snippet prop** — when provided, renders inside `<Heading level={1} variant="hero">` via `{@render headingContent()}` instead of the plain string. When absent, `heading` string is used as before (no breaking change).

2. **`Heading :global(em)` scoped rule** — inside `.page-hero`, target the Heading primitive's root so `<em>` children get `font-style: normal; color: var(--ink-faint)`. Pattern: `.page-hero :global(.heading-hero em) { … }` (using whatever class the Heading primitive exposes on its root).

3. **All composition uses the existing `Heading` and `Text` primitives** — no raw `<h1>` or font CSS added to PageHero. The `Heading level={1} variant="hero"` primitive already handles the correct size/weight/tracking; the snippet just passes mixed content into it.

4. **`border` prop** — add optional `border?: boolean = true` prop to suppress the bottom rule (the homepage uses `border={false}`).

## What does NOT change
- `eyebrow` → `<Text variant="eyebrow">` (already correct)
- `lede` → `<Text variant="lede">` inside `.page-hero-lede` (already correct)
- `children` → `<Inline gap="sm">` actions slot (already correct)
- Spacing: eyebrow `margin-bottom: 12px`, lede `margin-top: 20px; max-width: 62ch`, actions `margin-top: 24px` — all already in place

## Reference
- OG PageHero: `~/Projects/Web/website/src/lib/ui/PageHero.svelte`
- Usage: `~/Projects/Web/website/src/routes/(console)/+page.svelte`
- Design system PageHero: `src/lib/components/patterns/PageHero.svelte`
