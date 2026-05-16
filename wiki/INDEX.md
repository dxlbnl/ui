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
