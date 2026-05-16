# B3: Layout components

## Context

B3 delivers the six Svelte 5 layout primitive components — `Stack`, `Inline`, `Spread`,
`Grid`, `Container`, and `Rule` — that every higher-level component in the library
(Cards, Nav, Forms, Patterns) uses to compose its internal layout. They replace the old
CSS-only utility-class approach that was rejected in D5.

Decision D5 established that `layout.css` is a **source reference only**, not a public
API. Its class names must never leak to consumers. Instead, each component reads the
token variables it needs and exposes a typed, Chakra-style style-prop interface
(`gap="lg"`, `cols={3}`, etc.) so the CSS stays scoped inside each component's own
`<style>` block.

These components are the second layer in the build pyramid: atoms (`Button`, `Led`,
`TagPill`) are already done (B4); layout primitives wrap atoms into composed canvases;
composites (B5 Cards, B6 Nav, etc.) will import from both layers.

Related wiki pages:
- [vision.md](../vision.md) — what the library is and what success looks like
- [requirements.md](../requirements.md) — R9 layout helpers, R1 design tokens
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style,
  Svelte 5 runes, scoped CSS, `...rest` forwarding)
- [decisions.md](../decisions.md) — D5 (no global utility classes), D4 (Chakra-style
  composability), D1 (tests = Story play functions), D2 (Svelte 5 runes)
- [stories-guide.md](../stories-guide.md) — how to write Svelte CSF stories + play
  functions

Source reference (read; do not import globally):
`src/lib/tokens/layout.css`

### Files produced by this item

| File | Role |
|---|---|
| `src/lib/components/layout/Stack.svelte` | Vertical flex stack component |
| `src/lib/components/layout/Stack.stories.svelte` | Stack stories + tests |
| `src/lib/components/layout/Inline.svelte` | Horizontal wrapping flex component |
| `src/lib/components/layout/Inline.stories.svelte` | Inline stories + tests |
| `src/lib/components/layout/Spread.svelte` | Space-between flex row component |
| `src/lib/components/layout/Spread.stories.svelte` | Spread stories + tests |
| `src/lib/components/layout/Grid.svelte` | CSS grid component |
| `src/lib/components/layout/Grid.stories.svelte` | Grid stories + tests |
| `src/lib/components/layout/Container.svelte` | Max-width page container component |
| `src/lib/components/layout/Container.stories.svelte` | Container stories + tests |
| `src/lib/components/layout/Rule.svelte` | Horizontal divider component |
| `src/lib/components/layout/Rule.stories.svelte` | Rule stories + tests |
| `src/lib/components/layout/index.ts` | Barrel export for all six components |
| `src/lib/index.ts` | Updated to re-export all six components |

---

## Token reference

All gap / spacing prop values map to token CSS custom properties from `tokens.css`.
The table below is the authoritative mapping for this spec; implementers must use
exactly these CSS custom property expressions in component `<style>` blocks:

| Prop value | CSS expression | Resolved px |
|-----------|---------------|-------------|
| `"xs"` | `var(--u)` | `8px` |
| `"sm"` | `var(--u2)` | `16px` |
| `"md"` | `var(--u2)` | `16px` |
| `"lg"` | `var(--u4)` | `32px` |
| `"xl"` | `var(--u5)` | `40px` |
| `"none"` | `0` | `0px` |

> Note: The layout.css source uses raw `px` literals rather than token vars for its
> default gaps. The component layer must convert these to token vars; do not hard-code
> `px` values. Where layout.css has `gap: 16px` as a default, that maps to
> `var(--u2)`.

Default gap values per component (derived from layout.css source defaults):

| Component | Default gap | Token |
|-----------|------------|-------|
| `Stack` | `16px` | `var(--u2)` |
| `Inline` | `12px` | `var(--u)` + 4px — use `var(--u)` or literal `12px` inside the CSS var; see open question OQ-1 |
| `Spread` | `16px` | `var(--u2)` |
| `Grid` | `16px` | `var(--u2)` |
| `Container` | n/a (no gap) | — |
| `Rule` | n/a (no gap) | — |

> Open question OQ-1 covers the Inline `12px` default that does not align exactly to a
> spacing token step. See Open questions.

---

## Component specifications

### Stack

`Stack` renders a vertical flex column. Children are spaced by the `gap` prop.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: string       // polymorphic element tag; defaults to 'div'
  gap?: GapSize     // defaults to 'sm' (16px, matching layout.css .stack default)
}

