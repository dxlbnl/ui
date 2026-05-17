# B20: Prose component

## Context

Markdown-rendered content (via mdsvex or any other processor) produces raw HTML
elements that Svelte cannot style with scoped CSS, because those elements are
dynamically inserted as children — Svelte's compiler has no opportunity to add its
scoping attribute to them. The `Prose` component solves this by using the
`:global()` selector escape hatch *inside* a scoped component's `<style>` block,
scoped to the `.prose` class on the wrapper element:

```css
/* valid: global selector chained from a locally-scoped ancestor class */
.prose :global(h1) { … }
.prose :global(p)  { … }
```

This pattern is the only correct way to reach dynamically-inserted children without
adding raw styles to `app.css`. See [composition-limits.md](../composition-limits.md)
for the broader scoping constraint discussion.

All token values — colours, fonts, spacing — must come from CSS custom properties
(`var(--amber)`, `var(--ink-faint)`, `var(--bg-sunken)`, etc.) so that both the
Phosphor (dark) and Paper (light) palettes apply automatically without any
JavaScript.

Related wiki pages:
- [vision.md](../vision.md) — design-system goals
- [requirements.md](../requirements.md) — R1 (design tokens), R2 (typography)
- [architecture.md](../architecture.md) — component authoring conventions, Svelte 5 runes
- [decisions.md](../decisions.md) — D2 (CSS custom properties for tokens), D4 (Chakra-style),
  D5 (no global utility classes)
- [specs/B2-design-tokens.md](B2-design-tokens.md) — full token reference and exact values
- [specs/B10-accordion-tabs-table.md](B10-accordion-tabs-table.md) — Table styles that `Prose`
  mirrors for `table`/`th`/`td`
- [composition-limits.md](../composition-limits.md) — Svelte scoping constraints and the
  `:global()` workaround pattern

### Files in scope

| File | Role |
|---|---|
| `src/lib/components/layout/Prose.svelte` | New component — wrapper with all `:global()` CSS |
| `src/lib/components/layout/index.ts` | Updated to export `Prose` |
| `src/lib/index.ts` | Updated to re-export `Prose` (if not already via `layout/index.ts`) |
| `src/lib/components/layout/Prose.stories.svelte` | Stories (= tests) for `Prose` |

---

## Props interface

```ts
import type { HTMLAttributes } from 'svelte/elements'

interface ProseProps extends HTMLAttributes<HTMLElement> {
  as?: string        // polymorphic element tag; default 'article'
  maxWidth?: string  // CSS max-width value; default '72ch'
}

let { as = 'article', maxWidth = '72ch', children, ...rest }: ProseProps = $props()
```

Root element: `<svelte:element this={as} class="prose" style:max-width={maxWidth} {...rest}>`

- `as` defaults to `'article'`, which is the correct semantic element for a
  self-contained piece of editorial content (mdsvex output, blog post body, etc.).
- `maxWidth` defaults to `'72ch'` — 72 characters wide, which is the comfortable
  measure for body text. Consumers may pass `'none'` or `'100%'` to override.
- `...rest` is spread onto the root element so consumers can pass `id`, `aria-label`,
  `class`, `lang`, etc. without additional prop declarations.

---

## Per-element style table

Every selector is written as `.prose :global(element)` in the component `<style>` block.
The "Global class applied" column notes where a B2 typography utility class is applied
via `class` attribute on the element (not possible for dynamically-inserted content) —
for prose, the styles are replicated directly using the same token values the classes use.

