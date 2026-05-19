---
name: wiki-sync
description: Reconcile the wiki with the current code. Detects where the implementation has diverged from the wiki and updates the wiki pages (or flags the divergence for a decision). Use after significant code changes, or when the PostToolUse reminder fires, or when the user asks to "sync the wiki".
disable-model-invocation: false
---

# Sync the wiki with the code

The wiki is the source of truth — but implementation sometimes reveals that the wiki was
wrong, incomplete, or has been outgrown. This skill closes that gap **deliberately**, so
the wiki stays trustworthy.

## STEP 0 — read the wiki

Read `wiki/INDEX.md` and the pages relevant to the area that changed.

## Procedure

1. **Find the divergence** — compare the current code against the relevant wiki pages
   (`requirements.md`, `architecture.md`, the affected `wiki/specs/` pages). Look for:
   behaviour the code has that the wiki does not describe; wiki statements the code no
   longer satisfies; structural drift from `architecture.md`.
2. **Classify each gap**:
   - **Code is right, wiki is stale** → update the wiki page to match reality.
   - **Wiki is right, code drifted** → this is a defect; do not edit the wiki to hide
     it. Add a backlog item (or flag it) so it goes through the pipeline.
   - **Genuine decision** → the change was intentional and significant → append an
     entry to `wiki/decisions.md` and update the affected pages.
3. **Update `INDEX.md`** if pages were added or restructured.
4. **Size guardrails** — flag for the user when any of these thresholds is crossed,
   so token cost on every agent turn stays bounded:
   - `wiki/decisions.md` Standing Rules table > 12 rows (scannability collapses past
     that — promote sparingly).
   - `wiki/INDEX.md` Pages table > 15 rows (the "spec/research pages do not get rows"
     rule is probably being violated).
   - `wiki/progress.md` > 1000 lines (consider splitting older entries to
     `progress-archive-<YYYY>.md`).
   - Any spec page > 600 lines (signals the item was too big for one cycle — see
     `wiki/specs/README.md` Length budget).
   - Any backlog card > 80 lines (signals spec-grade detail leaked into the card —
     see `wiki/backlog/README.md` Card discipline).
5. **Report** what changed in the wiki and what was turned into backlog work.

## Rules

- Never edit the wiki just to make a failing reality "look consistent". The wiki must
  stay an honest spec.
- Prefer small, precise edits to the specific pages over rewrites.
- If unsure whether code or wiki is "right", surface it — do not guess.
