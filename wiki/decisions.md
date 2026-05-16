# Decision Log

> Append-only, ADR-style. Any agent that makes a notable design or technical choice adds
> an entry here. Newest at the bottom. Never edit past entries — supersede them with a
> new one.

## Format

```
## D<n>: <title>
- **Date**: <YYYY-MM-DD>
- **By**: <agent or user>
- **Context**: <what prompted the decision>
- **Decision**: <what was decided>
- **Consequences**: <trade-offs, follow-ups>
- **Supersedes**: <D<n> or "none">
```

---

## D1: Tests are Storybook play functions only
- **Date**: 2026-05-15
- **By**: bootstrap (user clarification)
- **Context**: User specified Storybook-based testing. User clarified: no separate
  `.test.ts` files; use CSF format stories with `play` functions; run via
  `@storybook/addon-vitest`.
- **Decision**: Every component's test harness is its `.stories.ts` file. Play functions
  use `@testing-library/svelte` + `@storybook/test` assertions. `@storybook/addon-vitest`
  runs them in Vitest browser mode (`npm test`). `@storybook/addon-a11y` audits
  accessibility in every Story.
- **Consequences**: No `*.test.ts` files anywhere. `test-writer` agent writes Stories
  with play functions; `implementer` makes them pass. Red state = play function
  assertion fails or a11y violation. Stories double as documentation.
- **Supersedes**: none

## D3: Fonts self-hosted via Fontsource, not Google CDN
- **Date**: 2026-05-15
- **By**: user
- **Context**: Design bundle referenced Google Fonts CDN for Inter Tight and JetBrains
  Mono. User preference is to avoid external CDN requests.
- **Decision**: Load both fonts via Fontsource npm packages (`@fontsource/inter-tight`,
  `@fontsource/jetbrains-mono`). Import in `src/app.css` (or `+layout.svelte`).
  The local `fonts/JetBrainsMono-Bold.ttf` from the design bundle is superseded by
  the Fontsource package.
- **Consequences**: No Google Fonts `<link>` in `<head>`. Font files are bundled with
  the app. Fontsource packages must be added as dependencies in B1 scaffold.
- **Supersedes**: none

## D4: Chakra-style composable components + strict TypeScript
- **Date**: 2026-05-15
- **By**: user
- **Context**: User wants components to be composable in the spirit of Chakra UI —
  compound sub-components, polymorphic `as` prop, full HTML attribute forwarding.
  Also: strict TypeScript (`noImplicitAny`, no `any` anywhere).
- **Decision**:
  1. **Compound components** — complex components export named sub-components as
     properties of the parent (e.g. `Card.Header`, `Card.Body`, `Card.Footer`).
     Implemented via named Svelte component exports from the category `index.ts`.
  2. **Polymorphic `as` prop** — interactive elements (Button, Card, etc.) accept
     an `as` prop (default `"button"` / `"div"`) and render via `<svelte:element
     this={as}>`, so `<Button as="a" href="...">` renders a semantically correct anchor.
  3. **HTML attribute forwarding** — every component destructures `...rest` from
     `$props()` and spreads it onto the root element, so all native HTML attributes
     work without explicit declaration.
  4. **Strict TypeScript** — `tsconfig.json` sets `strict: true`. Props are typed
     against the relevant `HTMLElementAttributes` type (e.g. `ButtonProps extends
     HTMLButtonAttributes`). No `any`, no `@ts-ignore`. Polymorphic props use a
     generic or union type to keep the `as` prop and its attribute set consistent.
  5. **Clean HTML** — minimal nesting, semantic elements, no wrapper divs unless
     structurally necessary. Class lists are computed, not concatenated strings.
- **Consequences**: Components are slightly more complex to author (generic types,
  `svelte:element`) but much more flexible to consume. The `as` prop requires care
  with ARIA roles when the element type changes. Stories must cover polymorphic usage.
  `@ts-ignore` is banned; if TypeScript fights, fix the types.
- **Supersedes**: none

## D5: No global utility classes — CSS scoped to components
- **Date**: 2026-05-15
- **By**: user
- **Context**: B3 produced `layout.stories.svelte` containing raw HTML with utility
  class strings (`.stack`, `.grid`, etc.) imported globally via `app.css`. User
  rejected this: "we are building a component library."
- **Decision**:
  1. `layout.css` and `patterns.css` are **removed from `app.css`**. Those class
     definitions are not a public API.
  2. CSS that drives a component lives in that component's `<style>` block —
     scoped by Svelte's compiler, no global leakage.
  3. Components expose **style props** (Chakra-UI style) rather than class strings:
     `<Stack gap="lg">` not `<div class="stack stack-lg">`.
  4. Build order is **bottom-up**: atoms (Button, Led, TagPill) → layout primitives
     (Stack, Inline, Grid, Container, Rule) → composites (Card, Nav, etc.).
     Each layer may only import from layers below it.
  5. Stories import and render the **component**, never raw HTML with utility classes.
     One `.stories.svelte` file per component.
- **Consequences**: More component files, but the exported API is clean, typed, and
  tree-shakeable. The raw CSS in `layout.css`/`patterns.css` becomes the
  implementation source that implementers read when writing component `<style>` blocks.
  `app.css` only retains fonts, token custom properties, and base element styles
  (things that must be global).
