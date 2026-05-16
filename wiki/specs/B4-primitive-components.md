# B4: Primitive components

## Context

This item delivers the three atom-level Svelte 5 components — `Button`, `Led`, and
`TagPill` — that every higher-level component in the library depends on. They translate
the visual patterns documented in the design bundle preview files into typed, accessible,
fully composable Svelte 5 components following the Chakra-style authoring conventions
established in D4 and D5.

Related wiki pages: [vision.md](../vision.md), [requirements.md](../requirements.md) (R3),
[architecture.md](../architecture.md) (component authoring conventions),
[decisions.md](../decisions.md) (D4 Chakra-style, D5 no global utility classes),
[stories-guide.md](../stories-guide.md).

Reference HTML for visual specification:
- `dexterlabs-design-system/project/preview/09-components-buttons.html` — Button variants
- `dexterlabs-design-system/project/preview/11-components-leds-tags.html` — Led + TagPill

### Files produced by this item

| File | Role |
|---|---|
| `src/lib/components/primitives/Button.svelte` | Button component |
| `src/lib/components/primitives/Button.stories.svelte` | Button stories + tests |
| `src/lib/components/primitives/Led.svelte` | Led component |
| `src/lib/components/primitives/Led.stories.svelte` | Led stories + tests |
| `src/lib/components/primitives/TagPill.svelte` | TagPill component |
| `src/lib/components/primitives/TagPill.stories.svelte` | TagPill stories + tests |
| `src/lib/components/primitives/index.ts` | Barrel export for all three components |
| `src/lib/index.ts` | Updated to re-export all three components |

---

## Component specifications

### Button

#### Props interface

```ts
import type { HTMLButtonAttributes } from 'svelte/elements'

type ButtonVariant = 'primary' | 'cta' | 'ghost' | 'back' | 'del'

interface Props extends HTMLButtonAttributes {
  as?: string          // polymorphic element tag; defaults to 'button'
  variant?: ButtonVariant  // defaults to 'primary'
}

let { as = 'button', variant = 'primary', children, ...rest }: Props = $props()
```

The component renders via `<svelte:element this={as} {...rest}>`. All native
`HTMLButtonAttributes` (including `disabled`, `type`, `aria-*`, `data-*`, `onclick`, etc.)
pass through via `...rest` without re-declaration.

#### Variants and visual behaviour

All variants share these base traits: `font-family: var(--mono)`, `letter-spacing` as
specified per variant, `text-transform: uppercase`, `cursor: pointer`,
`transition: background var(--transition), color var(--transition), border-color var(--transition)`,
`white-space: nowrap`.

| Variant | Resting state | Hover state | Disabled state |
|---------|--------------|-------------|----------------|
| `primary` | `background: var(--amber)`, `color: var(--bg)`, no border, `padding: 10px 16px`, `font-size: 14px`, `letter-spacing: 0.1em` | `background: var(--ink)` | `opacity: 0.5`, `cursor: not-allowed` |
| `cta` | `color: var(--amber)`, `border: 1px solid var(--amber)`, `border-radius: var(--radius)`, `background: transparent`, `padding: 9px 20px`, `font-size: 14px`, `letter-spacing: 0.1em` | `background: var(--amber)`, `color: var(--bg)` | `opacity: 0.5`, `cursor: not-allowed` |
| `ghost` | `color: var(--amber)`, no border, no background, `font-size: 14px`, `letter-spacing: 0.08em` | `color: var(--ink)` | — (no explicit disabled style needed) |
| `back` | `color: var(--ink-faint)`, no border, no background, `font-size: 14px`, `letter-spacing: 0.08em` | `color: var(--amber)` | — |
| `del` | `color: var(--ink-faint)`, `border: 1px solid var(--rule-strong)`, `border-radius: var(--radius)`, no background, `padding: 3px 7px`, `font-size: 12px`, `letter-spacing: 0.1em` | `color: var(--danger)`, `border-color: var(--danger)` | — |

All CSS lives in Button's own `<style>` block. No hardcoded hex values — only CSS custom
property references. No global class names are applied from outside the component.

#### Accessibility

- Default element is `<button>` with `type="button"` implied unless the consumer passes
  `type="submit"` or `type="reset"` via `...rest`.
