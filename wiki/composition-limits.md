# Composition limits — Svelte scoping and the path forward

This document records where the design system hits Svelte's scoped CSS boundary,
which patterns we use to work around it, and what remains as a genuine exception.
It serves as the rationale for B14 (Text + Heading primitives).

---

## The core constraint

Svelte scopes `<style>` rules to the component that declares them, by adding a
unique data-attribute (`data-svelte-XXXX`) to every element rendered by that
component. A parent's scoped rules cannot reach elements rendered by a **child**
component — i.e. the element that Stack, Inline, Spread, or Button actually put
in the DOM.

```svelte
<!-- NoteCard.svelte -->
<Spread class="note-head">...</Spread>   <!-- rendered by Spread, not NoteCard -->
ProductCard also has a few html elements.
<style>
  .note-head { font-family: var(--mono); } /* ← never applies; wrong scope */
</style>
```

---

## Three patterns, in order of preference

| Situation                                                      | Pattern                                                                |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Static layout/style, no pseudo-selectors needed                | `style=` prop directly on the primitive                                |
| Scoped CSS needed (pseudo, descendant, non-trivial properties) | Wrapper `<div class="my-class">` owned by the parent, primitive inside |
| Last resort for child component internals                      | `:global(.class)` — escapes scoping; risks collisions                  |

B13 used all three. `:global()` was reserved for cases where a child component's
rendered element must receive state-dependent styles (Tabs tab buttons, Select trigger,
Nav hamburger show/hide).

---

## Cases that still carry scoped CSS in higher-order components (post-B13)

### Typography spans — the main remaining issue

Almost every component has spans/paragraphs styled with scoped CSS:

| Component     | Scoped selectors                                                                                                   | Reason still scoped                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `NoteCard`    | `.note-hex`, `.note-kind`, `.note-title`, `.note-lede`, `.note-date`, `.note-read`                                 | Raw `<span>` / `<h3>` / `<p>` elements rendered by NoteCard |
| `ProductCard` | `.card-sku`, `.card-title`, `.card-desc`, `.card-img-label`, `.card-price`, `.card-price-sub`, `.card-stock-label` | Same                                                        |
| `ProjectCard` | `.card-title`, `.card-desc`, `.card-img-label`                                                                     | Same                                                        |
| `SectionHead` | `.section-num`, `.section-title`, `.section-sub`                                                                   | Same                                                        |
| `PageHero`    | `.page-hero-eyebrow`, `.page-hero-heading`, `.page-hero-lede`                                                      | Same                                                        |
| `Alert`       | `.alert-tag`, `.alert-title`, `.alert-msg`                                                                         | Same                                                        |
| `CtaBlock`    | `.cta-eyebrow`, `.cta-heading`, `.cta-desc`                                                                        | Same                                                        |
| `StatCard`    | `.stat-label`, `.stat-value`, `.stat-sub`                                                                          | Same                                                        |
| `ActivityRow` | `.activity-time`, `.activity-msg`, `.activity-actor`                                                               | Same                                                        |
| `KvList`      | `.kv-key`, `.kv-val`                                                                                               | Same                                                        |

**Resolution: B14 Text + Heading primitives.** Once `<Text variant="eyebrow">`,
`<Text variant="body">`, `<Heading level={3}>` etc. exist, each component's
typography CSS moves into the primitive that owns it. The parent stops styling
these elements entirely.

### Wrapper divs that survive because of scoping

