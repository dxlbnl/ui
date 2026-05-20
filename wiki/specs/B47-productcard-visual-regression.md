# B47: Regression — ProductCard visual fixes (image, description font, header alignment, CTA arrow)

## Context

ProductCard is shipped in 3-column grids on `/catalogue/`. Four visual regressions have
been identified against the production reference at `https://www.dexterlabs.nl/catalogue/`:

1. No `image` prop — the card cannot render a product photo.
2. `description` renders in mono — it should be sans body text.
3. Price / status / SKU row is not baseline-aligned.
4. CTA arrow is oversized relative to `<Button variant="cta">` on the same page.

This is a **visual-only track** item (D42). The `test-writer` stage is skipped; the
pipeline is `spec-writer → implementer → reviewer`. No new play-function assertions are
added beyond what the existing stories already cover. D38 (primitives first), D45
(native CSS nesting), and D14 (BEM variant modifiers) apply throughout.

Related pages: [requirements.md](../requirements.md) R4,
[architecture.md](../architecture.md),
[composition-limits.md](../composition-limits.md),
[decisions.md](../decisions.md) D42, D38, D45.

Item card: [B47](../backlog/doing/B47-productcard-visual-regression.md).

---

## Acceptance criteria

### Fix 1 — Image prop

**AC-1.** `ProductCard.svelte` declares two new optional props in its `Props` interface:

```ts
/** Resolved image URL shown at the top of the card. */
image?: string
/** Responsive srcset string for the image. */
imageSrcset?: string
```

Both are optional; existing callers without them continue to compile and render
correctly.

**AC-2.** When `image` is set, the `.card-img` area renders a single `<img>` element:

- `src={image}`, `srcset={imageSrcset}` (when `imageSrcset` is provided), `alt=""`.
- CSS: `width: 100%; height: 100%; object-fit: cover; display: block`.
- The container keeps `aspect-ratio: 4 / 3`, `border-bottom: 1px solid var(--rule)`,
  and `overflow: hidden`. The `aspect-ratio` changes from the current `14 / 9` to
  `4 / 3` to match production.
- The diagonal hatch background (`repeating-linear-gradient`) is retained on the
  container so it shows through letterbox gaps (if the image does not fill 4/3
  completely).

**AC-3.** When `image` is unset, the `.card-img` area renders the existing placeholder:
a diagonal hatch background (`repeating-linear-gradient(135deg, var(--bg-sunken) 0 10px,
var(--bg-elev) 10px 20px)`) with `{sku.toUpperCase()} · MODULE` centered inside it in
`<Text variant="mono" color="faint">`. The text changes from the current `· PRODUCT` to
`· MODULE` to match the production reference.

**AC-4.** The container `.card-img` remains `aspect-ratio: 4 / 3` in both branches
(image present and absent). The current `14 / 9` value is replaced.

**AC-5.** ProductCard does **not** receive `imageLight` / `imageLightSrcset` props.
It is not palette-switched (unlike `ProjectCard`). A single `image` prop is rendered
regardless of active palette.

**AC-6.** All CSS for the `.card-img` block is authored using native CSS nesting (D45)
inside the existing `:global(.product-card)` block.

---

### Fix 2 — Description in sans

**AC-7.** The `description` prop renders with `font-family: var(--sans)` and
`font-size: var(--t-body)` (16 px). Currently it uses `<Text variant="mono">`, which
applies `var(--mono)` / 14 px. The implementer replaces this with a scoped `.card-desc`
class rule (matching the `ProjectCard` pattern) rather than continuing to rely on
`<Text variant="mono">`.

Concretely: replace

```svelte
<Text variant="mono" case="none" color="dim" class="card-desc">{description}</Text>
```

with a plain `<p class="card-desc">{description}</p>` and a scoped CSS rule:

```css
.card-desc {
  font-family: var(--sans);
  font-size: var(--t-body);
  color: var(--ink-dim);
  line-height: 1.4;
  margin: 0;
}
```

(mirroring `ProjectCard`'s `.card-desc` rule — the two cards should be visually
consistent on description text).

**AC-8.** The `color="dim"` and `case="none"` intent is preserved via the `color:
var(--ink-dim)` rule in the scoped CSS class; no global `color` prop is added to
`<Text>` in this slot.