- When `as="a"`, the consumer must pass `href` via `...rest`; no additional ARIA role is
  needed because `<a href>` already has `role="link"`.
- `disabled` forwarded via `...rest` suppresses pointer events and sets `aria-disabled`
  on non-button elements (when `as="a"`, pass `aria-disabled="true"` manually — the
  component does not auto-add it).
- Focus indicator: the component must not suppress the browser default `:focus-visible`
  outline. A visible focus ring must be present on keyboard focus.
- Color contrast of text against background must meet WCAG 2.1 AA (4.5:1 for small text)
  in both Phosphor and Paper palettes.

---

### Led

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type LedColor = 'ok' | 'amber' | 'cyan' | 'danger' | 'off'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  color?: LedColor    // defaults to 'ok'
  blink?: boolean     // defaults to false
}

let { color = 'ok', blink = false, ...rest }: Props = $props()
```

The component renders as `<span>` (inline, no `as` prop — there is no meaningful
polymorphic use case for a status dot). All native `HTMLAttributes<HTMLSpanElement>`
pass through via `...rest`.

#### Variants and visual behaviour

The Led is a 7×7 px circle (`border-radius: 50%`, `width: 7px`, `height: 7px`,
`display: inline-block`, `flex-shrink: 0`). Background color and `box-shadow` glow are
set by the `color` prop:

| `color` | Background | Box shadow (glow) |
|---------|-----------|-------------------|
| `ok` | `var(--ok)` | `0 0 6px var(--ok)` |
| `amber` | `var(--amber)` | `0 0 6px var(--amber)` |
| `cyan` | `var(--cyan)` | `0 0 6px var(--cyan)` |
| `danger` | `var(--danger)` | `0 0 6px var(--danger)` |
| `off` | `var(--ink-faint)` | none |

When `blink={true}`, the animation `blink 1.6s steps(2,end) infinite` is applied. The
`@keyframes blink` definition: `50% { opacity: 0.25 }`.

All CSS lives in Led's own `<style>` block. No hardcoded hex values.

#### Accessibility

- The `<span>` element has `role="status"` by default so screen readers can announce
  state changes when the Led is used as a live status indicator.
- The consumer must provide a readable label via `aria-label` passed through `...rest`
  (e.g. `aria-label="System ok"`). Without a label the element is effectively
  presentation-only; this is a valid use case when the Led is paired with adjacent
  visible text.
- Color alone must not be the only means of conveying status (WCAG 1.4.1). The Led is
  a visual complement to adjacent text labels — the component itself does not enforce
  this, but the spec requires it and stories must demonstrate the Led paired with text.

---

### TagPill

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type TagPillVariant = 'default' | 'amber' | 'cyan'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagPillVariant  // defaults to 'default'
}

let { variant = 'default', children, ...rest }: Props = $props()
```

The component renders as `<span>`. No `as` prop — pills are always inline spans in the
design system. All native `HTMLAttributes<HTMLSpanElement>` pass through via `...rest`.

#### Variants and visual behaviour

Base styles for all variants: `display: inline-block`, `font-family: var(--mono)`,
`font-size: 11px`, `letter-spacing: 0.1em`, `text-transform: uppercase`,
`padding: 2px 6px`, `border: 1px solid <color>`. No border-radius (square corners per
design).

| Variant | `color` | `border-color` |
|---------|---------|---------------|
| `default` | `var(--ink-faint)` | `var(--ink-faint)` |
| `amber` | `var(--amber)` | `var(--amber)` |
| `cyan` | `var(--cyan)` | `var(--cyan)` |

All CSS lives in TagPill's own `<style>` block. No hardcoded hex values.

#### Accessibility

- `<span>` with text content is adequately described by its text alone for screen
  readers. No additional ARIA roles are required.
- Consumer may add `role="status"` and `aria-label` via `...rest` if the pill
  represents a live status update.

---

## Barrel exports

### `src/lib/components/primitives/index.ts`

Must export all three components as named exports:

```ts
export { default as Button } from './Button.svelte'
export { default as Led } from './Led.svelte'
export { default as TagPill } from './TagPill.svelte'
```

### `src/lib/index.ts`

Must re-export all three components (in addition to any existing exports from B2/B3):

