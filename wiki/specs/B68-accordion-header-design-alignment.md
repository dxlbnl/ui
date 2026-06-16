# B68: Align AccordionItem header with the design

## Context

`AccordionItem` (`src/lib/components/data/AccordionItem.svelte`) renders a native
`<details>`/`<summary>` row (D16). Today the `<summary>` header diverges from the
Dexterlabs design (`ui_kits/components/Accordion.jsx`, read live via DesignSync
2026-06-16; identical to `wiki/specs/_design-refs/B59/Accordion.jsx`):

- The disclosure glyph is a **trailing** `›` that **rotates 90°** on open
  (`.acc-icon` is the last child of the `<summary>`, after the title and actions).
- The title is `12px` / `letter-spacing: 0.08em`.

The design instead uses a **leading** disclosure glyph that **swaps character**
(`▸` closed → `▾` open, no rotation), a `13px` / `0.06em` title, and renders the
controls flush at the right edge. The trailing-chevron layout is also the root cause
of the user's report that the B65 `actions` look cramped (they sit between the title
and the rotating chevron rather than at the row's right edge).

This item is a **visual / structural alignment** — the **visual-only track** (D42 /
`wiki/stories-guide.md` "When NOT to assert"): the pipeline runs
`spec-writer → implementer → reviewer` with **no test-writer stage**. The spec names
the exact source change and the visual outcome; the reviewer verifies by reading the
diff and opening the affected stories, and by running the full suite green. The only
story edits required are the **assertion updates** that track the deliberate layout
change (see AC-7) — not new CSS-value-locking play assertions.

This reverses the B59 "Out of scope: glyph change — keep the rotating `›`" note: the
user now wants design alignment, and the authoritative source is the live DesignSync
`Accordion.jsx`. Logged as **D81**, superseding that B59 note.

Relevant wiki pages:
- Item card: `wiki/backlog/doing/B68-accordion-header-design-alignment.md` (authoritative design values)
- `wiki/requirements.md` — R10 (Accordion), WCAG 2.1 AA, strict TS
- `wiki/architecture.md` — component conventions, scoped CSS, test harness = Storybook play functions
- `wiki/stories-guide.md` — visual-only rule (D42), Svelte CSF story conventions
- `wiki/specs/B65-accordionitem-actions-snippet.md` — the `actions` snippet + click-guard (D79)
- `wiki/specs/B59-accordion-sticky-headers.md` — sticky model (D68), and the superseded glyph note
- `wiki/decisions.md` — D16 (native `<details>`), D45 (native CSS nesting), D62 (tokens-only — do not invent), D68/D78 (sticky offset model + `display: contents`), D75 (a11y suppress), D79 (actions click-guard), D81 (this item)
- Design reference: `wiki/specs/_design-refs/B59/Accordion.jsx`

---

## Current component (what to change)

`AccordionItem.svelte` has **two `<summary>` branches** — a sticky branch
(`data-sticky="true"` with inline `top`/`bottom`/`z-index` offsets) and a non-sticky
branch. In **both**, the child order is today:

```
.acc-title  →  .acc-actions (when present)  →  .acc-icon
```

`.acc-icon` is `<span class="acc-icon" aria-hidden="true">›</span>` and rotates via
`details[open] .acc-icon { transform: rotate(90deg); color: var(--amber); }`.
`.acc-title` is `flex: 1; font-size: 12px; letter-spacing: 0.08em`. `.acc-trigger` is
`display: flex; align-items: center; justify-content: space-between; gap` is **not set**;
`padding: 12px 16px`. The B65 `.acc-actions` span carries the D79 `onclick` preventDefault
guard. The B66 `display: contents` rule on `.acc-item:has(> [data-sticky])` (D78) and the
sticky surface/border CSS keyed on `[data-sticky="true"]` are unrelated to this item.

---

## Acceptance criteria

The acceptance criteria are the contract; the reviewer verifies each against the diff +
the rendered stories. These are **structural / visual** statements — they describe the
source change and the observable outcome, not new play-function assertions to author.

### DOM order

1. **Glyph moves to the leading position; actions move to the trailing position.** In
   **both** `<summary>` branches (sticky + non-sticky), the child order becomes:
   `.acc-icon` → `.acc-title` → `.acc-actions` (when present). `.acc-icon` is the
   **first** child of the `<summary>`; `.acc-title` follows; `.acc-actions` (when the
   `actions` prop is provided) is the **last** child, with nothing after it. When
   `actions` is omitted there is no `.acc-actions` element and the order is simply
   `.acc-icon` → `.acc-title` (zero regression — no `.acc-actions` is introduced).

### Disclosure glyph

