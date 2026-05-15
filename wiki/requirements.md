# Requirements

## Functional requirements

### R1 — Design tokens
Implement the full Dexterlabs token set as CSS custom properties in both themes:
- **Phosphor** (dark default): `--bg`, `--bg-rail`, `--bg-elev`, `--bg-sunken`, `--ink`, `--ink-dim`, `--ink-faint`, `--rule`, `--rule-strong`, `--amber`, `--cyan`, `--danger`, `--ok`
- **Paper** (light): same tokens, overridden under `[data-palette="paper"]`
- **Typography**: `--mono` / `--sans` font stacks, full type scale (`--t-micro` → `--t-display` + clamp vars)
- **Spacing**: `--u` (8px) through `--u10` (80px)
- **Radius**: `--radius` (2px), `--radius-card` (4px)
- **Transitions**: `--transition: 0.15s`
- **Shiki**: syntax highlight token vars (mapped to design tokens)
- Also include the base CSS reset and semantic element styles from `colors_and_type.css`

### R2 — Typography classes
CSS utility classes for all text styles:
- Headings: `.h1`, `.h2`, `.h3`, `.hero-heading`, `.display-heading`
- Body: `.body-text`, `.body-lede`
- Mono labels: `.mono-label`, `.eyebrow`
- `code` / `pre` block styles

### R3 — Primitive components
- **Button** — 5 variants: `btn-primary`, `btn-cta`, `btn-ghost`, `btn-back`, `btn-del`; disabled state on primary/cta
- **Led** — 7px dot with glow; colors: `ok` (default), `amber`, `cyan`, `danger`, `off`; `.blink` animation
- **TagPill** — mono uppercase pill; variants: default, `amber`, `cyan`

### R4 — Card components
- **Card** (base) — `bg-rail` surface, 1px rule border, flex column, square corners
- **ProductCard** — image placeholder (diagonal hatch), body content, footer CTA row (amber fill on hover)
- **ProjectCard** — similar structure, project-specific layout
- **NoteCard** — hex note ID, compact layout, amber border on hover

### R5 — Navigation
- Fixed top nav bar, `border-bottom: 1px solid var(--rule)`
- `//` prefix + ALL CAPS mono nav links; active state: amber bottom border
- Palette toggle button (`◑`/`◐`) that toggles `[data-palette="paper"]` on `<html>`
- Mobile hamburger (`≡` / `×`) with slide-out menu
- Breadcrumb support

### R6 — Form components
- **Field** — label + input + optional hint/error wrapper
- **Input** — mono, sunken bg, focus → amber border, error state, disabled state
- **InputWrap** — icon prefix, addon prefix/suffix, clear (`×`) button
- **Textarea** / **Select** variants sharing the same `.input` base style

### R7 — Modal
- Dialog modal with header (`// TITLE` + `×` close), body, footer buttons
- Confirm/destructive variant with danger icon circle
- Backdrop overlay: `rgba(7,9,8,0.85)`
- SSR-safe: hidden until mounted (no `document` in render path)

### R8 — Pattern components
- **Alert** — left-border accent, 4 tones: `ok`, `amber`, `danger`, `info`; tag + title + message
- **CTA Block** — amber-bordered panel, eyebrow + name + desc + arrow link; subtle amber bg on hover
- **StatCard** — large mono number + label + sub-label; value color variants
- **KV List** — mono key/value rows with dashed rule separators; value color variants
- **Progress bar** — track + fill; fill colors: `ok`, `amber`, `danger`
- **Activity row** — timestamp + LED + message; dashed rule below
- **Section head** — hex number + title + optional right sub-label, bottom rule
- **Section foot** — ghost link left + faint meta right, top rule
- **Page hero** — eyebrow + large heading + optional sub paragraph

### R9 — Layout helpers (CSS only, no Svelte wrapper needed)
- `.container` / `.container-md` / `.container-sm` (max-width + responsive padding)
- `.rail-layout` + `.rail-sidebar` + `.rail-main`
- `.grid` + `.grid-1/2/3/4/auto`, `.split`, `.split-aside`
- `.stack` / `.stack-sm` / `.stack-lg`, `.inline`, `.spread`
- `.rule`, `.rule-dashed`, `.rule-strong`
- Padding helpers `.p-1…4`, surface helpers, border helpers, visibility helpers

### R10 — Accordion, Tabs, Table
- **Accordion** — expand/collapse rows; SSR-safe (no layout shift on hydration)
- **Tabs** — tab bar with active state (amber underline); panel switching
- **Table** — mono headers (ALL CAPS), faint header color, dashed row rules

### R11 — Palette toggle / theming
- Runtime toggle via `[data-palette="paper"]` on `<html>`
- Preference persisted to `localStorage` (SSR-safe: no server write)
- Svelte context or store for reactive palette state

## Constraints

- **SSR-compatible** — No `window` / `document` / `localStorage` in component render paths. Use `$effect` and the `browser` guard from `$app/environment`.
- **Accessible** — WCAG 2.1 AA: keyboard nav, correct ARIA roles, sufficient color contrast across both palettes.
- **No external UI primitives** — Pure custom components; no Bits UI, Radix, shadcn, etc.
- **Svelte 5 runes** — All components use `$state`, `$derived`, `$props`, `$bindable`. No Svelte 4 `export let`.
- **Strict TypeScript** — `strict: true` in `tsconfig.json`. Props extend the matching `HTMLXxxAttributes` type. No `any`, no `@ts-ignore`, no `as any` casts.
- **Chakra-style composability** — compound sub-components, polymorphic `as` prop, HTML attribute forwarding via `...rest` (see D4).
- **Clean HTML** — semantic elements, minimal nesting, no gratuitous wrapper divs.
- **No gradients on surfaces** — Flat opaque fills only (diagonal hatch bg is a pattern, not a gradient).
- **No emoji** — Iconography via unicode glyphs, CSS LEDs, and SVG logo only.

## Assumptions

- Fonts self-hosted via Fontsource npm packages (`@fontsource/inter-tight`, `@fontsource/jetbrains-mono`). No Google Fonts CDN. (See D3)
- Brand assets (logo.svg, dexter-monotone.svg, etc.) copied from the design bundle into `static/`.
- No npm package publishing initially — library consumed within SvelteKit via `$lib` path alias.

## Open questions

- [ ] Which of preview `21-components-misc.html` items need Svelte components vs. CSS-only?
- [ ] Scope for `22-layout-patterns.html` — full page layouts or just layout helpers?