```ts
export { Button, Led, TagPill } from './components/primitives/index.js'
```

---

## Story specifications

All story files use **Svelte CSF format** (`.stories.svelte`), co-located with the
component. The mandatory format rules from `wiki/stories-guide.md` apply without
exception:

- `<script module lang="ts">` with `lang="ts"`
- `import { defineMeta } from "@storybook/addon-svelte-csf"`
- `import { expect, within } from "storybook/test"` (no `@` prefix)
- Play functions as named `const` variables in the module script block
- Play function signature: `async ({ canvasElement }: { canvasElement: HTMLElement }) => { ... }`
- Story names: human-readable with spaces, no camelCase
- No TypeScript casts in Story template attributes

---

### `Button.stories.svelte` — `title: 'Primitives/Button'`

#### Story: "Primary"

- `args: { variant: 'primary' }`, renders `<Button variant="primary">Order Now</Button>`
- Play: query button by role `"button"`, assert it is visible and enabled.
- Assert computed `background-color` matches the `--amber` token value (not transparent).
- Assert computed `color` matches the `--bg` token value.
- Assert `text-transform` is `"uppercase"`.

#### Story: "Primary Disabled"

- `args: { variant: 'primary', disabled: true }`, text `"Disabled"`.
- Play: assert the button has `disabled` attribute. Assert computed `opacity` is `"0.5"`.
- Assert computed `cursor` is `"not-allowed"`.

#### Story: "CTA"

- `args: { variant: 'cta' }`, text `"View Project →"`.
- Play: assert the button is visible and enabled.
- Assert computed `color` matches `--amber` token value.
- Assert computed `border` style includes `var(--amber)` — or assert `borderColor` is
  the resolved amber rgb value.

#### Story: "CTA Disabled"

- `args: { variant: 'cta', disabled: true }`, text `"Disabled"`.
- Play: assert the button has `disabled` attribute and computed `opacity` is `"0.5"`.

#### Story: "Ghost"

- `args: { variant: 'ghost' }`, text `"View All Hardware →"`.
- Play: assert the button is visible and enabled. Assert computed `background-color`
  is transparent (`rgba(0, 0, 0, 0)`). Assert computed `color` matches `--amber` token.

#### Story: "Back"

- `args: { variant: 'back' }`, text `"← Back to Catalogue"`.
- Play: assert the button is visible and enabled. Assert computed `color` matches
  `--ink-faint` token value.

#### Story: "Del"

- `args: { variant: 'del' }`, text `"Remove"`.
- Play: assert the button is visible and enabled. Assert computed `border` style is
  present (not `"none"`). Assert computed `color` matches `--ink-faint` token value.

#### Story: "As Link"

- Template: `<Button as="a" href="#demo" variant="ghost">View Demo →</Button>`
- Play: query by role `"link"`, assert `href` attribute is `"#demo"`. Assert element
  tag name is `"A"`.

---

### `Led.stories.svelte` — `title: 'Primitives/Led'`

#### Story: "Ok"

- Template: `<Led color="ok" aria-label="Status: ok" />`
- Play: query by `aria-label="Status: ok"`. Assert the element is visible.
- Assert computed `width` is `"7px"` and `height` is `"7px"`.
- Assert computed `background-color` matches the `--ok` token value.
- Assert `border-radius` is `"50%"`.

#### Story: "Amber"

- Template: `<Led color="amber" aria-label="Status: amber" />`
- Play: assert computed `background-color` matches `--amber` token value.

#### Story: "Cyan"

- Template: `<Led color="cyan" aria-label="Status: cyan" />`
- Play: assert computed `background-color` matches `--cyan` token value.

#### Story: "Danger"

- Template: `<Led color="danger" aria-label="Status: danger" />`
- Play: assert computed `background-color` matches `--danger` token value.

#### Story: "Off"

- Template: `<Led color="off" aria-label="Status: off" />`
- Play: assert computed `background-color` matches `--ink-faint` token value.
- Assert computed `box-shadow` is `"none"` (no glow on the off state).

#### Story: "Blink"

- Template: `<Led color="amber" blink={true} aria-label="Status: blinking" />`
- Play: assert the element is visible. Assert the element's computed
  `animation-name` is not `"none"` (i.e. a blink animation is applied).

