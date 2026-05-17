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

- [x] **B3: Layout components** — status: `done` — commit: `71a3e1c`
      Svelte layout primitives with style props (Chakra-style): `Stack`, `Inline`,
      `Spread`, `Grid`, `Container`, `Rule`. CSS scoped inside each component's
      `<style>` block — no global utility classes. One `.stories.svelte` per component.
      Source reference: `src/lib/tokens/layout.css`. Built after B4 atoms exist.

- [x] **B4: Primitive components** — status: `done` — commit: `8fffee3`
      Svelte components: `Button` (5 variants: primary, cta, ghost, back, del),
      `Led` (ok/amber/cyan/danger/off, blink animation), `TagPill` (default/amber/cyan).
      Full type props + Storybook stories. True visual atoms — built first.

- [x] **B5: Card components** — status: `done` — commit: `ba50c32`
      `Card` (base), `ProductCard`, `ProjectCard`, `NoteCard`.
      Diagonal hatch placeholder, amber footer hover, hex note IDs, amber card hover.

- [x] **B6: Navigation** — status: `done` — commit: `1340c58`
      `Nav` component: fixed top bar, mono ALL-CAPS links, active amber underline,
      palette toggle (◑/◐), mobile hamburger (≡/×), breadcrumb slot.
      Palette toggle persists preference to localStorage (SSR-safe).

- [x] **B7: Form components** — status: `done` — commit: `49b5b37`
      `Field` (label + input + hint/error), `Input` (base input: focus/error/disabled),
      `InputWrap` (icon prefix, addon, clear button), `Textarea`, `Select`.

- [x] **B8: Modal** — status: `done` — commit: `5d228c4`
      `Modal` dialog: header + body + footer; confirm/destructive variant with
      danger icon. Backdrop overlay, SSR-safe mount.

- [x] **B9: Pattern components** — status: `done` — commit: `93b5f56`
      `Alert` (ok/amber/danger/info), `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`,
      `ActivityRow`, `SectionHead`, `SectionFoot`, `PageHero`.

- [x] **B10: Accordion, Tabs, Table** — status: `done` — commit: `37329dc`
      `Accordion` (expand/collapse, SSR-safe), `Tabs` (amber active underline, panel switching),
      `Table` (mono headers, dashed row rules).

- [x] **B12: Story rewrite** — status: `done` — commit: `8158dff`
      Rewrite all `.stories.svelte` files to match the updated stories-guide pattern:
      `component:` in `defineMeta`, props via story `args`, slot for children only,
      inline play functions, accessible queries over `getByTestId`.
      Affects: B2 token stories, B3 layout stories, B4 primitive stories, B5 card stories.

- [x] **B13: Composition refactor** — status: `done` — commit: `038ed7e`
      Replace all raw flex/grid layout CSS in higher-order components with Stack, Inline,
      Spread layout primitives. Replace all raw `<button>` elements with the Button primitive
      (ARIA attributes forward via `{...rest}`). Affects: all pattern, card, nav, feedback,
      form, and data components. Exceptions: AccordionItem (`<summary>` semantic), Table
      (semantic table HTML), Card.svelte (base card primitive).

- [x] **B11: Storybook catalogue** — status: `done` — commit: `8b47cb2`
      Combined consistency pass + visual catalogue:
      (1) Fill coverage gaps in existing stories (Spread, Rule, Card, ProjectCard, CtaBlock,
      Modal confirm/destructive in main file), deepen shallow play functions, remove AC
      code comments from Table stories.
      (2) Add token documentation stories (color swatches, type scale, spacing).
      (3) Bring every component to full variant/state coverage.

- [x] **B14: Typography primitives** — status: `done`
      `Text` (variant: body/lede/mono/eyebrow, color prop maps to design tokens, polymorphic
      `as` prop) and `Heading` (level: 1–6, variant: display/hero/h1/h2/h3, same color prop).
      Zero-CSS components: wrap existing global typography classes from `typography.css`.
      Enables higher-order components to eliminate their scoped typography CSS entirely.

- [x] **B15: Keyboard navigation** — status: `done`
      Full ARIA keyboard patterns for the two interactive widgets that currently lack them.
      `Select`: arrow keys cycle options, Home/End jump to first/last, Escape closes, Enter
      confirms — completing the ARIA listbox pattern (WAI-ARIA 1.2 § Listbox). `Tabs`:
      left/right arrow moves focus between tabs and activates the target panel, Home/End
      jump to first/last — completing the WAI-ARIA tabpanel pattern. Both are WCAG 2.1 AA
      requirements for publicly distributed components.

- [x] **B16: Form primitives** — status: `done`
      Boolean and selection controls missing from the current form layer.
      `Checkbox` (checked/indeterminate/disabled, linked label, design-token accent), `Radio`
      + `RadioGroup` (exclusive selection, keyboard arrow-key nav within group), `Switch`
      (toggle boolean, amber when on, SSR-safe). `Field` enhancement: auto-inject
      `aria-invalid` and `aria-describedby` from its `error` prop so consumers get correct
      ARIA wiring without manual plumbing.

