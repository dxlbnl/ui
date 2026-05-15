# B2: Design tokens + global CSS

## Context

This item delivers the CSS foundation that every component in the library depends on.
It translates the Dexterlabs visual identity into browser-native CSS custom properties,
establishes a global reset, and provides typographic utility classes.

Related wiki pages: [vision.md](../vision.md), [requirements.md](../requirements.md)
(R1, R2), [architecture.md](../architecture.md), [decisions.md](../decisions.md) (D2,
D3).

Source of truth for all token values: `dexterlabs-design-system/project/colors_and_type.css`.

### Files in scope

| File | Role |
|---|---|
| `src/lib/tokens/tokens.css` | CSS custom properties — Phosphor defaults on `:root`, Paper overrides on `[data-palette="paper"]` |
| `src/lib/tokens/typography.css` | Base reset + utility classes + semantic element styles |
| `src/app.css` | Entry point: @imports Fontsource fonts + all token files |

### Files explicitly out of scope

- `src/lib/tokens/layout.css` — covered by B3
- `src/lib/tokens/patterns.css` — covered by B9

---

## Acceptance criteria

### Color tokens — Phosphor palette (dark default)

1. The CSS custom property `--bg` resolves to `#0b0d0c` on `:root` (Phosphor default,
   no `data-palette` attribute on any ancestor).
2. The following surface properties are present on `:root` with the correct values:
   - `--bg-rail: #0f1211`
   - `--bg-elev: #141817`
   - `--bg-sunken: #070908`
3. The following ink properties are present on `:root`:
   - `--ink: #d6e2dc`
   - `--ink-dim: #a4b0a9`
   - `--ink-faint: #7a8580`
4. The following rule properties are present on `:root`:
   - `--rule: #1d2321`
   - `--rule-strong: #2a3330`
5. The following accent properties are present on `:root`:
   - `--amber: #ffb347`
   - `--cyan: #7cc7d1`
   - `--danger: #ff7a6b`
   - `--ok: #8fd48a`

### Color tokens — Paper palette (light)

6. When `data-palette="paper"` is set on an ancestor element, `--bg` resolves to
   `#efece4` (warm off-white) within that subtree.
7. When `data-palette="paper"` is present, the following properties override the
   Phosphor defaults within that subtree:
   - `--bg-rail: #e6e2d6`
   - `--bg-elev: #f5f2ea`
   - `--bg-sunken: #dfdbce`
   - `--ink: #14110b`
   - `--ink-dim: #3f3b30`
   - `--ink-faint: #5f5a4a`
   - `--rule: #cfcabc`
   - `--rule-strong: #a8a192`
   - `--amber: #a04e00`
   - `--cyan: #030304`
   - `--danger: #a83224`
   - `--ok: #356b31`
8. Palette switching is dynamic: adding `data-palette="paper"` to the `<html>` element
   and then removing it returns all color values to their Phosphor defaults. No page
   reload is required.

### Typography tokens

9. The font-stack custom properties are present on `:root`:
   - `--mono` begins with `"JetBrains Mono"` and falls back to `ui-monospace`
   - `--sans` begins with `"Inter Tight"` and falls back to `"Inter"`
10. The following type-scale custom properties are present on `:root` with exact values:
    - `--t-micro: 12px`
    - `--t-mono: 14px`
    - `--t-body: 16px`
    - `--t-lede: 19px`
    - `--t-h3: 24px`
    - `--t-h2: 36px`
    - `--t-h1: 72px`
    - `--t-display: 140px`
    - `--t-hero: clamp(48px, 8vw, 112px)`
    - `--t-title: clamp(36px, 5vw, 56px)`
    - `--t-subtitle: clamp(22px, 3.5vw, 40px)`

### Spacing, radius, and transition tokens

11. The following spacing tokens are present on `:root` with exact values:
    - `--u: 8px`, `--u2: 16px`, `--u3: 24px`, `--u4: 32px`, `--u5: 40px`,
      `--u6: 48px`, `--u7: 56px`, `--u10: 80px`
12. Radius tokens are present on `:root`: `--radius: 2px`, `--radius-card: 4px`.
13. Transition token is present on `:root`: `--transition: 0.15s`.

