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

| Page | Purpose |
|------|---------|
| [vision.md](vision.md) | What the project is and why it exists. |
| [requirements.md](requirements.md) | Functional requirements and constraints. |
| [architecture.md](architecture.md) | Tech stack, structure, and key technical choices. |
| [backlog.md](backlog.md) | Prioritized work items with status and `review` flags. |
| [decisions.md](decisions.md) | Append-only decision log (ADR-style). |
| [progress.md](progress.md) | Append-only run journal — what the agents have done. |
| [specs/](specs/) | One detailed spec page per feature. See `specs/README.md`. |
| [specs/B2-design-tokens.md](specs/B2-design-tokens.md) | Spec: B2 Design tokens + global CSS (Phosphor/Paper palettes, reset, typography classes). |
| [specs/B3-layout-helpers.md](specs/B3-layout-helpers.md) | Spec: B3 Layout helpers — superseded CSS-only approach (kept for reference). |
| [specs/B3-layout-components.md](specs/B3-layout-components.md) | Spec: B3 Layout components — `Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule` as Svelte 5 style-prop components. |
| [stories-guide.md](stories-guide.md) | How to write Svelte CSF stories with play functions for this project. |
| [specs/B4-primitive-components.md](specs/B4-primitive-components.md) | Spec: B4 Primitive components — Button (5 variants), Led (5 colors + blink), TagPill (3 variants). |
| [specs/B5-card-components.md](specs/B5-card-components.md) | Spec: B5 Card components — Card (base), ProductCard, ProjectCard, NoteCard. Diagonal hatch placeholder, amber footer/border hover, hex note IDs. |
| [specs/B6-navigation.md](specs/B6-navigation.md) | Spec: B6 Navigation — Nav component with palette toggle, mobile hamburger, active link state. |
| [specs/B12-story-rewrite.md](specs/B12-story-rewrite.md) | Spec: B12 Story rewrite — add `component:` to `defineMeta`, props via `args`, shared `storybook-utils.ts`, remove null-checks and AC comments. |
| [specs/B7-form-components.md](specs/B7-form-components.md) | Spec: B7 Form components — `Input`, `Textarea`, `Select` (custom), `InputWrap` (icon/addon/clear), `Field` (label + a11y wiring). |
| [specs/B8-modal.md](specs/B8-modal.md) | Spec: B8 Modal — `Modal` dialog: header + body + footer; confirm/destructive variant with danger icon. Backdrop overlay, SSR-safe mount. |
| [specs/B9-pattern-components.md](specs/B9-pattern-components.md) | Spec: B9 Pattern components — `Alert`, `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`, `ActivityRow`, `SectionHead`, `SectionFoot`, `PageHero`. |
| [specs/B10-accordion-tabs-table.md](specs/B10-accordion-tabs-table.md) | Spec: B10 Data components — `Accordion` + `AccordionItem` (native `<details>`, SSR-safe), `Tabs` (underline + pill variants, amber active, ARIA tabpanel), `Table` (mono headers, dashed row rules, snippet rows). |
| [specs/B11-storybook-catalogue.md](specs/B11-storybook-catalogue.md) | Spec: B11 Storybook catalogue — consistency pass on Spread, Rule, Card, ProjectCard, CtaBlock, Modal, Table stories; token documentation stories (Color Palette, Typography Scale, Spacing Scale). |
| [specs/B13-composition-refactor.md](specs/B13-composition-refactor.md) | Spec: B13 Composition refactor — replace raw flex/grid CSS in all higher-order components with `Stack`, `Inline`, `Spread` layout primitives; replace raw `<button>` elements with `Button`. Exceptions: `AccordionItem`, `Table`, `Card.svelte`. |
| [composition-limits.md](composition-limits.md) | Reference: Svelte scoping constraints, the three workaround patterns, what remains in higher-order components post-B13, and what B14 Text+Heading will resolve. |
| [specs/B14-typography-primitives.md](specs/B14-typography-primitives.md) | Spec: B14 Typography primitives — `Text` (body/lede/mono/eyebrow variants, color prop) and `Heading` (level 1–6, display/hero/h1/h2/h3 variants). Zero-CSS wrappers around existing global type classes. |
| [specs/B15-keyboard-navigation.md](specs/B15-keyboard-navigation.md) | Spec: B15 Keyboard navigation — ARIA Listbox pattern for `Select` (ArrowDown/Up, Home/End, Enter, aria-activedescendant) and ARIA Tabs pattern for `Tabs` (ArrowLeft/Right, Home/End, automatic activation). WCAG 2.1 AA SC 2.1.1 compliance. |
| [specs/B16-form-primitives.md](specs/B16-form-primitives.md) | Spec: B16 Form primitives — `Checkbox` (checked/indeterminate/disabled, amber accent), `Radio` + `RadioGroup` (exclusive selection, arrow-key nav, roving tabindex), `Switch` (role=switch, amber track when on, SSR-safe). `Field` enhancement: auto-inject `aria-invalid` + `aria-describedby` via Svelte context. |
| [specs/B17-navigation-enhancements.md](specs/B17-navigation-enhancements.md) | Spec: B17 Navigation enhancements — `Breadcrumb` component (`<nav aria-label="breadcrumb">`, `<ol>`, `aria-current="page"` on last crumb, separators `aria-hidden`); `AnimatedAccordion` CSS-only height transition on `AccordionItem` via `interpolate-size: allow-keywords`, `@starting-style`, and `@supports` guard. |
| [specs/B18-toast-notifications.md](specs/B18-toast-notifications.md) | Spec: B18 Toast notifications — `Toast` (ok/amber/danger, role=status/alert, close button), `ToastRegion` (fixed viewport portal, SSR-safe via `$effect`, configurable corner + stack limit + auto-dismiss), `toast` store API (`push`, `dismiss`). |
| [specs/B20-prose-component.md](specs/B20-prose-component.md) | Spec: B20 Prose component — `Prose` wrapper that styles dynamically-inserted markdown HTML via `.prose :global(element)` CSS; polymorphic `as` prop (default `article`), `maxWidth` prop (default `72ch`); all 34 ACs cover h1–h4, p, a, ul/ol/li, code, pre, blockquote, table, img, hr, and palette switching. |
| [specs/B21-ai-readable-docs.md](specs/B21-ai-readable-docs.md) | Spec: B21 AI-readable docs — ten hand-written Markdown files under `docs/` covering all exported components; props tables, usage examples, design rationale; mdsvex-renderable; accurate to source `.svelte` files; prerequisite: B15–B20 complete. |
| [specs/B19-package-documentation.md](specs/B19-package-documentation.md) | Spec: B19 Package documentation — `README.md` (install, peer deps, CSS import, palette setup, usage example, Storybook link), `CHANGELOG.md` (Keep a Changelog, v0.1.0, B1–B14), JSDoc `@param`/`@default` on all exported component props, version bump 0.0.1→0.1.0. |

> The wiki is **open-ended**. Only this `INDEX.md` is structurally required. Add, split,
> and restructure pages as the project grows — just link new pages in the table above.

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
