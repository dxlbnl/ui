# B12: Story rewrite

## Context

All `.stories.svelte` files were written before the stories guide (`wiki/stories-guide.md`)
was finalised. They have several structural defects that reduce Storybook usability and
violate the now-canonical pattern:

- Missing `component:` in `defineMeta` — the Storybook autodocs prop table is blank.
- Props hard-coded in the template slot (e.g. `<Button variant="primary">`) instead of
  passed via story `args` — the Storybook controls panel has nothing to control.
- `resolveTokenColor` / `resolveTokenFgColor` helpers copy-pasted into every file —
  a shared utility should be extracted once.
- `expect(x).not.toBeNull()` null-guard assertions — the stories guide prohibits these;
  query APIs throw if the element is missing.
- `// AC n, m, k` inline comments — bookkeeping noise that belongs in git history only.
- `data-testid="stack-root"` / `querySelector("[data-testid='...']")` patterns on layout
  component roots — the guide prefers `canvasElement.firstElementChild` when an
  accessible query cannot be used.
- Redundant `as HTMLElement` casts after `querySelector` — only permitted in the
  `canvasElement.firstElementChild as HTMLElement` root pattern.

Relevant wiki pages: `wiki/stories-guide.md`, `wiki/architecture.md`,
`wiki/specs/B3-layout-components.md`, `wiki/specs/B4-primitive-components.md`,
`wiki/specs/B5-card-components.md`.

This item is purely mechanical: every play function assertion and its expected value
stays exactly the same. Only the structural scaffolding changes.

---

## Shared utility — `src/lib/storybook-utils.ts`

A new file is created at `src/lib/storybook-utils.ts` and exported from there. No
component may define these helpers locally after this rewrite.

```ts
// src/lib/storybook-utils.ts

/**
 * Resolves a CSS custom property to its computed background-color RGB string.
 * Use for token comparisons that need a background channel
 * (background-color, border-color).
 */
export function resolveTokenColor(token: string): string {
  const el = document.createElement('div')
  el.style.backgroundColor = `var(${token})`
  el.style.position = 'absolute'
  el.style.opacity = '0'
  document.body.appendChild(el)
  const value = getComputedStyle(el).backgroundColor
  document.body.removeChild(el)
  return value
}

/**
 * Resolves a CSS custom property to its computed foreground color RGB string.
 * Use for color/border-color comparisons.
 */
export function resolveTokenFgColor(token: string): string {
  const el = document.createElement('div')
  el.style.color = `var(${token})`
  el.style.position = 'absolute'
  el.style.opacity = '0'
  document.body.appendChild(el)
  const value = getComputedStyle(el).color
  document.body.removeChild(el)
  return value
}
```

Both functions are identical to the inline helpers currently duplicated across story files.
The local `resolveToken` (background-channel only), `resolveTokenBorderColor` (alias for
fg-channel), and any other local variants are replaced by the two canonical exports.

---

## Per-category rules

### Category A — Primitives (Button, Led, TagPill)

**Button.stories.svelte**

- Add `component: Button` to `defineMeta`.
- Remove the local `resolveToken` helper entirely. Replace the local `resolveTokenColor`
  with an import from `storybook-utils`.
- Move each component's props out of the slot template and into story `args`:
  - `variant`, `disabled`, `as`, `href` become `args` keys.
  - The slot retains only the text content (button label).
- The "As Link" story: `args={{ as: 'a', href: '#demo', variant: 'ghost' }}`, slot
  contains `View Demo →`.
- Do not add `component:` concerns to the "Paired With Text" slot pattern — Button
  stories use `component: Button` so the slot must not contain another `<Button>`.
  The "As Link" story continues to work because `as="a"` is passed via `args`.

**Led.stories.svelte**

- Add `component: Led` to `defineMeta`.
- Replace local `resolveTokenColor` with import from `storybook-utils`.
- Move `color`, `blink`, `aria-label` to story `args`.
- Remove all `expect(el).not.toBeNull()` guards.
- Remove all `as HTMLElement` casts that follow `querySelector`.
- Replace `canvasElement.querySelector("[aria-label]")` with
  `within(canvasElement).getByRole('status')` — Led renders `role="status"` on the span.
- The "Paired With Text" story cannot use `component: Led` (it renders a wrapping div
  with a `<Led>` + a `<span>` sibling). This story moves to a separate
  `Led.composition.stories.svelte` with no `component:` in `defineMeta`, OR the
  wrapping div + children remain in the slot with `component:` absent from that one
  story. **Chosen approach**: keep the composition story in a separate
  `Led.composition.stories.svelte` without `component:` so the main file is clean.

