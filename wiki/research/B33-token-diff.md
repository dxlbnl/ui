# B33 Token Diff — tokens.css vs colors_and_type.css

**Reference:** `dexterlabs-design-system/project/colors_and_type.css`
**Implementation:** `src/lib/tokens/tokens.css` + `src/lib/tokens/typography.css`
**Related components:** `src/lib/components/primitives/Text.svelte`, `src/lib/components/primitives/Heading.svelte`, `src/lib/components/feedback/Modal.svelte`

---

## Font families

Both files declare identical font stacks:

| Variable | Reference | Implementation | Verdict |
|----------|-----------|----------------|---------|
| `--mono` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | MATCH |
| `--sans` | `"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif` | `"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif` | MATCH |

The `@font-face` declaration for JetBrains Mono Bold was in the reference file but is NOT in `tokens.css`. It is not confirmed to exist anywhere in `src/lib/`. This is a latent risk but not a direct cause of visual shift — browsers will fall back to system mono if the face is missing.

---

## Type scale mismatches

All `--t-*` custom properties are identical between reference and implementation:

| Variable | Reference | Implementation | Verdict |
|----------|-----------|----------------|---------|
| `--t-micro` | `12px` | `12px` | MATCH |
| `--t-mono` | `14px` | `14px` | MATCH |
| `--t-body` | `16px` | `16px` | MATCH |
| `--t-lede` | `19px` | `19px` | MATCH |
| `--t-h3` | `24px` | `24px` | MATCH |
| `--t-h2` | `36px` | `36px` | MATCH |
| `--t-h1` | `72px` | `72px` | MATCH |
| `--t-display` | `140px` | `140px` | MATCH |
| `--t-hero` | `clamp(48px, 8vw, 112px)` | `clamp(48px, 8vw, 112px)` | MATCH |
| `--t-title` | `clamp(36px, 5vw, 56px)` | `clamp(36px, 5vw, 56px)` | MATCH |
| `--t-subtitle` | `clamp(22px, 3.5vw, 40px)` | `clamp(22px, 3.5vw, 40px)` | MATCH |

Typography class rules in `typography.css` are also an exact copy of the reference (`.h1`, `.h2`, `.h3`, `.hero-heading`, `.display-heading`, `.body-lede`, `.body-text`, `.mono-label`, `.eyebrow`). All `font-size`, `line-height`, `letter-spacing`, and `font-weight` values match.

**The token layer itself is not the source of the bug.**

---

## Missing / renamed variables

No custom properties were renamed or removed. All reference variables are present in the implementation.

**One item not ported:** The `@font-face` block for `JetBrains Mono Bold` in the reference (`fonts/JetBrainsMono-Bold.ttf`) has no corresponding declaration in `tokens.css`. If the font file is not separately loaded via a global stylesheet or `<link>` in app.html, the bold weight falls back to system mono. This is cosmetically different but unrelated to font-size shifting.

---

## Modal heading audit

Modal (`src/lib/components/feedback/Modal.svelte`, line 84):

```svelte
<Text variant="mono" as="h2" id="modal-title" size="lg" class="modal-title">{title}</Text>
```

- `variant="mono"` applies the `.mono-label` class: `font-size: var(--t-mono)` = **14px**, `letter-spacing: 0.08em`, `text-transform: uppercase`, `color: var(--ink-dim)`.
- `size="lg"` adds `data-size="lg"` attribute, which triggers the scoped rule `[data-size="lg"] { font-size: var(--t-lede) }` = **19px**.

Since `[data-size="lg"]` is declared _after_ `.mono-label` in the scoped `<style>` block, the attribute selector wins in cascade order and overrides the mono-label font-size. The effective font-size rendered is **19px**.

The reference has no concept of a "large mono-label." The closest reference class for 19px text is `.body-lede` (sans-serif, `line-height: 1.55`, `color: var(--ink-dim)`). The modal title ends up as:

- Font: mono (JetBrains Mono) — diverges from `.body-lede` which is sans
- Size: 19px — matches `--t-lede`
- Case: uppercase (inherited from `.mono-label`)
- Color: `var(--ink-dim)` (inherited from `.mono-label`)
- Line-height: NOT explicitly overridden; inherits body `1.5` since `.mono-label` does not set line-height

There is no semantic heading style applied (`h2` class = `font-weight: 500, font-size: 36px, letter-spacing: -0.01em`) — the `as="h2"` only changes the HTML element, not the visual style. This means the modal title is rendered in uppercase mono at 19px rather than as a proper h2-scale heading.

