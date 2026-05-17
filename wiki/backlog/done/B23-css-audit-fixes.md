---
id: B23
title: CSS audit fixes
type: bug
priority: medium
flags: []
created: 2026-05-17
---

## Description
Three issues surfaced by the post-B13 composition review. NoteCard hover selector was incorrectly escaped. Nav hamburger-wrap had redundant flex alignment. CtaBlock had a redundant `align-items: center` override on the Spread style prop.

## Notes
- commit: `6391d17`
- NoteCard: `:global(.note-card:hover)` → `:global(.note-card):hover`; removed `!important`.
- Nav: `.hamburger-wrap { display: flex; align-items: center }` → `display: block`.
- CtaBlock: removed redundant `align-items: center` from Spread `style=` prop.