2. **The glyph is `▸` closed / `▾` open, swapped via CSS off `details[open]`** — NOT via
   JS or markup. The native `<summary>` toggle flips the `[open]` attribute on
   `<details>`, not the Svelte `open` variable, so the swap must key off the attribute.
   Mechanism: `.acc-icon` is rendered as an **empty** `<span class="acc-icon"
   aria-hidden="true">` (no literal glyph text node) and the character is supplied by a
   pseudo-element:
   - `.acc-icon::before { content: "▸"; }` (closed)
   - `details[open] .acc-icon::before { content: "▾"; }` (open)

   The `aria-hidden="true"` is retained (the glyph is decorative; disclosure semantics
   come from the native `<details>`, D16). Identical markup/CSS applies to both branches.

3. **The existing rotation is removed.** `.acc-icon` carries **no** `transform: rotate(...)`
   in any state. The `details[open] .acc-icon { transform: rotate(90deg) }` rule is
   deleted. (A `transition` on `.acc-icon` may be kept or dropped — it has no rotation to
   animate; either is acceptable since there is no behaviour to assert.)

4. **Glyph styling.** `.acc-icon` uses `font-family: var(--mono)`, `font-size: 12px`,
   `width: 12px`, `flex-shrink: 0`. Colour: `var(--ink-faint)` when closed,
   `var(--amber)` when open (`details[open] .acc-icon { color: var(--amber) }`). The
   amber-open / ink-faint-closed colour behaviour is preserved from today — only the
   glyph character and its position change.

### Title

5. **Title typography aligned to the design.** `.acc-title` uses `font-family: var(--mono)`,
   `font-size: 13px` (was 12px), `letter-spacing: 0.06em` (was 0.08em),
   `text-transform: uppercase`, `color: var(--ink)`.

