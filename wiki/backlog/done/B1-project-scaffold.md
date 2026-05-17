---
id: B1
title: Project scaffold
type: chore
priority: high
flags: []
created: 2026-05-15
---

## Description
Bootstrap the SvelteKit + TypeScript project with Storybook 10, the vitest addon, a11y addon, and svelte-csf addon. Establish the folder structure and brand assets so the component pipeline has a working foundation.

## Notes
- commit: `5c59008`
- SvelteKit + TypeScript, Storybook 10 (`@storybook/sveltekit`), `@storybook/addon-vitest` (tests = Story play functions, no separate `.test.ts`), `@storybook/addon-a11y`, `@storybook/addon-svelte-csf`.
- Folder structure: `src/lib/components/`, `src/lib/tokens/`, `src/lib/index.ts`, `.storybook/`. Brand assets in `static/`. `pnpm check` passes 0 errors.