- [x] **B17: Navigation enhancements** — status: `done` — commit: `180790d`
      Two deferred navigation features. `Breadcrumb`: a `<nav aria-label="breadcrumb">`
      component that renders a list of `{ label, href }` crumbs with `aria-current="page"`
      on the last item; designed for the slot already present in `Nav`. `AnimatedAccordion`:
      smooth height transition on `AccordionItem` open/close using CSS `interpolate-size:
      allow-keywords` with a `@starting-style` fallback; gated behind `@supports` so the
      native `<details>` fallback remains instant on unsupported browsers.

- [x] **B18: Toast notifications** — status: `done` — commit: `eefc8b5`
      A transient notification system: `Toast` component (icon + message, ok/amber/danger
      variants, auto-dismiss after N seconds, manual close button) rendered in a
      `ToastRegion` portal anchored to a corner of the viewport. SSR-safe (region mounts
      client-side via `$effect`). ARIA: `role="status"` for ok/amber, `role="alert"` for
      danger. Distinct from `Alert` (which is static and inline). Stack of up to N toasts;
      oldest dismissed first when limit is exceeded.

- [x] **B20: Prose component** — status: `done` — commit: `fe54444`
      A `Prose` wrapper component that applies design-system typography to raw HTML
      rendered by mdsvex (or any markdown processor). Targets dynamically inserted child
      elements via `.prose :global(element)` — Svelte's scoped CSS cannot reach markdown
      children otherwise. Polymorphic `as` prop (default `article`). All styles use design
      tokens so both Phosphor and Paper palettes work automatically.
      Elements styled: `h1`–`h4` (typography classes from tokens), `p` (body-text spacing),
      `a` (ink-faint, amber hover, no underline by default), `ul`/`ol`/`li` (list-style,
      indent), `code` (inline mono, bg-rail pill), `pre`/`pre code` (block mono, bg-sunken,
      border: rule, padding — reusing shiki token vars for syntax highlights), `blockquote`
      (amber left border, ink-dim text, italic), `table`/`th`/`td` (mirrors Table component
      styles: mono headers, dashed row rules), `img` (max-width 100%, border: rule),
      `hr` (matches Rule component). Max prose width ~72ch. Gap between block elements
      via adjacent-sibling selectors or `> * + *` spacing.

- [x] **B21: AI-readable docs** — status: `done` — commit: `pending`
      Markdown documentation in `docs/` — machine-parseable by AI assistants and renderable
      by mdsvex on a future documentation site. Storybook covers interactive/visual reference;
      `docs/` covers prop tables, usage examples, and design rationale in plain text.
      Files: `docs/index.md` (overview, install, palette setup), `docs/design-tokens.md`
      (full token reference with values for both palettes), `docs/layout.md`,
      `docs/primitives.md`, `docs/cards.md`, `docs/navigation.md`, `docs/forms.md`,
      `docs/feedback.md`, `docs/patterns.md`, `docs/data.md`. Each file: component purpose,
      props table (name / type / default / description), minimal usage example, notable
      behaviour. No generated content — hand-written, accurate to the source.

- [ ] **B22: Modal story improvements** — status: `todo`
      The current Modal stories all render with `open: true`, which causes the Storybook
      docs page to open multiple overlapping modals at once. Each story should instead show
      a trigger `<Button>` that opens the modal, so the docs page is clean and the interaction
      is realistic. Escape-to-close is unreliable in the play function context because the
      `<dialog>` element may not have focus — the play function should click the trigger to open
      first, verify open state, then test close paths. The `open` prop default should stay
      `false`; the story manages state internally via `$state`.

- [ ] **B23: CSS audit fixes** — status: `todo`
      Three issues surfaced by the post-B13 composition review.
      (1) **NoteCard hover** — `:global(.note-card:hover)` must be `:global(.note-card):hover`
      so the pseudo-class is handled by the browser, not escaped into the global scope;
      remove the `!important` (Card's border specificity doesn't require it with the correct selector).
      (2) **Nav hamburger-wrap** — `.hamburger-wrap { display: flex; align-items: center }` on mobile
      can simplify to `display: block`; the parent Inline already handles vertical alignment.
      (3) **CtaBlock redundant override** — `align-items: center` on the Spread's `style=` prop
      is redundant (Spread already sets it); remove it.

- [ ] **B19: Package documentation** — status: `todo`
      Minimum viable documentation for the library. `README.md`: installation (`pnpm add
      dxlb-design`), peer deps, global CSS import, usage example, Storybook link. `CHANGELOG.md`:
      starting from v0.1.0, covering B1–B14. JSDoc `@param` / `@default` annotations on
      exported component props (feeds Storybook autodocs). Version bump from 0.0.1 → 0.1.0
      in `package.json` once B13 is confirmed stable.

- [ ] **B24: Style prop cleanup** — status: `todo`
      Eliminate excessive inline `style=` props introduced during B13–B14. Two classes of
      fix: (1) use correct Heading `variant` so typography overrides collapse to one prop;
      (2) replace multi-prop `style=` on layout primitives acting as containers with scoped
      HTML elements + scoped CSS. No `:global()` to be introduced. Spec writer to detail
      scope and acceptance criteria.