### Shiki syntax highlight tokens

14. The following Shiki tokens are present on `:root` and resolve via CSS variable
    references (not hard-coded hex values, except `--shiki-token-string`):
    - `--shiki-foreground` → references `var(--ink)`
    - `--shiki-background` → references `var(--bg-sunken)`
    - `--shiki-token-keyword` → references `var(--amber)`
    - `--shiki-token-function` → references `var(--cyan)`
    - `--shiki-token-constant` → references `var(--amber)`
    - `--shiki-token-string: #7ec8a0` (literal hex)
    - `--shiki-token-string-expression: #7ec8a0` (literal hex)
    - `--shiki-token-comment` → references `var(--ink-faint)`
    - `--shiki-token-parameter` → references `var(--ink-dim)`
    - `--shiki-token-punctuation` → references `var(--ink-dim)`
    - `--shiki-token-link` → references `var(--cyan)`
15. When `data-palette="paper"` is active, `--shiki-token-string` and
    `--shiki-token-string-expression` override to `#2d7a50`.

### Fonts (Fontsource)

16. Inter Tight weight 400 is loaded: an element styled with `font-family: var(--sans);
    font-weight: 400` renders in Inter Tight (verified by computed `fontFamily` in the
    browser including "Inter Tight").
17. Inter Tight weight 500 is loaded and available for headings.
18. JetBrains Mono weight 400 is loaded: an element styled with `font-family:
    var(--mono); font-weight: 400` renders in JetBrains Mono.
19. JetBrains Mono weight 700 is loaded and available for bold mono usage.
20. No `<link>` to `fonts.googleapis.com` exists in the document — fonts are served from
    the local bundle only (D3).

### Base reset

21. All elements have `box-sizing: border-box` applied via the `*, *::before,
    *::after` rule.
22. `html` and `body` have `margin: 0` and `padding: 0`.
23. `body` has `background: var(--bg)`, `color: var(--ink)`, `font-family: var(--sans)`,
    `font-size: var(--t-body)` (16px), and `line-height: 1.5`.
24. `body` has `-webkit-font-smoothing: antialiased`.
25. `img`, `svg`, and `video` elements have `display: block` and `max-width: 100%`.
26. Anchor elements have `color: inherit` and `text-decoration: none`.
27. `button` elements have `font: inherit`, `color: inherit`, `background: none`,
    `border: 0`, `cursor: pointer`, and `padding: 0`.
28. Paragraph and heading elements (`p`, `h1`–`h6`) have `overflow-wrap: break-word`
    and `margin: 0`.

### Typography utility classes — headings

29. `.h1` renders with `font-size: 72px` (`var(--t-h1)`), `font-weight: 500`,
    `letter-spacing: -0.03em`, and `line-height: 1`.
30. `.h2` renders with `font-size: 36px` (`var(--t-h2)`), `font-weight: 500`,
    `letter-spacing: -0.01em`, and `line-height: 1.1`.
31. `.h3` renders with `font-size: 24px` (`var(--t-h3)`), `font-weight: 500`,
    `letter-spacing: -0.01em`, and `line-height: 1.2`.
32. `.hero-heading` renders with `font-size: var(--t-hero)` (clamp 48–112px),
    `font-weight: 500`, `letter-spacing: -0.03em`, and `line-height: 1`.
33. `.display-heading` renders with `font-size: 140px` (`var(--t-display)`),
    `font-weight: 500`, `letter-spacing: -0.04em`, and `line-height: 0.9`.

### Typography utility classes — body

34. `.body-text` renders with `font-family: var(--sans)`, `font-size: 16px`
    (`var(--t-body)`), and `line-height: 1.65`.
35. `.body-lede` renders with `font-family: var(--sans)`, `font-size: 19px`
    (`var(--t-lede)`), `line-height: 1.55`, and `color: var(--ink-dim)`.

### Typography utility classes — mono labels

36. `.mono-label` renders with `font-family: var(--mono)`, `font-size: 14px`
    (`var(--t-mono)`), `letter-spacing: 0.08em`, `text-transform: uppercase`, and
    `color: var(--ink-dim)`.
