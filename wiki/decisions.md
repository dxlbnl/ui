# Decision Log

> ADR-style. Agents append new entries to **Archive — Full ADR History** below. Never
> edit past entries — supersede them with a new one.
>
> The **Standing Rules** section is a curated subset of cross-cutting rules every agent
> applies on every item. Promotion into Standing Rules is a deliberate user/manager call
> — agents do not promote rules from a normal spec/implementation cycle.
>
> **What belongs here**: project-level design and tech choices that affect how future
> agents write code across the codebase — stack choices, CSS conventions, API patterns,
> cross-cutting rules. **What does NOT belong here**: per-item pipeline decisions (e.g.
> "this item uses the visual-only track", "test-writer skipped for this item"). Those
> go in the item card's `## Notes` or `wiki/progress.md`.

## Format (Archive entries)

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

## Standing Rules

Cross-cutting rules every agent applies on every item. Promotion here is a deliberate user/manager call.

| ADR | Rule |
|-----|------|
| [D1](#d1-tests-are-storybook-play-functions-only) | Tests = Storybook play functions only. No `.test.ts`. |
| [D2](#d2-stack-and-architecture-choices) | Stack: SvelteKit + Svelte 5 runes + CSS custom-property tokens. No Tailwind. SSR-compatible. |
| [D3](#d3-fonts-self-hosted-via-fontsource-not-google-cdn) | Fonts via Fontsource npm packages. No Google CDN. |
| [D4](#d4-chakra-style-composable-components--strict-typescript) | Polymorphic `as` prop + `...rest` forwarding + strict TS. No `any`, no `@ts-ignore`. |
| [D5](#d5-no-global-utility-classes--css-scoped-to-components) | CSS scoped to components. `app.css` = fonts + tokens + base elements only. |
| [D38](#d38-primitives-first--always-use-design-system-primitives-in-higher-order-components) | Primitives first. Higher-order components must use design system primitives. |
| [D42](#d42-no-play-fn-assertions-for-visual-only-changes) | No play-fn assertions for visual-only changes. Test-writer is skipped on visual tracks. |
| [D43](#d43-text-or-snippet-slots-use-a-single-prop-string--snippet) | Text-or-snippet slots: single `prop?: string \| Snippet`. No parallel `*Content` props. |
| [D45](#d45-native-css-nesting-required----global-blocks-and-all-component-style-blocks) | Use native CSS nesting in all `<style>` blocks. Flat `.host :global(child)` selectors are banned. |

---

## Archive — Full ADR History

Append-only. Newest at the bottom. Never edit past entries — supersede with a new one. New ADRs go here by default.

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

## D10: Select is fully custom; native `<select>` not wrapped
- **Date**: 2026-05-16
- **By**: spec-writer (B7)
- **Context**: The design system reference (`15-components-forms.html`) uses a bespoke
  dropdown (`.dxl-select` / `.dxl-trigger` / `.dxl-panel`) rather than a styled native
  `<select>`. The native element cannot be fully styled cross-browser (arrow icon,
  option colours).
- **Decision**: `Select` in B7 is a fully custom component built with a `<button>`
  trigger and a `<ul role="listbox">` panel, replacing the native element entirely.
  The component is controlled: the consumer manages selected value state and receives
  changes via an `onchange` callback. Full ARIA Listbox keyboard navigation (arrow keys,
  Home/End) is deferred to a later item; B7 delivers open/close via click and Escape,
  plus the required ARIA attributes (`aria-haspopup`, `aria-expanded`, `role="listbox"`,
  `role="option"`, `aria-selected`).
- **Consequences**: `label[for]` does not programmatically associate with the trigger
  `<button>` (documented in OQ-2 of B7 spec). The a11y addon may flag incomplete
  keyboard navigation (OQ-3). Both are known and non-blocking for B7.
- **Supersedes**: none

## D11: Field does not inject ARIA attributes into child controls via context
- **Date**: 2026-05-16
- **By**: spec-writer (B7)
- **Context**: `Field` wires label to control via `label[for]` + `input[id]`. It also
  needs `aria-invalid` and `aria-describedby` on the wrapped control. Svelte does not
  support slot prop injection that reaches into a child component's root element. Options
  are: (a) Svelte context (child reads context and applies attrs itself), (b) consumer
  responsibility, (c) Field renders the control directly (coupling).
- **Decision**: In B7, ARIA attribute application is the consumer's responsibility.
  The convention is documented in the Field spec: the consumer passes `id={inputId}`,
  `aria-describedby="{inputId}-hint"`, and `aria-invalid={!!error}` directly on the
  wrapped control. This keeps `Field` as a pure layout/label wrapper with no coupling
  to the control type. A future item may introduce a Svelte context approach for ergonomics.
- **Consequences**: More verbose usage at the call site. Storybook stories must manually
  set `aria-describedby` and `aria-invalid` on the inner control. This is a known
  trade-off for B7.
- **Supersedes**: none

## D12: Modal uses native `<dialog>` element with `showModal()`
- **Date**: 2026-05-16
- **By**: spec-writer (B8)
- **Context**: R7 specifies a backdrop overlay and SSR-safe mount. Options are: (a) a
  `<div role="dialog" aria-modal="true">` with a sibling backdrop div and manual focus
  trap, or (b) the native `<dialog>` element opened via `showModal()`.
- **Decision**: Use the native `<dialog>` element opened via `dialogElement.showModal()`
  inside `$effect`. This provides: built-in focus trapping, native Escape key handling
  (`cancel` event), native `::backdrop` pseudo-element, correct `role="dialog"` semantics
  without manual ARIA, and automatic focus restoration on close. The HTML `open` attribute
  is NOT used (that attribute creates a non-modal, non-trapped dialog without backdrop);
  only `showModal()` is used. `close()` is called to close. All `showModal()` / `close()`
  calls live inside `$effect` (SSR-safe: `$effect` runs only in the browser).
- **Consequences**: The component requires a `bind:this` reference to the `<dialog>` DOM
  element. The `::backdrop` pseudo-element cannot inherit CSS custom properties in most
  browsers (the backdrop colour is hardcoded as `rgba(7, 9, 8, 0.85)`). Storybook renders
  in a browser context, so `showModal()` is available in all test environments. No custom
  focus-trap JavaScript is needed.
- **Supersedes**: none

## D13: Modal CSS uses `.modal[open]` selector for flex layout to avoid overriding UA hidden state
- **Date**: 2026-05-16
- **By**: implementer (B8)
- **Context**: The `<dialog>` element is hidden by the browser UA stylesheet when it does
  not have the `open` attribute (`display:none`). Applying `display:flex` unconditionally
  on `.modal` overrides that UA rule, making closed dialogs visible in the DOM (breaking
  the "Closed" story test and WCAG visibility requirements).
- **Decision**: The `display:flex` (and `align-items`/`justify-content`) rules that centre
  `.modal-inner` are placed on `.modal[open]` rather than `.modal`. The `.modal` base rule
  retains `position:fixed`, `inset:0`, `border:none`, `padding:0`, `background:transparent`,
  `max-width`, and `max-height`. This lets the UA `display:none` rule remain active for
  the closed state while still providing correct flex-centering when the dialog is shown.
- **Consequences**: Correct `toBeVisible()` / `not.toBeVisible()` test results in Storybook.
  No visual change when the dialog is open. CSS is still fully scoped. The `showModal()`
  call sets the `open` attribute on the `<dialog>` automatically, so the selector is
  always in sync with the controlled state.
- **Supersedes**: none

## D14: B9 pattern components use CSS BEM-style variant modifiers (`--variant`) rather than class suffixes (`.variant`)
- **Date**: 2026-05-16
- **By**: spec-writer (B9)
- **Context**: The reference `patterns.css` uses single-word class suffixes on the root
  element (`.alert.ok`, `.alert.amber`) rather than BEM-style modifiers
  (`.alert--ok`, `.alert--amber`). In Svelte scoped CSS, single-word modifier classes
  collide with Svelte's internal scoping hash and can produce hard-to-debug specificity
  issues if a consumer also passes a class like `ok` via `...rest`.
- **Decision**: All pattern component variant classes use BEM double-hyphen modifiers
  on the root element (`alert--ok`, `alert--amber`, `stat-value--ok`, `kv-val--amber`,
  `progress-fill--danger`, `cta-block`, etc.). Child element classes retain the original
  single-segment names (`.alert-tag`, `.stat-label`, etc.). This keeps parity with the
  reference design while avoiding root-level class collisions.
- **Consequences**: The CSS selectors in each component's `<style>` block differ slightly
  from `patterns.css` (modifier format only; visual output is identical). Implementers
  must write `.alert--ok` not `.alert.ok`.
- **Supersedes**: none

## D15: Alert uses `role="status"` uniformly across all variants
- **Date**: 2026-05-16
- **By**: spec-writer (B9)
- **Context**: The `danger` variant of `Alert` would be more semantically correct with
  `role="alert"` (assertive live region), which interrupts screen reader narration
  immediately. The other three variants (`ok`, `amber`, `info`) are correctly `role="status"`
  (polite). Using different roles per variant adds conditional logic and a surface for bugs.
- **Decision**: All four `Alert` variants use `role="status"` in B9. The implementer may
  optionally set `role={variant === 'danger' ? 'alert' : 'status'}` without spec deviation.
  This is documented in Open Questions OQ-1 of the B9 spec.
- **Consequences**: Screen readers on `danger` alerts use polite interruption rather than
  assertive. Acceptable for the current use cases (inline banners, not transient system
  alerts). The a11y addon will not flag this as a violation.
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

## D16: Accordion uses native `<details>`/`<summary>` — no JS expand/collapse
- **Date**: 2026-05-16
- **By**: spec-writer (B10)
- **Context**: R10 specifies "SSR-safe (no layout shift on hydration)". The reference
  HTML (`17-components-accordion.html`) uses a JavaScript click handler toggling `.open`
  and `.hidden` classes. Two implementation options were considered: (a) the JS class-
  toggle approach wrapped in a Svelte `$state`/`$effect`, or (b) native `<details>`/
  `<summary>` elements which expand/collapse without any JavaScript.
- **Decision**: Use native `<details>`/`<summary>`. The `<details>` element's `open`
  HTML attribute controls expand/collapse state. Initial open state is set via the
  `open` prop, which hydrates without JS. No `$state` or `$effect` is needed in
  `AccordionItem`. The CSS icon rotation uses `details[open] .acc-icon` selectors
  (no JS). This is the simplest SSR-safe approach: the component renders correctly on
  the server and requires zero JavaScript for the fundamental open/close behaviour.
- **Consequences**: Svelte does not need to manage open/close state in `AccordionItem`.
  After hydration the browser owns the open state (native DOM behaviour). Consumers who
  need full programmatic control can pass a reactive `open` prop from a parent `$state`.
  CSS `interpolate-size` animations for smooth height transitions are not possible with
  pure `<details>` in all current browsers — animated expand/collapse is explicitly out
  of scope for B10.
- **Supersedes**: none

## D17: Tabs uses `<button role="tab">` — not `<div>` click targets
- **Date**: 2026-05-16
- **By**: spec-writer (B10)
- **Context**: The reference HTML (`20-components-tabs.html`) uses `<div class="tab">`
  elements as click targets. Divs require manual `tabindex`, `role="tab"`, and keyboard
  handlers to be accessible.
- **Decision**: Each tab is a `<button>` element with `role="tab"`. This gives native
  keyboard focus, Enter/Space activation, and correct AT semantics at zero extra cost.
  The ARIA tab-panel pattern (arrow-key navigation) is a known gap (OQ-2 in the B10
  spec) and is non-blocking for B10.
- **Consequences**: Tab buttons can be styled to look like the reference divs via CSS
  (`border: none; background: transparent`). The `tablist` container uses a `<div>` with
  `role="tablist"`. Panel switching is driven by Svelte `$state` (`activeId`).
- **Supersedes**: none

## D18: B13 composition refactor — three-pattern Svelte scoping strategy
- **Date**: 2026-05-16
- **By**: spec-writer (B13)
- **Context**: Svelte scoped CSS cannot style elements rendered by a child component.
  Higher-order components that previously applied flex/grid CSS directly on a `<div>`
  cannot simply replace that `<div>` with `<Stack>` and then use the parent's `<style>`
  to style the Stack's root element. Three distinct situations arise: no extra styles
  needed, static styles only, and hover/pseudo/descendent styles.
- **Decision**: The B13 spec establishes three patterns in priority order: (1) use the
  primitive directly (no extra styles, drop the custom class); (2) pass static CSS via
  the `style=` prop on the primitive (no hover/pseudo-element); (3) keep a named wrapper
  div for hover/pseudo/descendent rules and put the layout primitive inside it. The
  implementer must choose the correct pattern per element — no single pattern fits all.
- **Consequences**: Some elements will have a wrapper div that did not exist before (e.g.
  `.card-cta` stays as a wrapper for the hover descendent rule; `Spread` goes inside).
  This adds one level of nesting in those cases but keeps scoped CSS correct and avoids
  the `:global()` escape hatch, which would leak styles.
- **Supersedes**: none

## D20: Layout primitives and Button accept `class` prop via ClassValue merging
- **Date**: 2026-05-16
- **By**: implementer (B13)
- **Context**: `Stack`, `Inline`, `Spread`, and `Button` originally rendered
  `class="stack"` (etc.) as a literal string attribute. When a consumer passed
  `class="foo"` via `...rest`, Svelte's attribute merging was overridden, so the
  primitive class was lost. This broke B13 AC tests and prevented `<Stack class="accordion">`
  from producing an element with both classes.
- **Decision**: All four primitives extract `class` explicitly from `$props()` and
  merge it with the component's own class using Svelte's array ClassValue syntax:
  `class={['stack', klass]}`. The Props interface declares `class?: ClassValue | null`
  (matching Svelte's own `HTMLAttributes.class` type). The `HTMLAttributes<HTMLDivElement>`
  base is removed from layout primitive interfaces to avoid TypeScript event-handler
  conflicts when callers pass anchor (`as="a"`) or other element attributes via `...rest`.
  The `[key: string]: unknown` index signature remains for full `...rest` forwarding.
- **Consequences**: Consumers can pass `class="my-class"` to any layout primitive or
  Button and the element will have both the primitive class and the consumer class.
  TypeScript no longer complains about anchor event types being passed to Stack/Inline/Spread.
  The tradeoff is that the Props interface is slightly less strict (no HTMLAttributes base),
  but `[key: string]: unknown` already provided the same effective permissiveness.
- **Supersedes**: none

## D21: B14 Colors story uses composition pattern (multiple Text instances in slot)
- **Date**: 2026-05-16
- **By**: test-writer (B14)
- **Context**: The `Text` `Colors` story must assert inline-style output for all 7 color
  tokens. Because `component:` in `defineMeta` renders exactly one component instance per
  story (wrapping the slot), seven separate stories would be needed to test each color
  value individually, or an alternative multi-instance approach is required.
- **Decision**: The `Colors` story uses a composition pattern: `component:` is kept in
  `defineMeta` (for autodocs), and the story slot renders multiple `<Text>` children with
  `data-testid` attributes for each color variant plus a no-color control. The `play`
  function queries each by `data-testid` and asserts the inline style attribute. This
  follows the precedent set by `Led.composition.stories.svelte` and `TagPill.composition.stories.svelte`.
- **Consequences**: The `Colors` story is a single test entry covering all 7 color ACs
  (AC-10 through AC-14). The `data-testid` query is a last-resort per the stories guide,
  justified here because the Text elements have no accessible role or visible-text
  distinguisher (all contain generic colour sample text). The Colors story does NOT use
  a separate `.composition.stories.svelte` file because the primary file keeps `component:`
  and the slot children are additional `<Text>` instances — Storybook wraps the outermost
  story slot, not the nested children.
- **Supersedes**: none

## D19: B11 tokens stories — replace 4 existing stories with 3 restructured ones
- **Date**: 2026-05-16
- **By**: spec-writer (B11)
- **Context**: `tokens.stories.svelte` was written in B2 with 4 stories (`Color Tokens`,
  `Type Scale`, `Labels`, `Semantic Elements`). B11 specifies 3 canonical catalogue
  stories (`Color Palette`, `Typography Scale`, `Spacing Scale`). Replacing 4 with 3
  reduces the total story count by 1 (from 156 to 155 if no new stories are added
  elsewhere), which may conflict with the "156 tests still pass" requirement.
- **Decision**: The 3 new token stories replace the 4 existing ones. The story count
  drops by 1 net (before accounting for new stories added in the consistency pass). The
  "156 tests still pass" requirement means no existing test assertions are broken, not
  that the story count stays at exactly 156. New stories in Spread, Rule, Card,
  ProjectCard, and CtaBlock will bring the total well above 156. OQ-3 in the spec
  documents this interpretation.
- **Consequences**: The existing `Color Tokens`, `Type Scale`, `Labels`, and `Semantic
  Elements` stories are removed. Their play function assertions are partially absorbed
  into the new `Color Palette` and `Typography Scale` stories. The `Semantic Elements`
  and `Labels` story content is not carried forward (out of scope per the spec's
  Out of scope section).
- **Supersedes**: none

## D22: B15 Select keyboard — aria-activedescendant on trigger button, not on listbox
- **Date**: 2026-05-16
- **By**: spec-writer (B15)
- **Context**: The WAI-ARIA Listbox pattern can be implemented with DOM focus either on
  the listbox container (`<ul role="listbox">`) or on an external control that opens the
  list. In `Select`, DOM focus stays on the trigger `<button>` when the panel is open
  (users Tab to the trigger; clicking it opens the panel without moving focus away). This
  means `aria-activedescendant` must be placed on the focus owner (the trigger) rather
  than on the `<ul>`.
- **Decision**: `aria-activedescendant="select-opt-{i}"` is set on the trigger `<button>`
  when the panel is open and a highlight index is active. Each `<li role="option">` gets
  `id="select-opt-{i}"`. This model keeps focus on the trigger throughout the panel
  interaction. The `<ul>` itself does not receive focus or `aria-activedescendant`.
- **Consequences**: Some screen readers may announce option changes less reliably than
  they would with roving DOM focus on `<li>` elements (documented in OQ-1 of B15 spec).
  A roving-tabindex refactor remains possible in a future item without a breaking API
  change.
- **Supersedes**: none

## D23: B15 Tabs keyboard — automatic activation model chosen
- **Date**: 2026-05-16
- **By**: spec-writer (B15)
- **Context**: WAI-ARIA APG describes two Tabs activation models: (a) automatic —
  arrow keys move focus AND activate the panel immediately; (b) manual — arrow keys
  move focus only, Space/Enter activates. The current Tabs component switches panels
  instantly (no async loading), making automatic activation the natural choice and
  consistent with common browser tab-bar behaviour.
- **Decision**: ArrowLeft/ArrowRight/Home/End on a tab button both move DOM focus AND
  set `activeId` to the target tab in the same event handler, with no intermediate
  "focused but inactive" state.
- **Consequences**: Simpler implementation (one state mutation per key press). Users who
  expect to browse tabs without activating them cannot do so — this is the trade-off of
  automatic activation. If a consumer needs manual activation, that would require a new
  `activationMode` prop (out of scope for B15).
- **Supersedes**: none

## D24: B16 Field enhancement uses Svelte context to auto-inject ARIA attributes into child controls
- **Date**: 2026-05-16
- **By**: spec-writer (B16)
- **Context**: D11 left ARIA wiring (`aria-invalid`, `aria-describedby`, `id`) as the
  consumer's responsibility when using `Field`. B16 addresses this ergonomics gap without
  coupling `Field` to specific control types.
- **Decision**: `Field` calls `setContext('field', { inputId, hintId, hasHint, hasError })`
  with reactive values. Each form control (`Input`, `Textarea`, `Select`, `Checkbox`,
  `Radio`, `Switch`) reads this context via `getContext('field')` and — when present —
  automatically applies `id`, `aria-describedby`, and `aria-invalid` to the rendered
  element. This keeps `Field` as a pure layout/label wrapper with no import dependency on
  any specific control type, while giving controls the information they need without
  consumer boilerplate. The context key `'field'` and the `FieldContext` interface are
  defined in a shared `src/lib/components/forms/field-context.ts` module.
- **Consequences**: Consumers no longer need to manually pass `id`, `aria-describedby`,
  and `aria-invalid` when using `Field`. Backward-compatible: controls outside `Field`
  receive no context and behave as before. Dynamic error changes (error prop flipping
  after initial mount) may not propagate reactively via context — this is documented as
  OQ-1 in the B16 spec and requires verification by the test-writer.
- **Supersedes**: D11 (partially — D11's consumer-responsibility approach was correct for
  B7; D24 supersedes it for B16 onwards)

## D25: B18 Toast uses `role="alert"` for danger variant, `role="status"` for ok/amber
- **Date**: 2026-05-16
- **By**: spec-writer (B18)
- **Context**: B9 `Alert` deferred the `role="alert"` vs `role="status"` question (OQ-1
  in B9 spec, D15). Static inline banners (`Alert`) are authored by the page designer and
  are present in the DOM at load time — polite `role="status"` is acceptable because the
  user is aware of the page context. Toasts, by contrast, appear unexpectedly at runtime
  driven by application events. A `danger` toast represents a critical error (connection
  lost, thermal fault) that the user must be made aware of immediately, regardless of what
  the screen reader is currently narrating.
- **Decision**: `Toast.svelte` computes `role` via `$derived`:
  `const role = $derived(variant === 'danger' ? 'alert' : 'status')`.
  The root element also gets `aria-live` set accordingly (`assertive` for danger, `polite`
  for ok/amber). All three variants also carry `aria-atomic="true"` to ensure the full
  message is read when the region updates.
- **Consequences**: Danger toasts interrupt the screen reader immediately. Ok and amber
  toasts are announced politely when the reader is idle. This matches the semantic
  intent of the ARIA live region spec. `Alert.svelte` (B9) is not changed — it remains
  uniformly `role="status"` for its static banner use case.
- **Supersedes**: D15 (for the Toast context; D15 remains applicable to `Alert`)

## D26: Prose component uses `.prose :global(element)` — scoped-ancestor-chained global selectors
- **Date**: 2026-05-16
- **By**: spec-writer (B20)
- **Context**: mdsvex (and any markdown processor) inserts h1–h4, p, a, ul, ol, li, code, pre,
  blockquote, table, th, td, img, and hr as dynamic children of the wrapper component.
  Svelte's compiler cannot add its scoping attribute to these elements because they are not
  present in the component template — they arrive at runtime as slot/children content. The
  standard three-pattern strategy from `composition-limits.md` does not apply here because the
  elements are neither rendered by a child Svelte component nor controlled by a layout primitive.
- **Decision**: `Prose.svelte` uses `.prose :global(element)` selectors throughout its
  `<style>` block. This syntax is valid in Svelte: the `.prose` part is scoped to the
  component (only this component's root element gets the class), and `:global(element)`
  reaches arbitrarily deep into its DOM subtree. Because `.prose` is unique to this component,
  the global selectors are effectively scoped to the prose container and do not leak into
  the rest of the page. All colour and typography values use `var(--token)` custom
  properties so both palettes work without any JavaScript.
- **Consequences**: This is the intended Svelte escape hatch for styling externally-sourced
  DOM subtrees. The CSS is NOT global — it is restricted to descendants of the `.prose`
  element rendered by this component. Any future global `.prose` class added to `app.css`
  would conflict; this class name must remain reserved for this component.
- **Supersedes**: none

## D27: B21 docs are hand-written and reviewer-verified — no play-function tests
- **Date**: 2026-05-16
- **By**: spec-writer (B21)
- **Context**: B21 produces only Markdown files in `docs/`. The project's testing approach
  (D1) is Storybook play functions for component behaviour. Play functions cannot validate
  the accuracy of prose documentation — there is nothing to render in a browser. A
  TypeDoc or JSDoc generation approach would conflict with the "no generated content"
  requirement and B19's responsibility for JSDoc annotations.
- **Decision**: The `test-writer` for B21 writes a single file-presence check (Bash
  `ls docs/` or a minimal Vitest `existsSync` assertion for all ten files). Content
  accuracy — prop table correctness, token values, usage example validity — is a
  **reviewer task**: the reviewer agent reads each doc file and cross-checks it against
  the corresponding source `.svelte` file and `tokens.css`. This is explicitly called
  out as a human/agent review task in the spec's Verification approach section.
- **Consequences**: No play functions are added for B21. The reviewer pass is more manual
  than for code items. If a prop changes in a future item, `docs/` must be updated
  manually (no auto-sync). B19 handles JSDoc annotations; B21 handles narrative docs.
- **Supersedes**: none

## D28: B19 JSDoc placement — two acceptable patterns; implementer verifies autodocs render
- **Date**: 2026-05-16
- **By**: spec-writer (B19)
- **Context**: Storybook autodocs for Svelte 5 components can read JSDoc from two
  placements: (a) a `/** @param ... @default ... */` block immediately above the
  `let { ... } = $props()` line, or (b) inline `/** ... */` comments above each field
  in the `interface Props` declaration. The correct placement depends on what
  `@storybook/addon-svelte-csf` version 5.x reads at runtime — this is not definitively
  documented for Svelte 5 runes mode.
- **Decision**: The B19 spec (AC-16) accepts either placement. The implementer must verify
  on one component (recommended: `Button.svelte`) that the autodocs prop table renders the
  annotation before annotating the full component set. If neither placement works, OQ-3
  should be escalated as a blocker.
- **Consequences**: Implementation may require a brief discovery step before the annotation
  pass begins. The 80% annotation density requirement (AC-18) is the measurable target
  regardless of placement style.
- **Supersedes**: none

## D29: B16 Accessible hiding pattern for Checkbox/Radio native inputs
- **Date**: 2026-05-17
- **By**: implementer (B16)
- **Context**: The spec says to hide the native `<input>` visually with
  `opacity: 0; position: absolute; width: 0; height: 0`. However,
  `@testing-library`'s `toBeVisible()` considers `opacity: 0` elements invisible,
  causing the "DefaultUnchecked" and "Indeterminate" stories to fail with
  "Received element is not visible".
- **Decision**: Use the classic accessible-hide pattern instead:
  `position: absolute; width: 1px; height: 1px; margin: -1px; clip: rect(0,0,0,0); overflow: hidden; white-space: nowrap`.
  This keeps the element in the accessibility tree (so `getByRole` works), is considered
  visible by testing-library (so `toBeVisible()` passes), and is visually imperceptible
  at 1px clipped.
- **Consequences**: Slight deviation from the literal spec wording but fully spec-compliant
  in behaviour — the input is invisible to the eye and accessible to AT and tests.
- **Supersedes**: none

## D30: B16 Field context reactivity — getter object pattern
- **Date**: 2026-05-17
- **By**: implementer (B16)
- **Context**: OQ-1 in the B16 spec notes that Svelte 5 context is read once at
  component initialisation. Passing a plain object with `$derived` properties does not
  propagate updates to `getContext` consumers.
- **Decision**: `Field` uses a getter-based plain object (`{ get inputId() {...}, ... }`)
  set via `setContext`. JavaScript getters are evaluated lazily each time the property
  is accessed, so child components reading context properties inside `$derived` blocks
  (or Svelte's reactive template evaluation) will pick up the latest values from the
  parent's reactive state. This avoids the Svelte 4 store pattern while keeping
  reactivity correct.
- **Consequences**: Dynamic `error` prop changes on `Field` propagate correctly to nested
  controls without remounting. This resolves OQ-1 as non-blocking.
- **Supersedes**: D11 (which documented the ARIA wiring gap as known trade-off).

## D31: B24 style cleanup — two-prop threshold for layout primitive container replacement
- **Date**: 2026-05-17
- **By**: spec-writer (B24)
- **Context**: B24 needs a clear rule for when a `style=` prop on a layout primitive
  warrants replacement with a scoped element. Single-property overrides (e.g.
  `style="width: 100%;"`) are sanctioned by pattern 1 in `composition-limits.md` and
  are common across the codebase. Multi-property overrides on structural regions are the
  problem pattern.
- **Decision**: Two or more CSS declarations on a layout primitive that also functions as
  a named structural region (has a `class=` prop or is the outermost element of a
  component) triggers replacement with a native scoped element + scoped CSS. Single-prop
  overrides are acceptable regardless of position. Reactive style values (e.g.
  `style="width: {value}%"`) are never moved to scoped CSS regardless of property count.
- **Consequences**: This threshold produces 12 container replacements across 6 files in
  B24 (SectionHead, SectionFoot, PageHero, Modal, ProductCard/ProjectCard/NoteCard cards,
  Nav). It leaves single-prop overrides in Accordion, ProgressBar, and several Text
  elements untouched. The rule is conservative: it only fires when a layout primitive is
  clearly acting as a named container, not merely passing through layout props.
- **Supersedes**: none

## D32: B25 Spread default gap is `none`, not the legacy hardcoded `var(--u2)`
- **Date**: 2026-05-17
- **By**: spec-writer (B25)
- **Context**: When adding the `gap` prop to `Spread`, a default value must be chosen.
  The current implementation hardcodes `gap: var(--u2)` (16 px) in scoped CSS with no
  prop. Two candidates exist: (a) `'sm'` (16 px) — preserves the current pixel output
  for all callers; (b) `'none'` (0 px) — reflects that `Spread` is space-between by
  design and internal gap is rarely needed.
- **Decision**: Default is `'none'`. Spread's primary purpose is `justify-content:
  space-between`, which already creates visual distance between children at the container
  level. An additional `gap` value prevents children touching only when the container is
  exactly full, which is an edge case. Auditing all current call sites (`SectionFoot`,
  `ProjectCard`, `ProductCard` ×2, `ProgressBar`, `KvList`, `NoteCard` ×2, `Modal`)
  shows none of them have adjacent children that would collide without a gap — they all
  rely on space-between semantics. `CtaBlock` is the sole exception and it is migrated to
  `gap="md"` explicitly. Defaulting to `none` means existing callers that did not pass
  `gap` are unaffected (they will now receive 0 px instead of 16 px — a difference only
  visible if two children are adjacent in a full-width container with no space-between
  breathing room, which none of the current callers exhibit).
- **Consequences**: All existing `<Spread>` call sites that do not pass `gap` may see a
  visual change only if their children were relying on the hardcoded 16 px gap for
  collision avoidance rather than on the space-between layout itself. The reviewer must
  verify the visual output of `CtaBlock`, `SectionFoot`, `ProductCard`, `ProjectCard`,
  `KvList`, `ProgressBar`, `NoteCard`, and `Modal` stories after the change.
- **Supersedes**: none

## D33: B26 test-writer — NaturalDefaults and DefaultCase use composition-in-slot pattern
- **Date**: 2026-05-17
- **By**: test-writer (B26)
- **Context**: `NaturalDefaults` (AC-8) must assert computed font-size for all four `Text`
  variants without a `size` prop. `DefaultCase` (AC-21) must assert `textTransform` for
  `mono` and `body` without a `case` prop. Both require multiple independent `<Text>`
  instances in a single story. The primary `Text.stories.svelte` has `component: Text` in
  `defineMeta`, so each story slot is wrapped by one outer `<Text>` instance.
- **Decision**: Both stories use the same composition-in-slot pattern established by `Colors`
  (D21): `args` set an innocuous outer variant (`body`) and the slot contains multiple
  `<Text data-testid="...">` instances as children. Play functions query each by `data-testid`
  and assert `getComputedStyle`. A separate `.composition.stories.svelte` file is not
  needed — the inner `<Text>` children are not double-wrapped by the outer component, just
  nested as slot content.
- **Consequences**: `NaturalDefaults` and `DefaultCase` pass today (natural defaults are
  already correct from global classes) and serve as regression guards ensuring implementation
  does not break the no-prop baseline. `data-testid` queries are justified per the stories
  guide: there is no accessible role or unique visible text to distinguish the variants.
- **Supersedes**: none

## D34: B27 Inline align prop uses `data-align` attribute pattern; default is `center`
- **Date**: 2026-05-17
- **By**: spec-writer (B27)
- **Context**: `Inline` hardcodes `align-items: center` in its base `.inline` CSS rule.
  Two call sites need `align-items: baseline` and currently work around this via
  `style="align-items: baseline;"`. A typed `align` prop removes the override.
- **Decision**: Add `align?: AlignValue` to `Inline.svelte` where
  `AlignValue = 'start' | 'center' | 'end' | 'baseline' | 'stretch'`. Default is
  `'center'` — preserving the existing rendered output for all current callers. The
  prop is forwarded as a `data-align` attribute on the root element and resolved
  via CSS attribute selectors (`.inline[data-align="start"] { align-items: flex-start }`,
  etc.) in the component's `<style>` block, mirroring the `data-gap` pattern from B25.
  The hardcoded `align-items: center` in the base `.inline` rule is removed; it is
  replaced by `.inline[data-align="center"] { align-items: center }`.
- **Consequences**: No existing caller is broken (default is `center` = current value).
  ProductCard and SectionHead migrate from `style="align-items: baseline;"` to
  `align="baseline"`. The `AlignValue` type is local to `Inline.svelte` (no shared
  module) — same convention as `GapSize` in B25.
- **Supersedes**: none

## D35: B27 test-writer strategy — `style=` absence assertions for scoped CSS migration
- **Date**: 2026-05-17
- **By**: test-writer (B27)
- **Context**: Part 2 of B27 moves inline `style=` attributes on layout primitives to
  scoped CSS inside their parent components. The net computed CSS is unchanged, so
  assertions on computed values would trivially pass both before and after implementation.
- **Decision**: For each scoped CSS migration, assert that the affected element's
  `getAttribute('style')` returns `null`. This fails today (inline `style=` is present)
  and passes after implementation (inline `style=` is removed). This is the minimal
  provably-failing test for a value-preserving CSS move.
- **AC-16 exception**: `Modal.svelte`'s bare `:global(.modal-title)` selector change is
  a CSS scope fix, not an inline-style removal. There is no inline `style=` to assert
  absent, and play functions cannot inspect CSS selector text. No failing test is written
  for AC-16; the implementer must verify by code review and the `pnpm check` run.
- **Consequences**: Every `style=` absence test fails before B27 implementation and
  passes after; all 250 pre-existing tests remain green throughout.
- **Supersedes**: none

## D36: B27 — ToastVariant renamed from success/warning/error to ok/amber/danger
- **Date**: 2026-05-17
- **By**: implementer (B27)
- **Context**: The `ToastVariant` in `stores/toast.ts` and `Toast.svelte` used
  `'success' | 'warning' | 'error'` but the ToastRegion stories (and the wider design
  token system) used `'ok' | 'amber' | 'danger'`. The mismatch caused the
  `ToastRegion > ThreeVariants` test to fail (danger toast got `role="status"` instead
  of `role="alert"`).
- **Decision**: Rename `ToastVariant` to `'ok' | 'amber' | 'danger'` throughout
  (`toast.ts`, `Toast.svelte`, `Toast.stories.svelte`). This aligns the component API
  with the design token naming convention used by every other component (Led, Alert,
  StatCard, ProgressBar, etc.).
- **Consequences**: Any external caller using old names (`'success'`, `'warning'`,
  `'error'`) must update. Only `Toast.stories.svelte` was an internal caller — updated
  in this item.
- **Supersedes**: none

## D37: B31 test-writer — `resolveTokenFgColor` for text/border assertions vs `resolveTokenColor` for background assertions
- **Date**: 2026-05-18
- **By**: test-writer (B31)
- **Context**: `storybook-utils.ts` exports two token resolvers: `resolveTokenColor`
  (probes via `background-color`) and `resolveTokenFgColor` (probes via `color`).
  The existing Error State story used `resolveTokenColor("--danger")` for a
  `borderColor` assertion. For B31, `--ink` is a foreground ink token; asserting it
  via `backgroundColor` would resolve incorrectly against the token's RGB.
- **Decision**: Use `resolveTokenFgColor` for `color` and `outlineColor` assertions
  (e.g. `--ink`, `--amber` as text/outline accent). Use `resolveTokenColor` for
  `backgroundColor` and `borderTopColor` assertions (e.g. `--bg-sunken`, `--rule`,
  `--rule-strong`, `--amber` as border token). This matches how the browser computes
  each channel.
- **Consequences**: `resolveTokenFgColor` is now imported alongside `resolveTokenColor`
  in `Select.stories.svelte`. Future stories should apply the same split.
- **Supersedes**: none

## D38: Primitives first — always use design system primitives in higher-order components
- **Date**: 2026-05-18
- **By**: user
- **Context**: The B28 spec-writer draft replaced `<Button>` and `<Inline>` with raw
  `<button>` and plain div elements, citing amber ghost-fill regressions. The user
  rejected this approach as inconsistent with a unified design system.
- **Decision**: Higher-order components (Nav, Modal, PageHero, cards, etc.) must always
  use design system primitives (`Button`, `Inline`, `Stack`, `Breadcrumb`, `Led`, etc.)
  rather than raw HTML elements. If a primitive cannot satisfy the visual requirement,
  that is a signal to fix or extend the primitive — not to bypass it. The only acceptable
  exceptions are structural elements with no primitive equivalent (e.g. `<nav>`, `<header>`,
  `<ul>`, `<details>`). Additionally: minimise `style=` prop usage; prefer scoped CSS
  class rules. Minimise custom CSS; prefer primitive props.
- **Consequences**: All agents must audit higher-order component implementations against
  this rule. Specs must name which primitive handles each interactive or layout element.
  If a primitive's default styling conflicts with a higher-order context, the fix is a
  new variant or prop on the primitive, not a raw element substitution.
- **Supersedes**: none

## D39: B34 — Modal visual redesign: 12px mono title, variant icons in body, ink-faint close
- **Date**: 2026-05-18
- **By**: user
- **Context**: After B33 changed the Modal title to `<Heading h3>` (24px sans), the user reviewed the rendered result and preferred a compact mono label matching the existing Dexterlabs UI language. The variant icons (confirm/destructive) were also moved from the header to the body, and the close button was made ink-faint.
- **Decision**: Modal title is `<Text variant="mono" size="xs" as="h2">` (12px mono uppercase). Variant icons (40px circle outline, amber/red) live in the modal body in a flex hstack with the content — not in the header. Close button is a plain `<button>` (not `<Button variant="ghost">`) styled ink-faint 18px. Modal inner background is `--overlay` (`rgba(7,9,8,0.85)`). Footer is `justify-content: flex-end`.
- **Consequences**: B33 spec updated with a note that subsequent redesign superseded the h3-heading AC. Stories consolidated 6→3 (Default, Confirm, Destructive).
- **Supersedes**: none (B33 spec note documents the deviation)

## D40: B35 — Alert moved to feedback; AlertVariant aligned with ToastVariant
- **Date**: 2026-05-18
- **By**: user
- **Context**: Alert existed in `patterns/` but belongs semantically with Modal, Toast, and ToastRegion. Separately, D36 had renamed ToastVariant to `ok/amber/danger` for consistency with Alert — but the user prefers the more descriptive `success/warning/error/info` naming.
- **Decision**: Alert moves to `src/lib/components/feedback/`. AlertVariant is `'success' | 'warning' | 'error' | 'info'`. ToastVariant stays `'success' | 'warning' | 'error'`. The two sets now align on shared values. CSS token references (`--ok`, `--amber`, `--danger`, `--cyan`) are unchanged.
- **Consequences**: `patterns/index.ts` no longer exports Alert; `feedback/index.ts` does. Alert stories move to `Feedback/Alert` in Storybook. D36 is superseded.
- **Supersedes**: D36

## D41: B35 — Dismiss button belongs inside Alert via ondismiss prop
- **Date**: 2026-05-18
- **By**: user
- **Context**: Initial B35 implementation placed the dismiss button as a sibling of `<Alert>` inside Toast's outer wrapper div, causing it to render outside the Alert's bordered container. The user pointed this out and asked why Toast isn't just an Alert.
- **Decision**: Alert accepts an optional `ondismiss?: () => void` prop. When provided, Alert renders a plain `<button>` (ink-faint, 18px, `margin-left: auto`) inside its own flex row — inside the bordered container. Toast passes `ondismiss={() => ondismiss(id)}` to Alert and has no separate dismiss button element. The `role`/`aria-live`/`aria-atomic` attributes remain on Toast's outer wrapper.
- **Consequences**: Alert is now optionally dismissible. The dismiss button is always visually inside the bordered Alert box. Future persistent Alert usage that needs a dismiss action can use the same prop.
- **Supersedes**: none

## D42: No play-fn assertions for visual-only changes
- **Date**: 2026-05-19
- **By**: user
- **Context**: B38's spec inflated a 1-line CSS fix (remove `margin-top: 20px` from `SectionFoot`) into 40 per-component play-fn assertions that locked a zero-outer-margin contract in every component's existing stories file. The user pushed back: "drop the damn stories for the visual changes."
- **Decision**: For visual / CSS-only changes (margin, padding, color, font, layout values), do **not** add play-fn assertion stories — neither new stories nor expanded play functions on existing stories — for the purpose of locking the visual contract. Make the source change and rely on the existing stories as visual development surfaces. Play-fn assertions are reserved for **behaviour** (interactions, state, accessibility, conditional rendering, focus management, keyboard nav, etc.), not for asserting computed CSS values.
  - `test-writer` is **skipped** for visual-only bug/feature tracks. Manager dispatches `spec-writer → implementer → reviewer` for those items.
  - `spec-writer` must not write ACs of the form "assert `getComputedStyle(root).margin* === '0px'`" or analogous computed-style locks for clean components. ACs for visual changes name the source-file change and the visual outcome; the reviewer verifies the change by reading the diff and (where useful) opening the affected story in Storybook.
  - Exception: when a computed value is the **observable contract of a behaviour** (e.g. a focus-visible outline appears on Tab, a scroll position lands at a specific Y), an assertion is fine — that is testing behaviour, not visual decoration.
- **Consequences**: Spec pages get shorter and more honest for visual work. Test-writer's queue shrinks. The pipeline for visual fixes is `spec-writer → implementer → reviewer`. `stories-guide.md` gets a new "When NOT to assert" section pointing here.
- **Supersedes**: none

## D43: Text-or-snippet slots use a single `prop?: string | Snippet`
- **Date**: 2026-05-19
- **By**: user (B39 review checkpoint)
- **Context**: B36 introduced the convention of pairing a text prop with a parallel snippet prop (`heading` + `headingContent`, with the snippet taking precedence). B39 was about to add the same pair for `eyebrow` + `eyebrowContent`. The user observed this doubles the prop surface for every text slot a component exposes.
- **Decision**: Component slots that may be either a plain string or arbitrary Svelte markup use a **single** prop typed `string | Snippet`. The component template discriminates at render time with `typeof prop === 'function'`. Examples:
  - `<PageHero eyebrow="// SECTION" />` — string branch wraps in `<Text variant="eyebrow">`.
  - `<PageHero eyebrow={mySnippet} />` — snippet branch renders as-is.
  No parallel `eyebrowContent` / `headingContent` props.
- **Consequences**:
  - B36's `headingContent` prop on `PageHero` is removed in B39; `heading?: string | Snippet` replaces both `heading?: string` and `headingContent?: Snippet`. Same for the new `eyebrow`.
  - Any future text-or-markup slot follows the single-prop pattern. Audit / sweep of other components (existing `*Content` props or candidate slots) is filed as a follow-up.
  - Spec-writer must reach for `prop: string | Snippet` before proposing a parallel `propContent` prop.
  - Documentation must show both string and snippet usages under the same prop name.
- **Supersedes**: B36's two-prop `heading` + `headingContent` pattern.

## D44: B41 — `color: inherit` replaces Shiki fallback in `pre > code`
- **Date**: 2026-05-19
- **By**: spec-writer (B41)
- **Context**: The existing `Prose.svelte` `pre > code` colour was `var(--shiki-foreground, var(--ink))`. MarkdownBody's canonical version uses `color: inherit`, inheriting from the `pre` block (which itself inherits from `.prose`). The B41 paste-ready style block uses `color: inherit`.
- **Decision**: Accept `color: inherit` in B41. The Shiki CSS variable fallback is removed. If active Shiki syntax highlighting is wired up in the future, the colour override lives in the Shiki CSS layer, not in Prose's base stylesheet.
- **Consequences**: In contexts where Shiki is not active (plain `<pre><code>`) the `pre > code` text inherits the prose ink colour correctly. If Shiki is activated without further work, its injected `--shiki-*` variables will not be picked up by Prose automatically — a follow-up item will be needed.
- **Supersedes**: none

## D45: Native CSS nesting required — `:global` blocks and all component `<style>` blocks
- **Date**: 2026-05-19
- **By**: user
- **Context**: The initial B41 implementation used flat `.prose :global(element)` selectors. The user mandated native CSS nesting as a **general rule** across all components, not just Prose.
- **Decision**: All component `<style>` blocks use native CSS nesting wherever elements or states are logically related. For `:global` escapes specifically, use `.host-class { :global { child { … } } }` rather than flat `.host-class :global(child)` selectors. Inside any `:global { }` block, standard CSS nesting applies (`&:hover`, `> child`, nested elements, etc.).
- **Consequences**: Style blocks are more compact and reflect document structure. The flat `.host-class :global(element)` form is banned for new code. Svelte + Vite both support native nesting; no build-tool change needed.
- **Supersedes**: D26 (which sanctioned the flat `.prose :global(element)` form)

## D48: B46 — ProjectCard dual-image palette toggle uses CSS-only `:global([data-palette='paper'])` nesting
- **Date**: 2026-05-19
- **By**: spec-writer
- **Context**: Two `<img>` elements (`.dark-img` / `.light-img`) need to toggle
  visibility based on `[data-palette='paper']` on `<html>`. The selector must reach
  outside the component's own DOM subtree. Options: (a) a Svelte store/reactive prop that
  passes display state as a boolean, or (b) a CSS-only `:global` selector nested inside
  the existing `:global(.project-card)` block.
- **Decision**: CSS-only via native nesting inside `:global(.project-card)`. The
  `.light-img { display: none }` default and the `[data-palette='paper']` override are
  co-located in the `.card-img` nested block. No JavaScript, no Svelte store, no `$effect`.
  This matches the canonical local component approach and keeps the palette toggle
  independent of the component's hydration state (works identically on SSR-rendered HTML).
- **Consequences**: The exact nesting form must compile through Svelte's CSS processor.
  The implementer must verify no flat selectors are introduced (D45). The spec's AC-11
  gives a reference nesting skeleton but allows alternate forms if they satisfy the
  behaviour and D45 constraints.
- **Supersedes**: none

## D46: B42 — Grid collapse stories placed in a separate Grid.collapse.stories.svelte file
- **Date**: 2026-05-19
- **By**: spec-writer
- **Context**: The new container-query collapse stories for B42 require `<Container>` and `<Grid>` to be co-instantiated in the story slot. The primary `Grid.stories.svelte` has `component: Grid` in `defineMeta`, which wraps the story slot with one outer `<Grid>` instance. Nesting another explicit `<Grid>` inside produces a double-render (a grid inside a grid with unintended column inheritance). Forcing the container width via inline style also differs from how the existing static stories work.
- **Decision**: The B42 collapse stories live in a sibling `Grid.collapse.stories.svelte` file with no `component:` set in its `defineMeta`. This follows the composition-story precedent from D9. The primary `Grid.stories.svelte` retains `component: Grid` for autodocs and is only updated to fix the existing play functions (AC-8 through AC-12).
- **Consequences**: Two story files for `<Grid>`. Storybook will show them under `Layout/Grid` and `Layout/Grid Collapse` (or similar title set in the collapse file's `defineMeta`). Play function count increases correctly. No double-render risk.
- **Supersedes**: none

## D47: B45 — Text scoped color removal is visual-only; CtaBlock needs explicit `color="faint"` on eyebrow
- **Date**: 2026-05-19
- **By**: spec-writer
- **Context**: B45 removes three `color` declarations from `Text.svelte`'s scoped CSS. All
  affected callsites were audited. Most are unaffected (they either already pass an explicit
  `color` prop, or a parent `:global` class rule supplies the color). Two callsites require
  attention: (1) `ProjectCard`/`ProductCard` — these are the primary broken cases; they fix
  themselves once the scoped color is removed (hover color flows through). (2) `CtaBlock`
  eyebrow — the only callsite that loses its default color without a replacement mechanism:
  CtaBlock's `.cta-block { color: inherit }` would make the eyebrow inherit page default
  ink instead of faint. Adding `color="faint"` to the eyebrow `<Text>` is the canonical
  prop-based fix per the design system contract.
- **Decision**: B45 is classified as visual-only (D42): test-writer is skipped, pipeline is
  spec-writer → implementer → reviewer. The single code change beyond Text.svelte is adding
  `color="faint"` to the eyebrow `<Text>` in `CtaBlock.svelte`.
- **Consequences**: The visual-only classification means no new play-fn assertions are added.
  The reviewer verifies hover color in `ProjectCard` and `ProductCard` Storybook stories,
  and confirms eyebrow faint color in `CtaBlock`. `NoteCard`'s existing `:global(.note-lede)`
  rule is expected to continue supplying the lede's dim color; the implementer must confirm
  this and fall back to `color="dim"` on the `<Text>` if not.
- **Supersedes**: none

## D49: B47 — ProductCard uses plain `<p class="card-desc">` for description, mirroring ProjectCard
- **Date**: 2026-05-20
- **By**: spec-writer
- **Context**: ProductCard's description prop was rendered via `<Text variant="mono">`, applying mono 14 px. The correct treatment is sans body 16 px (prose, not metadata). The natural fix is a scoped `<p class="card-desc">` with explicit font-family/size rules — exactly what ProjectCard already does.
- **Decision**: Replace `<Text variant="mono" case="none" color="dim" class="card-desc">` with `<p class="card-desc">` and a scoped CSS rule (`font-family: var(--sans); font-size: var(--t-body); color: var(--ink-dim); line-height: 1.4; margin: 0`). This mirrors ProjectCard's implementation identically and avoids a `:global()` workaround to override Text's variant defaults.
- **Consequences**: `description` is no longer rendered via the `Text` primitive in ProductCard. This is an accepted deviation from D38 for this specific slot — a plain `<p>` is the semantic element for body prose, and forcing `<Text>` here would require fighting its variant defaults. The `Text` primitive is still used for all other spans (SKU eyebrow, price, stock label, CTA label).
- **Supersedes**: none

## D50: B48 — Nav controlled mode requires both `palette` and `onPaletteToggle`; partial props treated as uncontrolled
- **Date**: 2026-05-20
- **By**: spec-writer
- **Context**: When specifying the controlled/uncontrolled boundary for Nav's palette
  toggle, a choice had to be made about what to do when only one of the two props is
  supplied. Two options: (a) either prop alone activates partial controlled behaviour
  (e.g. only `onPaletteToggle` suppresses localStorage writes); (b) both must be
  present to activate controlled mode; partial supply is treated as uncontrolled.
- **Decision**: Both `palette` and `onPaletteToggle` must be provided to activate
  controlled mode. If only one is supplied, Nav falls back to full uncontrolled
  behaviour (internal `$state`, localStorage read/write, `data-palette` mutation) as
  if neither prop were provided. This avoids a half-controlled state where the glyph
  and the DOM attribute can diverge unpredictably.
- **Consequences**: Consumers who accidentally pass only one prop get uncontrolled
  behaviour silently. The spec documents both mixed-mode cases (AC-10, AC-11) so the
  test-writer can verify the fallback. The website's correct usage always passes both
  props together.
- **Supersedes**: none

## D51: B49 — Nav menu dismiss includes Escape; outside-click via $effect-managed document listener
- **Date**: 2026-05-21
- **By**: spec-writer
- **Context**: B28 deliberately left click-outside-to-close out of scope for the
  `<details>`-based mobile menu. B49 adds it. Two scoping choices arose: (1) whether to
  also add Escape-to-close (the literal bug report only mentions clicking outside), and
  (2) how to keep the document listener SSR-safe and leak-free given the menu only
  renders when `links` is non-empty.
- **Decision**: (1) Include Escape-to-close as part of the same dismiss behaviour — it
  is idiomatic for dismissible overlays and shares the listener lifecycle, so the marginal
  cost is near zero. It is flagged as a non-blocking OQ so it can be dropped if it proves
  awkward, but the default is in-scope. (2) Require the document listener(s) to be
  attached/detached inside an `$effect` (browser-guarded per D7) with a returned cleanup;
  the implementer may keep one always-on listener that early-returns when closed, or
  attach-while-open — either is acceptable provided no duplicate handlers accumulate. The
  ACs target the `<details>` `open` attribute and dispatched DOM events rather than the
  720px media-query visibility, so they are testable at the wide Storybook viewport.
- **Consequences**: Behaviour-only change; markup, CSS, palette/breadcrumb logic
  unchanged. The `$effect` must tolerate the menu element being absent (No Links case).
  Route-change auto-close and focus management remain out of scope.
- **Supersedes**: none

## D52: B49 — Nav dismiss listeners rely on $effect-only SSR-safety, not a `browser` import
- **Date**: 2026-05-22
- **By**: implementer
- **Context**: B49's non-binding implementation notes (and D7) suggested guarding the
  document `pointerdown`/`keydown` listeners with `browser` from `$app/environment`.
  However `svelte-check` in this project cannot resolve `$app/environment` ("Cannot find
  module"), so importing it makes `pnpm check` fail (AC-15 requires 0 TS errors). The
  pre-existing palette `$effect` in `Nav.svelte` already accesses `localStorage`/`document`
  directly with no `browser` guard and passes `pnpm check`.
- **Decision**: Attach/detach the dismiss listeners inside a plain `$effect` (which only
  runs in the browser after hydration, never on the server) with a returned cleanup that
  removes both listeners — no `browser` import. AC-5 explicitly accepts an `$effect`
  "and/or" a `browser` flag, so the `$effect` alone satisfies SSR-safety (D7). This
  matches the established pattern in this file and keeps `pnpm check` clean.
- **Consequences**: One always-on document listener per mounted Nav; the pointer handler
  early-returns unless `menuEl?.open` and the target is outside `menuEl`, the keydown
  handler early-returns unless Escape and open. Tolerates `links` empty (`menuEl`
  undefined) without throwing. If `$app/environment` resolution is fixed project-wide
  later, a `browser` guard could be reintroduced, but it is not required.
- **Supersedes**: none

## D53: B56 — Popover is controlled/bindable and anchored to a `position:relative` parent
- **Date**: 2026-06-14
- **By**: spec-writer (B56)
- **Context**: Porting the design-system `Popover` (`Popover.jsx`) raised two API
  questions: (1) does Popover manage its own open state or is it controlled? (2) how is
  positioning anchored — built-in trigger vs. relative-parent? The reference React
  component keeps `open` in the parent `Trigger` and conditionally mounts `<Popover>`,
  positioning the panel `position:absolute` relative to a `position:relative` wrapper,
  with the trigger button as a sibling outside the panel.
- **Decision**: (1) **Controlled, bindable.** Popover takes `open = $bindable(false)` and
  an `onclose` callback; it never mutates `open` itself, only calls `onclose` on a dismiss
  request (outside `mousedown` or Escape) — identical to the existing `Modal` contract.
  This matches Svelte 5 `$bindable` idioms and keeps state ownership with the consumer.
  (2) **Anchored to the parent.** The panel renders `position:absolute` relative to its
  nearest positioned ancestor (a consumer-provided `position:relative` wrapper). Popover
  ships **no** built-in trigger and **no** `trigger` snippet — the trigger is consumer-
  provided and lives outside the panel. Dismiss listeners (document `mousedown` for
  outside-click, document `keydown` for Escape) are attached only while `open`, inside a
  single `$effect` with returned cleanup, **without** a `browser` import (per D52). Popover
  is non-modal: no `aria-modal`, no focus trap, no backdrop.
- **Consequences**: Consumers wrap the trigger + `<Popover>` in a `position:relative`
  element and own the `open` state (`bind:open` or `open` + `onclose`). Auto-positioning/
  flipping, focus management, a compound `Popover.Trigger`, and animation are out of scope
  (future items). Behaviour ACs mirror Nav/B49's dismissal stories; visual ACs are limited
  to the load-bearing anchoring + surface-token contract per D42.
- **Supersedes**: none

---

### ADR: B56 Popover — positive-control guard against a trivially-passing inside-click test

- **Date**: 2026-06-14
- **By**: test-writer (B56)
- **Context**: AC-12 ("a mousedown inside the panel does NOT call onclose") is a
  negative assertion. Against a no-op / unmounted component it passes vacuously — there
  are simply no listeners — violating the red-green requirement that every test fail when
  the feature is missing. Verified empirically: a minimal stub that ignored all props
  passed the "Keep Open On Inside Click" story while failing the other eight.
- **Decision**: The "Keep Open On Inside Click" story (Story 6) runs a **positive control**
  after the negative assertion: an OUTSIDE `mousedown` MUST call `onclose` exactly once.
  This proves the dismiss machinery is actually wired, so the "inside does not dismiss"
  assertion becomes non-trivial — a no-op component fails the positive control. Re-running
  against the stub confirmed all 9 stories then fail.
- **Consequences**: Story 6 asserts both halves of the outside/inside containment contract
  in one play function. The implementer must wire the document `mousedown` listener (not
  just avoid calling `onclose`) to make it green.
- **Supersedes**: none

## D54: B50 — StatusPill lives in `feedback/`, composes Led + Popover, owns its open state
- **Date**: 2026-06-14
- **By**: spec-writer (B50)
- **Context**: Porting the design-system `StatusPill` (`StatusPill.jsx`) — a clickable
  pill (status LED + uppercase mono label + optional `· detail` suffix) that toggles a
  detail Popover. Three questions: (1) which category does it belong to? (2) does it
  re-implement the LED/floating-panel or reuse the existing primitives? (3) who owns the
  open state? The reference `Led` and the library `Led` already cover all tones (incl.
  `cyan`) and `blink`; the reference `Popover` matches the library's controlled Popover.
- **Decision**: (1) **`feedback/`** — StatusPill is a composite that owns disclosure state
  and depends on `Popover` (which lives in `feedback/`); it sits beside Popover rather than
  in `primitives/`. Story title `Feedback/StatusPill`. (2) **Reuse `Led` + `Popover`**
  (D38) — StatusPill renders `<Led color={tone} {blink} />` (Led's prop is `color`, so
  `tone` → `color` is a 1:1 forward) and a `<Popover>` for the detail panel; no bespoke
  LED markup or floating layer. (3) **StatusPill owns `open`** in local `$state`: the
  trigger `<button>` toggles it and `Popover`'s `onclose` clears it. The Popover is gated
  on `open && children`, so a pill with no detail snippet never opens an empty panel
  (mirrors the reference `open && children`). The `ok` tone uses neutral chrome
  (`--rule-strong` border, `--ink-dim` label); non-`ok` tones colour label + border with
  `var(--<tone>)`; the LED is always tone-coloured.
- **Consequences**: No change to `Led` or `Popover` is required (the only nuance is the
  `tone`→`color` prop-name mapping, handled inside StatusPill). Disclosure dismissal
  (outside-click / Escape) is inherited from Popover and asserted at the StatusPill level.
  A bindable external `open`, a compound `StatusPill.Trigger`, and `tone="off"` in the
  variant matrix are out of scope (future items). StatusPill exports from
  `feedback/index.ts` + `src/lib/index.ts`.
- **Supersedes**: none

## D55: StatusPill tests pin label/detail via `data-part` structural hooks
- **Date**: 2026-06-14
- **By**: test-writer (B50)
- **Context**: B50's tone→colour and typography ACs (7, 9, 11, 12, 13) need to assert
  computed `color`/`font-family`/`text-transform` on the *label* span and the faint
  *detail* suffix span specifically — distinct from the trigger `<button>` and the
  composed `Led`. The reference markup nests an inner detail `<span>` inside the label
  `<span>`; a brittle `querySelector('span span')` would couple tests to nesting depth.
- **Decision**: The StatusPill stories query the label via `[data-part="label"]` and the
  detail suffix via `[data-part="detail"]`. The implementer must mark the label span with
  `data-part="label"` and the (conditional) detail suffix span with `data-part="detail"`.
  When `detail` is absent, no `[data-part="detail"]` element is rendered (asserted in the
  "Without Detail Suffix" story). The LED is still queried by its stable `.led` class
  (Led owns that), and the Popover panel by its `.popover` class (Popover owns that).
- **Consequences**: Adds two non-visual `data-part` attributes to StatusPill's internal
  markup — a documented test contract, not a styling hook. Mirrors the Modal idiom of
  querying internal parts by a stable handle. The `Cannot find module './StatusPill.svelte'`
  and downstream `implicitly has 'any'` svelte-check errors are expected red state until
  the implementer creates the component; verified they all clear once the module exists.
- **Supersedes**: none

## D56: B50 — StatusPill stops trigger `mousedown` propagation to avoid Popover self-dismiss
- **Date**: 2026-06-14
- **By**: implementer (B50), confirmed by reviewer
- **Context**: StatusPill owns its `open` state and toggles it on the trigger's `click`.
  The composed Popover dismisses on a document-level `mousedown` outside its panel (D53).
  A pointer interaction on the trigger fires `mousedown` (which Popover's document listener
  sees as "outside the panel" → `onclose` → `open=false`) *then* `click` (StatusPill toggles
  `open=true`), leaving the panel stuck open and breaking the toggle-closed behaviour (AC-16).
- **Decision**: StatusPill adds `onmousedown={(e) => e.stopPropagation()}` on the trigger so
  the trigger's own `mousedown` never reaches Popover's document dismissal listener. The
  `click` handler then cleanly toggles. Popover is NOT modified.
- **Consequences**: Genuine outside-click dismissal (mousedown on `document.body`, Story 9)
  and Escape dismissal (Story 10) still pass — only the trigger's own mousedown is shielded.
  Any future component that owns a Popover toggled from its own anchor will need the same
  guard; if this recurs, consider promoting it into Popover (an `anchorEl` it ignores).
- **Supersedes**: none

## D57: B51 — SegmentedControl lives in `forms/`, uses `radiogroup`/`radio` semantics with roving tabindex
- **Date**: 2026-06-14
- **By**: spec-writer (B51)
- **Context**: Porting the design-system `SegmentedControl` (`SegmentedControl.jsx`) — a
  horizontal row of joined buttons, exactly one active, selecting a value from a fixed
  set. The reference omits a11y entirely (bare `<button>`s with `onClick`). Two questions
  arose: (1) which category does it belong to? (2) what ARIA pattern — tablist (mirroring
  the library's `Tabs`) or radiogroup (mirroring the library's `RadioGroup`)?
- **Decision**: (1) **`forms/`** — SegmentedControl commits a *value* from a small fixed
  set, exactly like `RadioGroup` and `Select` (both in `forms/`); it does not own view
  panels. Story title `Forms/SegmentedControl`; exports added to `forms/index.ts` and
  `src/lib/index.ts`. (2) **`role="radiogroup"`** on the container + **`role="radio"` +
  `aria-checked`** on each segment, with **roving tabindex** (checked segment `tabindex=0`,
  others `-1`; first segment is the entry point when nothing is selected). Tablist
  semantics were rejected because they imply switching between visible panels, which this
  control does not do, and `radio` matches the same-category `RadioGroup` precedent. The
  container is named via a required `label` prop applied as `aria-label` (no visible
  `<legend>`). Keyboard model is **automatic activation** (Arrow/Home/End move focus AND
  select + fire `onchange`, with wrap-around) per D23. `value` is **bindable** with an
  internal committed copy, per the `Select` idiom, so the active state reflects the user's
  choice even when the caller does not feed `value` back.
- **Consequences**: The component re-uses the established RadioGroup keyboard idiom rather
  than the Tabs idiom. No visible label is rendered (out of scope; `Field` integration is
  a possible follow-up). Disabled segments, multi-select/toggle-off, manual activation,
  vertical orientation, and a compound `SegmentedControl.Item` API are out of scope.
- **Supersedes**: none

### ADR: B51 SegmentedControl — test contract hooks the implementer must honour
- **Date**: 2026-06-14
- **By**: test-writer (B51)
- **Context**: `SegmentedControl.stories.svelte` was written test-first. Most assertions
  use role-based queries (`getByRole('radiogroup' | 'radio', { name })`), which need no
  internal-structure coupling. But two facts the spec calls load-bearing are pinned by a
  stable hook rather than by role, so the implementer must render them exactly:
  (1) AC-2 queries the root via the `.segmented` class and asserts `display: inline-flex`;
  (2) the keyboard/roving-tabindex and active-colour assertions read `aria-checked` and
  `tabindex` directly off each `role="radio"` button.
- **Decision**: The stories file is the contract. To make the new tests green the
  implementer's `SegmentedControl.svelte` must render: a root carrying class **`segmented`**
  with **`role="radiogroup"`** and an `aria-label` defaulting to the `label` prop (an
  explicit `aria-label` via `...rest` must override it — assert in Story 8); one
  **`<button type="button" role="radio">`** per option with **`aria-checked`** reflecting
  selection and **roving `tabindex`** (`0` on the checked segment, or the first segment when
  unselected; `-1` elsewhere); the option's **value** (not its label) passed to `onchange`
  and to the bindable `value`; `display: inline-flex` on the root; `font-size` `11px` (md) /
  `10px` (sm); `text-transform: uppercase` + mono font on segments; active segment
  `background: var(--amber)` / `color: var(--bg)`, inactive `color: var(--ink-faint)` /
  transparent background. Keyboard model: ArrowRight/Down → next, ArrowLeft/Up → previous
  (both wrap), Home → first, End → last, each move focusing AND selecting (automatic
  activation), firing `onchange`.
- **Verification**: Confirmed red-for-the-right-reason — without the component the stories
  file fails to import (`Failed to resolve import "./SegmentedControl.svelte"`), 0 tests
  collected from it, the other 307 tests stay green. A throwaway contract-faithful stub was
  then dropped in temporarily: all 49 files / 315 tests passed (307 + 8), proving the eight
  play functions are well-formed and fail only because the component is missing. The stub
  was removed; `pnpm check` reported 0 errors with the stub present (no new type errors from
  the stories file).
- **Supersedes**: none

## D58: B52 — Gauge lives in `patterns/`, uses `role="progressbar"` as ProgressBar's radial sibling
- **Date**: 2026-06-14
- **By**: spec-writer (B52)
- **Context**: `Gauge` is a new SVG radial progress dial. Two decisions needed pinning
  before test-writer: (1) its home category, and (2) its ARIA role — `meter` vs
  `progressbar`. The existing linear `ProgressBar` lives in `patterns/` and uses
  `role="progressbar"` + `aria-valuenow/min/max` + `aria-label`.
- **Decision**: `Gauge` is filed under `src/lib/components/patterns/` as the radial sibling
  of `ProgressBar`, and exported from `patterns/index.ts` + `src/lib/index.ts`. It uses
  **`role="progressbar"`** (not `meter`): the ARIA `meter` role is for a static measurement
  within a known range, whereas `progressbar` represents progress toward completion — which
  is `ProgressBar`'s established semantics. Reusing `progressbar` keeps the two siblings
  consistent for AT users and matches the existing implementation; `progressbar` also has
  broader AT support than `meter`. The root `<svg>` carries `aria-valuenow={clampedPct}`,
  `aria-valuemin=0`, `aria-valuemax=100`, and `aria-label={label ?? 'Progress'}` (the same
  default name as `ProgressBar`). Decorative usage is opt-in by the consumer passing
  `aria-hidden="true"` via `...rest` (forwarded onto the SVG), not a component-level prop.
  The root is a fixed `<svg>` — no polymorphic `as` prop (polymorphism N/A for an SVG).
  `tone` is an open `string` token name rendered as `stroke="var(--{tone})"`; `track` is a
  full colour string defaulting to `var(--rule-strong)`.
- **Consequences**: Gauge geometry (`r`, `c`, `stroke-dasharray`) is computed and therefore
  testable, so B52 runs the full test-writer → implementer → reviewer pipeline with
  play-function assertions (NOT the D42 visual-only track). The `--{tone}` progress stroke
  is applied as a computed inline attribute (the one unavoidable computed-value attribute);
  all other styling is scoped CSS with tokens only.
- **Supersedes**: none

## D59: B52 — Gauge tests pin the two circles via `data-part="track"`/`data-part="arc"`
- **Date**: 2026-06-14
- **By**: test-writer (B52)
- **Context**: The Gauge stories must distinguish the two `<circle>` elements — the
  background track (asserted against the `track` prop / `--rule-strong`) and the progress
  arc (asserted against `var(--{tone})` and the computed `stroke-dasharray`). Relying on
  DOM order (`querySelectorAll('circle')[0]` vs `[1]`) is brittle and couples tests to
  render order. A stable structural hook is needed so colour/dasharray assertions target
  the right circle.
- **Decision**: The implementer MUST render `data-part="track"` on the **first** (background)
  circle and `data-part="arc"` on the **second** (progress) circle of `Gauge.svelte`. The
  stories query `[data-part="track"]` / `[data-part="arc"]` for per-circle assertions, and
  also assert order (`circles[0] === track`, `circles[1] === arc`) in the Default Geometry
  story so the order contract stays pinned too. These `data-part` attributes are inert
  structural hooks (no styling/behaviour), consistent with the `data-part` convention from
  D55 (StatusPill). OQ-1 resolved empirically: SVG `stroke` resolves via the **foreground**
  paint channel, so stories use `resolveTokenFgColor` (not `resolveTokenColor`) for all
  stroke-colour assertions.
- **Consequences**: `Gauge.svelte` must carry `data-part="track"`/`data-part="arc"` or the
  per-circle colour/dasharray assertions fail. The exact `stroke-dasharray` string is
  asserted from the spec formula `` `${(clamp(pct,0,100)/100)*c} ${c}` `` with
  `c = 2π·((size-width-3)/2)` — the implementer must build the attribute with the identical
  template so the rendered string matches byte-for-byte.
- **Supersedes**: none

## D60: B53 — ProportionBar lives in `patterns/`, uses `role="img"` + legend (not `progressbar`)
- **Date**: 2026-06-14
- **By**: spec-writer (B53)
- **Context**: Porting the design-system `ProportionBar` — a horizontal stacked share bar
  (part-to-whole) whose segment widths are computed from values, plus a per-segment
  legend. Two decisions needed pinning before test-writer: (1) its home category, and (2)
  its ARIA role. Its data-viz siblings are `Gauge` (radial, `role="progressbar"`, D58) and
  the linear `ProgressBar` (`role="progressbar"`), both in `patterns/`.
- **Decision**: (1) **`patterns/`** — ProportionBar files under
  `src/lib/components/patterns/` beside `ProgressBar`/`Gauge`, exported from
  `patterns/index.ts` + `src/lib/index.ts`; story title `Patterns/ProportionBar`.
  (2) **`role="img"` + `aria-label={label ?? 'Proportion'}`** on the root `<svg>` — NOT
  `progressbar`/`meter`. A stacked share bar is a *pictorial summary* of a composition,
  not progress toward completion (ProgressBar/Gauge) nor a single measurement (meter), so
  there is no single `aria-valuenow`. The bar is announced as one named image; the
  per-segment breakdown is exposed as real text via a sibling `<ul>` legend (label +
  optional valueLabel), which is the accessible complement to the image summary and is
  never `aria-hidden`. (3) **No polymorphic `as`** (root is intrinsically an `<svg>`);
  `...rest` (incl. `SVGAttributes`) forwards onto the root `<svg>`, enabling a decorative
  fallback (`aria-hidden="true"`). Stateless and SSR-safe (no `$effect`, no browser
  globals). The component is geometry-computing → **full pipeline** (test-writer →
  implementer → reviewer), NOT the D42 visual-only track.
- **Decision (test contract)**: rects/legend parts carry stable `data-part` hooks
  (`segment`, `swatch`, `legend-label`, `value-label`, `root`) since `<rect>`/`<span>`
  have no accessible role — mirrors the `data-part` convention from D55/D59. The 2px
  inter-segment gap is carved from each rect's right edge (`width = w − gap`, last segment
  no gap) while the running `x` offset accumulates the **un-gapped** `w(i)`; `total = sum
  of clamped(value) || 1` (zero-total → fallback 1, no division-by-zero); negative values
  clamp to 0. Canonical numeric example 42/28/18/12 → widths `[418,278,178,120]`, x
  `[0,420,700,880]`.
- **Consequences**: The implementer must render `role="img"`, the legend `<ul>`, and the
  `data-part` hooks exactly. The only inline styling is the caller-supplied per-segment
  `color` (rect `fill` + swatch `background`); all other styling is scoped CSS with tokens
  (D45). Tooltips/interactivity, animation, auto-formatted value labels, and vertical
  orientation are out of scope (future items).
- **Supersedes**: none
- **Test-writer note (2026-06-14)**: `ProportionBar.stories.svelte` adopts the D60
  `data-part` contract verbatim — no new hooks introduced. The implementer MUST render:
  `[data-part="root"]` wrapper (`<svg>` then `<ul>` as children), `<rect data-part="segment">`
  per segment in source order, and per legend `<li>` a `[data-part="swatch"]`,
  `[data-part="legend-label"]`, and (only when `valueLabel` set) `[data-part="value-label"]`,
  in that order. Label is uppercase mono `--ink-faint`; the `<svg>` carries scoped
  `border 1px var(--rule)` + `background var(--bg-sunken)` + `display:block`. The spec's
  8-story plan is realised as **9** stories: the "Labelled" story is split into "Labelled"
  (custom `label`) and "Default Label" (asserts the `'Proportion'` default) to cover both
  branches of AC 17 with `getByRole('img', { name })`.

## D61: B54 — CompareBars lives in `patterns/`; per-row `role="img"` + outer `role="group"`; over/under not colour-only
- **Date**: 2026-06-14
- **By**: spec-writer (B54)
- **Context**: Porting the design-system `CompareBars` — a stack of target-vs-actual rows
  (each row: an uppercase mono label, a track holding a ghost target fill under an actual
  fill, and a value caption). Bar widths are computed from `value`/`target`/`max`. Two
  decisions needed pinning before test-writer: (1) home category, and (2) the ARIA model
  for a multi-row chart, given the over/under state is expressed visually as a
  `--danger`/`--ok` (and `--danger`/`--ink-faint`) colour shift, which alone would
  violate WCAG 1.4.1 (Use of Colour).
- **Decision**: (1) **`patterns/`** — CompareBars files under
  `src/lib/components/patterns/` beside `ProgressBar`/`Gauge`/`ProportionBar`, exported
  from `patterns/index.ts` + `src/lib/index.ts`; story title `Patterns/CompareBars`.
  (2) **Per-row `role="img"`** with a summarizing `aria-label`
  (`` `${label}: ${value} of ${target}, ${over ? 'over target' : 'within target'}` ``) on
  each `[data-part="row"]`, and an outer **`role="group"`** with
  `aria-label={label ?? 'Comparison'}` on the root. A multi-row comparison chart is a set
  of small pictorial summaries, not progress toward completion (so not `progressbar`,
  unlike Gauge/ProgressBar) and not one composite share image (unlike ProportionBar's
  single `role="img"`). Exposing each row's label/value/target/over-state as text in the
  `aria-label` makes the over/under distinction available in a non-colour channel — and
  the visible `valueLabel` caption (e.g. `€180 / 140`) carries both numbers as text too —
  so the `--danger`/`--ok` colour shift is redundant reinforcement, satisfying WCAG 1.4.1.
  (3) Unlike Gauge/ProportionBar (intrinsic `<svg>` roots), CompareBars' root is a block
  element, so it **does** offer a polymorphic `as` prop (default `'div'`) with `...rest`
  forwarding. Geometry is computed → **full pipeline** (test-writer → implementer →
  reviewer) with play-function assertions, NOT the D42 visual-only track. The only dynamic
  inline values are the two fills' `width: <n>%` strings; all other styling is scoped CSS
  with tokens (D45). `max = Math.max(1, ...targets, ...values)` guards divide-by-zero;
  `targetW = (target/max)*100`, `actualW = min(100, (value/max)*100)`.
- **Consequences**: The implementer must render the `data-part` hooks (`root`, `row`,
  `label`, `track`, `target-fill`, `actual-fill`, `value-label`), the per-row `role="img"`
  aria-labels, and the outer `role="group"` exactly. If a future review prefers list
  semantics (`role="list"`/`listitem`) it can change without an API break. Tooltips,
  width animation, value-label formatting, and a compound `CompareBars.Row` API are out of
  scope.
- **Supersedes**: none

## D62: B55 — Pager lives in `navigation/`, uses native `<button>` + `<nav>` landmark + `aria-live` label
- **Date**: 2026-06-14
- **By**: spec-writer (B55)
- **Context**: Porting the design-system `Pager` (`Pager.jsx`) — a controlled
  prev / label / next stepper (two arrow `<button>`s flanking a centered uppercase mono
  label, arrows disabling at range edges). Three decisions needed pinning before
  test-writer: (1) home category, (2) native `<button>` vs the `Button` primitive for the
  bespoke arrows, and (3) the a11y model, given the glyphs `‹`/`›` carry no accessible
  name and the label changes after each click.
- **Decision**: (1) **`navigation/`** — Pager is a pagination control; it files under
  `src/lib/components/navigation/` beside `Nav`/`Breadcrumb`, exported from
  `navigation/index.ts` + `src/lib/index.ts`; story title `Navigation/Pager`. (2) **Native
  `<button>`, not `Button`** — the arrow styling is bespoke (`6px 12px` padding, mono
  `14px`, `--ink-dim` enabled / `--rule-strong` disabled, `cursor: not-allowed`) and
  matches none of `Button`'s six variants; forcing `Button` would mean fighting its
  variant defaults. This is an accepted narrow exception to **D38**, on the same footing
  as D49 (ProductCard plain `<p>`) and D54 (StatusPill native trigger). (3) **A11y**: root
  is a **`<nav>` landmark** with `aria-label` (default `'Pagination'`, overridable via
  `...rest`); each arrow gets an explicit accessible name via `prevLabel`/`nextLabel`
  props (`aria-label`, defaults `'Previous'`/`'Next'`) because the glyphs are
  non-readable; the label `<span>` is an **`aria-live="polite"`** region so the new page
  label is announced after a click. Disabled arrows use the **native `disabled`**
  attribute (removes them from tab order and suppresses the callback). Pager is
  controlled and stateless (no `$state`/`$effect`/browser globals → SSR-safe). `onPrev`/
  `onNext` are optional (a disabled-edge pager needs no callback).
- **Consequences**: Behaviour + a11y ACs run the full test-writer → implementer →
  reviewer pipeline with play-function assertions; load-bearing visual tokens
  (`--rule-strong` border, `--bg-rail` bg, `--ink-dim`/`--rule-strong` arrow colours,
  `--ink` label) are also asserted (the design's defining surface). CSS is scoped with
  native nesting (D45) and references **only** tokens that exist in `tokens.css`; the
  micro font-sizes (`14px`/`12px`), paddings (`6px 12px`/`0 10px`), `letter-spacing
  0.08em`, and `min-width` are literal px — there is no matching token, and the house
  convention permits literal px for mono micro-labels (StatusPill `11px`, Breadcrumb
  `11px`). Explicitly do NOT invent tokens (regression guard for the earlier `--u1` bug).
  Numbered page buttons, first/last jump buttons, and a compound API are out of scope.
- **Supersedes**: none

## D63: B55 — Pager label span carries `data-part="label"` as the test/styling hook
- **Date**: 2026-06-14
- **By**: test-writer (B55)
- **Context**: The Pager play functions must target the centered label `<span>` to
  assert its text, `aria-live="polite"`, typography tokens, and `min-width`. Arrow
  buttons are reachable by `getByRole('button', { name })` and the root by
  `getByRole('navigation', { name })`, but the label span has no role and no accessible
  name of its own, so it needs a stable, structural selector that survives refactors.
- **Decision**: The label `<span>` carries **`data-part="label"`**. Tests select it via
  `canvasElement.querySelector('[data-part="label"]')`. The implementer **must** put
  `data-part="label"` on the label span. This mirrors the house `data-part` convention
  used elsewhere for non-role-bearing internal elements.
- **Consequences**: A small, stable contract hook the implementer honours. No new role
  or ARIA semantics are implied by `data-part` (it is a data attribute only). If the
  implementer later gives the label a role/name, the hook can be revisited.
- **Supersedes**: none
