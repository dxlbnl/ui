---
id: B28
title: Nav overhaul — match website design
type: feature
priority: high
flags: [review]
created: 2026-05-17
spec: wiki/specs/B28-nav-overhaul.md
---

## Description

The current Nav diverges significantly from the production website Nav (`~/Projects/Web/website/src/lib/ui/Nav.svelte`). It needs a full overhaul to align on:

1. **Breadcrumb in brand area** — Nav brand currently shows `LED + wordmark`. Website shows `LED + wordmark + // + ~ + /CRUMB` inline. The breadcrumb should be rendered using the existing `Breadcrumb` component (`src/lib/components/navigation/Breadcrumb.svelte`) via a `breadcrumbs` prop (array of `{ label, href }`). Breadcrumb styles must also be aligned with the design reference. Auto-derivation from page state is not the design system's job.

2. **No hamburger button when there are no links** — Current Nav always renders the hamburger button and palette toggle. When `links` is empty (or omitted), the hamburger should not render. The palette toggle can stay (it's always relevant).

3. **`<details>`-based mobile menu** — Replace `menuOpen` boolean + `<Button>` hamburger with native `<details><summary>…</summary>` dropdown, matching the website pattern. The summary shows `≡`/`×` icons; CSS hides `<details>` on desktop and `<ul>` on mobile.

4. **Button/toggle colors are ink, not amber** — Palette toggle and hamburger summary use `color: var(--ink-faint)` with `hover: var(--ink)` (border-bottom amber on hover only). Currently they render as orange/amber fill which is wrong. The palette toggle must use `<Button>` with an appropriate variant — not a raw `<button>` element — since Button is the design system's interactive primitive.

5. **Breakpoint 720px not 767px** — Mobile breakpoint in website is `max-width: 720px`; current Nav uses 767px.

6. **Nav link hover/active** — `color: var(--ink-dim)` default, `color: var(--ink) + border-bottom: 1px solid var(--amber)` on hover/active. Same as website.

7. **Dropdown styling** — Mobile dropdown: `position: absolute; top: 100%; left: 0; right: 0; background: var(--bg); border-bottom: 1px solid var(--rule)`. Each link gets `padding: 10px 0; border-bottom: 1px solid var(--rule)`.

## Design system constraints (hard rules for this item)
- **Always use primitives in higher-order components.** `Button` for any interactive control, `Breadcrumb` for breadcrumb trails, `Led` for status indicators. Raw `<button>`, `<a>`, or `<span>` elements are only acceptable where no primitive exists.
- **Minimize `style=` prop usage.** Prefer CSS custom properties and scoped class rules.
- **Minimize custom CSS.** If a primitive already handles the layout or visual, use it — don't re-implement it.

## Reference
- Website Nav: `~/Projects/Web/website/src/lib/ui/Nav.svelte`
- Current design system Nav: `src/lib/components/navigation/Nav.svelte`
- Breadcrumb primitive: `src/lib/components/navigation/Breadcrumb.svelte`