| Element | CSS property | Token / value | Notes |
|---|---|---|---|
| **Container** | | | |
| `.prose` | `max-width` | prop `maxWidth` (default `72ch`) | on the root element, not `:global()` |
| `.prose` | `> * + *` margin-top | `var(--u3)` (24px) | adjacent-sibling spacing for block flow |
| **Headings** | | | |
| `h1` | `font-size` | `var(--t-h1)` (72px) | |
| `h1` | `font-weight` | `500` | |
| `h1` | `letter-spacing` | `-0.03em` | |
| `h1` | `line-height` | `1` | matches `.h1` class |
| `h2` | `font-size` | `var(--t-h2)` (36px) | |
| `h2` | `font-weight` | `500` | |
| `h2` | `letter-spacing` | `-0.01em` | |
| `h2` | `line-height` | `1.1` | matches `.h2` class |
| `h3` | `font-size` | `var(--t-h3)` (24px) | |
| `h3` | `font-weight` | `500` | |
| `h3` | `letter-spacing` | `-0.01em` | |
| `h3` | `line-height` | `1.2` | matches `.h3` class |
| `h4` | `font-size` | `var(--t-mono)` (14px) | small uppercase mono heading |
| `h4` | `font-family` | `var(--mono)` | |
| `h4` | `font-weight` | `500` | |
| `h4` | `letter-spacing` | `0.08em` | |
| `h4` | `text-transform` | `uppercase` | |
| `h4` | `color` | `var(--ink-faint)` | |
| **Paragraph** | | | |
| `p` | `font-family` | `var(--sans)` | |
| `p` | `font-size` | `var(--t-body)` (16px) | |
| `p` | `line-height` | `1.65` | matches `.body-text` class |
| **Anchor** | | | |
| `a` | `color` | `var(--ink-faint)` | |
| `a` | `text-decoration` | `none` | no underline by default |
| `a:hover` | `color` | `var(--amber)` | |
| `a:hover` | `text-decoration` | `underline` | underline on hover only |
| **Lists** | | | |
| `ul` | `list-style` | `disc` | |
| `ul` | `padding-left` | `var(--u3)` (24px) | |
| `ol` | `list-style` | `decimal` | |
| `ol` | `padding-left` | `var(--u3)` (24px) | |
| `li` | `line-height` | `1.65` | |
| `li + li` | `margin-top` | `var(--u)` (8px) | spacing between list items |
| **Inline code** | | | |
| `code` | `font-family` | `var(--mono)` | |
| `code` | `font-size` | `var(--t-mono)` (14px) | |
| `code` | `background` | `var(--bg-rail)` | pill chip background |
| `code` | `color` | `var(--cyan)` | |
| `code` | `padding` | `1px 5px` | |
| `code` | `border` | `1px solid var(--rule)` | |
| `code` | `border-radius` | `var(--radius)` | |
| **Block code** | | | |
| `pre` | `font-family` | `var(--mono)` | |
| `pre` | `font-size` | `var(--t-mono)` (14px) | |
| `pre` | `background` | `var(--bg-sunken)` | |
| `pre` | `border` | `1px solid var(--rule)` | |
| `pre` | `border-radius` | `var(--radius)` | |
| `pre` | `padding` | `16px 20px` | |
| `pre` | `overflow-x` | `auto` | |
| `pre` | `line-height` | `1.6` | |
| `pre code` | `background` | `transparent` | reset chip bg inside pre |
| `pre code` | `border` | `none` | reset chip border inside pre |
| `pre code` | `padding` | `0` | reset chip padding inside pre |
| `pre code` | `color` | `var(--shiki-foreground, var(--ink))` | fallback to `--ink` if no shiki |
| **Shiki syntax colours on `pre code` spans** | | | |
| `pre code .line` spans | `color` | via `var(--shiki-token-keyword)` etc. | these are set in `tokens.css` already; prose does not re-declare them |
| **Blockquote** | | | |
| `blockquote` | `margin` | `0` | block spacing handled by `> * + *` rule |
| `blockquote` | `padding` | `4px 0 4px 16px` | |
| `blockquote` | `border-left` | `2px solid var(--amber)` | |
| `blockquote` | `color` | `var(--ink-dim)` | |
| `blockquote` | `font-style` | `italic` | |
| **Table** | | | |
| `table` | `width` | `100%` | |
| `table` | `border-collapse` | `collapse` | |
| `table` | `font-family` | `var(--mono)` | |
| `table` | `font-size` | `var(--t-mono)` (14px) | |
| `th` | `text-align` | `left` | |
| `th` | `padding` | `8px 0` | |
| `th` | `border-bottom` | `1px solid var(--rule-strong)` | |
| `th` | `color` | `var(--ink-faint)` | |
| `th` | `letter-spacing` | `0.1em` | |
| `th` | `text-transform` | `uppercase` | |
| `th` | `font-weight` | `500` | |
| `td` | `padding` | `8px 0` | |
| `td` | `border-bottom` | `1px dashed var(--rule)` | |
| `td` | `color` | `var(--ink-dim)` | |
| **Image** | | | |
| `img` | `max-width` | `100%` | |
| `img` | `height` | `auto` | |
| `img` | `border` | `1px solid var(--rule)` | |
| `img` | `border-radius` | `var(--radius)` | |
| **Horizontal rule** | | | |
| `hr` | `border` | `none` | reset browser default |
| `hr` | `border-top` | `1px solid var(--rule)` | matches `Rule` component |
| `hr` | `margin` | `0` | block spacing handled by `> * + *` rule |

