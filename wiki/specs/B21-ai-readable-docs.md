# B21: AI-readable docs

## Context

`@dxlbnl/ui` is consumed by dexterlabs.nl and by AI coding assistants (e.g. Claude,
Copilot) that generate Svelte code against the design system. Without structured
plain-text documentation, those assistants must infer prop names and default values by
reading source files directly — a fragile, context-hungry process. The `docs/` directory
solves this: it provides accurate, hand-written Markdown that is:

- Machine-parseable by AI assistants without requiring access to `src/`.
- Renderable by mdsvex on a future documentation site (no HTML in prose, valid fenced
  code blocks, clear heading hierarchy).
- Complementary to Storybook (which covers interactive and visual reference); `docs/`
  covers prop tables, usage examples, and design rationale in plain text.

This is a **pure documentation task**. No `.svelte`, `.ts`, or `.css` files are created
or modified. The sole output is ten Markdown files under `docs/` at the project root
(same level as `src/` and `wiki/`).

Related wiki pages:
- [vision.md](../vision.md) — project goals and consumer context
- [requirements.md](../requirements.md) — R1 (design tokens), R2 (typography)
- [architecture.md](../architecture.md) — project structure, component authoring conventions
- [backlog.md](../backlog.md) — B21 item; also B15–B20 which must be complete first
- [specs/B2-design-tokens.md](B2-design-tokens.md) — token values (source of truth for `docs/design-tokens.md`)
- [specs/B4-primitive-components.md](B4-primitive-components.md) — Button, Led, TagPill
- [specs/B5-card-components.md](B5-card-components.md) — Card, ProductCard, ProjectCard, NoteCard
- [specs/B6-navigation.md](B6-navigation.md) — Nav
- [specs/B7-form-components.md](B7-form-components.md) — Input, Textarea, Select, InputWrap, Field
- [specs/B8-modal.md](B8-modal.md) — Modal
- [specs/B9-pattern-components.md](B9-pattern-components.md) — Alert, CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead, SectionFoot, PageHero
- [specs/B10-accordion-tabs-table.md](B10-accordion-tabs-table.md) — Accordion, Tabs, Table
- [specs/B14-typography-primitives.md](B14-typography-primitives.md) — Text, Heading
- [specs/B16-form-primitives.md](B16-form-primitives.md) — Checkbox, Radio, RadioGroup, Switch
- [specs/B17-navigation-enhancements.md](B17-navigation-enhancements.md) — Breadcrumb
- [specs/B18-toast-notifications.md](B18-toast-notifications.md) — Toast, ToastRegion, toast store
- [specs/B20-prose-component.md](B20-prose-component.md) — Prose

---

## Prerequisite backlog items

B21 documents components that must already be implemented. The implementer agent must
not write `docs/` files for components that do not yet exist in `src/lib/`. The full
set of components covered by this spec requires the following items to be complete:

| Item | Components documented by B21 |
|---|---|
| B2 (done) | Design tokens (`docs/design-tokens.md`) |
| B3 (done) | Stack, Inline, Spread, Grid, Container, Rule (`docs/layout.md`) |
| B4 (done) | Button, Led, TagPill (`docs/primitives.md`) |
| B5 (done) | Card, ProductCard, ProjectCard, NoteCard (`docs/cards.md`) |
| B6 (done) | Nav (`docs/navigation.md`) |
| B7 (done) | Input, Textarea, Select, InputWrap, Field (`docs/forms.md`) |
| B8 (done) | Modal (`docs/feedback.md`) |
| B9 (done) | Alert, CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead, SectionFoot, PageHero (`docs/patterns.md`) |
| B10 (done) | Accordion, AccordionItem, Tabs, Table (`docs/data.md`) |
| B14 (done) | Text, Heading (`docs/primitives.md`) |
| B15 (in-progress) | Select keyboard nav (documented alongside Select in `docs/forms.md`) |
| B16 | Checkbox, Radio, RadioGroup, Switch (`docs/forms.md`) |
| B17 | Breadcrumb, AnimatedAccordion (`docs/navigation.md`, `docs/data.md`) |
| B18 | Toast, ToastRegion, toast store (`docs/feedback.md`) |
| B20 | Prose (`docs/layout.md`) |

If B21 is started before B15–B20 are complete, the agent must write `docs/` sections
only for components that exist in `src/lib/`. Sections for not-yet-implemented
components must be omitted (or marked `<!-- TODO: add when B<n> is complete -->`). The
reviewer checks accuracy against the source, not completeness against future items.

**Recommended order**: B21 should only be scheduled after B20 is merged. If the manager
schedules B21 while B15–B18 are still pending, the implementer must note which sections
are incomplete and the manager should plan a follow-up documentation pass.

---

## Standard doc-file template

