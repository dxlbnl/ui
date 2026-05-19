# B46: ProjectCard image props + empty-state placeholder

## Context

`ProjectCard` was ported to the component library without its image capability. The
production dexterlabs.nl `/projects/` index shows image-led cards with a 14/9 aspect-
ratio photo at the top of each card, with a separate `imageLight` variant for the Paper
palette. Without these props the migrated `/projects/` grid is text-only, losing the
visual signature of the projects index.

The component already has a `.card-img` placeholder div with a diagonal-stripe
background and the `{slug.toUpperCase()} · PROJECT` eyebrow — that empty-state stays as
the fallback when no image is provided.

The website's image pipeline resolves URLs externally (`resolveProjectImage` +
`vercelSrcset`). ProjectCard only receives ready-to-use strings.

This is a **visual-only** feature addition per D42. No new interactive behaviour, no
keyboard or ARIA changes beyond `alt=""` on decorative images. The pipeline is
`spec-writer → implementer → reviewer`; `test-writer` is **skipped**.

Related wiki pages:
- [requirements.md](../requirements.md) — R4 (ProjectCard), constraints (Svelte 5 runes, strict TS)
- [architecture.md](../architecture.md) — component authoring conventions
- [decisions.md](../decisions.md) — D4 (Chakra-style), D5 (scoped CSS), D38 (primitives first), D42 (no play-fn for visual-only), D45 (native CSS nesting)
- [composition-limits.md](../composition-limits.md) — scoped CSS boundary, `:global` workarounds
- Item card: [backlog/doing/B46-projectcard-image-props.md](../backlog/doing/B46-projectcard-image-props.md)

---

## Acceptance criteria

### Props API

**AC-1.** `ProjectCard.svelte` adds four optional typed props to its `interface Props`:

```ts
image?: string             // dark-palette (Phosphor) src URL
imageLight?: string        // paper-palette src URL; optional, ignored when image is unset
imageSrcset?: string       // responsive srcset for `image`; optional
imageLightSrcset?: string  // responsive srcset for `imageLight`; optional
```

All four are optional. Existing props (`as`, `slug`, `title`, `description`, `tags`,
`ctaLabel`, `children`, `...rest`) are unchanged.

**AC-2.** When `image` is not provided (or is an empty string), no `<img>` element
appears in the rendered DOM, regardless of whether `imageLight`, `imageSrcset`, or
`imageLightSrcset` are set.

**AC-3.** `imageSrcset` and `imageLightSrcset` are ignored (not rendered as attributes)
when their respective `image` / `imageLight` src values are unset.

---

### Empty state (no `image` prop)

**AC-4.** When `image` is not provided, the `.card-img` div renders the existing
diagonal-stripe background and the `<Text variant="eyebrow">` element containing
`{slug.toUpperCase()} · PROJECT`. This is identical to the pre-B46 rendering.

**AC-5.** The empty-state `.card-img` div retains `aspect-ratio: 14 / 9`,
`border-bottom: 1px solid var(--rule)`, `display: flex`, `align-items: center`, and
`justify-content: center`.

---

### Single image (only `image` provided)

**AC-6.** When `image` is set and `imageLight` is not set, a single `<img>` element is
rendered inside `.card-img` with:
- `src` set to the `image` prop value.
- `srcset` set to `imageSrcset` when provided; the attribute is omitted otherwise.
- `alt=""` (empty string — the image is decorative; the card title provides the label).
- CSS: `width: 100%; height: 100%; object-fit: cover; display: block`.

**AC-7.** When only `image` is set, the `<Text variant="eyebrow">` placeholder element
is not rendered.

**AC-8.** The `.card-img` div retains `aspect-ratio: 14 / 9` and
`border-bottom: 1px solid var(--rule)` when an image is present. The diagonal-stripe
`background` is no longer necessary (the `<img>` covers the area) but must not cause
a visual break if the image fails to load — the stripe background may remain or be
replaced by a solid `var(--bg-sunken)` fallback; either is acceptable to the reviewer.

---

### Dual image (both `image` and `imageLight` provided)

**AC-9.** When both `image` and `imageLight` are set, two `<img>` elements are rendered
inside `.card-img`:
- The dark-mode image has class `dark-img` with `src={image}` and, when provided,
  `srcset={imageSrcset}`.
- The light-mode image has class `light-img` with `src={imageLight}` and, when provided,
  `srcset={imageLightSrcset}`.
- Both images carry `alt=""`.

**AC-10.** Palette visibility toggle is controlled entirely by CSS (no JavaScript):
- `.light-img` has `display: none` by default (Phosphor/dark palette active).
- Inside a `:global([data-palette='paper'])` context, `.light-img` has `display: block`
  and `.dark-img` has `display: none`.

**AC-11.** The CSS for palette toggling is authored using native CSS nesting (D45)
inside the `:global(.project-card)` block:

```css
:global(.project-card) {
  /* ... existing rules ... */

  .card-img {
    /* ... */

    .light-img { display: none; }

    :global([data-palette='paper']) & {
      .light-img { display: block; }
      .dark-img  { display: none; }
    }
  }
}
```

The exact nesting form may vary as long as (a) it compiles correctly with Svelte's CSS
processor, (b) the visual toggle behaviour is correct, and (c) no flat
`.project-card :global(child)` selectors are introduced (banned by D45).

---

### Image element sizing

**AC-12.** Both `.dark-img` and `.light-img` (and the single `<img>` in the non-dual
case) have CSS: `width: 100%; height: 100%; object-fit: cover; display: block`.

**AC-13.** The `.card-img` container has `overflow: hidden` to clip the image to the
`14/9` box. This property may already be inherited from the existing `.project-card`
`overflow: hidden`; if not, it must be added to `.card-img` explicitly.

---

### CSS authoring rules

**AC-14.** All new CSS in `ProjectCard.svelte`'s `<style>` block uses native CSS nesting
(D45). No new flat `.project-card :global(child)` selectors are introduced.

**AC-15.** `pnpm check` (Svelte type-check) passes with zero errors after the change.

---

### Existing stories pass

**AC-16.** All pre-existing `ProjectCard` stories (`Open Source`, `No Tags`, `As Div`,
and any others present) continue to render without error and all existing play function
assertions continue to pass after the change.

---

### New stories (visual catalogue; no play function assertions per D42)

**AC-17.** A `With Image` story is added to `ProjectCard.stories.svelte` with `image`
set to a plausible URL (e.g. a Vercel or placeholder URL), demonstrating the single-
image rendering path. No `play` function is required.

**AC-18.** A `With Dark And Light Image` story is added with both `image` and
`imageLight` set to different plausible URLs, demonstrating the dual-image palette-swap
path. No `play` function is required.

These stories serve as a visual reference for the reviewer to confirm the image layout,
palette toggle, and empty-state behaviour in Storybook.

---

## Out of scope

- `sizes` attribute — the canonical local component passed responsive `sizes` per
  breakpoint. Consumers who need it can pass it via `...rest` forwarding onto an outer
  wrapper or as a future additional prop. Not part of this item.
- Image URL resolution — the consumer (`+page.svelte`) calls `resolveProjectImage` and
  `vercelSrcset`; ProjectCard receives the resolved strings.
- Lazy loading (`loading="lazy"`) or `fetchpriority` — consumer concern; not added here.
- Changes to `ProductCard`, `NoteCard`, or `Card`.
- Container-query responsive image hiding (as implemented for NoteCard in B43) — B46
  targets the desktop image-led card layout only.

---

## Open questions

None blocking.
