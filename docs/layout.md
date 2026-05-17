# Layout

Layout components are zero-opinionated structural primitives that compose flex/grid behaviour via props. All accept an `as` prop for semantic polymorphism and forward unknown attributes to the root element.

## Stack

Renders a vertical flex column with configurable gap. Use it anywhere children should stack top-to-bottom.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `gap` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'` | Vertical gap between children. Maps to spacing tokens: none=0, xs=--u, sm/md=--u2, lg=--u4, xl=--u5. |
| `children` | `Snippet` | `undefined` | Slot content. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes forwarded to the root. |
| `style` | `string \| null` | `undefined` | Inline styles forwarded to the root. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Stack } from 'dxlb-design'
</script>

<Stack gap="md">
  <p>First item</p>
  <p>Second item</p>
</Stack>
```

### Notable behaviour

- `sm` and `md` both resolve to `--u2` (16px). They are semantically distinct aliases pointing to the same value.
- `as` accepts any valid HTML tag string (e.g. `'ul'`, `'section'`, `'nav'`). No type narrowing is applied.
- Svelte scoped CSS cannot style slotted children directly; use `Stack` `style` or child component `class` props for child overrides.

---

## Inline

Renders a wrapping flex row with vertically centred children. Use it for icon + label combinations, tag clusters, and any horizontal run of items.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `gap` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'` | Gap between children. Same token mapping as Stack. |
| `children` | `Snippet` | `undefined` | Slot content. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `style` | `string \| null` | `undefined` | Inline styles. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Inline, Led, TagPill } from 'dxlb-design'
</script>

<Inline gap="xs">
  <Led color="ok" />
  <TagPill>SvelteKit</TagPill>
  <TagPill variant="amber">B21</TagPill>
</Inline>
```

### Notable behaviour

- `flex-wrap: wrap` is always on — children wrap to a new line rather than overflow.
- `align-items: center` is applied unconditionally. Override via the `style` prop if baseline alignment is needed.

---

## Spread

Renders a flex row with `justify-content: space-between`, pushing children to opposite ends. The gap is fixed at `--u2` (16px) with no `gap` prop.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `children` | `Snippet` | `undefined` | Slot content. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `style` | `string \| null` | `undefined` | Inline styles. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Spread, Button } from 'dxlb-design'
</script>

<Spread>
  <span>Section title</span>
  <Button variant="cta">See all</Button>
</Spread>
```

### Notable behaviour

- Gap is always `--u2` (16px). There is no `gap` prop.
- `align-items: center` is applied unconditionally.
- Commonly used as a two-slot layout: left content and right action.

---

## Grid

Renders a CSS grid container. Supports fixed column counts or an auto-fill responsive layout.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `cols` | `1 \| 2 \| 3 \| 4 \| 'auto'` | `3` | Number of columns, or `'auto'` for responsive auto-fill. |
| `gap` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'sm'` | Grid gap. Same token mapping as Stack. |
| `minColWidth` | `string` | `'240px'` | Minimum column width used when `cols='auto'`. Passed to `minmax()`. |
| `children` | `Snippet` | `undefined` | Slot content. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded. |

### Usage

```svelte
<script>
  import { Grid, Card } from 'dxlb-design'
</script>

<Grid cols={3} gap="md">
  <Card>Alpha</Card>
  <Card>Beta</Card>
  <Card>Gamma</Card>
</Grid>

<!-- Responsive: fills columns down to 200px wide -->
<Grid cols="auto" minColWidth="200px" gap="sm">
  <Card>One</Card>
  <Card>Two</Card>
</Grid>
```

### Notable behaviour

- `cols='auto'` produces `repeat(auto-fill, minmax(minColWidth, 1fr))`.
- `cols=1` produces `1fr` (single column); other numeric values produce `repeat(n, 1fr)`.
- `grid-template-columns` and `gap` are set as inline styles on the root element; no scoped CSS class is involved.

---

## Container

Centres content horizontally with a configurable max-width and responsive horizontal padding.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'div'` | HTML element to render as the root. |
| `size` | `'lg' \| 'md' \| 'sm'` | `'lg'` | Maximum content width. lg=1440px, md=960px, sm=640px. |
| `children` | `Snippet` | `undefined` | Slot content. |
| `...rest` | `HTMLAttributes<HTMLDivElement>` | — | All native HTML div attributes forwarded. |

### Usage

```svelte
<script>
  import { Container } from 'dxlb-design'
</script>

<Container size="md">
  <p>Constrained content</p>
</Container>
```

### Notable behaviour

- Horizontal padding is 32px at wider viewports and 16px below 720px viewport width.
- Bottom padding varies by size: lg=80px, md=64px, sm=48px.
- `margin: 0 auto` centres the container. Does not apply `display: flex` or any other layout.
- `container-type: inline-size` is set, enabling CSS container queries on child components.

---

## Rule

Renders a `<hr>` element styled as a horizontal divider. Three visual variants use different border colours and styles.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'solid' \| 'dashed' \| 'strong'` | `'solid'` | Visual style of the rule. |
| `...rest` | `HTMLAttributes<HTMLHRElement>` | — | All native HTML hr attributes forwarded. |

### Usage

```svelte
<script>
  import { Rule } from 'dxlb-design'
</script>

<Rule />
<Rule variant="dashed" />
<Rule variant="strong" />
```

### Notable behaviour

- `solid` uses a 1px solid border in `--rule` (barely visible).
- `dashed` uses a 1px dashed border in `--rule`.
- `strong` uses a 1px solid border in `--rule-strong` (more visible).
- `margin: 0` is applied by default; add spacing via a wrapping `Stack` or inline `style`.

---

## Prose

Styles dynamically-inserted markdown HTML (e.g. mdsvex output) via `.prose :global(element)` selectors. Use it as a wrapper around rendered markdown content on documentation or blog pages.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'article'` | HTML element to render as the root. |
| `maxWidth` | `string` | `'72ch'` | Maximum width of the prose container. |
| `children` | `Snippet` | `undefined` | Rendered markdown HTML to style. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `...rest` | `HTMLAttributes<HTMLElement>` | — | All native HTML element attributes forwarded. |

### Usage

```svelte
<script>
  import { Prose } from 'dxlb-design'
</script>

<Prose>
  <!-- mdsvex-rendered HTML goes here -->
  <h1>Hello</h1>
  <p>This paragraph inherits prose styles.</p>
</Prose>
```

### Notable behaviour

- Styles are applied via `:global()` selectors scoped to the `.prose` class. Direct children gain `margin-top: --u3` (24px) spacing via an adjacent-sibling selector; the first child has no top margin.
- Elements styled: `h1`–`h4`, `p`, `a`, `ul`, `ol`, `li`, `code`, `pre`, `pre code`, `blockquote`, `table`, `th`, `td`, `img`, `hr`.
- `a` links are `--ink-faint` by default and turn `--amber` on hover.
- `blockquote` has a 2px left amber border and italic `--ink-dim` text.
- `code` (inline) uses `--bg-rail` background with a `--cyan` colour and `--rule` border.
- `pre code` (block) resets inline-code chip styles: transparent background, no border, inherits Shiki foreground.
- `h4` uses the mono font stack, uppercase, `--ink-faint` colour.
- `maxWidth` is applied as an inline `style` on the root element.
