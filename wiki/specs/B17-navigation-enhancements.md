# B17: Navigation enhancements

## Context

B17 delivers two features that were explicitly deferred during earlier navigation and
data-component work.

**Breadcrumb** was called out in B6 as out of scope ("Breadcrumb path display — deferred
to a future backlog item"). The B6 spec notes the brand area shows a `// ~ / SECTION / ITEM`
path, and the `Nav.svelte` template currently contains no breadcrumb markup at all.
`Breadcrumb` is a new, purely presentational component that renders a navigational trail
from a flat array of `{ label, href }` pairs. It is designed to be composed alongside
`Nav` (placed below or inside the nav bar by the consumer), not wired into `Nav` itself —
the earlier "breadcrumb slot" question in B6's open questions is resolved here as a
**separate, composed component** rather than a Nav snippet prop.

**AnimatedAccordion** was called out in B10 as out of scope ("Accordion animation:
height/opacity transition on open/close … CSS `interpolate-size` or `@starting-style`
animations are a follow-up item"). The `AccordionItem.svelte` currently uses the native
`<details>`/`<summary>` mechanic with instant open/close. This feature adds a smooth
height transition using only CSS, leaving the DOM structure and the `open` attribute
unchanged so SSR safety is preserved.

Related wiki pages:
- [vision.md](../vision.md) — Dexterlabs visual identity
- [requirements.md](../requirements.md) — R5 (Navigation), R10 (Accordion), WCAG 2.1 AA,
  SSR-safe constraints, Svelte 5 runes, strict TypeScript
- [architecture.md](../architecture.md) — component authoring conventions, Svelte 5 runes,
  scoped CSS, story format
- [specs/B6-navigation.md](B6-navigation.md) — `Nav` component; breadcrumb was out of scope
- [specs/B10-accordion-tabs-table.md](B10-accordion-tabs-table.md) — `AccordionItem`
  source component; animation was out of scope
- [decisions.md](../decisions.md) — D1 (tests = Story play functions), D4 (Chakra-style
  composability), D5 (no global utility classes), D16 (Accordion uses native `<details>`)
- [stories-guide.md](../stories-guide.md) — Svelte CSF story format and play function rules

---

## Files produced

| File | Role |
|---|---|
| `src/lib/components/navigation/Breadcrumb.svelte` | New `Breadcrumb` component |
| `src/lib/components/navigation/Breadcrumb.stories.svelte` | Breadcrumb stories + tests |
| `src/lib/components/navigation/index.ts` | Updated to export `Breadcrumb` |
| `src/lib/index.ts` | Updated to re-export `Breadcrumb` |
| `src/lib/components/data/AccordionItem.svelte` | Enhanced: CSS-only height animation added |
| `src/lib/components/data/Accordion.stories.svelte` | Updated: new "Animated" story added |

---

## Component specifications

---

### 1. Breadcrumb

A purely presentational component. It has no internal state and no event handlers.
It receives a flat array of crumb objects and renders a semantic `<nav>` landmark with
an ordered list. The last crumb always represents the current page.

#### Props interface

```ts
interface Crumb {
  label: string   // display text for the crumb
  href: string    // link destination; the last crumb's href is rendered but the link
                  // receives aria-current="page" to indicate it is the current page
}

interface BreadcrumbProps {
  crumbs: Crumb[]   // ordered array, first = root, last = current page; must not be empty
}

let { crumbs }: BreadcrumbProps = $props()
```

`BreadcrumbProps` does **not** extend `HTMLNavAttributes`; the `<nav>` element is the
fixed root and no `...rest` forwarding is needed. If a consumer needs to add attributes
to the nav, they wrap `Breadcrumb` rather than extending the component.

#### HTML structure

```html
<nav class="breadcrumb" aria-label="breadcrumb">
  <ol class="bc-list">
    {#each crumbs as crumb, i}
      <li class="bc-item">
        <a
          href={crumb.href}
          class="bc-link"
          aria-current={i === crumbs.length - 1 ? 'page' : undefined}
        >{crumb.label}</a>
        {#if i < crumbs.length - 1}
          <span class="bc-sep" aria-hidden="true">/</span>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
```

Key points:
- Root element is `<nav>` with `aria-label="breadcrumb"` — this creates a named
  navigation landmark that assistive technology can distinguish from the main `Nav`.
- The list is `<ol>` (ordered) — order is semantically significant for breadcrumbs.
- Each crumb is a full `<a>` element so it is keyboard-focusable; the last crumb also
  carries `aria-current="page"`.
- The separator glyph (`/`) is inside each `<li>` except the last. It carries
  `aria-hidden="true"` so screen readers do not announce it.
- No separator is rendered after the last (current) crumb.
- The component does **not** suppress the link on the last crumb — the `<a>` element is
  always rendered for all crumbs. `aria-current="page"` is the ARIA mechanism to signal
  the current location; removing the `href` would break keyboard navigation.

#### CSS rules (scoped)

All colors are CSS custom properties. No hardcoded hex or RGB values.

| Selector | Key rules |
|---|---|
| `.breadcrumb` | `display: block` (or no explicit display; just a semantic wrapper) |
| `.bc-list` | `display: flex; align-items: center; flex-wrap: wrap; gap: 0; list-style: none; padding: 0; margin: 0; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em` |
| `.bc-item` | `display: flex; align-items: center; gap: 6px` |
| `.bc-link` | `color: var(--ink-dim); text-decoration: none` |
| `.bc-link[aria-current="page"]` | `color: var(--ink); pointer-events: none` (visual emphasis on current; pointer-events prevents accidental reload but keyboard access is retained) |
| `.bc-link:not([aria-current]):hover` | `color: var(--ink)` |
| `.bc-sep` | `color: var(--ink-faint); user-select: none` |

#### Story specifications

File: `src/lib/components/navigation/Breadcrumb.stories.svelte`

`defineMeta` sets `component: Breadcrumb, title: 'Navigation/Breadcrumb', tags: ['autodocs']`.

Because `crumbs` is a plain array of objects, it can be passed via `args`.

**Story 1: "Default" (multi-crumb trail)**

`args`: `{ crumbs: [{ label: 'Home', href: '/' }, { label: 'Catalogue', href: '/catalogue' }, { label: 'Conduit PDX-2', href: '/catalogue/conduit-pdx2' }] }`

Play function asserts:
1. A `<nav>` with `aria-label="breadcrumb"` is present.
2. An `<ol>` is the direct child of the `<nav>`.
3. There are exactly 3 `<li>` elements in the list.
4. The link with text "Home" does NOT have `aria-current` set.
5. The link with text "Catalogue" does NOT have `aria-current` set.
6. The link with text "Conduit PDX-2" has `aria-current="page"`.
7. There are exactly 2 separator elements (`aria-hidden="true"`) — one between each
   adjacent pair of crumbs, none after the last.
8. The "Home" link `href` is `"/"`.
9. The "Catalogue" link `href` is `"/catalogue"`.

**Story 2: "Root Only" (single crumb)**

`args`: `{ crumbs: [{ label: 'Home', href: '/' }] }`

Play function asserts:
1. A `<nav>` with `aria-label="breadcrumb"` is present.
2. There is exactly 1 `<li>` element.
3. The link with text "Home" has `aria-current="page"` (single crumb = current page).
4. There are 0 separator elements (`aria-hidden="true"`) — no separator when only one
   crumb is present.

**Story 3: "Two Crumbs" (intermediate depth)**

`args`: `{ crumbs: [{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }] }`

Play function asserts:
1. There are exactly 2 `<li>` elements.
2. The link "Home" does NOT have `aria-current`.
3. The link "Projects" has `aria-current="page"`.
4. There is exactly 1 separator element.

---

### 2. AnimatedAccordion (AccordionItem CSS enhancement)

This is a **CSS-only** enhancement to the existing `AccordionItem.svelte`. No TypeScript,
no props, no internal `$state`, and no changes to the HTML template are required. The
`<details>` element, `open` attribute, `<summary>`, `.acc-body`, and all existing CSS
classes remain unchanged.

#### CSS technique

The animation uses three CSS features layered with progressive enhancement:

1. **`interpolate-size: allow-keywords`** — an emerging CSS property (Chrome 129+) that
   allows `height` to transition between a length value and an intrinsic keyword such as
   `auto`. When supported, `<details>` can animate its height from `0` (collapsed) to
   `auto` (open).

2. **`@starting-style`** — a CSS at-rule that defines the initial style of an element
   the first time it participates in a transition. Used here to set the starting height
   of `.acc-body` to `0` when the item opens, so the opening direction is visible.

3. **`@supports`** guard — the animation CSS block is wrapped in
   `@supports (interpolate-size: allow-keywords)`. Browsers that do not support this
   property receive no animation CSS at all and continue to use the native instant
   `<details>` expand/collapse behaviour.

#### Exact CSS to add inside the existing `<style>` block

```css
@supports (interpolate-size: allow-keywords) {
  details.acc-item {
    interpolate-size: allow-keywords;
  }

  .acc-body {
    overflow: hidden;
    height: 0;
    transition: height 300ms ease, opacity 300ms ease;
    opacity: 0;
  }

  details[open] .acc-body {
    height: auto;
    opacity: 1;
  }

  @starting-style {
    details[open] .acc-body {
      height: 0;
      opacity: 0;
    }
  }
}
```

Explanation of each rule:
- `interpolate-size: allow-keywords` on `details.acc-item` — enables `height: auto`
  as a transition endpoint for the subtree. Applied to `<details>` because `<details>`
  manages the block formatting context.
- `.acc-body { height: 0; overflow: hidden; opacity: 0 }` — collapsed state inside the
  `@supports` block. On unsupported browsers this rule is never applied so the native
  `<details>` collapse (which hides content via display, not height) is unaffected.
- `details[open] .acc-body { height: auto; opacity: 1 }` — target (open) state.
  `height: auto` is the intrinsic content height; the transition from `0` to `auto`
  is enabled by `interpolate-size`.
- `@starting-style { details[open] .acc-body { height: 0; opacity: 0 } }` — declares
  the *starting* style when `.acc-body` first enters `details[open]`. Without this, the
  open transition would begin from `height: auto` (the already-visible state) and there
  would be no visual opening animation.
- `transition: height 300ms ease, opacity 300ms ease` — transition timing. `300ms` is
  chosen as a balanced duration; `ease` matches the existing `var(--transition)` easing
  intent without requiring a variable-length value.

#### Relationship to existing rules

The existing `transition: background var(--transition)` on `.acc-trigger` is unaffected
and remains. The new animation rules are additive and are fully isolated inside the
`@supports` block. The `var(--transition)` variable could be used instead of `300ms ease`
if it resolves to a `<time>` value; if `var(--transition)` is a shorthand (e.g.
`200ms ease`), use it directly: `transition: height var(--transition), opacity var(--transition)`.
The implementer should inspect the token value and prefer `var(--transition)` if it is
a compatible value.

#### Story specification

A new story named **"Animated"** is added to the existing
`src/lib/components/data/Accordion.stories.svelte` file.

The story renders one `AccordionItem` (closed) inside an `Accordion`. Its play function
tests the DOM-observable aspects of the animation:

Play function asserts:
1. The `<details>` element starts without the `open` attribute (closed state).
2. The `.acc-body` is present in the DOM (it is always rendered inside `<details>`, but
   its visibility depends on the `open` state).
3. After `userEvent.click(summary)`, the `<details>` gains the `open` attribute.
4. After opening, `.acc-body` is visible (i.e. `toBeVisible()` passes).
5. After `userEvent.click(summary)` a second time, the `<details>` loses the `open`
   attribute.

The play function does **not** assert the computed `height` value, transition duration,
or `interpolate-size` property — these are CSS properties that are not reliably
inspectable across browser environments via `getComputedStyle` in Vitest browser mode.
The animation's visual correctness is verified through Storybook's visual review, not
through automated assertions.

---

## Acceptance criteria

### Breadcrumb — file existence and exports (AC 1–4)

1. `src/lib/components/navigation/Breadcrumb.svelte` exists.
2. `src/lib/components/navigation/Breadcrumb.stories.svelte` exists and contains at
   least the "Default", "Root Only", and "Two Crumbs" stories.
3. `src/lib/components/navigation/index.ts` exports `Breadcrumb` as a named export.
4. `src/lib/index.ts` re-exports `Breadcrumb` so that
   `import { Breadcrumb } from '@dxlbnl/ui'` resolves without error.

### Breadcrumb — HTML structure (AC 5–12)

5. The root element is `<nav class="breadcrumb" aria-label="breadcrumb">`.
6. The direct child of the `<nav>` is `<ol class="bc-list">`.
7. Each crumb is rendered as an `<li class="bc-item">` inside the `<ol>`.
8. The number of `<li>` elements equals `crumbs.length`.
9. Each `<li>` contains an `<a class="bc-link">` whose `href` attribute matches the
   corresponding `crumb.href` value and whose text content matches `crumb.label`.
10. The last crumb's `<a>` has `aria-current="page"`.
11. All crumbs that are not the last have no `aria-current` attribute set (the attribute
    is absent, not `aria-current="false"`).
12. Separator elements (rendered with `aria-hidden="true"`) appear between each adjacent
    pair of crumbs and are absent after the last crumb. For `n` crumbs, there are exactly
    `n - 1` separators.

### Breadcrumb — single-crumb edge case (AC 13–15)

13. When `crumbs` has exactly one entry, the single `<a>` has `aria-current="page"`.
14. When `crumbs` has exactly one entry, there are zero separator elements.
15. When `crumbs` has exactly one entry, the `<ol>` contains exactly one `<li>`.

### Breadcrumb — CSS and design tokens (AC 16–20)

16. `.bc-list` has `list-style: none` — the `<ol>` default list marker does not render.
17. `.bc-list` uses `font-family: var(--mono)` in computed style.
18. `.bc-link` has `color` resolving to `var(--ink-dim)` by default (for non-current crumbs).
19. `.bc-link[aria-current="page"]` has `color` resolving to `var(--ink)`.
20. `.bc-sep` has `color` resolving to `var(--ink-faint)`.
    Note: AC 16–20 involve CSS custom property resolution. Test-writer should use the
    probe technique from `wiki/stories-guide.md` where computed colors are compared.

### Breadcrumb — code quality (AC 21–24)

21. `Breadcrumb` is a purely presentational component — it contains no `$state()`,
    `$derived()`, or `$effect()` calls. Only `$props()` is used.
22. No hardcoded hex or RGB color values appear in `Breadcrumb.svelte`. All colors
    reference CSS custom properties.
23. Strict TypeScript: `Crumb` is typed as `{ label: string; href: string }`, `crumbs`
    is typed as `Crumb[]` (required). `pnpm check` passes with zero errors.
24. The a11y addon reports zero violations for all Breadcrumb stories. Specifically:
    the `<nav>` landmark is named (satisfies landmark uniqueness), `aria-current` is on
    a valid element, and `<ol>` / `<li>` structure is correct.

### Breadcrumb — story play functions (AC 25–27)

25. The "Default" story play function passes: `<nav aria-label="breadcrumb">` is found;
    3 `<li>` elements exist; the last crumb link has `aria-current="page"`; the first two
    crumb links do not; there are exactly 2 `aria-hidden` separators.
26. The "Root Only" story play function passes: 1 `<li>` exists; the single link has
    `aria-current="page"`; there are 0 separator elements.
27. The "Two Crumbs" story play function passes: 2 `<li>` elements exist; the second
    link has `aria-current="page"`; there is exactly 1 separator element.

---

### AnimatedAccordion — CSS changes (AC 28–34)

28. The `@supports (interpolate-size: allow-keywords)` block is present in the scoped
    `<style>` of `AccordionItem.svelte`.
29. Inside the `@supports` block, `details.acc-item` has `interpolate-size: allow-keywords`
    declared.
30. Inside the `@supports` block, `.acc-body` has `overflow: hidden` declared.
31. Inside the `@supports` block, `.acc-body` has a `transition` property that references
    `height` (and optionally `opacity`) with a non-zero duration.
32. Inside the `@supports` block, `.acc-body` has `height: 0` as its default state.
33. Inside the `@supports` block, `details[open] .acc-body` has `height: auto`.
34. Inside the `@supports` block, a `@starting-style` rule sets `details[open] .acc-body`
    to `height: 0`.
    Note: AC 28–34 are CSS-source-level assertions, not computed-style assertions. The
    test-writer should verify these through DOM/story-level proxy tests (see AC 35–37).
    The CSS source is the normative authority; if `@supports` prevents the rule from
    applying in an unsupported test browser, the assertion strategy should be adapted
    (see Open questions OQ-1).

### AnimatedAccordion — DOM behaviour (AC 35–37)

35. The `<details>` element starts without the `open` attribute (closed state). The
    `.acc-body` element exists in the DOM regardless of open state (it is always
    rendered; hiding is via height/overflow in supported browsers, or native `<details>`
    hiding in unsupported browsers).
36. After clicking the `<summary>` element, the `<details>` element gains the `open`
    attribute and `.acc-body` becomes visible (`toBeVisible()` passes).
37. After clicking the `<summary>` a second time, the `<details>` element loses the
    `open` attribute.

### AnimatedAccordion — no regression (AC 38–40)

38. All existing Accordion stories ("Default", "All Closed", "Toggle Interaction",
    "Rich Body", "Wrapper Border", "Item Borders", "Attribute Forwarding") continue to
    pass after the CSS change — `pnpm test` is fully green.
39. `pnpm check` passes with zero TypeScript errors after the CSS change (no `.svelte`
    or `.ts` file changes should introduce type errors).
40. The a11y addon reports zero new violations for any Accordion story after the change.

### AnimatedAccordion — "Animated" story (AC 41–42)

41. A story named "Animated" is present in `src/lib/components/data/Accordion.stories.svelte`.
42. The "Animated" story play function passes: open attribute is absent initially; after
    clicking the summary, `<details>` has `open` and `.acc-body` is visible; after
    clicking again, `<details>` loses `open`.

---

## Out of scope

- **Nav integration** — `Breadcrumb` is not wired into `Nav.svelte`. Composing
  `<Breadcrumb>` below or inside `<Nav>` is the consumer's responsibility. The
  "breadcrumb slot" question from B6 is resolved here as a separate component, not a
  Nav snippet prop.
- **SvelteKit `$page` integration** — `Breadcrumb` does not read `$page.url` or any
  SvelteKit route store. The `crumbs` array is always provided by the consumer. This
  keeps the component usable in Storybook and non-SvelteKit contexts.
- **Animated close (reverse transition)** — `@starting-style` only controls the entry
  (open) direction. The close transition (from `height: auto` to `height: 0`) is handled
  by reversing the `details[open] .acc-body` rule; this is implicit in the CSS. No
  separate close-animation AC is added because the implementation is the same block.
- **`interpolate-size` polyfill** — browsers that do not support `interpolate-size`
  receive instant open/close (the `<details>` native behaviour). No JavaScript fallback
  is provided.
- **Transition duration/easing as a prop** — the animation timing is fixed in CSS.
  Making it configurable via a prop is out of scope.
- **"Expand all" / "Collapse all"** — programmatic control over multiple AccordionItems
  simultaneously is out of scope (noted in B10 Out of scope; unchanged).
- **Accordion keyboard navigation** — no changes to keyboard behaviour are made in B17.
- **Breadcrumb structured data (`ld+json`)** — schema.org BreadcrumbList markup is out
  of scope.
- **Breadcrumb truncation** — long trails that overflow the viewport are not handled
  with ellipsis or collapse in B17.

---

## Open questions

**OQ-1** (potentially blocking for AC 28–34): The `@supports` guard means the animation
CSS is not applied in browsers that do not support `interpolate-size: allow-keywords`.
The Playwright browser used by `@storybook/addon-vitest` may or may not support this
property. If it does not, `getComputedStyle(accBody).height` will NOT reflect the
`height: 0` rule and assertions on computed height values will fail.

Resolution options:
- (a) Write AC 28–34 as source-level assertions: parse the scoped CSS from the
  `<style>` block text rather than `getComputedStyle`. The test-writer should check
  whether `@storybook/test` offers a DOM-accessible way to read scoped CSS rules.
- (b) Treat AC 28–34 as documentation-only criteria verified during code review, and
  limit automated play-function assertions to AC 35–37 (DOM toggle behaviour), which
  work regardless of `@supports` support.
- (c) Accept that in an unsupported browser the `height: 0` rule is absent and assert
  only that the existing toggle behaviour (AC 35–37) is unchanged.

**Recommendation**: the test-writer should implement option (b) — AC 28–34 are spec
criteria that the reviewer verifies by code inspection; the play functions assert only
AC 35–37 and AC 42. This is called out in the AC text above.

OQ-1 is **non-blocking** for implementation, but the test-writer must be aware that
CSS `@supports`-gated rules cannot be reliably asserted via `getComputedStyle` in a
potentially unsupported browser environment.

**OQ-2** (non-blocking): Should `Breadcrumb` suppress the `href`-link behaviour on the
last crumb (the current page) via `pointer-events: none` or `tabindex="-1"`? The current
spec uses `pointer-events: none` on `.bc-link[aria-current="page"]` in CSS, which
prevents a mouse click reload but keeps the element keyboard-focusable (which is
correct for WCAG — keyboard users can still reach it). If the product decision is that
the current-page crumb should be a `<span>` rather than an `<a>`, the HTML structure
and AC 9 would need revision. For now, always rendering `<a>` elements is the safer
and more accessible default.

**OQ-3** (non-blocking): The separator character is `/` in this spec (a forward slash,
matching the `// ~ / SECTION` aesthetic from the design reference). If the designer
prefers `›` (the same glyph used in `AccordionItem`) or another character, the
implementer can change it without a spec revision — only the glyph character changes,
not the `aria-hidden` structure.
