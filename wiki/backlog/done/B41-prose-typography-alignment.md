---
id: B41
title: "Regression — Prose should match MarkdownBody's typography"
type: bug
priority: high
flags: []
created: 2026-05-19
spec: wiki/specs/B41-prose-typography-alignment.md
---

## Description

`<Prose>` is the library replacement for the website's `src/lib/ui/MarkdownBody.svelte`.
Dexter's call: MarkdownBody's tunings are canonical, Prose should match.

Reference sources:
- Library: `node_modules/@dxlbnl/ui/dist/components/layout/Prose.svelte`
- Canonical: `src/lib/ui/MarkdownBody.svelte` (website repo)
- First consumer: `src/routes/(console)/legal/[slug]/+page.svelte`

## Notes

- Approach: replace `<style>` block in `src/lib/components/layout/Prose.svelte` with MarkdownBody-canonical CSS. Full 37-AC diff in spec.
- D42 applies — visual-only; test-writer skipped.
- D44 logged by spec-writer: `color: inherit` on `pre > code` intentionally drops Shiki fallback (`--shiki-foreground`).
- Spec: wiki/specs/B41-prose-typography-alignment.md