Every file in `docs/` (except `docs/index.md` and `docs/design-tokens.md`) follows
this template:

```markdown
# <Group Name>

Brief one-sentence description of the component group.

## <ComponentName>

One-sentence purpose statement: what the component renders and when to use it.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `propName` | `TypeString` | `defaultValue` | What the prop controls. |

### Usage

\`\`\`svelte
<script>
  import { ComponentName } from '@dxlbnl/ui'
</script>

<ComponentName prop="value">children</ComponentName>
\`\`\`

### Notable behaviour

- Bullet points describing behaviour that is not obvious from the props table.
- Each point covers one observable behaviour: SSR safety, ARIA attributes, CSS tokens
  used, keyboard interaction, conditional rendering, defaults inferred from other props.
```

Rules for every doc file:
- Use plain Markdown. No raw HTML tags in prose (mdsvex-renderable).
- Fenced code blocks use the `svelte` language tag for Svelte snippets, `ts` for
  TypeScript-only snippets, and `css` for CSS.
- Prop types use TypeScript notation (`string`, `boolean`, `'ok' | 'amber' | 'danger'`,
  `string[]`, `{ label: string; href: string }[]`).
- Default values are shown as TypeScript literals (`'primary'`, `false`, `undefined`,
  `[]`).
- Props that extend an HTML element's full attribute set (e.g. `HTMLButtonAttributes`)
  are documented with a single row: `...rest` | `HTMLButtonAttributes` | — | All native
  HTML button attributes are forwarded to the root element.
- Usage examples must be minimal but runnable — no placeholder imports or fictional APIs.
- AI consumption note: prop tables are the primary machine-readable artifact. Every
  exported prop must appear in the table. Props that come from `...rest` spreading of an
  HTML element type are summarised in the `...rest` row rather than listed individually.

---

## File specifications

### `docs/index.md`

Overview, install, palette setup, import paths.

Required sections (in order):

1. `# @dxlbnl/ui` — H1 title
2. `## Overview` — one paragraph: what the library is, who it is for, what design
   identity it implements (Phosphor dark + Paper light palettes, JetBrains Mono + Inter
   Tight, amber accent, terminal aesthetic)
3. `## Install` — one fenced `sh` block: `pnpm add @dxlbnl/ui`; note the peer deps
   (SvelteKit / Svelte 5, no external UI primitives); note the library is not currently
   published to npm (personal use)
4. `## Global CSS` — how to import the design tokens and typography into the app:
   the `app.css` / `+layout.svelte` pattern; reference to
   `src/app.css` (or equivalent) which imports `tokens.css` and `typography.css`
5. `## Palette setup` — explain the Phosphor (dark, default) and Paper (light) palettes;
   how to switch: `data-palette="paper"` attribute on `<html>`; the `Nav` component's
   toggle button writes to `localStorage` under key `'dxlb-palette'` and sets the
   attribute; explain the SSR caveat (initial render is always Phosphor; Paper preference
   is applied after hydration)
6. `## Import paths` — table or list of every exported name grouped by category, showing
   the import statement (`import { Button, Led, TagPill } from '@dxlbnl/ui'`); list all
   categories: primitives, layout, cards, navigation, forms, feedback, patterns, data

### `docs/design-tokens.md`

Full token reference. Source of truth: `src/lib/tokens/tokens.css`.

Required sections:

1. `# Design Tokens` — H1 title
2. `## Overview` — brief explanation: CSS custom properties defined on `:root` (Phosphor)
   and overridden on `[data-palette="paper"]`; no JS token objects; consumed via
   `var(--token-name)` in component `<style>` blocks
3. `## Surfaces` — table with columns: Token | Phosphor value | Paper value | Semantic meaning

   Tokens: `--bg`, `--bg-rail`, `--bg-elev`, `--bg-sunken`

4. `## Ink` — same table format

   Tokens: `--ink`, `--ink-dim`, `--ink-faint`

5. `## Rules` — same table format

   Tokens: `--rule`, `--rule-strong`

6. `## Accents` — same table format

   Tokens: `--amber`, `--cyan`, `--danger`, `--ok`

7. `## Typography` — table: Token | Value | Meaning

   Font stacks: `--mono`, `--sans`

   Type scale: `--t-micro`, `--t-mono`, `--t-body`, `--t-lede`, `--t-h3`, `--t-h2`,
   `--t-h1`, `--t-display`, `--t-hero`, `--t-title`, `--t-subtitle`

8. `## Spacing` — table: Token | Value (px) | Description

   Tokens: `--u` (8px), `--u2` (16px), `--u3` (24px), `--u4` (32px), `--u5` (40px),
   `--u6` (48px), `--u7` (56px), `--u10` (80px)

9. `## Radius` — Token | Value | Usage: `--radius` (2px), `--radius-card` (4px)

