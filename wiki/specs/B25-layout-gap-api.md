# B25: Layout primitive gap API

## Context

The three layout primitives — `Stack`, `Inline`, and `Spread` — share a Chakra-style
style-prop interface where a `gap` prop selects from a named scale of spacing tokens.
Two bugs exist in the current implementation that make the API inconsistent:

1. **`Spread` has no `gap` prop.** Its internal CSS hardcodes `gap: var(--u2)` (16 px).
   Stack and Inline both have a typed `GapSize` prop that maps to tokens; Spread does
   not. This means callers who need a different internal gap on a Spread (e.g. the 24 px
   gap in `CtaBlock`) fall back to `style="gap: 24px"` — a raw pixel value that bypasses
   the design system entirely.

2. **`md` is a duplicate of `sm` in Stack and Inline.** Both components map `md` to
   `var(--u2)` (16 px), the same token as `sm`. The intended slot for 24 px
   (`var(--u3)`) is therefore inaccessible via the prop API, and two named values resolve
   to the same pixel distance, which is a design system bug.

This item fixes both issues. It also migrates the one known call site that works around
bug (1) by using an inline `style=` prop on a layout primitive.

Related wiki pages:
- [architecture.md](../architecture.md) — component authoring conventions (Chakra-style
  style props, scoped CSS, `...rest` forwarding, strict TypeScript)
- [decisions.md](../decisions.md) — D5 (no global utility classes), D4 (Chakra-style
  composability), D18 (three-pattern Svelte scoping strategy), D31 (two-prop threshold
  for container replacement)
- [specs/B3-layout-components.md](B3-layout-components.md) — original layout primitive
  spec; the authoritative token-to-prop mapping table defined there is superseded by the
  corrected table in this spec
- [composition-limits.md](../composition-limits.md) — Svelte scoping strategy reference

### Files affected

| File | Change |
|------|--------|
| `src/lib/components/layout/Spread.svelte` | Add `gap` prop + `GapSize` type + data-gap CSS |
| `src/lib/components/layout/Stack.svelte` | Fix `md` CSS rule: `--u2` → `--u3` |
| `src/lib/components/layout/Inline.svelte` | Fix `md` CSS rule: `--u2` → `--u3` |
| `src/lib/components/patterns/CtaBlock.svelte` | Replace `style="gap: 24px;"` with `gap="md"` on `<Spread>` |
| `src/lib/components/layout/Spread.stories.svelte` | Add gap-variant stories; update existing stories for new default |

### Corrected gap scale (all three primitives)

This is the authoritative token mapping for B25 onwards. The `md` entry replaces the
erroneous value from `B3-layout-components.md`.

| `gap` prop value | CSS expression | Resolved px |
|-----------------|---------------|-------------|
| `"none"` | `0` | 0 px |
| `"xs"` | `var(--u)` | 8 px |
| `"sm"` | `var(--u2)` | 16 px |
| `"md"` | `var(--u3)` | 24 px ← fixed |
| `"lg"` | `var(--u4)` | 32 px |
| `"xl"` | `var(--u5)` | 40 px |

---

## Acceptance criteria

### AC-1 — Spread `gap` prop exists and is typed

`Spread.svelte` declares a `gap` prop of type `GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`
inside its `Props` interface. `pnpm check` produces zero TypeScript errors on the
component file.

### AC-2 — Spread default gap is `none` (0 px)

When `<Spread>` is rendered without a `gap` prop, the root element's computed `gap`
(or `column-gap`) is `"0px"` (or `"0"`). Existing call sites that do not pass `gap`
continue to render with 0 internal gap (they previously relied on the hardcoded 16 px).

> Rationale: `Spread` uses `justify-content: space-between` to push its children apart.
> An additional internal gap is rarely needed and was only hardcoded historically. The
> safe default that preserves all existing call sites' visual output is `none`. Any
> caller that relied on the hardcoded 16 px gap between its children must now pass
> `gap="sm"` explicitly — but no such caller exists in the current codebase other than
> `CtaBlock`, which is migrated to `gap="md"` in AC-8.

### AC-3 — Spread `gap="none"` renders 0 px gap

When `gap="none"` is passed explicitly to `<Spread>`, the root element's computed `gap`
is `"0px"` (or `"0"`).

### AC-4 — Spread `gap="xs"` renders 8 px

When `gap="xs"` is passed to `<Spread>`, the root element's computed `gap` resolves to
`8px` (the resolved value of `var(--u)`).

### AC-5 — Spread `gap="sm"` renders 16 px

When `gap="sm"` is passed to `<Spread>`, the root element's computed `gap` resolves to
`16px` (the resolved value of `var(--u2)`).

### AC-6 — Spread `gap="md"` renders 24 px

When `gap="md"` is passed to `<Spread>`, the root element's computed `gap` resolves to
`24px` (the resolved value of `var(--u3)`).