- **Supersedes**: none

## D2: Stack and architecture choices
- **Date**: 2026-05-15
- **By**: bootstrap (user interview)
- **Context**: Bootstrapping a personal Svelte component library implementing the
  Dexterlabs design system (claude.ai/design export).
- **Decision**: SvelteKit + TypeScript, Svelte 5 runes API, CSS custom properties for
  tokens (no Tailwind), Storybook 8 (`@storybook/svelte-vite`) for visual dev. No
  external UI primitive libraries. SSR-compatible, WCAG 2.1 AA.
- **Consequences**: Components must never use browser globals in render paths. All
  component props must be typed. Token changes are CSS-only. Cannot lean on Bits UI /
  Radix for accessibility — must implement ARIA patterns manually.
- **Supersedes**: none

## D6: B3 layout spec rewritten as Svelte component spec (supersedes CSS-only approach)
- **Date**: 2026-05-16
- **By**: spec-writer
- **Context**: The original `wiki/specs/B3-layout-helpers.md` specified CSS utility
  classes imported globally — the approach later rejected by D5. B3 is in-progress and
  required a clean spec aligned with D5 before test-writer and implementer could proceed.
- **Decision**: A new spec `wiki/specs/B3-layout-components.md` replaces the layout
  helpers spec as the implementation contract for B3. It specifies six Svelte 5
  components (`Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule`) with style props,
  scoped CSS, and full `...rest` forwarding. The old `B3-layout-helpers.md` is retained
  in the wiki for reference but is marked superseded in `INDEX.md`.
- **Consequences**: `test-writer` writes stories against the component API. The global
  utility class tests in `B3-layout-helpers.md` are not built (they were for a rejected
  approach). Rail layout, split, and card-grid patterns are deferred — they are either
  composable via `Grid` or belong in later items.
- **Supersedes**: B3-layout-helpers.md (that spec covers a CSS-only approach rejected by D5)

## D7: SSR-safe palette persistence via $effect + browser guard
- **Date**: 2026-05-16
- **By**: spec-writer
- **Context**: The `Nav` component must read and write `localStorage` (key
  `'dxlb-palette'`) and set `data-palette` on `document.documentElement`. These are
  browser-only APIs. The component must also SSR without errors.
- **Decision**: All `localStorage` and `document` access is placed inside:
  1. `$effect(() => { if (browser) { ... } })` — fires only after hydration in the
     browser; never runs on the server.
  2. Event handler functions — which are only invoked by user interaction in the browser.
  The initial `palette` state is `'phosphor'` (dark default), so the server-rendered
  HTML always reflects the dark theme. A brief flash on first load for Paper-preference
  users is a known trade-off; a `<head>` inline script mitigation is a SvelteKit layout
  concern out of scope for this component.
  The `browser` import comes from `$app/environment` (available in SvelteKit projects).
- **Consequences**: No `ReferenceError` during SSR. The component is portable to
  Storybook (which runs in a browser anyway). The `localStorage` key `'dxlb-palette'`
  is the shared contract between `Nav` and any future palette-aware components — it must
  not change without updating all consumers.
- **Supersedes**: none

## D9: Composition stories split into separate files to preserve `component:` in primary story file
- **Date**: 2026-05-16
- **By**: spec-writer (B12)
- **Context**: The `stories-guide.md` requires `component:` in `defineMeta` so that
  Storybook auto-generates a prop table. But when a story renders multiple instances of
  the same component (e.g. "Multiple Pills", "Paired With Text"), adding `component:`
  causes a double-render: the CSF adaptor wraps the slot with the component AND the
  slot itself contains another instance.
- **Decision**: Stories that render multiple component instances are moved to a sibling
  `<Name>.composition.stories.svelte` file with no `component:` in its `defineMeta`.
  The primary `<Name>.stories.svelte` retains `component:` and covers all single-instance
  stories. This applies to `Led` ("Paired With Text") and `TagPill` ("Multiple Pills").
  `Rule.stories.svelte` omits `component:` entirely because both of its stories are
  composition-style.
- **Consequences**: Two new files are created (`Led.composition.stories.svelte`,
  `TagPill.composition.stories.svelte`). Play function counts and coverage are unchanged.
  The autodocs prop table is available for every primary story file.
- **Supersedes**: none

## D8: Nav breadcrumb descoped from B6
- **Date**: 2026-05-16
- **By**: spec-writer
- **Context**: R5 lists "breadcrumb support" and the design bundle shows `// ~ / SECTION`
  inline in the brand area. Implementing this requires route awareness (SvelteKit
  `$page` store or a `crumbs` prop array) and non-trivial brand-area markup that differs
  from the wordmark-only brand.
- **Decision**: B6 delivers the `Nav` component with the wordmark brand area only (no
  breadcrumb path). A `crumbs` prop / snippet can be added in a follow-up item (B6b or
  B11). This keeps B6 focused and avoids coupling `Nav` to SvelteKit internals.
- **Consequences**: The brand area is simpler. The breadcrumb requirement remains open
  in `requirements.md` R5. `Nav` does not import from `$app/navigation` or `$app/stores`.
- **Supersedes**: none