**TagPill.stories.svelte**

- Add `component: TagPill` to `defineMeta`.
- Replace local `resolveTokenColor` and `resolveTokenFgColor` with imports from
  `storybook-utils`.
- Move `variant` to story `args`.
- The slot retains only the text content (pill label).
- The "Multiple Pills" story renders multiple instances — it cannot use `component:`
  without causing a double-render. Move to `TagPill.composition.stories.svelte` without
  `component:`. The play function logic is unchanged.

---

### Category B — Layout (Stack, Inline, Spread, Grid, Container, Rule)

The defining change for layout stories is:
1. Add `component: <ComponentName>` to `defineMeta`.
2. Move layout props (`gap`, `cols`, `as`, `minColWidth`, `size`, `variant`, `aria-label`,
   etc.) to story `args`.
3. Remove `data-testid` attributes from the component in the slot and from
   `querySelector` calls. Replace root queries with `canvasElement.firstElementChild as HTMLElement`.
4. Remove all `expect(root).not.toBeNull()` guards.
5. Remove all `// AC n` comment lines.
6. The slot keeps only the child elements (the content the layout component wraps).

Because each story renders exactly one layout component as the direct child of the story
canvas, `canvasElement.firstElementChild` is a reliable and attribute-free root reference.

**Complication — multiple stories per file need different children in the slot.**
In the current Svelte CSF format, `args` control the component props and the slot is
fixed per story instance via the `<Story>` template content. Each `<Story>` tag can have
its own slot children. That is already the case in the existing files. This does not
change — the slot children for each story remain exactly as they are, minus the
`data-testid` attributes on the root component element (which moves to `args`).

**Stack.stories.svelte** — 6 stories

| Story | `args` keys | Root query |
|-------|-------------|------------|
| Default Stack | `gap="sm"`, `aria-label="test-label"` | `canvasElement.firstElementChild` |
| Large Gap | `gap="lg"` | `canvasElement.firstElementChild` |
| Small Gap | `gap="xs"` | `canvasElement.firstElementChild` |
| As Section | `as="section"`, `gap="md"` | `canvasElement.firstElementChild` |
| None Gap | `gap="none"` | `canvasElement.firstElementChild` |
| XL Gap | `gap="xl"` | `canvasElement.firstElementChild` |

**Inline.stories.svelte** — 4 stories

| Story | `args` keys | Root query |
|-------|-------------|------------|
| Tag Row | `gap="sm"`, `aria-label="test-label"` | `canvasElement.firstElementChild` |
| None Gap | `gap="none"` | `canvasElement.firstElementChild` |
| Button Row | `gap="md"` | `canvasElement.firstElementChild` |
| Large Gap | `gap="lg"` | `canvasElement.firstElementChild` |

**Spread.stories.svelte** — 2 stories

| Story | `args` keys | Root query |
|-------|-------------|------------|
| Section Header | `aria-label="test-label"` | `canvasElement.firstElementChild` |
| Led Status Bar | (none — Spread has no configurable gap prop) | `canvasElement.firstElementChild` |

**Grid.stories.svelte** — 5 stories

| Story | `args` keys | Root query |
|-------|-------------|------------|
| Three Column | `cols={3}`, `gap="sm"` | `canvasElement.firstElementChild` |
| Two Column | `cols={2}`, `gap="lg"` | `canvasElement.firstElementChild` |
| Four Column | `cols={4}`, `gap="sm"` | `canvasElement.firstElementChild` |
| Auto Fill | `cols="auto"`, `minColWidth="160px"`, `gap="sm"` | `canvasElement.firstElementChild` |
| Single Column | `cols={1}`, `gap="md"` | `canvasElement.firstElementChild` |

Grid play functions access `(root as HTMLElement).style.gridTemplateColumns` — this
remains a valid approach because Grid sets the column template as an inline style.

**Container.stories.svelte** — 4 stories

| Story | `args` keys | Root query |
|-------|-------------|------------|
| Large | `size="lg"`, `aria-label="test-label"` | `canvasElement.firstElementChild` |
| Medium | `size="md"` | `canvasElement.firstElementChild` |
| Small | `size="sm"` | `canvasElement.firstElementChild` |
| As Main | `as="main"`, `size="md"` | `canvasElement.firstElementChild` |

**Rule.stories.svelte** — 2 stories

Rule is a leaf component (no children). The "All Variants" story renders three `<Rule>`
instances side-by-side inside a `<Stack>` wrapper — this is a composition. It cannot use
`component: Rule` without a double-render.