---

## Acceptance criteria

Each criterion is labelled:
- **(DOM)** — testable by querying the rendered DOM element (structure, attribute, class)
- **(CSS)** — testable only via `getComputedStyle` (visual review or computed style assertion)
- **(Token)** — CSS property must resolve to the correct design-token value (probe element pattern from `stories-guide.md`)

### Component structure

1. **(DOM)** `Prose` renders an `<article>` element by default (tag name is `ARTICLE`
   when `as` is not specified). `querySelector('article')` from `canvasElement` returns a
   non-null element.

2. **(DOM)** When `as="section"` is passed, `Prose` renders a `<section>` element.
   `querySelector('section')` from `canvasElement` returns a non-null element and
   `querySelector('article')` returns null.

3. **(DOM)** The root element always has the class `prose`. `canvasElement.firstElementChild.classList.contains('prose')` is true regardless of the `as` prop.

4. **(CSS)** The root element has `max-width` equal to `72ch` (the default). When
   `maxWidth="100%"` is passed, the root element's `max-width` resolves to `100%` of
   its containing block.

5. **(DOM)** `Prose` forwards `...rest` props onto the root element. When `id="my-prose"` and
   `aria-label="Article body"` are passed, `querySelector('#my-prose')` returns the root and
   `getAttribute('aria-label')` on that element is `"Article body"`.

6. **(DOM)** `Prose` renders its children slot inside the root element. When the slot
   contains an `<h1>Hello</h1>` and a `<p>World</p>`, both elements are present in the
   DOM as descendants of `.prose`.

7. **(DOM)** `Prose` is exported from `src/lib/components/layout/index.ts` and from
   `src/lib/index.ts`. Importing `{ Prose }` from `'dxlb-design'` (or from
   `'$lib/index.ts'`) must resolve without a TypeScript error (`pnpm check` passes).

### Block spacing — adjacent-sibling gap

8. **(CSS)** When a `<h1>` and a `<p>` are adjacent children of `.prose`, the `<p>`
   element has a computed `margin-top` of `24px` (i.e. `var(--u3)`).

9. **(CSS)** The first direct child of `.prose` has `margin-top: 0` (the `> * + *` rule
   only applies from the second child onward). This prevents unwanted top margin at the
   start of prose content.

### Headings (CSS — visual review)

10. **(Token)** `.prose :global(h1)` has computed `font-size` equal to `72px`
    (resolving `var(--t-h1)`), `font-weight: 500`, `letter-spacing: -0.03em`, and
    `line-height: 1`.

11. **(Token)** `.prose :global(h2)` has computed `font-size` equal to `36px`
    (resolving `var(--t-h2)`), `font-weight: 500`, `letter-spacing: -0.01em`, and
    `line-height: 1.1`.

12. **(Token)** `.prose :global(h3)` has computed `font-size` equal to `24px`
    (resolving `var(--t-h3)`), `font-weight: 500`, `letter-spacing: -0.01em`, and
    `line-height: 1.2`.

13. **(Token)** `.prose :global(h4)` has computed `font-family` beginning with
    `"JetBrains Mono"` (i.e. `var(--mono)`), `font-size: 14px`, `letter-spacing: 0.08em`,
    `text-transform: uppercase`, and `color` resolving to `var(--ink-faint)`.

### Paragraph

14. **(CSS)** `.prose :global(p)` has computed `font-size: 16px` and `line-height: 1.65`.

### Anchor

15. **(Token)** A bare `<a>` inside `.prose` has `text-decoration: none` in its
    computed style and `color` resolving to `var(--ink-faint)` (same RGB as a probe
    element set to `color: var(--ink-faint)`).

16. **(Token)** On hover (simulated via `userEvent.hover`), the `<a>` inside `.prose`
    changes `color` to the value of `var(--amber)` and `text-decoration` includes
    `underline`.

### Lists

17. **(CSS)** A `<ul>` inside `.prose` has `list-style: disc` and `padding-left: 24px`
    in computed style.

18. **(CSS)** An `<ol>` inside `.prose` has `list-style: decimal` and `padding-left: 24px`
    in computed style.

19. **(CSS)** `<li>` elements inside `.prose` lists have `line-height: 1.65`.

20. **(CSS)** The second `<li>` in a list (i.e. `li + li`) has `margin-top: 8px`
    (i.e. `var(--u)`).

### Inline code