let { as = 'div', gap = 'sm', children, ...rest }: Props = $props()
```

#### HTML element rendered

`<svelte:element this={as}>` — defaults to `<div>`. Common overrides: `<section>`,
`<article>`, `<ul>`.

#### CSS behaviour

The root element's style is set inline via Svelte's style directive (or a computed
`style` string spread via `...rest`). Preferred approach: use a CSS custom property
driven by the `gap` prop and a class that reads it.

The component applies:
```css
display: flex;
flex-direction: column;
gap: <resolved token value>;
```

Gap mapping applied in the component's `<style>` block via data attribute or scoped
class variants (implementer chooses the pattern, but no global class names may be used):

| `gap` prop | CSS `gap` value |
|-----------|----------------|
| `"none"` | `0` |
| `"xs"` | `var(--u)` |
| `"sm"` | `var(--u2)` (default) |
| `"md"` | `var(--u2)` |
| `"lg"` | `var(--u4)` |
| `"xl"` | `var(--u5)` |

#### Accessibility

- No ARIA role added. The rendered element inherits whatever semantic role its `as` tag
  provides. Consumers using `as="ul"` should pass `<li>` children.
- `...rest` forwards `aria-*` and `role` attributes for consumers who need to override.

#### Story ideas

- "Default Stack" — three `<Button>` atoms stacked vertically with `gap="sm"`.
- "Large Gap Stack" — `<TagPill>` + label text stacked with `gap="lg"`, showing wider
  spacing.
- "Small Gap Stack" — four `<Led>` + label rows stacked with `gap="xs"`.
- "As Section" — `<Stack as="section">` wrapping a heading and paragraph.

---

### Inline

`Inline` renders a horizontal wrapping flex row. Children are center-aligned and wrap
when the row is too narrow.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: string       // polymorphic element tag; defaults to 'div'
  gap?: GapSize     // defaults to 'sm' (closest token to the 12px source default)
}

let { as = 'div', gap = 'sm', children, ...rest }: Props = $props()
```

#### HTML element rendered

`<svelte:element this={as}>` — defaults to `<div>`. Common override: `<nav>`.

#### CSS behaviour

```css
display: flex;
flex-wrap: wrap;
align-items: center;
gap: <resolved token value>;
```

The `gap` prop maps to the same token table as Stack. Default is `"sm"` (`var(--u2)`,
16px). This deviates slightly from the layout.css 12px default — see OQ-1.

#### Accessibility

- No ARIA role added automatically.
- `...rest` forwards `role`, `aria-label`, etc. Consumers wrapping nav links should
  pass `as="nav"` and `aria-label`.

#### Story ideas

- "Tag Row" — `<Inline gap="sm">` containing five `<TagPill>` atoms (default, amber,
  cyan variants mixed), showing wrap behaviour.
- "Button Row" — `<Inline gap="md">` containing a ghost `<Button>` and a primary
  `<Button>`.
- "Led Status Row" — `<Inline gap="lg">` containing three `<Led>` + text label pairs.

---

### Spread

`Spread` renders a flex row with space-between justification. Typically used for a
header row: label on the left, action(s) on the right.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: string   // polymorphic element tag; defaults to 'div'
}

let { as = 'div', children, ...rest }: Props = $props()
```

No `gap` prop — `Spread` always uses a fixed `gap: var(--u2)` (16px) as per the
layout.css source. The gap prevents children from touching if the row is exactly full.
If gap customisation is needed in future, that is a new prop and out of scope for B3.

#### HTML element rendered

`<svelte:element this={as}>` — defaults to `<div>`.

#### CSS behaviour

```css
display: flex;
align-items: center;
justify-content: space-between;
gap: var(--u2);
```

#### Accessibility

- No ARIA role added. `...rest` forwards all attributes.
- Typical usage is as a visual layout row; semantic meaning comes from children and the
  `as` tag the consumer chooses.

#### Story ideas

- "Section Header" — `<Spread>` containing a `<span class="mono-label">` on the left
  and a ghost `<Button>` on the right. Simulates a real section header row.
- "Led Status Bar" — `<Spread>` with a `<Led color="ok" />` + status text on the left
  and a `<TagPill variant="amber">` on the right.

---

### Grid

`Grid` renders a CSS grid container. The `cols` prop controls column count; `gap`
controls gutter size. An `auto` mode uses `auto-fill` with a minimum cell width.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type GridCols = 1 | 2 | 3 | 4 | 'auto'

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: string       // polymorphic element tag; defaults to 'div'
  cols?: GridCols   // defaults to 3
  gap?: GapSize     // defaults to 'sm' (16px, matching layout.css .grid default)
  minColWidth?: string  // used only when cols='auto'; defaults to '240px'
}

let { as = 'div', cols = 3, gap = 'sm', minColWidth = '240px', children, ...rest }: Props = $props()
```

