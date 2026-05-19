# B41: Regression — Prose should match MarkdownBody's typography

## Context

`<Prose>` is the library replacement for `src/lib/ui/MarkdownBody.svelte` on the
canonical dexterlabs.nl website. The two implementations have diverged: Prose uses a
blanket adjacent-sibling spacing rule (`> * + *`) and inherits several heading sizes,
link decoration, list marker styles, image sizing, and code block background values
that differ from the hand-tuned MarkdownBody originals. This is a visual-only bug;
no behaviour or API change is involved.

Item card: `wiki/backlog/doing/B41-prose-typography-alignment.md`
Relevant decisions: D42 (no play-fn assertions for visual changes), D26 (`.prose :global(element)` scoping pattern)

Because D42 applies, `test-writer` is skipped. The pipeline for this item is
`spec-writer → implementer → reviewer`. The reviewer verifies by reading the diff and,
where noted, opening the story in Storybook.

---

## Acceptance criteria

The implementer replaces the `<style>` block in
`src/lib/components/layout/Prose.svelte` with the paste-ready block from the item
card. The diff produces the following specific changes, each of which must be present
in the final file:

### Root element

1. The `.prose` rule sets `font-size: var(--t-body)` and `line-height: 1.65` directly
   on the root container. The existing per-`p` `font-size`/`line-height` declarations
   are removed.

### Spacing strategy

2. The adjacent-sibling rule `:global(.prose > * + *)` (`margin-top: var(--u3)`) and
   the first-child reset `:global(.prose > :first-child)` are removed. Spacing is now
   owned per element via explicit `margin` declarations (see individual ACs below).

### h2

3. `h2` `font-size` changes from `var(--t-h2)` to **`var(--t-h3)`**.
4. `h2` gains `margin: 48px 0 8px` and `color: var(--ink)`. The previous `h2` rule had
   no `margin` or `color`.
5. `h2` `line-height: 1.1` is removed (no `line-height` on `h2` in the new rule).

### h3

6. `h3` `font-size` changes from `var(--t-h3)` to **`var(--t-lede)`**.
7. `h3` gains `margin: 32px 0 6px` and `color: var(--ink)`.
8. `h3` `line-height: 1.2` is removed (no `line-height` on `h3` in the new rule).

### h1 and h4

9. `h1` and `h4` rules are retained unchanged (the item card explicitly notes they do
   not conflict and can be folded into the same `:global` block without modification).

### Paragraph

10. `p` gains `margin-bottom: 20px` and `color: var(--ink)`. The previous `p` rule had
    neither `margin-bottom` nor `color`.
11. The per-`p` `font-family`, `font-size`, and `line-height` declarations are removed
    (now inherited from the `.prose` root — AC-1).

### Links

12. The selector changes from `.prose :global(a)` / `.prose :global(a:hover)` to
    **`a:not([class])`** (nested inside the `:global { }` block).
13. `a:not([class])` loses `color: var(--ink-faint)` and `text-decoration: none`.
    It gains `border-bottom: 1px solid var(--rule-strong)` and
    `transition: border-color 0.15s`.
14. The hover rule changes from `color: var(--amber); text-decoration: underline` to
    `border-color: var(--amber)` (i.e. the hover changes only the bottom-border colour).

### Strong and em

15. `strong` rule is added: `font-weight: 500; color: var(--ink)`. No `strong` rule
    existed previously.
16. `em` rule is added: `color: var(--ink-dim)`. No `em` rule existed previously.

### Blockquote

17. `blockquote` gains `margin: 28px 0`. Previously `margin: 0`.
18. `blockquote` loses `font-style: italic`.
19. A nested `blockquote p { margin-bottom: 0 }` rule is added to suppress the
    standard paragraph bottom margin inside a blockquote.

### Inline code chip

20. `code` `background` changes from `var(--bg-rail)` to **`var(--bg-elev)`**.
21. `code` gains `border-radius: var(--radius)`. (Existing rule already had this, so
    the property must remain present.)

### Block code (pre)

22. `pre` rule loses `font-family: var(--mono)` and `background: var(--bg-sunken)`.
    The new rule has no `background` or `font-family` on `pre` itself.
23. `pre` gains `white-space: pre` and `margin: 24px 0`.
24. `pre > code` (nested) changes:
    - `background: transparent` → `background: none`
    - `border: none` stays
    - `padding: 0` stays
    - `color` changes from `var(--shiki-foreground, var(--ink))` to **`color: inherit`**

### Lists

25. `ul` and `ol` share a single rule: `padding-left: 20px; margin-bottom: 20px; color: var(--ink)`.
    Previously `ul` and `ol` were separate rules with `padding-left: var(--u3)` and no
    `margin-bottom` or `color`.
26. `li` gains `margin-bottom: 6px`. Previously only `line-height: 1.65` (which is
    retained).
27. The `li + li { margin-top: var(--u) }` rule is removed.
28. `ul li::marker` rule is added: `color: var(--amber)`. No marker rule existed previously.
29. `ol li::marker` rule is added: `font-family: var(--mono); font-size: var(--t-mono);
    color: var(--ink-faint)`. No marker rule existed previously.

### Horizontal rule

30. `hr` gains `margin: 48px 0`. Previously `margin: 0`.

### Image

31. `img` `width` changes from `max-width: 100%` to **`width: 100%`** (making images
    always full-width rather than capped at their intrinsic size).
32. `img` loses `border-radius: var(--radius)`.
33. `img` gains `display: block` and `margin: 28px 0`.

### Table

34. `table` gains `margin: 24px 0`. Previously no margin on `table`.
35. `td` gains a `:first-child` rule: `width: 40%`. No `td:first-child` rule existed.
36. `td:last-child` rule is added: `color: var(--ink)`. No `td:last-child` rule existed.

### CSS structure

37. All element rules are nested inside a single `.prose { :global { … } }` native CSS
    nesting block (D45). The flat `.prose :global(element)` form is banned. Inside the
    `:global { }` block, standard CSS nesting applies (`&:hover`, `> code`, nested
    element rules, etc.).

---

## Out of scope

- Any change to `Prose.svelte`'s TypeScript API (`as`, `maxWidth`, `children`,
  `...rest`). Props are unchanged.
- `h1` and `h4` styles are not modified.
- Shiki syntax-highlight token variables (`--shiki-*`) in the `pre > code` colour: the
  new `color: inherit` intentionally removes the Shiki fallback. If Shiki integration
  is needed, that is a separate item.
- Responsive / mobile typography changes.
- Updating any consumer (`legal/[slug]/+page.svelte`) beyond whatever Prose provides.
- Story play-function assertions (D42 — visual track, test-writer skipped).

---

## Open questions

None blocking.