10. `## Transitions` — Token | Value: `--transition` (0.15s)

11. `## Shiki syntax tokens` — table listing all `--shiki-*` variables and their
    Phosphor values; note they map to other design tokens (e.g. `--shiki-token-keyword`
    maps to `var(--amber)`) and that the Paper palette overrides only string-related
    shiki vars

The token values in `docs/design-tokens.md` must be accurate to `src/lib/tokens/tokens.css`.
The reviewer cross-checks every value in the table against the CSS source file.

### `docs/layout.md`

Components: Stack, Inline, Spread, Grid, Container, Rule, Prose.

Source files to cross-check:
- `src/lib/components/layout/Stack.svelte`
- `src/lib/components/layout/Inline.svelte`
- `src/lib/components/layout/Spread.svelte`
- `src/lib/components/layout/Grid.svelte`
- `src/lib/components/layout/Container.svelte`
- `src/lib/components/layout/Rule.svelte`
- `src/lib/components/layout/Prose.svelte` (B20 — only write if the file exists)

Per-component sections must include props tables accurate to the source files. Known
props at time of writing (implementer must verify against source):

**Stack**: `as` (string, `'div'`), `gap` (`'none'|'xs'|'sm'|'md'|'lg'|'xl'`, `'sm'`),
`class`, `style`, `children`, `...rest`. Renders a vertical flex column.

**Inline**: `as` (string, `'div'`), `gap` (`'none'|'xs'|'sm'|'md'|'lg'|'xl'`, `'sm'`),
`class`, `style`, `children`, `...rest`. Renders a wrapping flex row, vertically centred.

**Spread**: `as` (string, `'div'`), `class`, `style`, `children`, `...rest`. Renders a
flex row with `justify-content: space-between`. No `gap` prop — gap is fixed at 16px.

**Grid**: `as` (string, `'div'`), `cols` (`1|2|3|4|'auto'`, `3`), `gap`
(`'none'|'xs'|'sm'|'md'|'lg'|'xl'`, `'sm'`), `minColWidth` (string, `'240px'`),
`children`, `...rest`. `cols='auto'` uses `repeat(auto-fill, minmax(minColWidth, 1fr))`.

**Container**: `as` (string, `'div'`), `size` (`'lg'|'md'|'sm'`, `'lg'`), `children`,
`...rest`. Max widths: lg = 1440px, md = 960px, sm = 640px. Centres content, responsive
horizontal padding (32px → 16px on narrow viewports).

**Rule**: `variant` (`'solid'|'dashed'|'strong'`, `'solid'`), `...rest` (HTMLHRAttributes).
Renders a `<hr>`. Solid uses `--rule`, strong uses `--rule-strong`.

**Prose**: `as` (string, `'article'`), `maxWidth` (string, `'72ch'`), `children`,
`...rest`. Styles dynamically-inserted markdown HTML via `.prose :global(element)`
selectors. Use this wrapper around mdsvex output.

### `docs/primitives.md`

Components: Button, Led, TagPill, Text, Heading.

Source files to cross-check:
- `src/lib/components/primitives/Button.svelte`
- `src/lib/components/primitives/Led.svelte`
- `src/lib/components/primitives/TagPill.svelte`
- `src/lib/components/primitives/Text.svelte`
- `src/lib/components/primitives/Heading.svelte`

Known props at time of writing:

**Button**: `as` (string, `'button'`), `variant`
(`'primary'|'cta'|'ghost'|'back'|'del'`, `'primary'`), `href` (string, `undefined`),
`children`, `...rest` (HTMLButtonAttributes). Use `as="a"` with `href` for anchor
rendering. All variants use `--mono` font, uppercase. `primary` = amber fill, dark text;
`cta` = amber border, transparent; `ghost` = amber text, no border; `back` = muted text;
`del` = small muted bordered, danger hover.

**Led**: `color` (`'ok'|'amber'|'cyan'|'danger'|'off'`, `'ok'`), `blink` (boolean,
`false`), `...rest` (HTMLSpanAttributes). Renders a 7×7 px circle with glow. Has
`role="status"` on the root element. `blink` adds a 1.6s step animation.

**TagPill**: `variant` (`'default'|'amber'|'cyan'`, `'default'`), `children`, `...rest`
(HTMLSpanAttributes). Renders uppercase mono text in a small bordered pill. Square
corners (`border-radius: 0`).

**Text**: `variant` (`'body'|'lede'|'mono'|'eyebrow'`, `'body'`), `color`
(`'ink'|'dim'|'faint'|'amber'|'cyan'|'ok'|'danger'`, `undefined`), `as` (string, variant
default: `body` → `p`, `lede` → `p`, `mono` → `span`, `eyebrow` → `span`), `children`,
`class`, `style`, `...rest`. Zero-CSS wrapper: applies the matching global typography
class. Color is applied as an inline `style` using the corresponding CSS custom property.

