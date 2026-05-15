# Backlog

## How to read this file

Each item has a **status** and an optional **`review`** flag:

- `todo` — not started
- `in-progress` — currently being built
- `done` — reviewer passed and the full suite is green (one commit made)
- **`review`** — pause for user approval after the spec is written, before
  implementation. You add this flag; the `manager` may also auto-add it for risky,
  ambiguous, or architecturally significant items.

## Items

- [x] **B1: Project scaffold** — status: `done` — commit: `5c59008`
      SvelteKit + TypeScript, Storybook 10 (`@storybook/sveltekit`),
      `@storybook/addon-vitest` (tests = Story play functions, no separate `.test.ts`),
      `@storybook/addon-a11y`, `@storybook/addon-svelte-csf`. Folder structure:
      `src/lib/components/`, `src/lib/tokens/`, `src/lib/index.ts`, `.storybook/`.
      Brand assets in `static/`. `pnpm check` passes 0 errors.

- [x] **B2: Design tokens + global CSS** — status: `done`
      Implement both palettes (Phosphor dark + Paper light) as CSS custom properties,
      base reset, semantic element styles, typography classes (`.h1`–`.h3`,
      `.hero-heading`, `.display-heading`, `.body-text`, `.body-lede`, `.mono-label`,
      `.eyebrow`, `code`, `pre`). Source: `colors_and_type.css` from design bundle.

- [ ] **B3: Layout components** — status: `todo`
      Svelte layout primitives with style props (Chakra-style): `Stack`, `Inline`,
      `Spread`, `Grid`, `Container`, `Rule`. CSS scoped inside each component's
      `<style>` block — no global utility classes. One `.stories.svelte` per component.
      Source reference: `src/lib/tokens/layout.css`. Built after B4 atoms exist.

- [ ] **B4: Primitive components** — status: `in-progress` — flags: `review`
      Svelte components: `Button` (5 variants: primary, cta, ghost, back, del),
      `Led` (ok/amber/cyan/danger/off, blink animation), `TagPill` (default/amber/cyan).
      Full type props + Storybook stories. True visual atoms — built first.

- [ ] **B5: Card components** — status: `todo`
      `Card` (base), `ProductCard`, `ProjectCard`, `NoteCard`.
      Diagonal hatch placeholder, amber footer hover, hex note IDs, amber card hover.

- [ ] **B6: Navigation** — status: `todo` — flags: `review`
      `Nav` component: fixed top bar, mono ALL-CAPS links, active amber underline,
      palette toggle (◑/◐), mobile hamburger (≡/×), breadcrumb slot.
      Palette toggle persists preference to localStorage (SSR-safe).

- [ ] **B7: Form components** — status: `todo`
      `Field` (label + input + hint/error), `Input` (base input: focus/error/disabled),
      `InputWrap` (icon prefix, addon, clear button), `Textarea`, `Select`.

- [ ] **B8: Modal** — status: `todo`
      `Modal` dialog: header + body + footer; confirm/destructive variant with
      danger icon. Backdrop overlay, SSR-safe mount.

- [ ] **B9: Pattern components** — status: `todo`
      `Alert` (ok/amber/danger/info), `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`,
      `ActivityRow`, `SectionHead`, `SectionFoot`, `PageHero`.

- [ ] **B10: Accordion, Tabs, Table** — status: `todo`
      `Accordion` (expand/collapse, SSR-safe), `Tabs` (amber active underline, panel switching),
      `Table` (mono headers, dashed row rules).

- [ ] **B11: Storybook catalogue** — status: `todo`
      Storybook stories for every component (all variants + states).
      Token documentation stories (color swatches, type scale, spacing).
      Mirrors the 22 preview HTML files from the design bundle.