21. **(Token)** An inline `<code>` element (not inside `<pre>`) inside `.prose` has
    computed `background-color` resolving to `var(--bg-rail)`, `color` resolving to
    `var(--cyan)`, `border-radius` resolving to `var(--radius)` (2px), and `border`
    of `1px solid` resolving to `var(--rule)`.

22. **(CSS)** The inline `<code>` has `padding: 1px 5px` in computed style.

### Block code (`pre` / `pre code`)

23. **(Token)** A `<pre>` block inside `.prose` has `background-color` resolving to
    `var(--bg-sunken)`, `border` of `1px solid` resolving to `var(--rule)`, `padding`
    of `16px 20px`, `overflow-x: auto`, and `line-height: 1.6`.

24. **(CSS)** A `<code>` element that is a direct child of `<pre>` inside `.prose` has
    `background-color: transparent`, `border: none` (or `border-width: 0`), and
    `padding: 0` — i.e. the inline code chip styles are fully reset when code appears
    inside a pre block.

25. **(Token)** A `<code>` element inside `<pre>` inside `.prose` has `color` resolving
    to `var(--shiki-foreground)`, which in the Phosphor palette resolves transitively
    to `var(--ink)` (i.e. the same RGB as a probe element set to `color: var(--ink)`).

### Blockquote

26. **(Token)** A `<blockquote>` inside `.prose` has `border-left` of `2px solid`
    resolving to `var(--amber)`, `color` resolving to `var(--ink-dim)`, and
    `font-style: italic`.

27. **(CSS)** The `<blockquote>` has `padding: 4px 0 4px 16px` in computed style.

### Table (mirroring `Table` component styles)

28. **(CSS)** A `<table>` inside `.prose` has `width: 100%`, `border-collapse: collapse`,
    and `font-family` beginning with `"JetBrains Mono"`.

29. **(Token)** `<th>` elements inside `.prose table` have `text-transform: uppercase`,
    `font-weight: 500`, `letter-spacing: 0.1em`, `color` resolving to `var(--ink-faint)`,
    and `border-bottom` of `1px solid` resolving to `var(--rule-strong)`.

30. **(Token)** `<td>` elements inside `.prose table` have `border-bottom` of
    `1px dashed` resolving to `var(--rule)` and `color` resolving to `var(--ink-dim)`.

### Image

31. **(CSS)** An `<img>` inside `.prose` has `max-width: 100%`, `height: auto`, and
    `border` of `1px solid` resolving to `var(--rule)`.

### Horizontal rule

32. **(CSS)** An `<hr>` inside `.prose` has `border-top` of `1px solid` resolving to
    `var(--rule)` and `border-bottom-width: 0` (i.e. only the top rule is drawn,
    matching the `Rule` layout component output).

### Palette switching (token coverage)

33. **(Token)** When `data-palette="paper"` is set on an ancestor of `.prose` (e.g. on
    the Storybook canvas wrapper or on the component itself via `...rest`), the `<a>`
    colour resolves to the Paper `--ink-faint` value (`#5f5a4a`), the `<blockquote>`
    border resolves to the Paper `--amber` value (`#a04e00`), and the `<pre>` background
    resolves to the Paper `--bg-sunken` value (`#dfdbce`) — all without any JavaScript
    change to the `Prose` component.

### TypeScript and exports

34. **(DOM)** `pnpm check` produces zero TypeScript errors when `Prose` is used as:
    ```svelte
    <Prose as="section" maxWidth="60ch" id="body" aria-label="Body">
      <h1>Title</h1>
    </Prose>
    ```
    and when it is used with no props at all: `<Prose><p>text</p></Prose>`.

---

## Story plan

All stories live in: `src/lib/components/layout/Prose.stories.svelte`

Because `Prose` uses a dynamic slot for its content (markdown HTML), stories inject
static HTML strings as slot children rather than using actual mdsvex. This is correct
and sufficient — `Prose` is purely a CSS wrapper; it does not process markdown itself.

`defineMeta` sets `component: Prose, tags: ['autodocs']`.

Each story renders a static HTML fragment as the slot content; the `play` function
queries elements and asserts computed styles.

### Story 1 — `Default` (all elements)

**Purpose**: Visual specimen of all styled elements in a single scroll.