#### HTML element rendered

`<svelte:element this={as}>` — defaults to `<div>`.

#### CSS behaviour

```css
display: grid;
gap: <resolved token value>;
grid-template-columns: <derived from cols>;
```

Column template derivation:

| `cols` | `grid-template-columns` |
|--------|------------------------|
| `1` | `1fr` |
| `2` | `repeat(2, 1fr)` |
| `3` | `repeat(3, 1fr)` (default) |
| `4` | `repeat(4, 1fr)` |
| `'auto'` | `repeat(auto-fill, minmax(<minColWidth>, 1fr))` |

The `grid-template-columns` value is set via the `style` attribute (inline computed
string) because it is dynamic. The `gap` value may also be inline or via a scoped CSS
variable. Either approach is valid as long as no global class names are emitted.

#### Accessibility

- No ARIA role added. Grid is a visual layout primitive; semantic meaning comes from
  children.
- `...rest` forwards all attributes.

#### Story ideas

- "Three Column Grid" — `<Grid cols={3} gap="sm">` containing nine plain `<div>`
  cells with background fill and padding (showing the grid). This is the default.
- "Two Column Grid" — `<Grid cols={2} gap="lg">` with two `<Button>` atoms in
  each cell, showing wider gutter.
- "Auto Grid" — `<Grid cols="auto" minColWidth="160px" gap="sm">` with six
  `<TagPill>` atoms, demonstrating auto-fill responsive behaviour.
- "Single Column" — `<Grid cols={1} gap="md">` used to stack items identically to
  `<Stack>` but via grid semantics.

---

### Container

`Container` is a max-width page-width wrapper. It centres its children horizontally and
provides consistent horizontal padding and bottom padding. Three size variants map to
the three `.container` / `.container-md` / `.container-sm` classes in layout.css.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type ContainerSize = 'lg' | 'md' | 'sm'

interface Props extends HTMLAttributes<HTMLDivElement> {
  as?: string             // polymorphic element tag; defaults to 'div'
  size?: ContainerSize    // defaults to 'lg'
}

let { as = 'div', size = 'lg', children, ...rest }: Props = $props()
```

#### HTML element rendered

`<svelte:element this={as}>` — defaults to `<div>`. Common override: `<main>`,
`<section>`.

#### CSS behaviour

All three sizes share: `margin: 0 auto`, `padding-left: 32px`, `padding-right: 32px`,
`container-type: inline-size`.

| `size` | `max-width` | `padding-bottom` |
|--------|------------|-----------------|
| `"lg"` (default) | `1440px` | `80px` |
| `"md"` | `960px` | `64px` |
| `"sm"` | `640px` | `48px` |

At viewport widths `≤ 720px`, horizontal padding collapses to `16px` on both sides
(media query inside the component's `<style>` block).

#### Accessibility

- No ARIA role added. `...rest` forwards attributes including `aria-label` when the
  consumer renders `as="main"` etc.
- `container-type: inline-size` has no effect on the accessibility tree.

#### Story ideas

- "Large Container" — `<Container size="lg">` wrapping a paragraph of lorem ipsum and
  a `<Rule>`. Shows max-width clamping on wide canvases.
- "Medium Container" — `<Container size="md">` wrapping a `<Stack>` of three
  `<Button>` atoms, showing narrower content column.
- "Small Container" — `<Container size="sm">` wrapping a single paragraph.
- "As Main" — `<Container as="main" size="md">` to show semantic override.

---

### Rule

`Rule` renders a horizontal divider line. Three style variants map to the three rule
classes in layout.css.

#### Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

type RuleVariant = 'solid' | 'dashed' | 'strong'

interface Props extends HTMLAttributes<HTMLHRElement> {
  variant?: RuleVariant   // defaults to 'solid'
}

let { variant = 'solid', ...rest }: Props = $props()
```