6. **Title fills the row and ellipsises.** `.acc-title` is `flex: 1 1 auto; min-width: 0`
   and single-line with ellipsis: `overflow: hidden; white-space: nowrap;
   text-overflow: ellipsis`. The `flex: 1 1 auto` is what pushes `.acc-actions` (when
   present) and keeps the glyph hugging the left — `.acc-trigger` no longer relies on
   `justify-content: space-between` for the right-hug (it may be removed or kept; the
   title's `flex` drives the layout — whichever satisfies AC-1 and the right-hug).

### Row layout

7. **Row spacing aligned to the design, padding kept.** `.acc-trigger` keeps
   `display: flex; align-items: center; padding: 12px 16px`. Add a single consistent
   `gap` of **`12px`** between the flex children (matching the design's row `gap: 12px`).
   `.acc-actions` retains `display: flex; align-items: center; gap: 8px; flex-shrink: 0`
   (unchanged from B65). The net visual result: glyph at the left, title filling the
   middle, actions hugging the right edge with nothing after them.

### Story assertion updates (the only required story edits)

8. **Update the assertions that the layout change deliberately invalidates.** Three
   existing play-function assertions in `src/lib/components/data/Accordion.stories.svelte`
   reference the OLD glyph (trailing, literal `›`, rotating). They must be **updated to
   the new intended layout** — these are deliberate updates tracking this change, **not**
   weakenings and **not** new CSS-value locks:

   a. **"Default" story (currently labelled AC-5)** asserts
      `firstIcon!.textContent!.trim() === "›"`. The glyph is now an empty span with a
      `::before` pseudo-element, so its `textContent` is empty. Update this assertion to
      reflect the new structure — e.g. assert `.acc-icon` is the **first** child of the
      `<summary>`, still `aria-hidden="true"`, and (optionally) that its
      `::before` content resolves to `▸` when closed via
      `getComputedStyle(icon, '::before').content`. Do **not** keep the literal-`›`
      text assertion.

   b. **"Toggle Interaction" story (currently labelled AC-11)** asserts
      `getComputedStyle(icon).transform !== "none"` after opening (the rotation). The
      rotation is removed, so this assertion must go. Replace it with the now-load-bearing
      open-state signal that survives the redesign — the icon **colour** changing to
      `var(--amber)` on open (the story already asserts this via `resolveTokenFgColor("--amber")`
      immediately after; the `transform` line is simply removed). If the glyph-swap is
      asserted, assert `::before` content flips `▸`→`▾`; do not assert `transform`.

   c. **"With Actions" story (currently labelled AC-6/AC-7)** asserts the OLD order
      `title → actions → icon` and that the icon is the **last** child. Update it to the
      **new** order `icon → title → actions`: assert `.acc-icon` is the **first** child of
      the `<summary>`, `.acc-title` index is greater than the icon's, `.acc-actions` index
      is greater than the title's, and `.acc-actions` is the **last** child (nothing after
      it). Keep all the D79 click-guard behaviour assertions (mouse click + keyboard
      activation do not toggle, the control's own handler fires, a title-area click still
      toggles, the omitted-`actions` second item has no `.acc-actions`) — those are
      load-bearing behaviour and must continue to pass unchanged.

9. **No other story changes; all stories pass.** Apart from the three assertion updates in
   AC-8, no existing story in `Accordion.stories.svelte` or `Accordion.sticky.stories.svelte`
   should require changes, and **all** stories (and the a11y audit) must pass green. The
   sticky stories assert positioning/structure (`data-sticky`, computed `position: sticky`,
   inline offsets, surfaces/borders, `display: contents`) and the D80 scroll behaviour —
   none of which this layout change touches.

### Tokens, sticky, API, quality

10. **Tokens only (D62) — no new colours or tokens.** Only existing tokens are used:
    `var(--mono)`, `var(--ink)`, `var(--ink-faint)`, `var(--amber)`. The `12px`/`13px`
    sizes, `0.06em` letter-spacing, `12px`/`8px` gaps, and `12px 16px` padding are literal
    values (the house convention permits literal px for mono micro-labels; this matches the
    design). No `--token` is invented.

11. **Sticky model unchanged.** The `display: contents` rule on the sticky `.acc-item`
    (D78/B66), the sticky surface/border CSS keyed on `[data-sticky="true"]` (D68/B59), and
    the offset arithmetic / ResizeObserver measurement are **untouched**. The glyph/title/
    layout changes are content/style only inside the same measured `<summary>`, so the
    sticky offset math (`top` = Σ heights above, `bottom` = Σ heights below,
    `z-index = 10 + (n − i)`) is unaffected. (If a header's measured height shifts slightly
    because the title is now 13px, the registry re-measures and the cumulative-sum contract
    in the sticky stories — asserted from live heights per D69 — still holds.)

12. **No public API change.** `AccordionItemProps` is unchanged: `label: string`,
    `open?: boolean` (default `false`), `actions?: Snippet`, `children: Snippet`. No prop is
    added, removed, or renamed. `AccordionItem` remains the default export of the file and
    is re-exported unchanged from `src/lib/components/data/index.ts` and `src/lib/index.ts`.

13. **The B65 / D79 click-guard still works.** `.acc-actions` keeps its
    `onclick={(e) => e.preventDefault()}` guard; clicking (or keyboard-activating) a control
    inside `actions` does not toggle the `<details>`, while a title-area click still toggles.
    Moving `.acc-actions` to the trailing position does not change the guard (it is scoped to
    the wrapper, not a position).

14. **Quality gates.** `pnpm check` is clean (strict TS, lint conventions per D75) and
    `pnpm test` is green (all existing play functions pass with the AC-8 updates). The
    `@storybook/addon-a11y` audit reports **zero violations** on every Accordion story —
    the glyph stays `aria-hidden="true"`, the title text is unchanged, and no ARIA is
    added or removed.

---

## Story plan

Per the visual-only rule (D42), **do not** add new stories and **do not** add
CSS-value-locking play assertions. The change is verified by the reviewer opening:

- **"With Actions"** (`Accordion.stories.svelte`) — demonstrates the new
  `icon → title → actions` layout with controls hugging the right edge (this story was the
  motivation: the actions are no longer cramped beside a trailing chevron).
- **"Default" / "Toggle Interaction"** (`Accordion.stories.svelte`) — demonstrate the
  leading `▸`/`▾` glyph and the closed→open colour/character swap (no rotation).
- The **sticky stories** (`Accordion.sticky.stories.svelte`) — demonstrate the new header
  layout under sticky tiling, confirming the layout change did not disturb the offset model.

The only edits are the three assertion updates in AC-8 (they track the deliberate layout
change). All other stories remain byte-for-byte and must pass.

---

## Out of scope

The design header carries these, but they are separate API features, **not** part of this
visual alignment — do **not** implement here (noted as possible follow-ups):

- **`count` badge** (the design's `s.count`) — a dedicated count/badge prop. A caller can
  already render a badge inside `label` or `actions`.
- **`multiple`** (single-open coordination) — the native `<details>` already gives
  independent multi-open; out of scope per B59.
- **Controlled mode** (`openIds` / `onToggle` / `defaultOpenIds`) — open state stays
  browser-owned (D16); out of scope per B59.
- **`flush`** (zero body padding in sticky mode) — independent of this layout change; out of
  scope per B59.

Also out of scope: any change to `Accordion.svelte`, the sticky registry / offset
arithmetic (D68/D78), the D80 smart-scroll behaviour, the body styling, the animation
block, or the `actions` click-guard mechanism (D79). This item changes only the
`<summary>` header layout, the glyph, and the title typography in `AccordionItem.svelte`.

---

## Open questions

None blocking. One note carried into implementation:

- The glyph swap is asserted (if at all) via `getComputedStyle(icon, '::before').content`.
  Pseudo-element `content` reads back as a quoted string (e.g. `"\"▸\""`) in some browsers;
  the reviewer/implementer should compare on the unquoted character or use `.includes('▸')`
  rather than strict equality if the test browser quotes it. This is a test-assertion detail
  for the AC-8 updates, not a spec ambiguity, and does not affect the rendered output.