- **All Variants**: `component:` is omitted from `defineMeta` for this file (or only
  for this story). The play function queries `canvasElement.querySelectorAll("hr")`
  as it does today — this query targets the semantic `<hr>` elements, which is
  accessible. Replace `resolveTokenBorderColor` with `resolveTokenFgColor` imported
  from `storybook-utils`.
- **In Context**: same situation — wraps `<Rule>` inside a `<Stack>`. The
  `canvasElement.querySelector("hr")` query (semantic `<hr>` tag) is already
  compliant with the guide. Keep as-is. Remove the `as HTMLElement` cast and the
  `expect(hr).not.toBeNull()` guard. Remove `// AC n` comments.

Because Rule's two stories are both composition-style (multiple elements in the slot),
the `component:` field is **left out of `defineMeta`** for this file. This is
consistent with the guide's "composition stories" note.

---

### Category C — Cards (Card, ProductCard, ProjectCard, NoteCard)

Card story files render the card component with all its props provided directly in the
template. With `component:` added to `defineMeta`, the component is auto-rendered from
`args` and the slot must be empty (or contain sub-component snippets for `Card` which
accepts children).

**Special case — Card.stories.svelte**: `Card` accepts `children`. So the slot pattern
is: `args` holds `as` and `href`; the slot holds only the child content (`<p>`, `<h2>`,
etc.), not the `<Card>` wrapper. This is the standard children-in-slot pattern.

**ProductCard, ProjectCard, NoteCard**: these components have no children prop — they
render everything internally from typed props. With `component:` set, the stories become
self-closing (no slot content needed). All props move to `args`. The slot is empty.

Root query pattern: because `component:` wraps the story canvas with the component, the
root element is `canvasElement.firstElementChild`. Replace all
`canvasElement.querySelector("[data-testid='card']")` with
`canvasElement.firstElementChild as HTMLElement`. The `data-testid="card"` attribute is
removed from the template (it was only needed for the selector and is no longer used).

**Card.stories.svelte** — 3 stories

| Story | `args` keys | Slot content |
|-------|-------------|--------------|
| Default | (none — default `as="div"`) | `<p>A simple card body.</p>` |
| As Article | `as="article"` | `<h2>Title</h2><p>Body.</p>` |
| As Link | `as="a"`, `href="#demo"` | `<span>View demo</span>` |

Remove local `resolveTokenColor` and `resolveTokenFgColor`; import from `storybook-utils`.
Remove all `not.toBeNull()` guards. Remove `// AC n` comments.

**ProductCard.stories.svelte** — 6 stories

All data props (`href`, `sku`, `name`, `description`, `price`, `status`, `ctaLabel`,
`as`) move to `args`. Slot is empty (self-closing `<Story ... />`).
Remove `data-testid="card"` from args. Root accessed via
`canvasElement.firstElementChild as HTMLElement`.
Remove local `resolveTokenColor`; import from `storybook-utils`.
Remove all `not.toBeNull()` guards. Remove `// AC n` comments.

**ProjectCard.stories.svelte** — 3 stories

All props (`href`, `slug`, `title`, `description`, `tags`, `ctaLabel`, `as`) move to
`args`. Slot is empty. Root via `canvasElement.firstElementChild as HTMLElement`.
Remove all `not.toBeNull()` guards. Remove `// AC n` comments.

**NoteCard.stories.svelte** — 4 stories

All props (`href`, `idx`, `kind`, `title`, `lede`, `date`, `as`) move to `args`. Slot
is empty. Root via `canvasElement.firstElementChild as HTMLElement`.
Remove local `resolveTokenFgColor`; import from `storybook-utils`.
Remove all `not.toBeNull()` guards. Remove `// AC n` comments.

---

### Category D — Tokens (tokens.stories.svelte)

This file has no single component to set `component:` to — it uses a custom
`ColorSwatch.svelte` visualiser that is not a design-system component. `component:` stays
absent. The file is otherwise already close to the guide pattern.

Changes:
- Remove any `expect(x).not.toBeNull()` guards (there are none currently).
- Remove any `// AC n` comments (there are none currently).
- No `resolveTokenColor` helper exists in this file (the helpers are not needed here).
- No changes to play functions, story names, or template content.

---

## Target file list

