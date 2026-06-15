# Primitives

The lowest-level interactive and typographic building blocks. Every higher-order component is composed from these.

## Button

Renders a styled button or anchor with five visual variants. All variants use the `--mono` font stack and uppercase text.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `as` | `string` | `'button'` | HTML element to render. Use `'a'` with `href` for link rendering. |
| `variant` | `'primary' \| 'cta' \| 'ghost' \| 'back' \| 'del'` | `'primary'` | Visual style of the button. |
| `href` | `string` | `undefined` | When `as='a'`, the anchor href. |
| `children` | `Snippet` | `undefined` | Button label content. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `...rest` | `HTMLButtonAttributes` | — | All native HTML button attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Button } from '@dxlbnl/ui'
</script>

<!-- Filled amber CTA -->
<Button variant="primary">Buy Now</Button>

<!-- Outlined amber -->
<Button variant="cta">Pre-order</Button>

<!-- Amber text, no border -->
<Button variant="ghost">See all →</Button>

<!-- Muted navigation back link -->
<Button variant="back">← Back</Button>

<!-- Small danger-hover delete action -->
<Button variant="del">Remove</Button>

<!-- Anchor rendering -->
<Button as="a" href="/shop" variant="primary">Shop</Button>
```

### Notable behaviour

- `primary`: amber (`--amber`) fill with dark (`--bg`) text; hover switches fill to `--ink`. Disabled state uses 0.5 opacity.
- `cta`: amber border and amber text, transparent fill; hover fills with amber.
- `ghost`: amber text, no border, no fill; hover colour changes to `--ink`.
- `back`: `--ink-faint` text, no border; hover turns amber.
- `del`: small (12px) muted bordered pill; hover turns `--danger` colour.
- Disabled is supported on all variants via the native `disabled` attribute or `aria-disabled="true"`.
- `text-decoration: none` is set so the component works as a styled anchor without underline.

---

## Led

Renders a 7×7 px circular status indicator with a colour glow. Carries `role="status"` on the root element.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `'ok' \| 'amber' \| 'cyan' \| 'danger' \| 'off'` | `'ok'` | LED colour and glow. |
| `blink` | `boolean` | `false` | Enables a 1.6s stepped blink animation. |
| `...rest` | `HTMLAttributes<HTMLSpanElement>` | — | All native HTML span attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Led } from '@dxlbnl/ui'
</script>

<Led color="ok" />
<Led color="amber" blink />
<Led color="danger" aria-label="System error" />
<Led color="off" />
```

### Notable behaviour

- Each colour maps to its design token and applies a matching `box-shadow` glow, except `off` which uses `--ink-faint` with no glow.
- `blink` uses a CSS `steps(2, end)` animation — a hard two-state flash, not a fade.
- `role="status"` is always present. Provide `aria-label` when the LED conveys meaningful status to screen readers; add `aria-hidden="true"` when it is purely decorative.
- `flex-shrink: 0` prevents the dot from collapsing inside flex containers.

---

## TagPill

Renders a small uppercase mono bordered pill. Used for tags, labels, and status chips.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'amber' \| 'cyan'` | `'default'` | Colour of the pill border and text. |
| `children` | `Snippet` | `undefined` | Pill label text. |
| `...rest` | `HTMLAttributes<HTMLSpanElement>` | — | All native HTML span attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { TagPill } from '@dxlbnl/ui'
</script>

<TagPill>SvelteKit</TagPill>
<TagPill variant="amber">In Stock</TagPill>
<TagPill variant="cyan">Eurorack</TagPill>
```

### Notable behaviour

- `border-radius: 0` — square corners, intentional for the terminal aesthetic.
- Text is always uppercase (`text-transform: uppercase`) and 11px mono.
- `default` uses `--ink-faint` for both border and text.
- `amber` uses `--amber`; `cyan` uses `--cyan`.

---

## Text

Zero-CSS wrapper that applies a global typography class to the rendered element. Use it to apply body, lede, mono, or eyebrow type styles with optional colour.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'body' \| 'lede' \| 'mono' \| 'eyebrow'` | `'body'` | Typography class to apply. |
| `color` | `'ink' \| 'dim' \| 'faint' \| 'amber' \| 'cyan' \| 'ok' \| 'danger'` | `undefined` | Optional colour override applied as an inline style. |
| `as` | `string` | Variant default | HTML element. Defaults: body→`p`, lede→`p`, mono→`span`, eyebrow→`span`. |
| `children` | `Snippet` | `undefined` | Text content. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `style` | `string \| null` | `undefined` | Inline styles merged with the colour style. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Text } from '@dxlbnl/ui'
</script>

<Text>Body paragraph text.</Text>
<Text variant="lede">Lead paragraph, slightly larger.</Text>
<Text variant="mono" color="faint">META · LABEL</Text>
<Text variant="eyebrow" color="amber">Category</Text>
<Text variant="body" color="danger">Validation error message.</Text>
```

### Notable behaviour

- The component adds zero CSS of its own. It delegates entirely to global typography classes (`body-text`, `body-lede`, `mono-label`, `eyebrow`) defined in `typography.css`.
- `color` is applied as `color: var(--<token>)` in an inline style. If `style` is also provided, the colour style is prepended.
- `as` override is useful when semantic meaning differs from the variant default (e.g. `<Text variant="mono" as="p">` for a mono paragraph).
- The `mono` variant renders uppercase monospace; the `eyebrow` variant also renders uppercase monospace (used for section labels above headings).

---

## Heading

Renders `<h1>`–`<h6>` with a named typography variant class. Zero CSS of its own — delegates to global heading classes.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | HTML heading level to render. |
| `variant` | `'display' \| 'hero' \| 'title' \| 'h1' \| 'h2' \| 'h3'` | Level default | Typography class. Defaults: level 1→`'h1'`, level 2→`'h2'`, level 3→`'h3'`, levels 4–6→`undefined` (no class applied). |
| `color` | `'ink' \| 'dim' \| 'faint' \| 'amber' \| 'cyan' \| 'ok' \| 'danger'` | `undefined` | Optional colour override applied as an inline style. |
| `children` | `Snippet` | `undefined` | Heading text. |
| `class` | `ClassValue \| null` | `''` | Additional CSS classes. |
| `style` | `string \| null` | `undefined` | Inline styles merged with colour style. |
| `...rest` | `[key: string]: unknown` | — | All additional attributes forwarded to the root element. |

### Usage

```svelte
<script>
  import { Heading } from '@dxlbnl/ui'
</script>

<!-- Default h2 with h2 class -->
<Heading>Section Title</Heading>

<!-- h1 element with display variant -->
<Heading level={1} variant="display">DEXTERLABS</Heading>

<!-- Hero landing heading -->
<Heading level={1} variant="hero">Build Hardware</Heading>

<!-- Title (content page) heading — smaller scale than hero -->
<Heading level={1} variant="title">Order cancelled.</Heading>

<!-- h3 with amber colour -->
<Heading level={3} color="amber">Module Status</Heading>
```

### Notable behaviour

- The element rendered is always `<h{level}>` regardless of `variant`. Variant only controls the CSS class applied.
- `display` maps to `display-heading` class (140px); `hero` maps to `hero-heading` (fluid 48–112px); `title` maps to `title-heading` (fluid 36–56px via `--t-title`); `h1`/`h2`/`h3` map to the corresponding heading size classes.
- For levels 4–6 with no explicit `variant`, no typography class is applied — the element renders with browser default heading styles.
- `color` and `style` merge in the same way as `Text`: colour style is prepended.