**Heading**: `level` (`1|2|3|4|5|6`, `2`), `variant`
(`'display'|'hero'|'h1'|'h2'|'h3'`, level default: 1→`'h1'`, 2→`'h2'`, 3→`'h3'`,
others→`undefined`), `color` (same union as Text, `undefined`), `children`, `class`,
`style`, `...rest`. Renders `<h{level}>` with the corresponding typography class.
`display` and `hero` are larger decorative variants for landing pages.

### `docs/cards.md`

Components: Card, ProductCard, ProjectCard, NoteCard.

Source files to cross-check:
- `src/lib/components/cards/Card.svelte`
- `src/lib/components/cards/ProductCard.svelte`
- `src/lib/components/cards/ProjectCard.svelte`
- `src/lib/components/cards/NoteCard.svelte`

Known props at time of writing:

**Card**: `as` (string, `'div'`), `children`, `...rest` (HTMLAttributes). Base container:
`--bg-rail` background, `--rule` border, flex column, overflow hidden.

**ProductCard**: `as` (string, `'a'`), `sku` (string, required), `name` (string,
required), `description` (string, required), `price` (string, `undefined`), `status`
(`'in-stock'|'coming-soon'|'low-stock'|'out-of-stock'`, `'out-of-stock'`), `ctaLabel`
(string, derived from status), `...rest` (HTMLAnchorAttributes). Renders a product card
with diagonal-hatch image placeholder, stock LED indicator, price in amber, and a CTA
footer that turns amber on hover. Default CTA labels: `'in-stock'` → `'BUY NOW'`,
`'coming-soon'` → `'PRE-ORDER'`, `'out-of-stock'` → `'VIEW DETAILS'`.

**ProjectCard**: `as` (string, `'a'`), `slug` (string, required), `title` (string,
required), `description` (string, required), `tags` (string[], `[]`), `ctaLabel`
(string, `'VIEW PROJECT'`), `...rest` (HTMLAnchorAttributes). Renders a project card
with diagonal-hatch placeholder, optional `TagPill` tags, and a CTA footer that turns
amber on hover.

**NoteCard**: `as` (string, `'a'`), `idx` (number, required), `kind` (string, `'LOG'`),
`title` (string, required), `lede` (string, `undefined`), `date` (string, `undefined`),
`...rest` (HTMLAnchorAttributes). `idx` is displayed as a zero-padded hex ID (e.g.
index 7 → `0x07`). Border turns amber on hover.

### `docs/navigation.md`

Components: Nav, Breadcrumb (B17 — only if implemented).

Source files to cross-check:
- `src/lib/components/navigation/Nav.svelte`
- `src/lib/components/navigation/Breadcrumb.svelte` (if it exists)

Known props at time of writing:

**Nav**: `links` (`{ href: string; label: string; active?: boolean }[]`, `[]`),
`siteName` (string, `'DEXTERLABS'`), `...rest`. Fixed top bar (48px height, z-index 100).
Active link gets an amber underline. Palette toggle button reads/writes `localStorage`
key `'dxlb-palette'` and sets `data-palette` on `<html>`. Mobile hamburger hidden above
768px. SSR caveat: palette initialises to `'phosphor'` on the server; Paper preference
is applied after hydration.

**Breadcrumb** (B17): `crumbs` (`{ label: string; href: string }[]`, required). Renders
`<nav aria-label="breadcrumb">` with an `<ol>`. Last crumb has `aria-current="page"`.
Separators are `aria-hidden`. Purely presentational, no internal state.

### `docs/forms.md`

Components: Input, Textarea, Select, InputWrap, Field, Checkbox (B16), Radio (B16),
RadioGroup (B16), Switch (B16).

Source files to cross-check:
- `src/lib/components/forms/Input.svelte`
- `src/lib/components/forms/Textarea.svelte`
- `src/lib/components/forms/Select.svelte`
- `src/lib/components/forms/InputWrap.svelte`
- `src/lib/components/forms/Field.svelte`
- `src/lib/components/forms/Checkbox.svelte` (B16 — only if implemented)
- `src/lib/components/forms/Radio.svelte` (B16 — only if implemented)
- `src/lib/components/forms/RadioGroup.svelte` (B16 — only if implemented)
- `src/lib/components/forms/Switch.svelte` (B16 — only if implemented)

Known props at time of writing:

**Input**: `error` (boolean, `false`), `...rest` (HTMLInputAttributes). Mono font,
bg-sunken, full width. Focus → amber border. Error → danger border. Disabled → 0.4 opacity.

**Textarea**: `error` (boolean, `false`), `...rest` (HTMLTextareaAttributes). Same
visual treatment as Input. `resize: vertical`, `min-height: 60px`.