**Slot content** (Svelte template, injected as children):
```html
<h1>Heading one</h1>
<h2>Heading two</h2>
<h3>Heading three</h3>
<h4>Heading four</h4>
<p>A paragraph of body text with an <a href="#">inline link</a> and
   some <code>inline code</code> for good measure.</p>
<ul><li>Item one</li><li>Item two</li><li>Item three</li></ul>
<ol><li>First</li><li>Second</li><li>Third</li></ol>
<blockquote>A blockquote with amber left border and italic text.</blockquote>
<pre><code>const x = 42; // block code</code></pre>
<table>
  <thead><tr><th>Name</th><th>Value</th></tr></thead>
  <tbody><tr><td>alpha</td><td>1</td></tr><tr><td>beta</td><td>2</td></tr></tbody>
</table>
<img src="/logo.svg" alt="Dexterlabs logo" />
<hr />
<p>Paragraph after the rule.</p>
```

**Play function assertions**:
- The root element has tag `ARTICLE` and class `prose`. **(DOM)**
- `querySelector('h1')` is visible. **(DOM)**
- The `<h1>` has computed `font-size: 72px`. **(CSS)**
- The inline `<code>` (not inside `<pre>`) has `color` resolving to `var(--cyan)`. **(Token)**
- The `<blockquote>` has `border-left` including `var(--amber)` resolved RGB. **(Token)**
- The `<a>` has `text-decoration: none`. **(CSS)**
- The `<pre>` has `overflow-x: auto`. **(CSS)**
- The `<th>` has `text-transform: uppercase`. **(CSS)**
- The second `<p>` (after `<hr>`) has `margin-top: 24px` (adjacent-sibling rule). **(CSS)**

### Story 2 — `Polymorphic`

**Purpose**: Verify the `as` prop works.

**Args**: `as="section"`, `maxWidth="60ch"`

**Slot content**: `<h2>Section title</h2><p>Body paragraph.</p>`

**Play function**:
- `querySelector('section')` is non-null; `querySelector('article')` is null. **(DOM)**
- `canvasElement.firstElementChild.style.maxWidth` is `"60ch"`. **(DOM/CSS)**

### Story 3 — `PaperPalette`

**Purpose**: Visual confirmation that all token-driven colours flip correctly in the
Paper (light) palette. Uses `data-palette="paper"` on the story's root element.

**Implementation note**: Because Storybook `args` cannot set `data-palette` on the
wrapper, this story omits `component:` or passes `data-palette="paper"` via the
`data-palette` attribute in `...rest` props. The story may use a wrapping `<div
data-palette="paper">` as the outer container if `args` cannot set that attribute.

**Args**: `{ 'data-palette': 'paper' }` or wrapped in a `data-palette="paper"` div.

**Slot content**: An `<a>` element, a `<blockquote>`, a `<pre><code>` block.

**Play function**:
- The `<a>` has `color` resolving to the Paper `--ink-faint` value (probe element
  with `color: var(--ink-faint)` inside a `[data-palette="paper"]` ancestor). **(Token)**
- The `<blockquote>` `border-left-color` resolves to Paper `--amber` (`#a04e00` ≈
  `rgb(160, 78, 0)`). **(Token)**
- The `<pre>` background resolves to Paper `--bg-sunken`. **(Token)**

### Story 4 — `Headings`

**Purpose**: All four heading levels side by side for visual type-scale review.

**Slot content**: `<h1>`, `<h2>`, `<h3>`, `<h4>` each with a sample label.

**Play function**:
- `<h1>` computed `font-size: 72px`. **(CSS)**
- `<h2>` computed `font-size: 36px`. **(CSS)**
- `<h3>` computed `font-size: 24px`. **(CSS)**
- `<h4>` computed `font-family` begins with `"JetBrains Mono"` and `text-transform`
  is `uppercase`. **(CSS)**

### Story 5 — `CodeBlocks`

**Purpose**: Side-by-side comparison of inline code and a fenced code block.

**Slot content**:
- A `<p>` containing an inline `<code>code snippet</code>`.
- A `<pre><code>function hello() {\n  return 42;\n}</code></pre>` block.

**Play function**:
- The inline `<code>` has `background-color` resolving to `var(--bg-rail)`. **(Token)**
- The inline `<code>` has `color` resolving to `var(--cyan)`. **(Token)**
- The inline `<code>` has `border` of `1px solid`. **(CSS)**
- The `<pre code>` child has `background-color: transparent`. **(CSS)**
- The `<pre code>` child has `padding: 0`. **(CSS)**
- The `<pre>` has `overflow-x: auto`. **(CSS)**

### Story 6 — `Blockquote`

**Purpose**: Blockquote styling — amber border, italic, dim text.

**Slot content**: `<p>Before quote.</p><blockquote>Quoted text from somewhere meaningful.</blockquote><p>After quote.</p>`