| File | Changes |
|------|---------|
| `src/lib/storybook-utils.ts` | **NEW** — exports `resolveTokenColor`, `resolveTokenFgColor` |
| `src/lib/tokens/tokens.stories.svelte` | No structural changes needed; verify no null-checks or AC comments exist |
| `src/lib/components/primitives/Button.stories.svelte` | Add `component: Button`; props to `args`; import helpers from `storybook-utils`; remove local helpers; children only in slot |
| `src/lib/components/primitives/Led.stories.svelte` | Add `component: Led`; `color`/`blink`/`aria-label` to `args`; use `getByRole('status')`; remove null-checks and casts; import helpers; move "Paired With Text" to new composition file |
| `src/lib/components/primitives/Led.composition.stories.svelte` | **NEW** — "Paired With Text" story without `component:` |
| `src/lib/components/primitives/TagPill.stories.svelte` | Add `component: TagPill`; `variant` to `args`; import helpers; children only in slot; move "Multiple Pills" to composition file |
| `src/lib/components/primitives/TagPill.composition.stories.svelte` | **NEW** — "Multiple Pills" story without `component:` |
| `src/lib/components/layout/Stack.stories.svelte` | Add `component: Stack`; all props to `args`; root via `firstElementChild`; remove `data-testid`; remove null-checks/casts/AC-comments |
| `src/lib/components/layout/Inline.stories.svelte` | Add `component: Inline`; all props to `args`; root via `firstElementChild`; remove `data-testid`; remove null-checks/casts/AC-comments |
| `src/lib/components/layout/Spread.stories.svelte` | Add `component: Spread`; `aria-label` to `args`; root via `firstElementChild`; remove `data-testid`; remove null-checks/casts/AC-comments |
| `src/lib/components/layout/Grid.stories.svelte` | Add `component: Grid`; all props to `args`; root via `firstElementChild`; remove `data-testid`; remove null-checks/casts/AC-comments |
| `src/lib/components/layout/Container.stories.svelte` | Add `component: Container`; all props to `args`; root via `firstElementChild`; remove `data-testid`; remove null-checks/casts/AC-comments |
| `src/lib/components/layout/Rule.stories.svelte` | No `component:` (composition stories); replace local `resolveTokenBorderColor` with `resolveTokenFgColor` from `storybook-utils`; remove null-checks/casts/AC-comments |
| `src/lib/components/cards/Card.stories.svelte` | Add `component: Card`; `as`/`href` to `args`; children only in slot; import helpers; remove null-checks/casts/AC-comments |
| `src/lib/components/cards/ProductCard.stories.svelte` | Add `component: ProductCard`; all props to `args`; self-closing stories; remove `data-testid`; root via `firstElementChild`; import helpers; remove null-checks/casts/AC-comments |
| `src/lib/components/cards/ProjectCard.stories.svelte` | Add `component: ProjectCard`; all props to `args`; self-closing stories; remove `data-testid`; root via `firstElementChild`; remove null-checks/AC-comments |
| `src/lib/components/cards/NoteCard.stories.svelte` | Add `component: NoteCard`; all props to `args`; self-closing stories; remove `data-testid`; root via `firstElementChild`; import helpers; remove null-checks/casts/AC-comments |

Total story files touched: 14 existing + 3 new (storybook-utils, Led.composition, TagPill.composition) = 17 files.

---

## Invariants to preserve

- All play functions that exist today continue to exist after the rewrite. No play
  function may be deleted or merged.
- Every assertion value is unchanged (pixel measurements, colour comparisons, text
  content, tag names, attribute values).
- Story names are unchanged: "Default Stack", "Tag Row", "Coming Soon", etc.
- `pnpm test` must report at least as many passing tests after the rewrite as before.
  The baseline count before this item is the number reported by `pnpm test` at the start
  of B12 implementation (target: all play functions pass, count >= 62 across all files).
- The `// ── Name ──` section divider comments in script blocks are decorative and may
  be kept or removed — they are not AC comments and do not reference spec line numbers.

---

## Acceptance criteria

1. `src/lib/storybook-utils.ts` exists and exports exactly two named functions:
   `resolveTokenColor(token: string): string` and `resolveTokenFgColor(token: string):
   string`. Both functions are pure TypeScript with no Svelte-specific imports.

2. `Button.stories.svelte` imports `resolveTokenColor` from `../../../storybook-utils`
   (or the equivalent relative path) and contains no locally-defined `resolveToken`,
   `resolveTokenColor`, or `resolveTokenFgColor` helper.

3. `Led.stories.svelte` imports `resolveTokenColor` from `storybook-utils` and contains
   no locally-defined helper.