**Select**: `options` (`{ value: string; label: string }[]`, required), `value` (string,
`undefined`), `placeholder` (string, `'SELECT…'`), `error` (boolean, `false`), `disabled`
(boolean, `false`), `onchange` (`(value: string) => void`, `undefined`). Fully custom
component (no native `<select>`). Opens a `role="listbox"` panel on click. Keyboard: arrow
keys cycle options, Home/End jump to first/last (B15), Escape closes, Enter confirms.
`aria-activedescendant` is set on the trigger button when the panel is open. Panel closes
on outside click.

**InputWrap**: `iconPre` (Snippet, `undefined`), `addonPre` (string, `undefined`),
`addonSuf` (string, `undefined`), `clearable` (boolean, `false`), `value` (string, `''`),
`onclear` (function, `undefined`), `children` (Snippet, required). Wraps a form control
with optional icon prefix, text addons, and a clear button. The child Input (or other
control) must be passed as the default children snippet.

**Field**: `label` (string, required), `inputId` (string, required), `hint` (string,
`undefined`), `error` (string, `undefined`), `children` (Snippet, required). Renders a
labelled form field group. Sets Svelte context (`'field'`) so that child controls
(`Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`) automatically receive
`id`, `aria-describedby`, and `aria-invalid` when context is present (B16 enhancement).
When `error` is set, the hint text is shown in danger colour.

**Checkbox** (B16): `label` (string, required), `checked` ($bindable boolean, `false`),
`indeterminate` (boolean, `false`), `disabled` (boolean, `false`), `...rest`
(HTMLInputAttributes). Wrapped in `<label>` for implicit accessible name. Amber fill
when checked. `indeterminate` sets `input.indeterminate` via `$effect`.

**Radio** (B16): `label` (string, required), `checked` (boolean, `false`), `disabled`
(boolean, `false`), `...rest` (HTMLInputAttributes — notably `name` and `value`). Single
radio atom. Wrapped in `<label>`. Use inside `RadioGroup` for exclusive selection.

**RadioGroup** (B16): `legend` (string, required), `name` (string, required), `options`
(`{ value: string; label: string; disabled?: boolean }[]`, required), `value` (string,
`undefined`), `disabled` (boolean, `false`), `onchange` (`(value: string) => void`,
`undefined`). Renders `<fieldset>` + `<legend>`. Arrow keys move focus and selection
within the group (roving tabindex). Selected radio has `tabindex="0"`; others have
`tabindex="-1"`.

**Switch** (B16): `label` (string, required), `checked` ($bindable boolean, `false`),
`disabled` (boolean, `false`), `...rest` (HTMLButtonAttributes). Renders `role="switch"`
with `aria-checked`. Amber track when on. Space key toggles via native button click.
SSR-safe (no `$effect` needed — all state is CSS-driven).

### `docs/feedback.md`

Components: Modal, Alert, Toast (B18), ToastRegion (B18), toast store API (B18).

Source files to cross-check:
- `src/lib/components/feedback/Modal.svelte`
- `src/lib/components/patterns/Alert.svelte` (note: lives in patterns layer)
- `src/lib/components/feedback/Toast.svelte` (B18 — only if implemented)
- `src/lib/components/feedback/ToastRegion.svelte` (B18 — only if implemented)
- `src/lib/stores/toast.ts` (B18 — only if implemented)

Note: `Alert` is imported from `'@dxlbnl/ui'` directly (exported from the patterns
layer); document the import path correctly.

Known props at time of writing:

**Modal**: `open` (boolean, `false`), `title` (string, required), `variant`
(`'default'|'confirm'|'destructive'`, `'default'`), `onclose` (function, `undefined`),
`children` (Snippet, `undefined`), `footer` (Snippet, `undefined`), `...rest`
(HTMLDialogAttributes). Uses native `<dialog>` opened via `showModal()` inside `$effect`
(SSR-safe). Backdrop is native `::backdrop`. `confirm` variant shows amber `!` icon;
`destructive` shows danger `!` icon. Clicking the backdrop calls `onclose`. Escape key
calls `onclose` (native cancel event intercepted). `footer` snippet renders below the
body with right-aligned content (pass Buttons).

**Alert**: `variant` (`'ok'|'amber'|'danger'|'info'`, `'info'`), `title` (string,
required), `message` (string, `undefined`), `children` (Snippet, `undefined`), `...rest`.
Static inline banner. `role="status"`. Left border and icon glyph colour matches variant.
`message` and `children` are both optional body slots (use one or the other).

**Toast** (B18): `id` (string, required), `message` (string, required), `variant`
(`'ok'|'amber'|'danger'`, `'ok'`), `ondismiss` (`(id: string) => void`, required).
Internal component — use the `toast` store to push toasts, not `Toast` directly.
`danger` variant uses `role="alert"` (assertive); ok/amber use `role="status"` (polite).

