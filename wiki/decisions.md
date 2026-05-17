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
