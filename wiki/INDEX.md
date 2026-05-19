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
| [decisions.md](decisions.md)                   | Decision log — Standing Rules (curated cross-cutting) + Archive (append-only full ADRs).    |
| [progress.md](progress.md)                     | Append-only run journal — what the agents have done.                                        |
| [specs/](specs/)                               | Detailed spec pages, one per feature/bug item. Discovered via the item card's `spec:` frontmatter; see `specs/README.md`. |
| [research/](research/)                         | Research notes, one per research item. Discovered via the item card's `report:` frontmatter. |
| [design-system-audit.md](design-system-audit.md) | Audit: OG flat-CSS vs Svelte implementation — token alignment, component drifts, missing pieces. |

> The wiki is **open-ended**. Only this `INDEX.md` is structurally required. Add, split,
> and restructure pages as the project grows — just link new pages in the table above.

## Conventions

- **Adding a page**: create `wiki/<name>.md` and add a row to the Pages table above so it
  is discoverable. **Spec and research pages do NOT need INDEX rows** — the `specs/` and
  `research/` directory links cover them; the item card's `spec:` (or `report:`)
  frontmatter is the canonical pointer to a spec or research note. Only add INDEX rows
  for top-level wiki documents (vision, requirements, architecture, audits, cross-cutting
  summaries).
- **Backlog items**: live as per-item files under `wiki/backlog/<lane>/B<n>-<slug>.md`.
  Lane = directory (no `status:` field). Each item has a `type:` (feature / bug /
  research / chore) and an optional `flags:` list (`review` to pause for approval,
  `blocked` if stuck). File new work with `/intake`; see `backlog/README.md`.
- **Spec pages**: live in `specs/`, one per feature/bug, named after the backlog item
  (e.g. `B3-user-login.md`). They must contain testable acceptance criteria — see
  `specs/README.md`.
- **Decisions**: when an agent makes a notable design/tech choice, it appends an entry to
  the **Archive** section of `decisions.md`. Promotion to **Standing Rules** is a
  deliberate user/manager call, never an agent's.
- **Progress**: the `manager` appends to `progress.md` as items move through the
  pipeline, so the run is auditable.