**ToastRegion** (B18): `position`
(`'bottom-right'|'bottom-left'|'top-right'|'top-left'`, `'bottom-right'`), `limit`
(number, `5`). Mount once at the app root (in `+layout.svelte`). SSR-safe (renders
only after hydration via `$effect` + `mounted` flag). Stack limit: when exceeded, the
oldest toast is dismissed automatically.

**toast store API** (B18): Not a Svelte component. Document as a code section:
- `toast.push(message, options?)` — pushes a new toast; returns the toast `id` string
- `toast.push(message, { variant: 'ok'|'amber'|'danger', duration: number })` — options:
  `variant` defaults to `'ok'`; `duration` (ms) defaults to `5000`; pass `0` to disable
  auto-dismiss
- `toast.dismiss(id)` — removes the toast with the given id
- `toast.subscribe` — standard Svelte store subscribe for reading the active toast list

### `docs/patterns.md`

Components: CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead,
SectionFoot, PageHero.

Source files to cross-check:
- `src/lib/components/patterns/CtaBlock.svelte`
- `src/lib/components/patterns/StatCard.svelte`
- `src/lib/components/patterns/KvList.svelte`
- `src/lib/components/patterns/ProgressBar.svelte`
- `src/lib/components/patterns/ActivityRow.svelte`
- `src/lib/components/patterns/SectionHead.svelte`
- `src/lib/components/patterns/SectionFoot.svelte`
- `src/lib/components/patterns/PageHero.svelte`

Known props at time of writing:

**CtaBlock**: `as` (string, `'div'`), `eyebrow` (string, `undefined`), `heading`
(string, required), `subtext` (string, `undefined`), `children` (Snippet, `undefined`),
`...rest`. Amber border, space-between layout. Children slot renders the CTA button(s) on
the right. Hover adds a light amber background tint.

**StatCard**: `label` (string, required), `value` (string, required), `sublabel`
(string, `undefined`), `color` (`'default'|'ok'|'amber'|'danger'`, `'default'`), `...rest`.
Mono font stat display. `value` is 32px mono. Color tokens applied to the value only.

**KvList**: `items` (`{ key: string; value: string; color?: 'default'|'ok'|'amber'|'danger'|'cyan' }[]`,
required). Renders key-value pairs separated by dashed rules. Keys in muted mono uppercase;
values in the specified color token (default = `--ink`).

