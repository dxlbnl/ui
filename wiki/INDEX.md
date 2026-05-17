# Wiki Index

**This wiki is the single source of truth for the project. It is the spec.**
Every agent reads this page first, before doing anything else.

## How the workflow uses this wiki

- The `manager` reads `backlog.md` to decide what to build next.
- `spec-writer` turns a backlog item into a detailed, testable page under `specs/`.
- `test-writer` writes failing tests from that spec page; `implementer` makes them pass;
  `reviewer` verifies the result against this wiki.
- When code and wiki disagree, the **wiki wins** — update the wiki (or run `/wiki-sync`).

## Pages

### Project & wiki

| Page | Purpose |
|------|---------|
| [vision.md](vision.md) | What the project is and why it exists. |
| [requirements.md](requirements.md) | Functional requirements and constraints. |
| [architecture.md](architecture.md) | Tech stack, structure, and key technical choices. |
| [backlog.md](backlog.md) | Prioritized work items with status and `review` flags. |
| [decisions.md](decisions.md) | Append-only decision log (ADR-style). |
| [progress.md](progress.md) | Append-only run journal — what the agents have done. |

### Reference & guides

| Page | Purpose |
|------|---------|
| [stories-guide.md](stories-guide.md) | How to write Svelte CSF stories with play functions for this project. |
| [composition-limits.md](composition-limits.md) | Svelte scoping constraints, the three workaround patterns, what remains in higher-order components post-B13. |
| [specs/](specs/) | One detailed spec page per feature. See `specs/README.md`. |

### Specs — Foundation & layout

| Page | Purpose |
|------|---------|
| [specs/B2-design-tokens.md](specs/B2-design-tokens.md) | B2 Design tokens + global CSS (Phosphor/Paper palettes, reset, typography classes). |
| [specs/B3-layout-components.md](specs/B3-layout-components.md) | B3 Layout components — `Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule` as Svelte 5 style-prop components. |
| [specs/B3-layout-helpers.md](specs/B3-layout-helpers.md) | B3 Layout helpers — superseded CSS-only approach (kept for reference). |

### Specs — Components

| Page | Purpose |
|------|---------|
| [specs/B4-primitive-components.md](specs/B4-primitive-components.md) | B4 Primitive components — Button (5 variants), Led (5 colors + blink), TagPill (3 variants). |
| [specs/B14-typography-primitives.md](specs/B14-typography-primitives.md) | B14 Typography primitives — `Text` (body/lede/mono/eyebrow variants, color prop) and `Heading` (level 1–6, display/hero/h1/h2/h3 variants). |
| [specs/B5-card-components.md](specs/B5-card-components.md) | B5 Card components — Card (base), ProductCard, ProjectCard, NoteCard. Diagonal hatch placeholder, amber footer/border hover, hex note IDs. |
| [specs/B6-navigation.md](specs/B6-navigation.md) | B6 Navigation — Nav component with palette toggle, mobile hamburger, active link state. |
| [specs/B17-navigation-enhancements.md](specs/B17-navigation-enhancements.md) | B17 Navigation enhancements — `Breadcrumb` (`aria-current="page"`), `AnimatedAccordion` CSS-only height transition via `interpolate-size`. |
| [specs/B7-form-components.md](specs/B7-form-components.md) | B7 Form components — `Input`, `Textarea`, `Select` (custom), `InputWrap` (icon/addon/clear), `Field` (label + a11y wiring). |
| [specs/B16-form-primitives.md](specs/B16-form-primitives.md) | B16 Form primitives — `Checkbox` (indeterminate/disabled), `Radio` + `RadioGroup` (roving tabindex), `Switch` (role=switch, SSR-safe). |
| [specs/B8-modal.md](specs/B8-modal.md) | B8 Modal — `Modal` dialog: header + body + footer; confirm/destructive variant with danger icon. Backdrop overlay, SSR-safe mount. |
| [specs/B9-pattern-components.md](specs/B9-pattern-components.md) | B9 Pattern components — `Alert`, `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`, `ActivityRow`, `SectionHead`, `SectionFoot`, `PageHero`. |
| [specs/B10-accordion-tabs-table.md](specs/B10-accordion-tabs-table.md) | B10 Data components — `Accordion` + `AccordionItem` (native `<details>`), `Tabs` (underline + pill, ARIA tabpanel), `Table` (mono headers, dashed rules). |
| [specs/B18-toast-notifications.md](specs/B18-toast-notifications.md) | B18 Toast notifications — `Toast` (ok/amber/danger), `ToastRegion` (fixed portal, SSR-safe), `toast` store API (`push`, `dismiss`). |
| [specs/B20-prose-component.md](specs/B20-prose-component.md) | B20 Prose component — `Prose` wrapper for dynamically-inserted markdown HTML; polymorphic `as` prop, `maxWidth` prop; palette switching. |

### Specs — Enhancements & refactors

| Page | Purpose |
|------|---------|
| [specs/B12-story-rewrite.md](specs/B12-story-rewrite.md) | B12 Story rewrite — add `component:` to `defineMeta`, props via `args`, shared `storybook-utils.ts`, remove null-checks and AC comments. |
| [specs/B13-composition-refactor.md](specs/B13-composition-refactor.md) | B13 Composition refactor — replace raw flex/grid CSS with `Stack`/`Inline`/`Spread`; replace raw `<button>` with `Button`. |
| [specs/B15-keyboard-navigation.md](specs/B15-keyboard-navigation.md) | B15 Keyboard navigation — ARIA Listbox for `Select`, ARIA Tabs for `Tabs` (ArrowLeft/Right, Home/End). WCAG 2.1 AA SC 2.1.1. |

### Specs — Documentation & packaging

| Page | Purpose |
|------|---------|
| [specs/B11-storybook-catalogue.md](specs/B11-storybook-catalogue.md) | B11 Storybook catalogue — consistency pass on key stories; token documentation stories (Color Palette, Typography Scale, Spacing Scale). |
| [specs/B19-package-documentation.md](specs/B19-package-documentation.md) | B19 Package documentation — `README.md`, `CHANGELOG.md` (v0.1.0), JSDoc on all exported props, version bump 0.0.1→0.1.0. |
| [specs/B21-ai-readable-docs.md](specs/B21-ai-readable-docs.md) | B21 AI-readable docs — ten Markdown files under `docs/` covering all exported components; props tables, usage examples, design rationale. |

> The wiki is **open-ended**. Only this `INDEX.md` is structurally required. Add, split,
> and restructure pages as the project grows — just link new pages in the relevant section above.

## Conventions

- **Adding a page**: create `wiki/<name>.md` (or `wiki/specs/<feature>.md`) and add a row
  to the Pages table above so it is discoverable.
- **Backlog status**: each item in `backlog.md` is `todo` / `in-progress` / `done`, with
  an optional `review` flag meaning "pause for user approval before implementing".
- **Spec pages**: live in `specs/`, one per feature, named after the backlog item. They
  must contain testable acceptance criteria — see `specs/README.md`.
- **Decisions**: when an agent makes a notable design/tech choice, it appends an entry to
  `decisions.md`.
- **Progress**: the `manager` appends to `progress.md` as items move through the
  pipeline, so the run is auditable.