No `as` prop — `Rule` always renders as `<hr>`. No `children` — `<hr>` is a void
element. All `HTMLAttributes<HTMLHRElement>` pass through via `...rest`.

#### HTML element rendered

`<hr>` — always. No polymorphism.

#### CSS behaviour

All variants share: `border: none`, `margin: 0`.

| `variant` | `border-top` |
|-----------|-------------|
| `"solid"` (default) | `1px solid var(--rule)` |
| `"dashed"` | `1px dashed var(--rule)` |
| `"strong"` | `1px solid var(--rule-strong)` |

#### Accessibility

- `<hr>` has the implicit ARIA role `separator`, which is correct for a thematic break.
  No additional ARIA attributes needed in the default case.
- Decorative rules that carry no semantic meaning should receive `aria-hidden="true"`
  passed through `...rest` by the consumer.

#### Story ideas

- "All Variants" — three `<Rule>` elements with labeled paragraphs above and below
  each, showing `solid`, `dashed`, and `strong` visually.
- "In Context" — a `<Stack gap="md">` containing a heading, `<Rule>`, and a paragraph,
  demonstrating how `Rule` fits inside a layout component.

---

## Acceptance criteria

Numbers are grouped by concern. Every assertion must be verifiable by a `play` function
inside a Storybook story, either via `getComputedStyle` or by querying the DOM.

### General (all six components)

1. All six component files exist at `src/lib/components/layout/<Name>.svelte`.
2. `src/lib/components/layout/index.ts` exports `Stack`, `Inline`, `Spread`, `Grid`,
   `Container`, and `Rule` as named exports.
3. `src/lib/index.ts` re-exports all six so that
   `import { Stack, Inline, Spread, Grid, Container, Rule } from '$lib'`
   resolves without error in a SvelteKit consumer.
4. `pnpm check` passes with zero TypeScript errors on all six component files and both
   barrel export files.
5. No component file contains an `@import` or any external CSS reference; all styles
   live inside the component's own `<style>` block.
6. No hardcoded `px` colour values (hex, rgb, hsl) appear in any component's
   `<style>` block. All colour references use `var(--token)`.
7. No component uses Svelte 4 `export let`; all props are declared via `$props()`.
8. Every component spreads `...rest` onto its root element, so that arbitrary
   `class`, `style`, `data-*`, and `aria-*` attributes passed by a consumer are
   forwarded to the rendered DOM element.
9. No component emits a global CSS class name that would be usable outside the component
   as a utility class. Scoped Svelte styles only.
10. All six story files exist at
    `src/lib/components/layout/<Name>.stories.svelte`, co-located with the component.
11. Every story file uses `<script module lang="ts">`, imports `defineMeta` from
    `"@storybook/addon-svelte-csf"`, and imports `expect` and `within` from
    `"storybook/test"` (no `@` prefix). `defineMeta` does not include a `component:`
    key. Play functions are named `const` variables in the module script block.
12. Every story `play` function passes when executed via `pnpm test`
    (`@storybook/addon-vitest` Vitest browser mode).

### Stack

13. `<Stack>` renders a single root `<div>` element by default (no extra wrapper
    elements; `children` render directly inside the root).
14. When `as="section"` is passed, the root element is `<section>`.
15. The root element has computed `display: flex` and `flex-direction: column`.
16. `gap="none"` produces computed `gap: 0px` (or `gap: 0`).
17. `gap="xs"` produces computed `gap` equal to the resolved value of `var(--u)` (8px).
18. `gap="sm"` (default) produces computed `gap` equal to the resolved value of
    `var(--u2)` (16px).
19. `gap="md"` produces computed `gap` equal to the resolved value of `var(--u2)` (16px).
20. `gap="lg"` produces computed `gap` equal to the resolved value of `var(--u4)` (32px).
21. `gap="xl"` produces computed `gap` equal to the resolved value of `var(--u5)` (40px).
22. An `aria-label` attribute passed via `...rest` appears on the rendered root element.
23. A `data-testid` attribute passed via `...rest` appears on the rendered root element.
24. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    Stack story.

### Inline

25. `<Inline>` renders a single root `<div>` element by default.
26. When `as="nav"` is passed, the root element is `<nav>`.
27. The root element has computed `display: flex`, `flex-wrap: wrap`, and
    `align-items: center`.