**ProgressBar**: `value` (number, required), `label` (string, `undefined`), `color`
(`'ok'|'amber'|'danger'`, `'ok'`), `...rest`. Value is clamped to 0–100. Has
`role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. When `label`
is set, a header row shows the label and percentage.

**ActivityRow**: `timestamp` (string, required), `description` (string, required),
`actor` (string, `undefined`), `status` (`'ok'|'amber'|'danger'|'off'`, `'off'`), `...rest`.
Renders a log-row with a timestamp, LED status indicator, optional actor name, and
description. Separated from adjacent rows by a dashed bottom border.

**SectionHead**: `eyebrow` (string, `undefined`), `heading` (string, required), `sublabel`
(string, `undefined`), `children` (Snippet, `undefined`), `...rest`. Renders a `<section>`
with a bottom border. `eyebrow` is a small mono label above the heading. `sublabel`
appears inline to the right of the heading. Children render below as a call to action or
filter row.

**SectionFoot**: `href` (string, required), `label` (string, required), `count` (number,
`undefined`), `meta` (string, `undefined`), `...rest`. Renders a `<footer>` with a space-
between layout. `label` is an amber link. `count` and `meta` render on the right as muted
mono text; if both are provided they are joined with ` · `.

**PageHero**: `eyebrow` (string, `undefined`), `heading` (string, required), `lede`
(string, `undefined`), `children` (Snippet, `undefined`), `...rest`. Full-width `<header>`
with bottom border. `heading` uses `--t-hero` (clamp 48px–112px). `lede` is body-sized
prose capped at 62ch. Children render below the lede (e.g. action buttons in an `Inline`).

### `docs/data.md`

Components: Accordion, AccordionItem, Tabs, Table.

Source files to cross-check:
- `src/lib/components/data/Accordion.svelte`
- `src/lib/components/data/AccordionItem.svelte`
- `src/lib/components/data/Tabs.svelte`
- `src/lib/components/data/Table.svelte`

Known props at time of writing:

**Accordion**: `children` (Snippet, required), `...rest` (HTMLDivAttributes). Thin wrapper
that adds a shared border around its `AccordionItem` children. Use with `AccordionItem`
children.

**AccordionItem**: `label` (string, required), `open` (boolean, `false`), `children`
(Snippet, required). Uses native `<details>`/`<summary>` — no JS for expand/collapse (SSR-
safe). `open` prop sets initial state. CSS `interpolate-size` animation on supporting
browsers (B17 enhancement). The icon (`›`) rotates 90° and turns amber when open.

**Tabs**: `tabs` (`{ id: string; label: string; panel: Snippet }[]`, required), `active`
(string, defaults to first tab id), `variant` (`'underline'|'pill'`, `'underline'`).
`...rest`. Arrow keys move focus and activate the tab (automatic activation model). Active
tab has amber underline (`underline`) or amber background (`pill`). Each tab is a
`<button role="tab">` with `aria-selected` and `aria-controls`. Each panel is
`<div role="tabpanel">` with `hidden` when inactive. Home/End jump to first/last tab.

**Table**: `headers` (string[], required), `rows` (string[][], `undefined`), `children`
(Snippet, `undefined`), `caption` (string, `undefined`), `...rest` (HTMLTableAttributes).
When `rows` is provided, cells are rendered automatically. When `children` is provided,
custom `<tr>` markup is rendered instead. Headers are mono uppercase. Rows have dashed
bottom borders. Hover adds `--bg-rail` background.

---

## Acceptance criteria

"Acceptance criteria" for a documentation item means: is the file present, does it
contain all required sections, and are the prop tables accurate to the source? These
are not automated-test criteria — they are reviewer criteria. The verification approach
is: the reviewer (agent or human) reads each `docs/` file and cross-checks every prop
name, type, and default value against the corresponding source `.svelte` file.

### File presence

1. `docs/index.md` exists at the project root.
2. `docs/design-tokens.md` exists at the project root.
3. `docs/layout.md` exists at the project root.
4. `docs/primitives.md` exists at the project root.
5. `docs/cards.md` exists at the project root.
6. `docs/navigation.md` exists at the project root.
7. `docs/forms.md` exists at the project root.
8. `docs/feedback.md` exists at the project root.
9. `docs/patterns.md` exists at the project root.
10. `docs/data.md` exists at the project root.

Verification: `ls docs/` returns all ten files.

### `docs/index.md` structure

11. Contains an H1 heading `# @dxlbnl/ui`.
12. Contains an `## Install` section with a fenced `sh` block showing `pnpm add @dxlbnl/ui`.
13. Contains a `## Global CSS` section explaining which files to import and from where.
14. Contains a `## Palette setup` section that mentions `data-palette="paper"`, the
    `localStorage` key `'dxlb-palette'`, and the SSR hydration caveat.
15. Contains an `## Import paths` section that lists all exported component names from
    `src/lib/index.ts`, grouped by category.

### `docs/design-tokens.md` accuracy

16. Every CSS custom property listed in `src/lib/tokens/tokens.css` (`:root` block) is
    present in the token table — both name and Phosphor value are accurate.
17. Every CSS custom property listed in the `[data-palette="paper"]` override block is
    present with its Paper value.
18. The token table for Shiki variables lists all `--shiki-*` custom properties defined
    in `tokens.css` and indicates which design token each maps to.

### Per-file template compliance

For each of `docs/layout.md`, `docs/primitives.md`, `docs/cards.md`,
`docs/navigation.md`, `docs/forms.md`, `docs/feedback.md`, `docs/patterns.md`,
`docs/data.md`:

19. The file begins with an H1 heading for the group name.
20. Each component covered by the file has its own `##` H2 section.
21. Each component section contains a `### Props` subsection with a Markdown table that
    has exactly four columns: `Prop`, `Type`, `Default`, `Description`.
22. Each component section contains a `### Usage` subsection with at least one fenced
    Svelte code block showing how to import and use the component.
23. Each component section contains a `### Notable behaviour` subsection with at least
    one bullet point.
24. No raw HTML tags appear in the prose (only fenced code blocks may contain HTML).

### Prop table accuracy

25. Every prop exported in each component's `Props` interface (via `$props()` in the
    source `.svelte` file) has a corresponding row in the prop table.
26. Prop types in the table match the TypeScript type in the source exactly (union
    members, base types, and whether the prop is required vs optional).
27. Default values in the table match the destructured default in the source (e.g.
    `variant = 'primary'` → Default column shows `'primary'`).
28. Required props (no default in the source destructuring) are shown with `—` in the
    Default column (not empty, not `undefined`).
29. Props that come from `...rest` spreading of an HTML element type have a single
    `...rest` row in the table rather than listing each individual HTML attribute.

### Usage example correctness

30. Every usage example imports from `'@dxlbnl/ui'` (not from relative paths).
31. Every usage example uses prop names that match the source component exactly.
32. Every usage example is syntactically valid Svelte 5 (fenced with the `svelte` tag).
33. No usage example imports a component that is not yet exported from `src/lib/index.ts`
    at the time B21 is implemented (i.e. no forward references to unimplemented components).

