---
id: B63
title: Align human-facing docs to the @dxlbnl/ui package name
type: chore
priority: medium
created: 2026-06-15
---

## Description
The published package is `@dxlbnl/ui` (per `package.json`), but the README and `docs/`
still say `dxlb-design` everywhere — the `# dxlb-design` README title, the
`pnpm add dxlb-design` install snippet, every `import { … } from 'dxlb-design'`, and the
`dxlb-design/tokens.css` / `typography.css` CSS import paths. Copy-paste examples are
therefore broken for consumers. Align all human-facing docs to the real package identity.

## Notes
- Scope: `README.md` + `docs/*.md` (index.md install + every import group, and each
  per-component usage example). Source code + barrel already use `@dxlbnl/ui`.
- Don't blind-swap the scope on subpath imports: confirm the real CSS subpaths from the
  `package.json` `exports` map (e.g. is it `@dxlbnl/ui/tokens.css` or `@dxlbnl/ui/tokens/tokens.css`?)
  and fix the docs to match what's actually published.
- Pure docs alignment — no code change, no test impact.
- Surfaced during the v1.2.0 documentation pass (CHANGELOG + component docs).