37. `.eyebrow` renders with `font-family: var(--mono)`, `font-size: 12px`
    (`var(--t-micro)`), `letter-spacing: 0.12em`, `text-transform: uppercase`, and
    `color: var(--ink-faint)`.

### Semantic element styles — code

38. Inline `<code>` elements render with `font-family: var(--mono)`, `font-size: 14px`
    (`var(--t-mono)`), `background: var(--bg-elev)`, `padding: 1px 5px`,
    `border: 1px solid var(--rule)`, `border-radius: var(--radius)`, and
    `color: var(--cyan)`.
39. `<pre>` elements render with `font-family: var(--mono)`, `font-size: 14px`
    (`var(--t-mono)`), `background: var(--bg-sunken)`, `border: 1px solid var(--rule)`,
    `border-radius: var(--radius)`, `padding: 16px 20px`, `overflow-x: auto`, and
    `line-height: 1.6`.

### Semantic element styles — blockquote

40. `<blockquote>` elements render with `margin: 28px 0`, `padding: 4px 0 4px 16px`,
    `border-left: 2px solid var(--amber)`, and `color: var(--ink-dim)`.

### Semantic element styles — table

41. `<table>` elements render with `width: 100%`, `border-collapse: collapse`,
    `font-family: var(--mono)`, and `font-size: 14px` (`var(--t-mono)`).
42. `<th>` elements render with `text-align: left`, `padding: 8px 0`,
    `border-bottom: 1px solid var(--rule-strong)`, `color: var(--ink-faint)`,
    `letter-spacing: 0.1em`, `text-transform: uppercase`, and `font-weight: 500`.
43. `<td>` elements render with `padding: 8px 0`,
    `border-bottom: 1px dashed var(--rule)`, and `color: var(--ink-dim)`.

---

## Token reference

### Color tokens (13 semantic + 4 Shiki overrides in Paper)

**Surfaces**
- `--bg`
- `--bg-rail`
- `--bg-elev`
- `--bg-sunken`

**Ink**
- `--ink`
- `--ink-dim`
- `--ink-faint`

**Rules**
- `--rule`
- `--rule-strong`

**Accents**
- `--amber`
- `--cyan`
- `--danger`
- `--ok`

**Shiki syntax highlight (on `:root`, Paper overrides two)**
- `--shiki-foreground`
- `--shiki-background`
- `--shiki-token-keyword`
- `--shiki-token-function`
- `--shiki-token-constant`
- `--shiki-token-string`
- `--shiki-token-string-expression`
- `--shiki-token-comment`
- `--shiki-token-parameter`
- `--shiki-token-punctuation`
- `--shiki-token-link`

### Typography tokens

**Font stacks**
- `--mono`
- `--sans`

**Type scale**
- `--t-micro`
- `--t-mono`
- `--t-body`
- `--t-lede`
- `--t-h3`
- `--t-h2`
- `--t-h1`
- `--t-display`
- `--t-hero`
- `--t-title`
- `--t-subtitle`

### Spacing tokens

- `--u`
- `--u2`
- `--u3`
- `--u4`
- `--u5`
- `--u6`
- `--u7`
- `--u10`

### Dimension tokens

- `--radius`
- `--radius-card`
- `--transition`

---

## Story plan

All stories live in one file: `src/lib/tokens/tokens.stories.ts`.

Because these stories test CSS-only artifacts (no Svelte components), each story should
render a plain HTML template string via `render: () => ({ template: '...' })` or via a
minimal wrapper. The `play` function uses `within(canvasElement)` + `expect` from
`@storybook/test` to assert at least one computed style value.

### Story 1 — `PhosphorPalette`

- **Purpose**: Visual documentation of all 13 Phosphor color tokens as color swatches.
  Displays token name + hex value per swatch, grouped by category (Surfaces / Ink /
  Rules / Accents).
- **Template**: A grid of `<div>` swatches, each with `background-color: var(--token)`
  and a label. No `data-palette` attribute on the story root.
