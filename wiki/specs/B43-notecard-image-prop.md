# B43: NoteCard image prop with side / top placement

## Context

`NoteCard` is the hex-indexed log entry card used across the dexterlabs.nl `/notes/`
index and potentially future project tile grids. The current component exposes `idx`,
`kind`, `title`, `lede`, `date`, and `as` — but no way to surface a thumbnail image.
The production site renders each notes row with a 240 px thumbnail to the right of the
text block; the component library has no equivalent.

This item adds `image?`, `imageSrcset?`, and `imagePlacement?: 'side' | 'top'` props.
The route (consumer) owns URL resolution; NoteCard only handles rendering.

Related wiki pages:
- [requirements.md](../requirements.md) — R4 (NoteCard), constraints (Svelte 5 runes, strict TS, D45 nesting)
- [architecture.md](../architecture.md) — component authoring conventions
- [decisions.md](../decisions.md) — D4 (Chakra-style), D5 (scoped CSS), D38 (primitives first), D42 (no play-fn for visual-only), D43 (`string | Snippet` slots), D45 (native CSS nesting)
- Item card: [backlog/doing/B43-notecard-image-prop.md](../backlog/doing/B43-notecard-image-prop.md)

This is a **visual-only** feature addition: no new interactive behaviour, no keyboard
or ARIA changes beyond `alt=""` on the decorative image. Per D42, the `test-writer`
stage is **skipped**; the pipeline is `spec-writer → implementer → reviewer`.

---

## Acceptance criteria

### Props API

**AC-1.** `NoteCard.svelte` exports three additional typed props in its `interface Props`:

```ts
image?: string          // resolved src URL; optional
imageSrcset?: string    // responsive srcset; optional, ignored when image is unset
imagePlacement?: 'side' | 'top'  // default 'side'
```

All three are optional. Existing props (`as`, `idx`, `kind`, `title`, `lede`, `date`,
`...rest`) are unchanged. The component continues to extend `[key: string]: unknown`
for attribute forwarding.

**AC-2.** When `image` is not provided (or is an empty string), no `<img>` element or
image wrapper element appears in the rendered DOM, regardless of the value of
`imagePlacement`.

**AC-3.** `imageSrcset` is ignored (not rendered) when `image` is unset.

---

### `data-image-placement` attribute

**AC-4.** When `image` is provided, the root element receives a `.side` or `.top` class
(matching the resolved `imagePlacement` value) in addition to `note-card`. When `image`
is unset neither class is present. No `data-image-placement` attribute is used.

---

### Side layout (default)

**AC-5.** When `image` is set and `imagePlacement` is `'side'` (or omitted, since `'side'`
is the default), the card uses a three-column grid:
`grid-template-columns: 60px 1fr 240px` with `gap: 32px` and `align-items: end`.
`.card-body` spans columns 1–2 (`grid-column: 1 / span 2`); the image wrapper occupies
column 3 with `align-self: stretch; min-height: 0` so it fills the card height without
driving it.

**AC-6.** When `image` is unset and `imagePlacement` is `'side'` (or omitted), the card
body falls back to a two-column grid: `grid-template-columns: 60px 1fr`. No third column
and no image wrapper element render.

**AC-7.** At `@container (max-width: 720px)` with `imagePlacement="side"`:
- The grid collapses to `grid-template-columns: 40px 1fr`.
- The image wrapper (`.note-card-image`) is `display: none`.

---

### Top layout

**AC-8.** When `image` is set and `imagePlacement` is `'top'`, the card body uses
`display: flex; flex-direction: column`. The image wrapper renders above the text
content block.

**AC-9.** The image wrapper in the `'top'` layout has `width: 100%` and
`aspect-ratio: 16 / 9` and `margin-bottom: 16px`.

---

### Image element (shared)

**AC-10.** The image wrapper element has class `note-card-image` and carries the styles
`overflow: hidden` and `border: 1px solid var(--rule)`.

**AC-11.** Inside the image wrapper, an `<img>` element is rendered with:
- `src` set to the `image` prop value.
- `srcset` set to `imageSrcset` when provided; omitted otherwise.
- `alt=""` (empty string — the image is decorative; the card title provides the label).
- CSS: `width: 100%; height: 100%; object-fit: cover; object-position: center; display: block`.

**AC-12.** The `<img>` element is the only child of `.note-card-image`.

---

### CSS authoring rules

**AC-13.** All CSS in `NoteCard.svelte`'s `<style>` block uses native CSS nesting (D45).
Flat `.note-card :global(child)` selectors are replaced with nested equivalents.
The existing `:global(.note-card)` and `:global(.note-card):hover` blocks are converted
to native nesting form (e.g. `:global { .note-card { … & :hover { … } } }`).

**AC-14.** Layout and image styles are driven by the `.side` / `.top` classes on the
root element — no JavaScript computes inline styles for the grid or flex layout.

---

### Existing stories pass

**AC-15.** All five pre-existing `NoteCard` stories (`With Lede`, `Minimal`, `High Index`,
`As Div`, `No Inline Flex Style`) continue to pass after the change. The existing play
function assertions must not regress.

---

### New stories (visual catalogue; no play function assertions required per D42)

**AC-16.** A `Side With Image` story is added to `NoteCard.stories.svelte` with
`image` and `imageSrcset` props set to a plausible URL and srcset string, and
`imagePlacement` defaulting to `'side'`.

**AC-17.** A `Top With Image` story is added with `imagePlacement="top"` and a plausible
image URL, demonstrating the vertical stacking layout.

**AC-18.** A `Side No Image` story (or the existing `With Lede` story serves this role)
demonstrates the two-column fallback when `image` is absent.

These stories serve as visual reference for the reviewer; they carry no `play` function
assertions (per D42 — layout and image-rendering are visual, not behavioural).

---

## Out of scope

- Placeholder / empty-state visual treatment when `image` is unset (item card notes this
  as a separate ask for a future `Placeholder` library primitive).
- Image URL resolution — the consumer (e.g. `+page.svelte`) resolves `resolveLogImage`
  + `vercelSrcset`; NoteCard receives a ready-to-use string.
- Lazy loading (`loading="lazy"`) or `fetchpriority` attributes — these are consumer
  concerns passed via `...rest` on the `<img>` or a future prop.
- Responsive srcset generation — the component accepts a pre-built `imageSrcset` string.
- Container query polyfills — native `@container` is used; browser support is assumed
  adequate for this project's audience.
- Changes to `ProductCard` or `ProjectCard` image handling.

---

## Open questions

None blocking. The item card's proposed CSS and API are precise enough to implement
directly.
