---
id: B44
title: "Regression — Prose should not constrain width by default"
type: bug
priority: medium
flags: []
created: 2026-05-19
spec: wiki/specs/B44-prose-no-default-maxwidth.md
---

## Description

`<Prose>` currently defaults `maxWidth = '72ch'`, which sets an inline
`style="max-width: 72ch"` on the rendered element. This creates a double
constraint when Prose sits inside a Container that's already picking the
page width:

- `Container size="sm"` (640px) → inner 576px ≈ 72ch — the two caps
  coincide, no visible effect, but two-source-of-truth.
- `Container size="md"` (960px) → inner 896px ≈ 112ch — Prose silently
  caps the reading column at 72ch, so the body text appears narrower than
  the PageHero / Signature / Rule above and below it. Visual edges
  mismatch up and down the page.

The current workaround in the website is to pass `<Prose maxWidth="none">`
on every slug page, which is noise.

Reference:
- Library: `node_modules/@dxlbnl/ui/dist/components/layout/Prose.svelte`
- Consumers (current workaround):
  - `src/routes/(console)/legal/[slug]/+page.svelte`
  - `src/routes/(console)/notes/[slug]/+page.svelte`

## Notes

- Approach: drop `maxWidth = '72ch'` default → `undefined`; use `style:max-width={maxWidth}`; remove `maxWidth="none"` from 2 consumer routes.
- Spec: wiki/specs/B44-prose-no-default-maxwidth.md