### No generated content

34. Every doc file is hand-written by the implementer reading the source files. No
    content is auto-generated from JSDoc, TypeDoc, or any other tooling.
35. The implementer agent reads each source `.svelte` file directly before writing the
    corresponding doc section, to ensure accuracy at the time of writing.

### Markdown quality (mdsvex-renderable)

36. All code blocks use an explicit language tag (`svelte`, `ts`, `sh`, `css`).
37. All Markdown tables use the standard pipe-table format (`|---|---|---|---|`).
38. No file uses HTML block-level elements (`<div>`, `<p>`, `<table>`, etc.) in prose;
    Markdown syntax is used throughout.
39. Each file can be parsed by a standard Markdown parser without errors (no unclosed
    fences, no malformed tables, no broken headings).

---

## Verification approach

Because `docs/` files are documentation, not code, there are no Storybook play functions
or Vitest tests for this item. The verification is a **reviewer task**:

1. **File presence check** (Bash): `ls docs/` confirms all ten files exist. This is the
   only automated check for B21.
2. **Prop accuracy review** (agent reviewer): For each component section in each doc
   file, the reviewer reads the corresponding source `.svelte` file and checks:
   - Every prop in the `$props()` destructure has a table row.
   - Prop type and default match the source.
   - No phantom props (props listed in the table that do not exist in the source).
3. **Token accuracy review** (agent reviewer): For `docs/design-tokens.md`, the reviewer
   reads `src/lib/tokens/tokens.css` line by line and confirms every custom property
   name and value matches the table.
4. **Usage example sanity check** (agent reviewer): Each fenced code block is read and
   confirmed to use real prop names and valid Svelte 5 syntax.
5. **Markdown lint** (optional, if a linter is configured): The reviewer may run a
   Markdown linter (`markdownlint`) to confirm no table formatting errors.

The `test-writer` for B21 writes no `.stories.svelte` files. Instead, it writes a
single shell-level check confirming all ten files exist (e.g. a short Bash script or
a Vitest test that does `fs.existsSync('docs/index.md')` etc.). The reviewer does the
content accuracy review manually.

---

## Out of scope

- **Storybook stories or play functions** — B21 produces only Markdown files. No
  `.stories.svelte` files are created or modified.
- **TypeScript source changes** — no `.svelte`, `.ts`, or `.css` files are touched.
- **Auto-generated documentation** — no JSDoc annotations, TypeDoc output, or schema
  extraction. All docs are hand-written.
- **`README.md` at the project root** — covered by B19 (Package documentation). B21
  does not modify `README.md` or `CHANGELOG.md`.
- **SvelteKit route pages** — no documentation site pages are created. The `docs/`
  files are plain Markdown intended for AI consumption and future mdsvex rendering.
- **Storybook autodocs** — JSDoc `@param` annotations on component props are covered
  by B19, not B21.
- **Versioning** — `docs/` files are not versioned separately from the package. They
  reflect the current state of `src/lib/` at the time B21 is implemented.
- **Interactive examples** — no CodeSandbox links, no embedded demos. Minimal static
  code snippets only.
- **External link verification** — no checking that `href` values in examples resolve.
- **Internationalisation** — all docs are in English only.
- **Pagination or navigation between doc files** — the files are standalone Markdown
  documents. No sidebar, no prev/next links, no table of contents beyond each file's
  own heading hierarchy.

---

## Open questions

**OQ-1 (non-blocking): Components from B15–B20 not yet implemented.**
If B21 is scheduled before B15–B20 are complete, the implementer must skip sections for
unimplemented components (e.g. `Checkbox`, `Toast`, `Breadcrumb`, `Prose`). The manager
should either: (a) schedule B21 only after B20 is merged (recommended), or (b) accept
a partial B21 and schedule a follow-up B21b documentation pass after remaining items
land. This is a scheduling decision for the manager, not an implementation question.

**OQ-2 (non-blocking): toast store — import path in docs.**
The `toast` store is exported from `src/lib/index.ts` as a value, not a component.
In `docs/feedback.md`, the usage example should show
`import { toast } from '@dxlbnl/ui'`. Confirm this import resolves correctly once B18
is implemented (the store must be exported from `src/lib/index.ts`).

**OQ-3 (non-blocking): `docs/index.md` install section.**
The library is not currently published to npm (see `wiki/vision.md` — "Not published to
npm initially"). The `## Install` section should note this caveat clearly and document
how to use the library via a local path or workspace reference until a version is
published. If B19 bumps the version to 0.1.0 first, the install section may reference
that version.

No open questions block implementation. B21 is ready for implementation after B15–B20
are complete (or after scheduling decision on partial implementation).
