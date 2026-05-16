# B11: Storybook catalogue

## Context

B11 is a catalogue quality pass with two distinct goals:

1. **Consistency pass** — several existing story files were written in earlier backlog
   items with shallow coverage: only 2–3 stories each, play functions that assert
   visibility but not computed styles, and in one case (`Table.stories.svelte`) spec AC
   code references embedded as comments in story names and inline comments. This item
   fills those coverage gaps so every component has meaningful, representative stories.

2. **Token documentation** — `src/lib/tokens/tokens.stories.svelte` already exists with
   4 stories (`Color Tokens`, `Type Scale`, `Labels`, `Semantic Elements`), but the
   prompt specifies a revised structure with different story names and additional spacing
   coverage. This item brings the token stories into alignment with the intended
   catalogue structure.

Related wiki pages:
- [stories-guide.md](../stories-guide.md) — canonical story format, play function rules,
  token color resolution, query priority order
- [wiki/specs/B2-design-tokens.md](B2-design-tokens.md) — all token names and values
- [architecture.md](../architecture.md) — component authoring conventions
- [decisions.md](../decisions.md) — D1 (tests = story play functions), D9 (composition
  stories), D14 (variant class naming)

The current suite has **156 stories** across 39 files. Every new story with a `play`
function adds to that count. Stories without `play` functions are visual documentation
only and do not count as tests.

---

## Acceptance criteria

### Part 1 — Consistency pass on existing stories

#### AC-1 through AC-5: Spread.stories.svelte

**AC-1.** `Spread.stories.svelte` contains at least 4 stories: `Section Header`,
`Led Status Bar`, `With Gap`, and `Vertical Stack`.

**AC-2.** The `With Gap` story demonstrates how `Spread` fills available space between
its children. Its play function:
- Gets `canvasElement.firstElementChild` as the root element.
- Asserts `getComputedStyle(root).display` is `"flex"`.
- Asserts `getComputedStyle(root).justifyContent` is `"space-between"`.
- Asserts `getComputedStyle(root).gap` is not `"0px"` (confirming gap is applied).

**AC-3.** The `Vertical Stack` story renders a `Spread` element with `as="section"` and
`aria-label` forwarded. Its play function:
- Asserts `canvasElement.firstElementChild.tagName` is `"SECTION"` (polymorphic `as`
  prop forwarded to the rendered element).
- Asserts `getComputedStyle(root).display` is `"flex"`.
- Asserts `root.getAttribute("aria-label")` is the value passed in args (confirming
  `...rest` forwarding).

**Note:** `Spread.svelte` has no `gap` or `direction` style props — the component uses a
fixed `gap: var(--u2)` and `flex-direction: row`. The `With Gap` story demonstrates the
existing gap behavior; `Vertical Stack` demonstrates `as`-prop polymorphism. If a future
refactor adds style props, these stories should be updated.

#### AC-6 through AC-8: Rule.stories.svelte

**AC-6.** `Rule.stories.svelte` contains at least 3 stories: `All Variants`, `In
Context`, and `With Margin Override`.

**AC-7.** The `With Margin Override` story passes `style="margin-top: 24px; margin-bottom:
24px"` (or equivalent inline style) to a `Rule` via `...rest`. Its play function:
- Queries the `<hr>` by `getAllByRole("separator")[0]` or
  `canvasElement.querySelector("hr")`.
- Asserts `getComputedStyle(hr).marginTop` is `"24px"`.
- Asserts `getComputedStyle(hr).marginBottom` is `"24px"`.
  This confirms `...rest` attribute forwarding works for style overrides.

**AC-8.** The existing `All Variants` and `In Context` stories are unchanged and still
pass.

#### AC-9 through AC-12: Card.stories.svelte

**AC-9.** `Card.stories.svelte` contains at least 5 stories: `Default`, `As Article`,
`As Link`, `Computed Styles`, and `Hover Border`.

