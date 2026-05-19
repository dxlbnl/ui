# Specs

Detailed feature specs live here — **one page per feature**, created and refined by the
`spec-writer` agent from a `backlog.md` item. These are wiki pages, not a separate source
of truth: the wiki *is* the spec.

Each spec page is named after its backlog item (e.g. `B1-user-login.md`) and linked from
`../INDEX.md`.

## Spec page format

```
# B<n>: <feature title>

## Context
<why this feature exists; link to the relevant wiki pages>

## Acceptance criteria
<numbered, TESTABLE statements — these map directly to tests>
1. ...
2. ...

## Out of scope
<what this feature deliberately does not cover>

## Open questions
<anything unresolved; if blocking, the item should be flagged `review` in backlog.md>
```

## Length budget

Specs are read by every downstream agent (test-writer, implementer, reviewer) and by
the spec-writer when a new spec cross-references them. Keep them tight.

- **Routine item**: target ≤ 300 lines. Most bug fixes and single-component features
  fit here.
- **Major multi-component item**: target ≤ 600 lines. Cross-cutting refactors, new
  component clusters.
- **Hard ceiling**: 600 lines. If a spec is heading past that, stop and ask the manager
  whether to split the item. A spec that big usually means the work itself is too large
  for one pipeline cycle.

Once the implementation lands, do **not** retroactively edit the spec to reflect what
was built — that's `wiki-sync`'s job for ongoing pages, not specs. But do **prune
resolved open questions** when the spec-writer revises a spec mid-cycle: an OQ that
has been answered belongs in `## Notes` of the item card or in a `decisions.md` entry,
not lingering in the spec.

## The contract

The acceptance criteria are the contract: `test-writer` turns each one into failing
tests, `implementer` makes them pass, `reviewer` checks every criterion is met.
