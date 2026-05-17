# Changelog

## [0.1.0] - 2026-05-17

### Added

- **B1: Project scaffold** — SvelteKit + TypeScript, Storybook 10 with `@storybook/addon-svelte-csf` and `@storybook/addon-vitest`, folder structure under `src/lib/`
- **B2: Design tokens** — Phosphor (dark) and Paper (light) palettes as CSS custom properties; base reset; semantic element styles; typography classes (`.h1`–`.h3`, `.hero-heading`, `.display-heading`, `.body-text`, `.body-lede`, `.mono-label`, `.eyebrow`, `code`, `pre`)
- **B3: Layout components** — `Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule` — Svelte 5 style-prop primitives (Chakra-style), scoped CSS, no global utility classes
- **B4: Primitive components** — `Button` (primary / cta / ghost / back / del variants), `Led` (ok / amber / cyan / danger / off, blink animation), `TagPill` (default / amber / cyan)
- **B5: Card components** — `Card` (base), `ProductCard`, `ProjectCard`, `NoteCard` — diagonal hatch placeholder, amber border hover, hex note IDs
- **B6: Navigation** — `Nav` — fixed top bar, mono ALL-CAPS links, amber active underline, palette toggle (◑/◐), mobile hamburger, breadcrumb slot; palette preference persisted to localStorage
- **B7: Form components** — `Input`, `Textarea`, `Select` (custom listbox), `InputWrap` (icon prefix, addon, clear button), `Field` (label + a11y wiring)
- **B8: Modal** — `Modal` — native `<dialog>`, header / body / footer slots, confirm / destructive variants, backdrop overlay, SSR-safe mount
- **B9: Pattern components** — `Alert` (ok / amber / danger / info), `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`, `ActivityRow`, `SectionHead`, `SectionFoot`, `PageHero`
- **B10: Data components** — `Accordion` + `AccordionItem` (native `<details>`, animated height), `Tabs` (amber underline, ARIA tabpanel), `Table` (mono headers, dashed row rules)
- **B14: Typography primitives** — `Text` (body / lede / mono / eyebrow variants, color prop, polymorphic `as`) and `Heading` (level 1–6, display / hero / h1 / h2 / h3 variants)
- **B15: Keyboard navigation** — ARIA Listbox pattern for `Select` (arrow keys, Home/End, Escape, Enter); ARIA Tabs pattern for `Tabs` (ArrowLeft/Right, Home/End) — WCAG 2.1 AA SC 2.1.1
- **B16: Form primitives** — `Checkbox` (checked / indeterminate / disabled), `Radio` + `RadioGroup` (roving tabindex, arrow-key nav), `Switch` (role=switch, amber when on, SSR-safe); `Field` auto-injects `aria-invalid` and `aria-describedby`
- **B17: Navigation enhancements** — `Breadcrumb` (`aria-current="page"` on last crumb); `AnimatedAccordion` CSS height transition via `interpolate-size: allow-keywords` with `@supports` guard
- **B18: Toast notifications** — `Toast` (ok / amber / danger, auto-dismiss, manual close), `ToastRegion` (fixed portal, SSR-safe, stack limit), `toast` store (`push`, `dismiss`)
- **B20: Prose component** — `Prose` wrapper for markdown-rendered HTML; polymorphic `as` prop; `maxWidth` prop; full element styling using design tokens

[0.1.0]: #