**AC-10.** The `Computed Styles` story renders a `Card` with `data-testid="cs-card"` (or
accessible semantics if possible). Its play function:
- Resolves `--bg-rail` via `resolveTokenColor("--bg-rail")` (from `$lib/storybook-utils.js`).
- Asserts `getComputedStyle(root).backgroundColor` equals the resolved `--bg-rail` value.
- Resolves `--rule` via `resolveTokenFgColor("--rule")`.
- Asserts `getComputedStyle(root).borderTopColor` equals the resolved `--rule` value.
- Asserts `getComputedStyle(root).borderTopWidth` is `"1px"`.
- Asserts `getComputedStyle(root).borderTopStyle` is `"solid"`.
- Asserts `getComputedStyle(root).overflow` is `"hidden"`.

**AC-11.** The `Hover Border` story is a **composition story** (no `component:` in
`defineMeta`) that renders a `Card` with an inner text node. Because Vitest browser
mode does not support CSS `:hover` pseudo-class triggering via `userEvent.hover` in a
reliable cross-browser way, this story has a **descriptive play function** that:
- Verifies the `Card` renders and is visible.
- Uses `getByTestId` (or `canvasElement.firstElementChild`) to obtain the card root.
- Documents the expected hover behavior in a comment: "On hover: border-color transitions
  to var(--amber)".
- Asserts the `card` element exists (i.e., does not throw).

  Alternatively, if `userEvent.hover` reliably triggers `:hover` in the test environment,
  the play function may assert `getComputedStyle(card).borderColor` equals the resolved
  `--amber` value after hovering. The test-writer should verify this works before
  committing to it.

**AC-12.** The existing `Default`, `As Article`, and `As Link` stories are unchanged
and still pass.

#### AC-13 through AC-16: ProjectCard.stories.svelte

**AC-13.** `ProjectCard.stories.svelte` contains at least 5 stories: `Open Source`,
`No Tags`, `As Div`, `Many Tags`, and `No Description`.

**AC-14.** The `Many Tags` story passes `tags` with at least 6 items (e.g.
`["TypeScript", "Open Source", "SvelteKit", "Rust", "Embedded", "Hardware"]`). Its play
function:
- Asserts all 6 tag texts are visible in the canvas via `canvas.getByText(tagName)`.
- Asserts `canvasElement.querySelector(".card-tags")` is not null (tag container rendered).
- Asserts `canvasElement.querySelectorAll(".card-tags span").length` is at least 6, OR
  queries visible tag pill elements and confirms count.

**AC-15.** The `No Description` story passes `description=""` (empty string). Its play
function:
- Asserts the component renders without error (`root` is visible).
- Asserts the heading (title text) is visible.
- Asserts the description element (`.card-desc`) is present but contains empty or
  whitespace-only text content.

**AC-16.** The existing `Open Source`, `No Tags`, and `As Div` stories are unchanged
and still pass.

#### AC-17 through AC-20: CtaBlock.stories.svelte

**AC-17.** `CtaBlock.stories.svelte` contains at least 5 stories: `Default`,
`No Eyebrow`, `As Link`, `Background Color`, and `Full Props`.

**AC-18.** The `Background Color` story renders a `CtaBlock` with a heading and no
other optional props. Its play function:
- Gets `canvasElement.firstElementChild` as the root.
- Resolves `--bg-elev` via `resolveTokenColor("--bg-elev")`.
- NOTE: `CtaBlock.svelte` does not set `background: var(--bg-elev)` by default (its
  background is transparent/unset, with a hover rule). If the component does not
  explicitly set a `--bg-elev` background, this story instead asserts that the
  **border color matches `--amber`** (which the component does set: `border: 1px solid
  var(--amber)`). The story name should reflect what is actually tested; rename to
  `Border Color` if the background assertion is not applicable. The spec-writer notes
  this ambiguity — see Open Questions OQ-1.

**AC-19.** The `Full Props` story passes all optional props: `eyebrow`, `heading`,
`subtext`, and slot content (button label). Its play function:
- Asserts `eyebrow` text is visible.
- Asserts `heading` text is visible.
- Asserts `subtext` text is visible.
- Asserts the slot-rendered button text is visible (via `getByRole("button")` or
  `getByText`).
- Asserts `.cta-eyebrow` element is present in the DOM.

**AC-20.** The existing `Default`, `No Eyebrow`, and `As Link` stories are unchanged
and still pass.

#### AC-21 through AC-24: Modal composition

