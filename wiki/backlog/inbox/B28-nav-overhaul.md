---
id: B28
title: Nav overhaul — match website design
type: feature
priority: high
flags: [review]
created: 2026-05-17
---

## Description

The current Nav diverges significantly from the production website Nav (`~/Projects/Web/website/src/lib/ui/Nav.svelte`). It needs a full overhaul to align on:

1. **Breadcrumb in brand area** — Nav brand currently shows `LED + wordmark`. Website shows `LED + wordmark + // + ~ + /CRUMB` inline, derived from `page.url.pathname`. The breadcrumb should be a `breadcrumbs` prop (array of `{ label, href }`) so callers can pass it; auto-derivation from page state is not the design system's job.

2. **No hamburger button when there are no links** — Current Nav always renders the hamburger button and palette toggle. When `links` is empty (or omitted), the hamburger should not render. The palette toggle can stay (it's always relevant).

3. **`<details>`-based mobile menu** — Replace `menuOpen` boolean + `<Button>` hamburger with native `<details><summary>…</summary>` dropdown, matching the website pattern. The summary shows `≡`/`×` icons; CSS hides `<details>` on desktop and `<ul>` on mobile.

4. **Button/toggle colors are ink, not amber** — Palette toggle and hamburger summary use `color: var(--ink-faint)` with `hover: var(--ink)` (border-bottom amber on hover only). Currently they render as orange/amber fill which is wrong.

5. **Breakpoint 720px not 767px** — Mobile breakpoint in website is `max-width: 720px`; current Nav uses 767px.

6. **Nav link hover/active** — `color: var(--ink-dim)` default, `color: var(--ink) + border-bottom: 1px solid var(--amber)` on hover/active. Same as website.

7. **Dropdown styling** — Mobile dropdown: `position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--rule)`. Each link gets `padding: 10px 0; border-bottom: 1px solid var(--rule)`.

## Reference
- Website Nav: `~/Projects/Web/website/src/lib/ui/Nav.svelte`
- Current design system Nav: `src/lib/components/navigation/Nav.svelte`