- **Play function**: Query the swatch element for `--bg` and assert its computed
  background color is `rgb(11, 13, 12)` (i.e. `#0b0d0c`). Also assert that the swatch
  for `--amber` computes to `rgb(255, 179, 71)` (`#ffb347`).

### Story 2 — `PaperPalette`

- **Purpose**: Visual documentation of the Paper palette overrides. Same swatch layout
  as Story 1, but the story root element has `data-palette="paper"`.
- **Template**: Identical swatch grid, but story wrapper element has attribute
  `data-palette="paper"`.
- **Play function**: Assert that `--bg` computed on an inner element inside
  `[data-palette="paper"]` resolves to `rgb(239, 236, 228)` (`#efece4`). Assert
  `--amber` resolves to `rgb(160, 78, 0)` (`#a04e00`).

### Story 3 — `PaletteSwitching`

- **Purpose**: Demonstrates and tests that setting/removing `data-palette="paper"` on
  the wrapper changes token values without page reload.
- **Template**: A single box showing `--bg` as background, with a toggle button.
- **Play function**: Uses `userEvent.click` to toggle `data-palette="paper"` on the
  wrapper element. After toggling on, asserts the computed `background-color` of the
  box is the Paper value. After toggling off, asserts return to Phosphor value.

### Story 4 — `TypeScale`

- **Purpose**: Visual specimen of all 11 type-scale steps. Each row shows the token
  name, the resolved size, and a sample text string rendered at that size. Mirrors
  `dexterlabs-design-system/project/preview/04-type-scale.html`.
- **Template**: A vertical list of specimens from `--t-micro` (eyebrow) through
  `--t-h1` (large title), labelled with the CSS variable name and size.
- **Play function**: Query the `.h1` specimen element and assert its computed
  `font-size` is `72px`. Query the `.eyebrow` element and assert `font-size` is `12px`.

### Story 5 — `TypographyClasses`

- **Purpose**: All typography utility classes in one specimen view. Two sections:
  headings (`.h1`, `.h2`, `.h3`, `.hero-heading`, `.display-heading`) and body/mono
  (`.body-text`, `.body-lede`, `.mono-label`, `.eyebrow`). Sample text for each class.
- **Play function**: Assert `.mono-label` has `text-transform: uppercase` and
  `letter-spacing: 0.08em`. Assert `.body-lede` has computed `font-size: 19px`.

### Story 6 — `SemanticElements`

- **Purpose**: Visual display of all styled semantic elements: inline `<code>`, `<pre>`
  block, `<blockquote>`, and a `<table>` (3 cols, 2 data rows).
- **Play function**: Assert `code` element has computed `color` matching the Phosphor
  `--cyan` value (`rgb(124, 199, 209)`). Assert `blockquote` has a computed
  `border-left` that includes `2px solid`.

### Story 7 — `BaseReset`

- **Purpose**: Confirms the base reset is applied. Renders a `<button>` (unstyled),
  a `<p>`, and an `<img>` inside the story canvas.
- **Play function**: Assert the `<button>` element has `background-color: rgba(0,0,0,0)`
  (transparent), `border: 0`, and `padding: 0`. Assert the `<p>` element has
  `margin: 0`. Assert the root element has `box-sizing: border-box`.

---

## Out of scope

- `src/lib/tokens/layout.css` — layout utility classes (`.container`, `.grid`, `.stack`,
  etc.) are B3.
- `src/lib/tokens/patterns.css` — pattern component CSS (`.alert`, `.cta-block`, etc.)
  is B9.
- Button, LED, TagPill, Card component CSS — those are B4/B5 even though the source
  `colors_and_type.css` contains them; B2 only extracts the token and typography
  sections.
- Palette toggle persistence to `localStorage` — that is runtime behaviour specified
  in B6 (Nav) and B11.
- No Svelte component is produced in this item. Token CSS is globally imported via
  `app.css`; no `.svelte` file needed.

---

## Open questions

None identified. All token values and class definitions are fully specified in
`dexterlabs-design-system/project/colors_and_type.css` and cross-checked against
`src/lib/tokens/tokens.css` + `src/lib/tokens/typography.css`. Implementation already
exists and matches the source of truth. This item is not blocking.