**AC-21.** `Modal.stories.svelte` (the primary file with `component:` in `defineMeta`)
retains its existing 5 stories: `Default Open`, `Closed`, `Close Button`, `No Footer`,
`Escape Closes`.

**AC-22.** `Modal.composition.stories.svelte` retains its existing 2 stories: `Confirm
Variant` and `Destructive Variant`. These stories use the `{#snippet footer()}` syntax
to pass footer content, which requires the component instance to be in the slot — this
is a composition-style story that cannot be expressed with `args` alone.

**Rationale:** The `footer` prop in `Modal` is a Svelte snippet. Storybook CSF `args`
cannot express a Svelte snippet value. Attempting to move these stories into the primary
file (with `component:` set) and passing footer content via args is not possible without
a custom argType or wrapper. The composition file is the correct home for these stories
per D9. No change is required for Modal in this item.

**AC-23.** The existing `Modal.composition.stories.svelte` play functions assert:
- The modal dialog is visible.
- The icon element (`.modal-icon`) is visible, `aria-hidden="true"`, and shows `"!"`.
- The icon background color matches `--amber` (confirm) or `--danger` (destructive).
- Cancel and action buttons are visible by role + accessible name.
These assertions are already implemented and must continue to pass.

**AC-24.** `pnpm check` reports 0 TypeScript errors in `Modal.stories.svelte` and
`Modal.composition.stories.svelte` after any changes.

#### AC-25 through AC-28: Table.stories.svelte

**AC-25.** `Table.stories.svelte` contains exactly the same 6 stories (`Basic`, `With
Caption`, `Empty rows`, `Header cell styles`, `Body cell styles`, `Attribute forwarding`)
and same play function logic as before this item.

**AC-26.** All AC reference comments are removed from `Table.stories.svelte`. This means:
- The leading `<!-- AC-70: ... -->` comment before `<Story name="Basic"` is removed.
- The leading `<!-- AC-71: ... -->` comment before `<Story name="With Caption"` is removed.
- The leading `<!-- AC-72: ... -->` comment before `<Story name="Empty rows"` is removed.
- The leading `<!-- AC-55 / AC-56 / AC-57 / AC-58: ... -->` comment before `<Story
  name="Header cell styles"` is removed.
- The leading `<!-- AC-60 / AC-61 / AC-62: ... -->` comment before `<Story name="Body
  cell styles"` is removed.
- The leading `<!-- AC-68: ... -->` comment before `<Story name="Attribute forwarding"`
  is removed.

**AC-27.** All inline AC reference comments inside the play functions of
`Table.stories.svelte` are removed. This includes lines like `// AC-51: table
element...`, `// AC-54: three <th scope="col">...`, `// AC-52: border-collapse:
collapse`, etc. The assertions themselves are kept; only the `// AC-XX:` prefix labels
are stripped.

**AC-28.** After removing AC comments, `Table.stories.svelte` is syntactically valid
Svelte and `pnpm check` reports 0 errors.

---

### Part 2 — Token documentation stories

The file `src/lib/tokens/tokens.stories.svelte` is rewritten (or updated) to contain
exactly the following 3 stories with the specified names. The existing 4 stories
(`Color Tokens`, `Type Scale`, `Labels`, `Semantic Elements`) are **replaced** by these
3. The `ColorSwatch` component import is retained if used.

**AC-29.** `tokens.stories.svelte` contains exactly 3 stories: `Color Palette`,
`Typography Scale`, and `Spacing Scale`.

#### Color Palette story (AC-30 through AC-33)

**AC-30.** The `Color Palette` story renders labeled color swatches for all 13 semantic
color tokens: `--ink`, `--ink-dim`, `--ink-faint`, `--bg`, `--bg-elev`, `--bg-sunken`,
`--bg-rail`, `--amber`, `--ok`, `--danger`, `--cyan`, `--rule`, `--rule-strong`. Each
swatch must show the token name as a visible text label.

**AC-31.** Each swatch element renders with `background-color: var(<token-name>)` applied
(directly via inline style or via the `ColorSwatch` component). The play function can use
`getByTestId` with the token name as the test ID (e.g. `data-testid="--bg"`) to locate
each swatch, consistent with the existing implementation.

