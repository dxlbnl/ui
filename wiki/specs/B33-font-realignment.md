# B33: Typography realignment with OG design system

## Context

B26 introduced `size` and `case` props on `Text.svelte` and (incorrectly) on
`Heading.svelte`. Those props work by setting a `data-size` attribute that is matched
by scoped CSS rules that come after the variant class rules in the `<style>` block,
so they always override the variant's semantic font-size.

The research pass (see
[wiki/research/B33-token-diff.md](../research/B33-token-diff.md)) confirmed:

- `tokens.css` and `typography.css` match the reference (`colors_and_type.css`) exactly.
  The token layer is not the source of any bug.
- The Modal's title element uses `<Text variant="mono" as="h2" size="lg">`, which
  resolves to 19 px mono uppercase — a mismatch with the reference `.h3` heading style
  (24 px, weight 500, sans-serif).
- `Heading.svelte` carries a `size` prop and `[data-size]` overrides that can shrink
  any heading arbitrarily (e.g., `<Heading level={1} size="xs">` renders at 12 px).
  This prop should not exist on `Heading`.

Related pages: [vision.md](../vision.md), [requirements.md](../requirements.md),
[architecture.md](../architecture.md), [stories-guide.md](../stories-guide.md),
[specs/B26-typography-size-prop.md](B26-typography-size-prop.md).

Item card: [wiki/backlog/doing/B33-font-realignment.md](../backlog/doing/B33-font-realignment.md).

---

## Acceptance criteria

### Change 1 — Modal title heading

**File:** `src/lib/components/feedback/Modal.svelte`

**Before (line 84):**
```svelte
<Text variant="mono" as="h2" id="modal-title" size="lg" class="modal-title">{title}</Text>
```

**After (as implemented in B33):**
```svelte
<Heading level={2} variant="h3" id="modal-title" class="modal-title">{title}</Heading>
```

The `Heading` import must be added to the `<script>` block; the existing `Text`
import may be removed if it is unused afterwards.

> **Note:** This was subsequently revised by the Modal redesign task (post-B34).
> The current implementation uses `<Text variant="mono" size="xs" as="h2">` (12px,
> mono, uppercase) — a deliberate design direction change. B33 ACs AC-2 through AC-5
> no longer describe the live code; the current story assertions reflect the new design.

**AC-1** The modal title element is an `<h2>` tag (verified by querying
`canvasElement.querySelector('h2#modal-title')`).

**AC-2** The modal title has `font-size` computed to `24px` (the resolved value of
`var(--t-h3)`), verified with `getComputedStyle(el).fontSize === '24px'`.

**AC-3** The modal title has `font-family` that resolves to the `--sans` stack
(Inter Tight / Inter / system sans-serif). Verified by probing the computed
`font-family` string — it must NOT contain `"JetBrains Mono"` or `"Courier"`.

**AC-4** The modal title has `font-weight` computed to `500`.

**AC-5** The modal title has `text-transform` computed to `none` (not `uppercase`).

**AC-6** A Storybook story `Modal / Default` opens the modal (via `userEvent.click`
on a trigger button or by setting `open={true}` directly), then asserts AC-1 through
AC-5 on the `h2#modal-title` element.

**AC-7** A Storybook story `Modal / Destructive` repeats the heading assertions for
the destructive variant to confirm the change is variant-agnostic.

---

### Change 2 — Remove `size` prop from `Heading.svelte`

**File:** `src/lib/components/primitives/Heading.svelte`

**Before:** `Heading.svelte` declares a `size?: SizeVariant` prop and the scoped
`<style>` block contains five `[data-size="..."]` rules that override the variant
font-size. The element is rendered with `data-size={size || undefined}`.

**After:** The `size` prop, the `SizeVariant` type alias (if it is not referenced
elsewhere in the file), and all five `[data-size="..."]` rules are removed from
`Heading.svelte`. The `data-size` attribute is no longer emitted.

**AC-8** `Heading.svelte` does not contain the string `size` as a prop declaration
(i.e., no `size?:` in the `Props` interface) after the change.

**AC-9** `Heading.svelte` does not contain any `[data-size]` CSS rule after the
change.

**AC-10** The `Heading / Levels` story (or equivalent covering story) asserts
`getComputedStyle(h1).fontSize === '72px'` — confirming `.h1` (`var(--t-h1)`) is
in effect with no `size` override.

**AC-11** The same story asserts `getComputedStyle(h2).fontSize === '36px'`
(`var(--t-h2)`).

**AC-12** The same story asserts `getComputedStyle(h3).fontSize === '24px'`
(`var(--t-h3)`).

---

### Change 3 — Caller audit for `size=` on `<Heading`

**AC-13** Before implementing Changes 1 and 2, search every `.svelte` file in the
repository for the pattern `size=` passed to a `<Heading` component. For each
occurrence found:

- Remove the `size` prop from the call site.
- Confirm the visual result is still correct by reviewing which variant/level the
  heading uses and cross-checking against the type scale.

If no occurrences are found, this AC is satisfied by recording a negative result in
the commit message.

---

### Regression AC

**AC-14** After both changes are applied, run `pnpm test` and confirm the full
Storybook story suite passes with no new failures beyond any pre-existing skipped
items.

---

## Out of scope

- Changes to `tokens.css` or `typography.css` — these already match the reference
  exactly and must not be modified in this item.
- Changes to the `size` prop on `Text.svelte` — that prop is intentional and in spec
  for `Text`. Only `Heading.svelte` has the prop removed.
- Renaming the `xs/sm/md/lg/xl` size values to semantic token names (e.g., `lede`,
  `h3`) — this is a separate potential improvement, not in scope for B33.
- The `@font-face` for JetBrains Mono Bold — the research flagged this as a latent
  risk unrelated to font-size shifting. It is not addressed in B33.
- Visual changes to the `modal-body`, `modal-footer`, or any part of `Modal.svelte`
  other than the title element.
- Accessibility improvements beyond what correcting the heading level and style already
  provides.

---

## Open questions

None. All design decisions were approved by the user before this spec was written:

1. Modal title: `<Heading level={2} variant="h3">` — 24 px, weight 500, sans-serif.
2. Heading `size` prop: removed entirely; callers to be audited and fixed.
3. Token layer: no changes.

No blocking open questions. Implementation may proceed.