28. `gap="none"` produces computed `gap: 0px`.
29. `gap="sm"` (default) produces a non-zero computed `gap`.
30. `gap="lg"` produces computed `gap` equal to the resolved value of `var(--u4)` (32px).
31. An `aria-label` attribute passed via `...rest` appears on the rendered root element.
32. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    Inline story.

### Spread

33. `<Spread>` renders a single root `<div>` element by default.
34. When `as="header"` is passed, the root element is `<header>`.
35. The root element has computed `display: flex`, `align-items: center`, and
    `justify-content: space-between`.
36. The root element has a non-zero computed `gap` (the fixed 16px / `var(--u2)` gutter).
37. Two children placed inside `<Spread>` are visually pushed to opposite ends of the
    container (assertable indirectly: `justify-content: space-between` is verified).
38. An `aria-label` attribute passed via `...rest` appears on the rendered root element.
39. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    Spread story.

### Grid

40. `<Grid>` renders a single root `<div>` element by default.
41. The root element has computed `display: grid`.
42. `cols={1}` produces `grid-template-columns` resolving to a single column (one `1fr`
    track — computed value contains exactly one `fr` unit or one width).
43. `cols={2}` produces `grid-template-columns` resolving to two equal columns.
44. `cols={3}` (default) produces `grid-template-columns` resolving to three equal columns.
45. `cols={4}` produces `grid-template-columns` resolving to four equal columns.
46. `cols="auto"` with default `minColWidth` produces a `grid-template-columns`
    computed value consistent with `repeat(auto-fill, minmax(240px, 1fr))` — verified by
    asserting the computed value is not a fixed pixel or fractional track list (it will
    contain multiple tracks once children fill it, or a single `minmax` track when empty).
47. `cols="auto"` with `minColWidth="160px"` produces a `grid-template-columns`
    computed value whose minimum track size is `160px` (assertable by confirming the
    computed value differs from the `minColWidth="240px"` default case when the container
    is wide enough).
48. `gap="sm"` (default) produces computed `gap` equal to the resolved value of
    `var(--u2)` (16px).
49. `gap="lg"` produces computed `gap` equal to the resolved value of `var(--u4)` (32px).
50. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    Grid story.

### Container

51. `<Container>` renders a single root `<div>` element by default.
52. When `as="main"` is passed, the root element is `<main>`.
53. The root element has computed `margin-left: auto` and `margin-right: auto`.
54. `size="lg"` (default) produces computed `max-width: 1440px`, `padding-left: 32px`,
    `padding-right: 32px`, and `padding-bottom: 80px`.
55. `size="md"` produces computed `max-width: 960px`, `padding-left: 32px`,
    `padding-right: 32px`, and `padding-bottom: 64px`.
56. `size="sm"` produces computed `max-width: 640px`, `padding-left: 32px`,
    `padding-right: 32px`, and `padding-bottom: 48px`.
57. The `<style>` block declares a media query so that at viewport widths `≤ 720px`,
    `padding-left` and `padding-right` resolve to `16px`. (This cannot be asserted by
    a play function at fixed canvas size — it is verified by code review only. See
    Out of scope.)
58. The root element has `container-type: inline-size` set (allowing children to use
    container queries). This is verified by reading the element's `containerType`
    computed style in the play function or confirming it is present in the stylesheet.
59. An `aria-label` attribute passed via `...rest` appears on the rendered root element.
60. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    Container story.

### Rule

61. `<Rule>` renders a single `<hr>` element — no wrapper, no children rendered.
62. The `<hr>` element has computed `border-top-style: solid` and
    `border-top-width: 1px` for `variant="solid"` (default).
63. The `<hr>` element has a `border-top-color` that resolves to the same value as
    `var(--rule)` for `variant="solid"`.
64. `variant="dashed"` produces computed `border-top-style: dashed` and
    `border-top-width: 1px`. `border-top-color` resolves to `var(--rule)`.
65. `variant="strong"` produces computed `border-top-style: solid` and
    `border-top-color` that resolves to the value of `var(--rule-strong)`, which is
    visually distinct from `var(--rule)`.
66. All variants have computed `margin-top: 0px` and `margin-bottom: 0px`.
67. All variants have no `border-bottom`, `border-left`, or `border-right` set
    (those properties resolve to `none` or `0px`).
