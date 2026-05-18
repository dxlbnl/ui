# Wiki Index

**This wiki is the single source of truth for the project. It is the spec.**
Every agent reads this page first, before doing anything else.

## How the workflow uses this wiki

- The `manager` reads `backlog/` to decide what to build next, dispatching on each
  item's `type:` (feature / bug / research / chore).
- `spec-writer` turns a feature/bug backlog item into a testable spec page under
  `specs/`.
- `test-writer` writes failing tests from that spec page; `implementer` makes them
  pass; `reviewer` verifies the result against this wiki.
- When code and wiki disagree, the **wiki wins** — update the wiki (or run `/wiki-sync`).

## Pages

| Page                               | Purpose                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| [vision.md](vision.md)                         | What the project is and why it exists.                                                      |
| [requirements.md](requirements.md)             | Functional requirements and constraints.                                                    |
| [architecture.md](architecture.md)             | Tech stack, package manager, test setup, structure.                                         |
| [stories-guide.md](stories-guide.md)           | How to write Storybook stories — the only test artefact in this project.                    |
| [composition-limits.md](composition-limits.md) | Svelte scoped-CSS boundary: known limits, workarounds, rationale for typography primitives. |
| [backlog/](backlog/)                           | Work items, arranged in four lanes (inbox → ready → doing → done). See `backlog/README.md`. |
| [decisions.md](decisions.md)                   | Append-only decision log (ADR-style).                                                       |
| [progress.md](progress.md)                     | Append-only run journal — what the agents have done.                                        |
| [specs/](specs/)                               | One detailed spec page per feature/bug. See `specs/README.md`.                              |
| [specs/B26-typography-size-prop.md](specs/B26-typography-size-prop.md) | Spec: `size` and `case` props on Text/Heading; scoped CSS; 15 caller migrations. |
| [specs/B27-layout-style-prop-cleanup.md](specs/B27-layout-style-prop-cleanup.md) | Spec: `align` prop on Inline + scoped CSS pass across 9 components; eliminates all remaining layout `style=` overrides. |
| [specs/B28-nav-overhaul.md](specs/B28-nav-overhaul.md) | Spec: Nav overhaul — `<Breadcrumb>` in brand area, new `Button variant="nav"`, `<details>` mobile menu, ink-faint toggle, 720px breakpoint, absolute dropdown. |
| [specs/B29-checkbox-visual-jump.md](specs/B29-checkbox-visual-jump.md) | Spec: Fix layout shift on toggle (fixed-size indicator) + illegible checkmark; regression story AC-4. |
| [specs/B31-select-design.md](specs/B31-select-design.md) | Spec: Fix amber panel border + audit trigger token rules; 2 new token-assertion stories. |
| [specs/B33-font-realignment.md](specs/B33-font-realignment.md) | Spec: Modal title → Heading h3 style (24 px, sans); remove size prop from Heading.svelte; caller audit. |
| [specs/B30-input-chrome-fixes.md](specs/B30-input-chrome-fixes.md) | Spec: Hide number spin buttons; clear-button color → ink-dim; icon SVG fill → currentColor; 10 ACs. |
| [specs/B36-pagehero-snippet-heading.md](specs/B36-pagehero-snippet-heading.md) | Spec: PageHero — `headingContent` snippet prop, `:global(.hero-heading em)` ink-faint rule, `border` prop; 9 ACs. |
| [specs/B32-switch-fixes.md](specs/B32-switch-fixes.md) | Spec: Switch — off-state border `--rule` fix (dark mode visibility) + label-click toggle; 9 ACs, extends existing stories only. |
| [specs/B34-modal-close-button.md](specs/B34-modal-close-button.md) | Spec: Modal header flex fix — close button flush right; `justify-content: space-between` on `.modal-header`; 7 ACs, no new stories. |
| [design-system-audit.md](design-system-audit.md) | Audit: OG flat-CSS vs Svelte implementation — token alignment, component drifts, missing pieces. |
| [research/B33-token-diff.md](research/B33-token-diff.md) | Research: B33 — token diff (colors_and_type.css vs tokens.css) + Modal/Text/Heading size-prop audit. |

> The wiki is **open-ended**. Only this `INDEX.md` is structurally required. Add, split,
> and restructure pages as the project grows — just link new pages in the table above.

## Conventions

- **Adding a page**: create `wiki/<name>.md` (or `wiki/specs/<feature>.md`) and add a row
  to the Pages table above so it is discoverable. Unlinked pages are invisible.
- **Backlog items**: live as per-item files under `wiki/backlog/<lane>/B<n>-<slug>.md`.
  Lane = directory (no `status:` field). Each item has a `type:` (feature / bug /
  research / chore) and an optional `flags:` list (`review` to pause for approval,
  `blocked` if stuck). File new work with `/intake`; see `backlog/README.md`.
- **Spec pages**: live in `specs/`, one per feature/bug, named after the backlog item
  (e.g. `B3-user-login.md`). They must contain testable acceptance criteria — see
  `specs/README.md`.
- **Decisions**: when an agent makes a notable design/tech choice, it appends an entry to
  `decisions.md`.
- **Progress**: the `manager` appends to `progress.md` as items move through the
  pipeline, so the run is auditable.