**Play function**:
- The `<blockquote>` has `font-style: italic`. **(CSS)**
- The `<blockquote>` has `border-left-width: 2px`. **(CSS)**
- The `<blockquote>` `border-left-color` resolves to `var(--amber)` RGB. **(Token)**
- The `<blockquote>` `color` resolves to `var(--ink-dim)` RGB. **(Token)**

### Story 7 — `TableInProse`

**Purpose**: Table rendered inside prose — mirrors `Table` component appearance.

**Slot content**: A `<table>` with `<thead>` (two `<th>`) and `<tbody>` (two `<tr>`
with `<td>` cells).

**Play function**:
- `<table>` has `border-collapse: collapse`. **(CSS)**
- `<th>` has `text-transform: uppercase` and `font-weight: 500`. **(CSS)**
- `<th>` `color` resolves to `var(--ink-faint)`. **(Token)**
- `<td>` `border-bottom` style includes `dashed`. **(CSS)**
- `<td>` `color` resolves to `var(--ink-dim)`. **(Token)**

---

## Out of scope

- **Markdown processing**: `Prose` is a CSS wrapper only. It does not import or
  depend on mdsvex, rehype, remark, or any markdown library. Stories inject static HTML.
- **Shiki syntax highlighting spans**: The shiki CSS variables (`--shiki-token-keyword`,
  `--shiki-token-function`, etc.) are already declared in `tokens.css` (B2). `Prose`
  does not redeclare them — it relies on the global token cascade to colour syntax
  spans inside `pre code`. No per-span `:global()` rules are added in `Prose.svelte`.
- **Responsive font sizes**: The prose container caps width at `72ch` but does not
  change `font-size` at breakpoints. Fluid type scaling is a future concern.
- **Figure / figcaption**: Styling for `<figure>` and `<figcaption>` is not included.
  These may be added in a follow-up item.
- **Definition lists** (`dl`/`dt`/`dd`): Not styled in this item.
- **Footnotes**: Not styled in this item.
- **Table row hover**: The `Table` component adds a hover background on `tbody tr`;
  `Prose` table styles do not add a hover rule (keeping the CSS minimal; consumers who
  need hover can override via the `class` prop or a descendant style).
- **`h5` and `h6`**: Only `h1`–`h4` are styled. `h5`/`h6` inherit the base reset
  (no margin, no explicit font-size from the prose block) and are not common in prose.
- **Palette toggle persistence**: Out of scope — handled by `Nav` (B6).
- **mdsvex integration**: Integration of `Prose` with an mdsvex-powered SvelteKit
  route is a site-level concern, not a component-library concern.

---

## Open questions

**OQ-1** (non-blocking): Should `maxWidth` be a typed union of known values (e.g.
`'72ch' | '65ch' | '80ch' | 'none' | string`) or a plain `string`? A plain `string`
gives maximum flexibility but loses IDE autocomplete hints for the common values. A
union with `| string` (TypeScript) gives both — this is the recommended approach.
Non-blocking: the implementer may choose either.

**OQ-2** (non-blocking): The `h4` style maps to the mono-label/eyebrow visual register
(small, uppercase, mono, `--ink-faint`). This differs from the global typography classes
(`.h1`–`.h3`) which have no `h4` class equivalent. If the design system later adds a
`.h4` class, this spec should be updated to reference it. Until then, the implementer
replicates the eyebrow-level style directly.

**OQ-3** (non-blocking): The `PaperPalette` story (Story 3) needs `data-palette="paper"`
set on an ancestor of the `.prose` element. Storybook's `args` system spreads props onto
the component's root element, so passing `{ 'data-palette': 'paper' }` in `args` should
work (the `...rest` spread will put it on the `<article>`). However, the palette selector
in `tokens.css` scopes overrides to `[data-palette="paper"]` and its *descendants* — if
the attribute is on the prose root itself, tokens inside `.prose :global(a)` may not pick
up the override depending on selector specificity. The test-writer should verify this
and, if needed, wrap the `Prose` component in a `<div data-palette="paper">` instead.
Non-blocking.

**OQ-4** (non-blocking): `img` elements rendered by mdsvex are typically wrapped in `<p>`
elements by the markdown parser (a known quirk). In that case, `img` inside `<p>` inside
`.prose` will receive the `p`'s body-text line-height. No fix is required in `Prose` —
this is a markdown-processor behaviour. Consumers who need figures should use the
`<figure>` element pattern (out of scope).