68. An `aria-hidden="true"` attribute passed via `...rest` appears on the rendered
    `<hr>` element.
69. The `<hr>` element has implicit ARIA role `separator` — no explicit `role` attribute
    is set by the component itself; browsers assign this natively to `<hr>`.
70. The `@storybook/addon-a11y` panel reports no accessibility violations on any
    Rule story. (A bare `<hr>` is accessible by default; no violations are expected.)

### Story specifications

#### `Stack.stories.svelte` — title: `'Layout/Stack'`

71. Story "Default Stack" exists. Template: `<Stack gap="sm">` containing three
    `<Button variant="ghost">` atoms with different labels. Play: query the root
    element (e.g. by `data-testid`), assert `display: flex`, `flex-direction: column`,
    `gap: 16px`.
72. Story "Large Gap" exists. Template: `<Stack gap="lg">` containing two `<TagPill>`
    atoms. Play: assert `gap` resolves to `32px`.
73. Story "Small Gap" exists. Template: `<Stack gap="xs">` containing four items.
    Play: assert `gap` resolves to `8px`.
74. Story "As Section" exists. Template: `<Stack as="section" gap="md">` wrapping a
    `<h2>` and a `<p>`. Play: assert the root element's `tagName` is `"SECTION"`.

#### `Inline.stories.svelte` — title: `'Layout/Inline'`

75. Story "Tag Row" exists. Template: `<Inline gap="sm">` containing at least four
    `<TagPill>` atoms (mixing variants). Play: query the root element, assert
    `display: flex`, `flex-wrap: wrap`, `align-items: center`.
76. Story "Button Row" exists. Template: `<Inline gap="md">` containing a ghost
    `<Button>` and a primary `<Button>`. Play: assert the root contains exactly two
    button elements.
77. Story "Large Gap" exists. Template: `<Inline gap="lg">` with three items.
    Play: assert `gap` resolves to `32px`.

#### `Spread.stories.svelte` — title: `'Layout/Spread'`

78. Story "Section Header" exists. Template: `<Spread>` with a `<span>` label on the
    left and a `<Button variant="ghost">` on the right. Play: query the root element,
    assert `display: flex`, `justify-content: space-between`.
79. Story "Led Status Bar" exists. Template: `<Spread>` with `<Led color="ok" />` +
    a status `<span>` on one side and a `<TagPill variant="amber">` on the other.
    Play: assert `justify-content: space-between` and that the root contains both a
    `<span>` (the Led) and a text element.

#### `Grid.stories.svelte` — title: `'Layout/Grid'`

80. Story "Three Column" exists (default). Template: `<Grid cols={3} gap="sm">` with
    nine child `<div>` cells. Play: assert `display: grid` and
    `grid-template-columns` resolves to three equal tracks.
81. Story "Two Column" exists. Template: `<Grid cols={2} gap="lg">` with four cells.
    Play: assert `grid-template-columns` resolves to two tracks and `gap` resolves
    to `32px`.
82. Story "Four Column" exists. Template: `<Grid cols={4} gap="sm">` with eight cells.
    Play: assert `grid-template-columns` resolves to four tracks.
83. Story "Auto Fill" exists. Template: `<Grid cols="auto" minColWidth="160px" gap="sm">`
    with six `<TagPill>` atoms. Play: assert `display: grid` and that
    `grid-template-columns` is not a simple fixed-count list (the computed value
    will be a resolved `px` track list when the container has a definite size; assert
    it contains more than zero columns).
84. Story "Single Column" exists. Template: `<Grid cols={1} gap="md">` with three items.
    Play: assert `grid-template-columns` resolves to a single-track value.

#### `Container.stories.svelte` — title: `'Layout/Container'`

85. Story "Large" exists. Template: `<Container size="lg">` wrapping a `<p>` and a
    `<Rule>`. Play: assert `max-width: 1440px`, `margin-left: auto`, `margin-right: auto`,
    `padding-bottom: 80px`.
86. Story "Medium" exists. Template: `<Container size="md">` wrapping a `<Stack>` with
    two `<Button>` atoms. Play: assert `max-width: 960px` and `padding-bottom: 64px`.
87. Story "Small" exists. Template: `<Container size="sm">` wrapping a paragraph.
    Play: assert `max-width: 640px` and `padding-bottom: 48px`.