**Whether this is a bug or intentional design** (compact mono label as modal title) is ambiguous. However, B33 reports visual shift, suggesting a recent change altered the size. If `size="lg"` was added during B26, the title grew from 14px to 19px — that 5px jump is the "shift."

---

## Text/Heading component audit

### Text.svelte — `data-size` mapping

| `size` prop | `data-size` attribute | Token resolved | Pixel value |
|-------------|----------------------|----------------|-------------|
| `xs` | `data-size="xs"` | `var(--t-micro)` | 12px |
| `sm` | `data-size="sm"` | `var(--t-mono)` | 14px |
| `md` | `data-size="md"` | `var(--t-body)` | 16px |
| `lg` | `data-size="lg"` | `var(--t-lede)` | 19px |
| `xl` | `data-size="xl"` | `var(--t-h3)` | 24px |

These size names do NOT appear in the reference CSS. The reference uses semantic names (`--t-body`, `--t-lede`, `--t-h3`, etc.). The `xs/sm/md/lg/xl` abstraction layer was introduced in B26 and maps as above.

**Critical issue:** The `data-size` rules in `Text.svelte` override the variant base class font-size because they appear later in the scoped style block. This means:
- `<Text variant="body" size="xs">` renders at 12px — overrides the 16px body base
- `<Text variant="mono" size="lg">` (the modal case) renders at 19px — overrides the 14px mono base
- `<Text variant="lede" size="sm">` renders at 14px — overrides the 19px lede base

The override behaviour is intended (size prop is documented as "font size override") but the mapping names (`lg` = 19px = lede-scale) may be surprising.

### Heading.svelte — `data-size` mapping

Identical `data-size` rules as Text.svelte:

| `size` prop | Token | Pixel value | Effect on `variant="h2"` (base: 36px) |
|-------------|-------|-------------|---------------------------------------|
| `xs` | `--t-micro` | 12px | shrinks from 36px to 12px |
| `sm` | `--t-mono` | 14px | shrinks from 36px to 14px |
| `md` | `--t-body` | 16px | shrinks from 36px to 16px |
| `lg` | `--t-lede` | 19px | shrinks from 36px to 19px |
| `xl` | `--t-h3` | 24px | shrinks from 36px to 24px |

The Heading component's `data-size` rules come after the variant class declarations in the scoped block, so they always win. A `<Heading level={2} size="lg">` would render at 19px despite being a semantic h2 — significantly smaller than the reference's `.h2` = 36px. This is an unexpected downgrade and likely the source of visual breakage if any callers pass a `size` prop to `Heading`.

**No `data-case` prop exists on Heading** (unlike Text). This is consistent with the reference — headings have no text-transform in the reference.

---

## Summary — changes needed

- **No changes needed in `tokens.css`** — all CSS custom properties are identical to the reference. The token layer is clean.

- **No changes needed in `typography.css`** — all global class declarations match the reference exactly.

- **Modal heading (Modal.svelte line 84):** The `size="lg"` prop on `<Text variant="mono">` inflates the modal title from 14px to 19px. Decide on intent:
  - If the modal title should be a proper heading style: replace with `<Heading level={2} variant="h3">` (24px, weight 500, sans) or `variant="h2"` (36px). Remove the `size="lg"` and `as="h2"` pattern.
  - If it should stay as a mono label at the reference size: remove `size="lg"` (reverts to 14px mono-label).
  - If 19px mono is the deliberate design: it has no reference counterpart — document this as an intentional deviation.

- **Heading.svelte `data-size` rules:** The `xs/sm/md/lg/xl` size overrides can shrink headings far below their semantic level (e.g., h1 at 12px). Consider whether this override should be clamped to only _increase_ size, or whether the size prop should be removed from Heading entirely if it was not part of the B26 spec for that component.

- **`@font-face` for JetBrains Mono Bold:** Verify the font is loaded globally (e.g., in `app.html` via a `<link>` or `<style>` tag). If not, bold mono text silently falls back to system mono, which has different metrics. Not a font-size shift issue but a visual quality issue.

- **`data-size` name-to-token mapping is unintuitive:** `lg` maps to `--t-lede` (19px), not to `--t-h3` (24px) as a designer might expect. Consider renaming the size props to match the token semantics (`lede`, `h3`, etc.) or documenting the current mapping prominently.