### AC-7 — Spread `gap="lg"` renders 32 px and `gap="xl"` renders 40 px

When `gap="lg"` is passed to `<Spread>`, the root element's computed `gap` resolves to
`32px`. When `gap="xl"` is passed, it resolves to `40px`.

### AC-8 — CtaBlock uses `gap="md"` on its inner Spread

In `src/lib/components/patterns/CtaBlock.svelte`, the `<Spread>` element is rendered
as `<Spread gap="md">` with no `style=` prop (the `style="gap: 24px;"` attribute is
removed entirely). The visual result is unchanged: the gap between the text stack and
the action slot remains 24 px.

> Verification: the source file must not contain `style="gap: 24px"` anywhere, and the
> rendered CtaBlock's inner Spread must have a computed `gap` of `24px`.

### AC-9 — Stack `gap="md"` now renders 24 px (was 16 px)

When `gap="md"` is passed to `<Stack>`, the root element's computed `gap` resolves to
`24px` (the resolved value of `var(--u3)`), not `16px`. The component's scoped CSS
rule `.stack[data-gap="md"]` must reference `var(--u3)`.

### AC-10 — Stack `gap="sm"` still renders 16 px (unchanged)

When `gap="sm"` is passed to `<Stack>`, the root element's computed `gap` resolves to
`16px` (the resolved value of `var(--u2)`). This value is unchanged from before B25.

### AC-11 — Inline `gap="md"` now renders 24 px (was 16 px)

When `gap="md"` is passed to `<Inline>`, the root element's computed `gap` resolves to
`24px` (the resolved value of `var(--u3)`), not `16px`. The component's scoped CSS rule
`.inline[data-gap="md"]` must reference `var(--u3)`.

### AC-12 — Inline `gap="sm"` still renders 16 px (unchanged)

When `gap="sm"` is passed to `<Inline>`, the root element's computed `gap` resolves to
`16px` (the resolved value of `var(--u2)`). This value is unchanged from before B25.

### AC-13 — `GapSize` type is consistent across all three primitives

All three files (`Stack.svelte`, `Inline.svelte`, `Spread.svelte`) declare the same
`GapSize` union type: `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'`. `pnpm check`
passes with zero TypeScript errors across the entire project (not just the three
primitive files).

### AC-14 — No `style="gap: 24px"` remains anywhere in the codebase

After the migration, a text search of `src/` for `style=["'].*gap:\s*24px` yields zero
matches. Inline pixel gap values on layout primitives have been eliminated.

### AC-15 — Spread stories cover all six gap sizes

`Spread.stories.svelte` includes at least the following named stories (new or updated):

- A story that asserts `gap="none"` produces 0 px computed gap.
- A story that asserts `gap="sm"` produces 16 px computed gap.
- A story that asserts `gap="md"` produces 24 px computed gap.
- A story that asserts `gap="lg"` produces 32 px computed gap.

The existing stories ("Section Header", "Led Status Bar", "With Gap", "Vertical Stack")
must continue to pass. Any that previously asserted a fixed non-zero gap on a bare
`<Spread>` (no `gap` prop) must be updated to reflect the new `none` default.

### AC-16 — Stack `gap="md"` story asserts 24 px

The "As Section" story in `Stack.stories.svelte` (which uses `gap="md"`) must be
updated so its gap assertion expects `24px`, not `16px`. The play function previously
contained `expect(gap.includes("16px")).toBe(true)` for `gap="md"` — this assertion
must now pass with `24px`.

### AC-17 — Full test suite remains green

`pnpm test` passes with zero failures after all changes in this item. No previously
passing story play function may regress.

---

## Out of scope

- **Changing the default behaviour of existing `<Spread>` call sites that don't pass
  `gap`.** These callers (CtaBlock excepted, which is migrated) continue to work because
  the new default is `none` (0 px) — a safe no-op for space-between layouts.
- **Changing the `xs`, `sm`, `lg`, or `xl` gap values.** Only `md` is corrected.
- **Any layout primitive other than `Stack`, `Inline`, and `Spread`.** `Grid` also has
  a `gap` prop but uses the same token table — it is not changed in this item.
- **Migrating callers that use inline `style=` for gap values other than 24 px.** Only
  the documented `style="gap: 24px"` in `CtaBlock` is migrated. Any hypothetical
  `style="gap: 32px"` call site is out of scope.
- **Nav restructuring.** Explicitly excluded.
- **Adding a shared `gap-utils.ts` or extracting `GapSize` to a shared module.** The
  type is declared locally in each component file — DRY extraction is a future
  refactor concern and out of scope here.
- **Visual regression testing.** Tests are play-function assertions only.

---

## Open questions

No open questions block implementation. All design decisions and affected files are
identified. B25 is ready for `test-writer`.