88. Story "As Main" exists. Template: `<Container as="main" size="md">`. Play: assert
    the root element's `tagName` is `"MAIN"`.

#### `Rule.stories.svelte` — title: `'Layout/Rule'`

89. Story "All Variants" exists. Template: three `<Rule>` elements inside a `<Stack>`,
    one per variant (`solid`, `dashed`, `strong`), each labeled above with a
    `<span>`. Play: query all three `<hr>` elements; assert the first has
    `border-top-style: solid`; the second has `border-top-style: dashed`; the third
    has `border-top-style: solid` and a `border-top-color` different from the first.
90. Story "In Context" exists. Template: `<Stack gap="md">` wrapping a `<h3>`, a
    `<Rule>`, and a `<p>`. Play: assert the `<hr>` element is visible and has
    `margin: 0px` (all sides).

---

## Out of scope

- **`as` prop type safety via generics** — for simplicity in B3, `as` is typed as
  `string`, not a generic constrained to keyof `HTMLElementTagNameMap`. Full generic
  polymorphism is a future refinement (noted as OQ-2).
- **Responsive breakpoint testing** — the `≤ 720px` media query in `Container` collapses
  horizontal padding to `16px`. Play functions cannot resize the Storybook canvas
  viewport reliably, so this is specified as a code-review check only.
- **Container query collapse** — Grid's `cols="auto"` auto-fill behaviour at narrow
  widths is governed by the browser; it cannot be meaningfully asserted in a fixed-size
  play function canvas.
- **Rail layout** (`rail-layout`, `rail-sidebar`, `rail-main`) — this is a page-level
  layout pattern suited to a dedicated page-shell component, not a general-purpose layout
  primitive. Deferred to a future item (likely part of B6 Nav or a dedicated B-shell
  item).
- **Padding / surface / border / visibility helpers** — the utility classes from
  `layout.css` (`.p-1`, `.surface-rail`, `.bordered`, `.hidden`, `.sr-only`, etc.) are
  not exposed as component props. Consumers use inline `style` attributes or pass a
  `class` name via `...rest` when they need one-off adjustments. These are already
  tested in `B3-layout-helpers.md`.
- **Split layout** (`split`, `split-aside`) — not elevated to a Svelte component in this
  item. Consumers who need a 50/50 or aside split should compose `<Grid cols={2}>` or
  `<Grid cols={2}>` with `minColWidth`. A dedicated `Split` component can be added
  later.
- **Card grid** (`card-grid`) — belongs to the Card family (B5), not a general layout
  primitive.
- **`gap` prop on `Spread`** — Spread intentionally has a fixed gap (`var(--u2)`). Gap
  customisation is out of scope for B3.
- **Svelte context / store for layout state** — none of the layout primitives need
  reactive state or context. They are stateless wrappers.
- **Storybook `autodocs` generated page** — story files include `tags: ['autodocs']` in
  `defineMeta` but the generated documentation page content is not under test here.
- **Visual regression / snapshot testing** — tests are interaction and assertion only.

---

## Open questions

**OQ-1 (non-blocking): Inline default gap does not hit a token boundary.**
`layout.css` defines `.inline { gap: var(--gap, 12px) }`. The project spacing tokens
are `--u` (8px), `--u2` (16px), `--u3` (24px), etc. `12px` sits between `--u` and
`--u2`. The implementer has two options:

- Accept `gap="sm"` defaulting to `16px` (`var(--u2)`), which deviates slightly from
  the reference CSS but aligns with the token system.
- Introduce a half-step token `--u-sm: 12px` or use `calc(var(--u) + 4px)` in the
  `<style>` block for the `sm` default.

**Recommendation**: Use `var(--u2)` (16px) as the default. The 4px deviation is not
visually significant and keeps the token surface clean. If the visual difference matters,
re-examine in a future refinement pass. This spec treats `gap="sm"` as 16px (`var(--u2)`)
throughout.

**OQ-2 (non-blocking): Generic `as` prop typing.**
All six components type `as` as `string`. This satisfies `strict: true` but does not
constrain it to valid HTML tag names. A fully type-safe generic `as` prop (e.g.
`as?: keyof HTMLElementTagNameMap`) would also require the `...rest` type to narrow
accordingly. This is architecturally sound but complex; it can be addressed in a later
TypeScript refinement pass without any breaking API change. Not blocking B3.

No open questions block implementation. B3 is ready for `test-writer`.