---

### Fix 3 — Header row alignment (SKU left, price + LED right, same baseline)

**AC-9.** The card header region presents SKU left and the price-plus-LED group right,
both aligned to the same center baseline. Implement this using `<Spread align="center">`
(or a native scoped wrapper with `display: flex; align-items: center;
justify-content: space-between`) so the two groups do not drift vertically.

**AC-10.** The current markup structure in `.card-footer-row` places price and LED both
on the right, which is correct. What is missing is `align-items: center`. The
`.card-footer-row` scoped CSS rule must include `align-items: center` (not `baseline`
— the two groups have different internal heights so `baseline` misaligns them).

**AC-11.** No extra wrapper elements are introduced beyond what already exists. The
`<Spread>` primitive (D38) is preferred for the row if it satisfies AC-9 without
additional style overrides; otherwise the existing `.card-footer-row` scoped div is
used with the corrected CSS.

---

### Fix 4 — CTA arrow matches `Button variant="cta"` sizing

**AC-12.** The `.card-cta` area renders its CTA text at `font-size: 14px` and
`letter-spacing: 0.1em` — matching `Button.svelte`'s `.btn-cta` rule (currently 14 px /
0.1em). If the `<Text variant="mono">` in `.card-cta` produces a different computed
size (because `--t-mono` is also 14 px, this may already be correct — the implementer
must verify), the rule is enforced explicitly via a scoped `.card-cta` descendant
selector rather than relying on the Text primitive's defaults.

**AC-13.** The arrow `→` glyph is `aria-hidden="true"` (already present) and renders
at the same font-size as the CTA label text (inheriting from the parent `.card-cta`
rule). No separate font-size override is applied to the `<span>` containing the arrow.

**AC-14.** The full `.card-cta` block (text + arrow) uses native CSS nesting (D45)
inside `:global(.product-card)`.

---

### Stories

**AC-15.** A new story named `"With Image"` is added to `ProductCard.stories.svelte`.
It passes `image="/placeholder.jpg"` (or any resolvable static path) and the existing
props from the `"Coming Soon"` story. It has **no `play` function** (D42). Its purpose
is a visual reference for the image layout.

**AC-16.** All six existing stories (`Coming Soon`, `In Stock`, `Out of Stock`,
`Low Stock`, `Custom CTA`, `As Div`) continue to pass their play functions unchanged.
The `Coming Soon` story's existing assertion
`await expect(getComputedStyle(cardImg).aspectRatio).toBe("14 / 9")` will fail after
AC-4 changes the ratio to `4 / 3`. The story must be updated to assert `"4 / 3"`.

**AC-17.** The `"Coming Soon"` story's `.card-img` play assertion block is updated to
expect `aspectRatio` of `"4 / 3"` (not `"14 / 9"`). No other play assertions change.

---

### Code quality

**AC-18.** No `any`, no `@ts-ignore`, no `as any` casts are introduced. TypeScript
compiles cleanly under `pnpm check`.

**AC-19.** All new or modified CSS in `ProductCard.svelte` uses native CSS nesting
(D45). Flat `.product-card :global(selector)` forms are not introduced.

**AC-20.** The `image` and `imageSrcset` props are forwarded correctly. They are
destructured from `$props()` and are **not** spread into `...rest` (they must not land
as attributes on the root `<a>` or `<div>` element).

---

## Out of scope

- `imageLight` / `imageLightSrcset` dual-palette support — ProductCard is not palette-switched.
- Palette-aware image toggling (CSS or JS) — not needed for ProductCard.
- Any behaviour changes to the CTA (hover state, link destination, etc.) — hover amber
  fill is already implemented and must not be regressed.
- Accessibility improvements beyond what already exists (WCAG audit is the reviewer's
  check, not a new AC here).
- Refactoring ProductCard to consume `<Button>` for the CTA row — the `.card-cta`
  hover-descendent rule (`:global(.product-card):hover .card-cta`) requires a scoped
  wrapper div, which is a genuine exception per `composition-limits.md`.

---

## Open questions

None blocking. All scoping and design decisions are resolved inline in the ACs above.