**AC-32.** The `Color Palette` play function:
- Locates the `--bg` swatch via `canvas.getByTestId("--bg")`.
- Asserts `getComputedStyle(bgSwatch).backgroundColor.startsWith("rgb")` is `true`
  (confirming the custom property resolved to an actual color, not the string `"var(--bg)"`).
- Locates the `--amber` swatch via `canvas.getByTestId("--amber")`.
- Asserts `getComputedStyle(amberSwatch).backgroundColor` is not `"rgba(0, 0, 0, 0)"`
  (confirming `--amber` resolved to a non-transparent color).

**AC-33.** The `Color Palette` story uses no TypeScript type annotations inside the play
function (`CanvasElement` is destructured plain, no `: HTMLElement`).

#### Typography Scale story (AC-34 through AC-38)

**AC-34.** The `Typography Scale` story renders at minimum the following named typography
classes as sample text specimens: `.hero-heading`, `.display-heading`, `.h1`, `.h2`,
`.h3`, `.body-text`, `.body-lede`, `.mono-label`, `.eyebrow`. Each specimen shows the CSS
class name as a visible label beside (or above) the sample text.

**AC-35.** Each specimen element uses a `data-testid` or accessible query handle to
allow the play function to locate it. Suggested test IDs: `scale-h1`, `scale-h2`,
`scale-h3`, `scale-lede`, `scale-body`.

**AC-36.** The `Typography Scale` play function asserts:
- `getComputedStyle(canvas.getByTestId("scale-h1")).fontSize` is `"72px"`.
- `getComputedStyle(canvas.getByTestId("scale-h2")).fontSize` is `"36px"`.
- `getComputedStyle(canvas.getByTestId("scale-h3")).fontSize` is `"24px"`.
- `getComputedStyle(canvas.getByTestId("scale-lede")).fontSize` is `"19px"`.
- `getComputedStyle(canvas.getByTestId("scale-body")).fontSize` is `"16px"`.

**AC-37.** The `.mono-label` specimen is present and visible. The play function asserts
its `textTransform` is `"uppercase"` and its `fontFamily` (lowercased) includes
`"jetbrains"` or `"mono"`.

**AC-38.** The `.eyebrow` specimen is present and visible. The play function asserts its
`fontSize` is `"12px"`.

#### Spacing Scale story (AC-39 through AC-43)

**AC-39.** The `Spacing Scale` story renders labeled bars (or blocks) for the following
spacing tokens: `--u` (8px), `--u2` (16px), `--u3` (24px), `--u4` (32px), `--u5`
(40px). Each bar element uses `width: var(<token>)` or `height: var(<token>)` to
visually represent the spacing value. Each bar has a visible label showing the token
name and its pixel value.

**AC-40.** The `Spacing Scale` play function is minimal (documentation story). It asserts
at least one spacing token resolves to its expected pixel value:
- Creates a probe element via `document.createElement("div")`.
- Sets `probe.style.width = "var(--u4)"`.
- Appends probe to `document.body`, reads `getComputedStyle(probe).width`, removes probe.
- Asserts the resolved width is `"32px"`.

**AC-41.** The `Spacing Scale` story renders without error. The play function does not
throw.

**AC-42.** The `Spacing Scale` story contains no TypeScript type annotations inside the
play function.

**AC-43.** The tokens story file imports only from `"@storybook/addon-svelte-csf"` and
`"storybook/test"` (and optionally the `ColorSwatch` component). No imports from
component directories.

---

### Part 3 — Format compliance and suite integrity

**AC-44.** All play functions in modified story files use no TypeScript type annotations
inside the `play={...}` attribute (no `: HTMLElement`, `: string`, etc.). Type
assertions (`as HTMLElement`) used outside play function boundaries in `<script module>`
are acceptable only if they were already present.

**AC-45.** All play functions in modified story files `await` every `expect` assertion.

**AC-46.** No modified story file uses `getByTestId` as the primary query when a
semantic alternative exists (role, label, text). `getByTestId` is permitted for layout
elements with no accessible role or text (e.g. spacing bar elements, color swatch divs).

**AC-47.** All `Story` elements in modified files use the `args` prop for component
props (not inline `<ComponentName prop={...}>`), except in composition stories where
multiple instances or Svelte snippet props require the full component in the slot.