| Component                           | Wrapper                                | Why the wrapper stays                                                                  |
| ----------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| `NoteCard` `.note-head`             | `<div class="note-head"><Spread>`      | Font/size/transform styles scoped to this div; Spread can't carry them                 |
| `NoteCard` `.note-foot`             | `<div class="note-foot"><Spread>`      | Border-top + padding need a scoped element; Spread is a child component                |
| `ProductCard` `.card-meta`          | `<div class="card-meta"><Spread>`      | Font/size/letter-spacing cascade; meta area has no direct child component to style     |
| `ProductCard` `.card-price`         | `<span class="card-price">`            | `display:flex; align-items:baseline` for price + VAT — small inline flex row           |
| `ProductCard` `.card-stock`         | `<span class="card-stock">`            | `display:flex` for led + label inline — could be `<Inline>` once Inline renders inline |
| `ProgressBar` `.progress-header`    | `<div class="progress-header">`        | `display:flex; justify-content:space-between` for label + pct — could be `<Spread>`    |
| `Alert` outer `.alert`              | `<div class="alert alert--{variant}">` | Row layout (tag + body) + variant border-color rules + hover-descendant cascade        |
| `SectionHead` outer `.section-head` | `<section class="section-head">`       | Column layout + `border-bottom` + padding                                              |
| `CtaBlock` outer `.cta-block`       | `<svelte:element class="cta-block">`   | Row layout + `:hover` background — hover rule requires scoped class                    |

**Resolution: most of these shrink or disappear once Text + Heading primitives carry
their own typography CSS.** What remains are genuine layout wrappers (hover rules,
border-bottom, widget geometry) which are correctly kept as scoped elements.

---

## Genuine exceptions — not resolvable by primitives

These carry CSS that primitives cannot express, by design:

| Location                                                                               | CSS                         | Why it stays                                                                       |
| -------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------- |
| `.product-card { display:flex; flex-direction:column }`                                | Root card layout            | Card's own self-layout; Card.svelte primitive itself does the same                 |
| `.card-img { display:flex; align-items:center; justify-content:center; aspect-ratio }` | Image placeholder centering | Widget geometry — the hatch image box is not a content-flow container              |
| `.product-card:hover .card-cta`                                                        | Descendent hover rule       | Requires a scoped ancestor class; primitive cannot carry descendant selectors      |
| `.project-card:hover .card-cta`                                                        | Same                        | Same                                                                               |
| `.modal[open] { display:flex; align-items:center; justify-content:center }`            | Dialog centering            | Browser-controlled `open` attribute; dialog centering is not a content-flow layout |
| `Nav { position:fixed }`                                                               | Fixed topbar                | Positioning is not layout composition                                              |
| `Nav @media` show/hide                                                                 | Responsive hamburger        | Media query display override — requires `:global()` to reach child Button          |
| `Tabs .tab-bar { border-bottom }`                                                      | Tab underline               | Border on the tablist container; wrapper stays                                     |
| `Select .select-panel`                                                                 | Dropdown positioning        | `position:absolute` widget geometry                                                |
| `InputWrap .icon-pre`, `.addon`                                                        | Input widget overlays       | Absolute/flex-based widget geometry; not content layout                            |
| `AccordionItem <summary>`                                                              | Browser UA flex             | Semantic `<summary>` — cannot be replaced by a layout primitive                    |

---

## What B14 (Text + Heading) will change

`Text` takes a `color` prop that maps directly to a design token:

```
<Text color="cyan">  →  <span style="color: var(--cyan)">
<Text color="amber"> →  <span style="color: var(--amber)">
<Text color="faint"> →  <span style="color: var(--ink-faint)">
<Text color="dim">   →  <span style="color: var(--ink-dim)">
```

Supported values: `ink` · `dim` · `faint` · `amber` · `cyan` · `ok` · `danger`.
No color prop = inherits from parent.

After B14, a component like NoteCard should reduce to:

```svelte
<Stack as="a" gap="xs" style="border: 1px solid var(--rule); ...">
  <Spread>
    <Text variant="mono" color="faint">{hexId}</Text>
    <Text variant="mono" color="cyan">{kind}</Text>
  </Spread>
  <Heading level={3}>{title}</Heading>
  <Text variant="body" color="dim">{lede}</Text>
  <Spread style="border-top: 1px dashed var(--rule); padding-top: 12px; margin-top: 8px;">
    <Text variant="mono" color="faint">{date}</Text>
    <Text variant="mono" color="amber">READ →</Text>
  </Spread>
</Stack>
```

No `<style>` block. No scoped CSS. The component is pure composition.