#### Story: "Paired With Text"

- Purpose: demonstrates accessible pairing of Led with adjacent text label.
- Template renders a flex row: `<Led color="ok" aria-label="System ok" />` followed
  by a `<span>` with text "System ok".
- Play: assert the Led element is visible. Assert the text span is visible and contains
  the string `"System ok"`.

---

### `TagPill.stories.svelte` — `title: 'Primitives/TagPill'`

#### Story: "Default"

- Template: `<TagPill>Utility</TagPill>`
- Play: assert the element is visible and its text content is `"Utility"`.
- Assert computed `font-family` contains `"JetBrains Mono"` (case-insensitive).
- Assert computed `text-transform` is `"uppercase"`.
- Assert computed `color` matches `--ink-faint` token value.

#### Story: "Amber"

- Template: `<TagPill variant="amber">Featured</TagPill>`
- Play: assert computed `color` matches `--amber` token value.
- Assert computed `border-color` matches `--amber` token value.

#### Story: "Cyan"

- Template: `<TagPill variant="cyan">New</TagPill>`
- Play: assert computed `color` matches `--cyan` token value.
- Assert computed `border-color` matches `--cyan` token value.

#### Story: "Multiple Pills"

- Purpose: demonstrates real-world usage with several pills in a flex row.
- Template renders a flex row containing: `<TagPill>Utility</TagPill>`,
  `<TagPill>Power Supply</TagPill>`, `<TagPill variant="amber">Latest</TagPill>`.
- Play: assert that 3 elements with appropriate roles or text are visible.
  Assert the "Latest" pill has a computed `color` that is not the same as the
  `--ink-faint` value (confirming variant applied).

---

## Acceptance criteria

### General (all three components)

1. All three components exist at their specified paths within
   `src/lib/components/primitives/`.
2. `src/lib/components/primitives/index.ts` barrel-exports `Button`, `Led`, and
   `TagPill` as named exports.
3. `src/lib/index.ts` re-exports all three components so that
   `import { Button, Led, TagPill } from '$lib'` resolves without error in a SvelteKit
   consumer.
4. `pnpm check` (Svelte type-check) passes with zero errors on all three component files
   and both barrel export files.
5. No component file imports CSS from any external file; all styles live inside the
   component's own `<style>` block.
6. No hardcoded hex colour values appear in any component's `<style>` block; every colour
   reference uses a `var(--token)` CSS custom property.
7. No component uses Svelte 4 `export let`; all props are declared via `$props()`.
8. Every component uses `...rest` spread onto its root element so that arbitrary HTML
   attributes passed by a consumer are forwarded.

### Button

9. `Button` renders as a `<button>` element by default.
10. When `as="a"` is passed together with `href`, the rendered element is `<a>` with the
    correct `href` attribute, and querying by role `"link"` succeeds.
11. The `variant` prop controls the visual style class applied to the root element; all
    five variants (`primary`, `cta`, `ghost`, `back`, `del`) are visually distinct.
12. `variant="primary"`: resting background resolves to the `--amber` token value;
    `color` resolves to `--bg`; `text-transform` is `uppercase`.
13. `variant="cta"`: resting `color` resolves to `--amber`; `border-color` resolves to
    `--amber`; `background-color` is transparent.
14. `variant="ghost"`: resting `color` resolves to `--amber`; `background-color` is
    transparent; no border.
15. `variant="back"`: resting `color` resolves to `--ink-faint`; `background-color` is
    transparent; no border.
16. `variant="del"`: resting `color` resolves to `--ink-faint`; `border-color` resolves
    to `--rule-strong`.
17. When `disabled={true}` is passed to `variant="primary"` or `variant="cta"`, the
    element has the `disabled` attribute and its computed `opacity` is `0.5`.
18. When `disabled={true}` is passed, the computed `cursor` style is `not-allowed`.
19. Focus via keyboard (Tab) produces a visible `:focus-visible` outline that is not
    suppressed by the component's CSS. The `@storybook/addon-a11y` panel reports no
    focus-indicator violations on any Button story.
20. The `@storybook/addon-a11y` panel reports no accessibility violations on any Button
    story in its default rendered state.

### Led

