# Architecture

## Tech stack

- **Language**: TypeScript
- **Runtime / platform**: SvelteKit (Node.js / Vite)
- **Key frameworks / libraries**:
  - Svelte 5 (runes API) — component authoring
  - SvelteKit — project structure, SSR scaffold, dev server
  - Storybook 10.4.0 (`@storybook/sveltekit`) — visual dev, documentation, and the
    **primary test harness**
  - `@storybook/addon-vitest` 10.4.0 — runs Story play functions as Vitest browser-mode tests
  - `@storybook/addon-a11y` — accessibility auditing in the browser panel
  - `@storybook/addon-svelte-csf` — enables `.stories.svelte` format alongside `.stories.ts`
  - `@fontsource/inter-tight` + `@fontsource/jetbrains-mono` — self-hosted fonts (no Google CDN)
  - Pinned exact versions: Storybook 10.4.0, Vitest 4.1.6, `@vitest/browser-playwright` 4.1.6

## Test setup

- **Test runner**: `@storybook/addon-vitest` (Vitest browser mode, driven by Story
  play functions)
- **Test command**: `pnpm test` (runs `vitest` — `test.projects` defined inline in `vite.config.ts`)
- **Test file location / naming**: `src/lib/components/<category>/<Name>.stories.svelte`
  (Svelte CSF format via `@storybook/addon-svelte-csf` — one stories file per component,
  no separate `.test.ts` files)
- **What a "test" is**: a `<Story>` with a `play` prop that uses `@storybook/test`
  interactions and `expect` assertions. The play function also powers the Storybook
  interaction panel and the a11y addon.

> There are **no** `*.test.ts` files. Tests are Story play functions only.
> The `test-writer` agent writes Stories with `play` functions; the `implementer`
> makes them pass via `@storybook/addon-vitest`.

## Project structure

```
src/
  lib/
    tokens/
      tokens.css           # CSS custom properties — both palettes
      typography.css        # Typography classes + base element styles
      layout.css            # Layout helpers
      patterns.css          # Pattern component CSS
    components/
      primitives/           # Button, Led, TagPill
        Button.svelte
        Button.stories.svelte
        Led.svelte
        Led.stories.svelte
        TagPill.svelte
        TagPill.stories.svelte
      cards/                # Card, ProductCard, ProjectCard, NoteCard
      navigation/           # Nav
      forms/                # Field, Input, InputWrap, Textarea, Select
      feedback/             # Alert, Modal
      patterns/             # StatCard, KvList, CtaBlock, ProgressBar,
                            #   ActivityRow, SectionHead, SectionFoot, PageHero
      data/                 # Accordion, Tabs, Table
    index.ts                # Package barrel export

  routes/
    +layout.svelte           # Imports app.css globally
    +page.svelte

  app.css                    # @imports all token CSS files + Fontsource fonts

static/
  logo.svg
  logo.png
  dexter-monotone.svg
  dexter.png

.storybook/
  main.ts                   # @storybook/sveltekit framework + addon list
  preview.ts                # Global CSS import + a11y + backgrounds config
```

## Component authoring conventions (Chakra-style)

Every component follows these rules. Agents must not deviate.

```ts
// Example: Button.svelte
<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'

  type Variant = 'primary' | 'cta' | 'ghost' | 'back' | 'del'

  interface Props extends HTMLButtonAttributes {
    as?: string           // polymorphic element — defaults to 'button'
    variant?: Variant
  }

  let { as = 'button', variant = 'primary', children, ...rest }: Props = $props()
</script>

<svelte:element this={as} class="btn-{variant}" {...rest}>
  {@render children?.()}
</svelte:element>
```

1. **Compound sub-components** — `Card.Header`, `Card.Body`, `Card.Footer` etc.
   exported from the category `index.ts` as named exports.
2. **Polymorphic `as` prop** — `<svelte:element this={as}>` + typed via union or
   generic. Default to the most semantic element.
3. **Attribute forwarding** — `...rest` spread onto the root element. All native
   HTML attributes work without explicit re-declaration.
4. **Strict TypeScript** — `strict: true` in `tsconfig.json`. Props extend the
   matching `HTMLXxxAttributes` type. No `any`, no `@ts-ignore`.
5. **Clean HTML** — semantic elements, minimal nesting, no wrapper divs unless
   structurally required. Class values computed, not concatenated strings.
6. **Snippets for slots** — use Svelte 5 `{#snippet}` / `{@render}` instead of
   `<slot>`. Named snippet props for compound layouts.

## Key technical decisions

- **Tests = Storybook play functions** — no separate test files; `@storybook/addon-vitest`
  executes play functions in Vitest browser mode (see D1)
- **Stories in Svelte CSF format** — `.stories.svelte` via `@storybook/addon-svelte-csf`,
  one per component; `<Story play={...}>` uses `@storybook/test` imports (see D1)
- **Chakra-style composability** — compound sub-components, `as` polymorphic prop,
  `...rest` HTML attribute forwarding, strict TypeScript (see D4)
- Svelte 5 runes throughout — no Svelte 4 `export let` (see D2). Runes mode is auto-detected per file (use of `$props()`, `$state()`, etc.); `runes: true` is NOT set globally in `svelte.config.js` to avoid breaking node_modules.
- CSS custom properties for tokens — no JS token objects, no Tailwind (see D2)
- No external UI primitive libraries — all components are custom (see D2)
- SSR-safe by default — browser APIs gated behind `$effect` / `browser` guard
- WCAG 2.1 AA hard requirement — a11y addon enforces this in every Story