**AC-48.** The full test suite (`pnpm test`) passes with 0 failures after all changes.
The total story count (including new stories added in Part 1) is at least 156 (no
existing stories are removed).

**AC-49.** `pnpm check` reports 0 TypeScript errors after all changes.

**AC-50.** No new `data-testid` attributes are added to Svelte component source files
(`*.svelte` in `src/lib/components/`). Test IDs are added only to story file markup.

---

## Out of scope

- **New Svelte components** — this item adds no new component files. All changes are
  in `.stories.svelte` files and `tokens.stories.svelte`.
- **Full component coverage for all 39 story files** — B11 targets the specific files
  listed above. Other story files (Button, Led, TagPill, Stack, Inline, Grid, Container,
  Nav, Input, InputWrap, Field, Textarea, Select, Alert, StatCard, KvList, ProgressBar,
  ActivityRow, SectionHead, SectionFoot, PageHero, Accordion, Tabs,
  ProductCard, NoteCard) are not changed by this item.
- **Hover CSS pseudo-class testing via userEvent** — CSS `:hover` trigger reliability in
  Vitest browser mode is uncertain; Card hover behavior is documented as a visual note
  only unless hover triggering is confirmed to work (see AC-11).
- **Paper palette swatch story** — the B2 spec's `PaperPalette` story concept is not part
  of B11. The `Color Palette` story shows Phosphor (dark default) values only.
- **Palette switching story** — dynamic palette toggle stories are out of scope. Nav
  (B6) handles palette toggle; token documentation stories are static.
- **`SemanticElements` story content** — the existing semantic elements story (code,
  pre, blockquote, table) in `tokens.stories.svelte` is removed when the file is
  rewritten to the 3-story structure. Its content (blockquote, `<pre>`, `<code>`,
  `<table>` styling) is not carried forward. This is an intentional descoping of the
  B2-specified `SemanticElements` and `BaseReset` stories.
- **Spacing tokens `--u6`, `--u7`, `--u10`** — these larger spacing values are not
  required in the `Spacing Scale` story, though they may be included as visual
  documentation without an associated test assertion.
- **Modal footer snippet stories in the primary file** — confirmed impossible without a
  Svelte-specific Storybook argType for snippets; no change required (see AC-22).

---

## Open questions

**OQ-1 (non-blocking).** `CtaBlock.svelte` sets `background: color-mix(in srgb, var(--amber)
6%, transparent)` only on `:hover`, not as a static background. Its default background
is effectively transparent (inherits from the page background, `--bg`). The proposed
`Background Color` story name in AC-18 is therefore misleading. The test-writer should
rename this story to `Border Color` and assert that the root element's `borderColor`
resolves to `--amber`, which is the actual CSS rule on the component's base state. The
spec name `Background Color` is kept here for traceability to the manager's prompt, but
the test-writer has authority to rename it.

**OQ-2 (non-blocking).** Card.svelte has no hover CSS rule — hover behavior is only on
composite card components (`ProjectCard`, `ProductCard`, `NoteCard`). The "hover state
(amber border on hover)" mentioned in the manager prompt refers to `NoteCard`, not `Card`
base. AC-11 therefore specifies a documentation-only hover story for `Card` that confirms
the card renders and documents the hover intent. If the intent is to test `NoteCard` hover,
that should be a separate `NoteCard.stories.svelte` addition and is out of scope for B11.

**OQ-3 (non-blocking).** The manager prompt specifies 156 total tests must still pass.
The current suite has exactly 156 `<Story>` elements (including stories without play
functions). Adding new stories increases this count. The requirement is interpreted as:
no existing stories are removed (count only goes up). If the tokens story rewrite removes
4 stories and adds 3, the net count drops by 1. The test-writer must keep this in mind
and either (a) not remove the existing 4 tokens stories (i.e., add the 3 new ones
alongside them rather than replacing them), or (b) confirm with the manager that 155 is
acceptable. **This is a potential blocker** if strict equality to 156 is required.
Recommendation: add the 3 new token stories without removing the existing 4, giving a
total of 163+ stories, and mark the old stories as retained. Alternatively, if the
manager confirms replacement is fine, proceed with 3 replacement stories.