21. `Led` renders as a `<span>` element.
22. The rendered element is exactly `7px` wide and `7px` tall (`width: 7px`,
    `height: 7px` in computed styles).
23. The rendered element has `border-radius: 50%` (circular).
24. `color="ok"` (default): computed `background-color` matches the resolved value of
    `var(--ok)`. A non-`none` `box-shadow` is applied.
25. `color="amber"`: computed `background-color` matches `var(--amber)`.
26. `color="cyan"`: computed `background-color` matches `var(--cyan)`.
27. `color="danger"`: computed `background-color` matches `var(--danger)`.
28. `color="off"`: computed `background-color` matches `var(--ink-faint)`. Computed
    `box-shadow` is `none`.
29. `blink={true}`: the rendered element has a CSS `animation-name` that is not `"none"`.
    The animation keyframe produces opacity `0.25` at the `50%` frame.
30. `blink={false}` (default): no animation is applied (`animation-name: none`).
31. `aria-label` passed via `...rest` appears on the rendered `<span>` element.
32. The `@storybook/addon-a11y` panel reports no accessibility violations on any Led
    story that provides an `aria-label`.

### TagPill

33. `TagPill` renders as a `<span>` element.
34. The rendered element has `text-transform: uppercase` and
    `font-family` containing `"JetBrains Mono"` (case-insensitive match on computed value).
35. The rendered element has `font-size: 11px` and `letter-spacing: 0.1em`.
36. The rendered element has a `border` (not `border: none`); the border has no
    `border-radius` (square corners: `border-radius: 0` or unset).
37. `variant="default"` (default): computed `color` matches `var(--ink-faint)` value;
    `border-color` matches `var(--ink-faint)` value.
38. `variant="amber"`: computed `color` matches `var(--amber)` value; `border-color`
    matches `var(--amber)` value.
39. `variant="cyan"`: computed `color` matches `var(--cyan)` value; `border-color`
    matches `var(--cyan)` value.
40. Children (slot content / snippet) render as the pill text content.
41. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    TagPill story.

### Stories

42. `Button.stories.svelte` exists at `src/lib/components/primitives/Button.stories.svelte`
    and defines stories with `title: 'Primitives/Button'`. The following named stories
    exist: "Primary", "Primary Disabled", "CTA", "CTA Disabled", "Ghost", "Back",
    "Del", "As Link".
43. `Led.stories.svelte` exists at `src/lib/components/primitives/Led.stories.svelte`
    and defines stories with `title: 'Primitives/Led'`. The following named stories
    exist: "Ok", "Amber", "Cyan", "Danger", "Off", "Blink", "Paired With Text".
44. `TagPill.stories.svelte` exists at
    `src/lib/components/primitives/TagPill.stories.svelte` and defines stories with
    `title: 'Primitives/TagPill'`. The following named stories exist: "Default",
    "Amber", "Cyan", "Multiple Pills".
45. Every story with a `play` function passes when executed via `pnpm test`
    (`@storybook/addon-vitest` Vitest browser mode).
46. Every story file uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, and imports `expect` and `within` from
    `"storybook/test"` (no `@` prefix). Play functions are named `const` variables in
    the module script block, not inline arrows in template attributes.

---

## Out of scope

- Hover and active state animations beyond the CSS `transition` already specified
  (no JS-driven animation).
- Any compound sub-component pattern (e.g. `Button.Icon`) — primitives are atoms with
  no sub-components.
- Icon embedding inside Button (consumers pass icon glyphs as children).
- Led rendered as anything other than a `<span>` (no `as` prop).
- TagPill rendered as anything other than a `<span>` (no `as` prop).
- Palette toggle runtime behaviour — that is B6.
- B3 layout helper components (`Stack`, `Grid`, etc.) — stories may use inline
  `style` attributes for layout within the story canvas but must not use global utility
  classes that depend on `layout.css` being globally imported.
- Visual regression snapshot testing — tests are interaction + assertion only.
- Storybook `autodocs` generated docs page — stories should include
  `tags: ['autodocs']` in `defineMeta` but the generated page content is not under test
  here.

---

## Open questions

None identified. All visual specifications are fully defined in the reference HTML files
and the token values are established by B2. This item is not blocking.
