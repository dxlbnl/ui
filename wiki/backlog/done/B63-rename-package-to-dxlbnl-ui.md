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

## Outcome (2026-06-15)
Done. Swapped `dxlb-design` → `@dxlbnl/ui` across `README.md` + all 10 `docs/*.md`
(H1 titles, install/workspace snippets, every `import … from '@dxlbnl/ui'`, the
single-entry-point and prose mentions). **CSS subpath bug found and fixed:** the real
`package.json` `exports` map publishes the CSS under `./tokens/tokens.css` and
`./tokens/typography.css`, so the canonical imports are `@dxlbnl/ui/tokens/tokens.css`
and `@dxlbnl/ui/tokens/typography.css`. `README.md` already used the `/tokens/`
subpath (only needed the scope swap), but `docs/index.md` had the wrong flat paths
(`dxlb-design/tokens.css` / `typography.css`) — corrected to the subpathed form. The
local-path install example became `../path/to/dxlb-ui` (the repo dir). Verified zero
`dxlb-design` references remain in `README.md`/`docs/`. Out of scope and left as-is:
wiki history references, the `B33` filesystem path, and README's stale component table
(component-list drift, not name alignment).