4. Every story file that previously defined `resolveTokenColor` or `resolveTokenFgColor`
   locally now imports the relevant function(s) from `storybook-utils` instead. No file
   defines either helper locally.

5. `Button.stories.svelte` `defineMeta` call includes `component: Button`.

6. `Led.stories.svelte` `defineMeta` call includes `component: Led`.

7. `TagPill.stories.svelte` `defineMeta` call includes `component: TagPill`.

8. `Stack.stories.svelte` `defineMeta` call includes `component: Stack`.

9. `Inline.stories.svelte` `defineMeta` call includes `component: Inline`.

10. `Spread.stories.svelte` `defineMeta` call includes `component: Spread`.

11. `Grid.stories.svelte` `defineMeta` call includes `component: Grid`.

12. `Container.stories.svelte` `defineMeta` call includes `component: Container`.

13. `Card.stories.svelte` `defineMeta` call includes `component: Card`.

14. `ProductCard.stories.svelte` `defineMeta` call includes `component: ProductCard`.

15. `ProjectCard.stories.svelte` `defineMeta` call includes `component: ProjectCard`.

16. `NoteCard.stories.svelte` `defineMeta` call includes `component: NoteCard`.

17. In every layout story file (Stack, Inline, Spread, Grid, Container), layout props
    (`gap`, `cols`, `as`, `size`, `minColWidth`) are passed via the `args` object on
    each `<Story>` tag. The slot template for each story contains only the child elements
    and no layout prop attributes on the root component element.

18. No layout story file (Stack, Inline, Spread, Grid, Container) contains a
    `data-testid` attribute on the layout component element in the story slot.

19. In every layout story play function (Stack, Inline, Spread, Grid, Container), the
    root element is accessed via `canvasElement.firstElementChild` (not via
    `querySelector` with a `data-testid` selector).

20. In ProductCard, ProjectCard, and NoteCard story files, all typed component props
    are passed via `args` and the story slot is empty (stories are self-closing). No
    `data-testid="card"` attribute appears in the story template.

21. In ProductCard, ProjectCard, and NoteCard play functions, the root element is
    accessed via `canvasElement.firstElementChild as HTMLElement` (replacing all
    `querySelector("[data-testid='card']")` calls).

22. No story file anywhere contains `expect(x).not.toBeNull()` or
    `expect(x).toBeNull()` where `x` was obtained from `querySelector` as a null-check
    guard. (Legitimate `toBeNull()` assertions that are part of the business logic — such
    as `expect(canvasElement.querySelector('.card-price')).toBeNull()` verifying absence
    of an element — are preserved as-is.)

23. No story file anywhere contains inline `// AC n` comments where `n` is one or more
    integers (e.g. `// AC 15, 18, 22` or `// AC 12:`). The pattern to reject is a
    comment that begins with `// AC` followed by digits.

24. `pnpm check` completes with 0 TypeScript errors across all `.svelte` and `.ts` files.

25. `pnpm test` runs all play functions and all pass. The passing count is greater than
    or equal to 62 (the baseline count before this rewrite).

26. `@storybook/addon-a11y` reports no violations on any story when viewed in Storybook
    (`pnpm storybook`). All a11y checks pass.

---

## What NOT to change

- Play function logic: conditional branches, which element is queried, which assertion
  is made, what value is expected.
- Story names (the `name` prop on each `<Story>` tag).
- Assertion values: pixel measurements, colour comparisons, text strings, ARIA attribute
  values.
- The `tokens.stories.svelte` template content (the type-scale markup, colour swatch
  setup, semantic element showcase).
- The `ColorSwatch.svelte` component — it is a story fixture, not a design-system
  component, and is out of scope.
- Import paths for components themselves (e.g. `import Button from './Button.svelte'`).
- The `tags: ['autodocs']` entry in `defineMeta`.

---

## Out of scope

- Adding new stories or covering new variants. This item only rewrites existing stories.
- Changing component implementation files (`.svelte` other than story files).
- Writing stories for B6 (Nav) or any not-yet-built component.
- Fixing play function logic errors (if a play function asserts the wrong value, that is
  a separate bug).
- Adding `data-testid` to any element as a new pattern.
- Changing the `ColorSwatch.svelte` visualiser component.
- The `storybook-utils.ts` file being exported from `src/lib/index.ts` — it is a test
  helper, not a public library API.

---

## Open questions

None that block implementation. The pattern for every case is specified above. The one
judgement call — whether Rule stories use `component:` — is resolved: `component:` is
omitted from `Rule.stories.svelte` because both stories are composition-style with
multiple `<Rule>` instances.
