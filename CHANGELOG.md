# Changelog

All notable changes to this project are documented here. The format loosely follows
[Keep a Changelog](https://keepachangelog.com/) and the package follows semantic versioning.

## [1.2.0] - 2026-06-14

### Added

- **B50: `StatusPill`** — compact status indicator (LED + mono label).
- **B51: `SegmentedControl`** — single-select segmented button group.
- **B52: `Gauge`** — radial/linear value gauge (feedback).
- **B53: `ProportionBar`** — single stacked bar showing part-to-whole segments, with optional legend.
- **B54: `CompareBars`** — paired value-vs-budget comparison bars with over/under clamping.
- **B55: `Pager`** — pagination control.
- **B56: `Popover`** — anchored floating panel with placement + dismissal handling.
- **B57: `Inbox`** — notification bell + dismissible message panel.
- **B58: `AppShell`** — full application frame: desktop sidebar rail that swaps to a mobile bottom tab bar via CSS container queries, with `brand` / `topLeft` / `topRight` / `footer` slots and controlled `nav` / `current` / `onNavigate`.

### Changed

- **B49: `Nav`** — the menu now closes when clicking outside it.
- **B59: `Accordion`** — sticky-header behaviour for stacked items.
- **B60: `ProgressBar`** — added an over-budget (>100%) state.
- **`Gauge`, `ProportionBar`, `CompareBars` moved from `patterns/` to `feedback/`** — their Storybook category is now `Feedback/*`. Imports from the package root (`import { Gauge } from '@dxlbnl/ui'`) are unaffected (D71/D72).
- **`AppShell` visual alignment** to the design reference — mono label tracking, rounded count pill, centred tab indicator, glowing tab badge, roomier desktop gutter (D73).
- **Storybook stories consolidated** to lean, demo-first stories across the library (StatusPill, SegmentedControl, Gauge, ProportionBar, CompareBars, Popover, Inbox, AppShell); each carries a full interaction/play test that mirrors the design reference.

### Fixed

- **`AppShell` desktop layout** — the rail stacked above the content instead of beside it; the responsive column→row switch lived on the same element carrying `container-type` (an element cannot match an `@container` query against its own container). Moved the switch to an inner wrapper (D74).
- **B62: `ProportionBar`** — legend styling.
- **B61:** Storybook dev-UI crash caused by stories importing `vi` from `vitest`; the house pattern is `fn` from `storybook/test`.

### Internal

- `pnpm test` is now one-shot (`vitest run`) with a new `pnpm test:watch` for the watcher; `pnpm check` is warning-clean — intentional init-only prop reads wrapped in `untrack()` and three documented a11y false-positives suppressed with justified `svelte-ignore` (D75). No consumer-facing API change.

## [1.1.1] - 2026-05-21

### Fixed

- `NoteCard` — corrected side-image layout and tidied CSS.

## [1.1.0] - 2026-05-20

### Added

- Image props for `NoteCard` (side / top placement), `ProjectCard` (with empty-state placeholder), and `ProductCard` (image prop) (B43, B46, B47).
- `build:watch` script.

### Changed

- Components strip outer margins — the consumer owns spacing (B38).
- Responsive vertical padding for `PageHero` and `Container` (B40).
- `Grid` responsive collapse via container queries (B42).
- `Prose` typography aligned with canonical MarkdownBody styles; `maxWidth` now defaults to no constraint (B41, B44).
- `Text` and `Heading` default to `color: inherit` (B45).
- `Nav` controlled palette mode + layout escape hatches (B48).

### Fixed

- `/order/cancel/` regression alignment (B39); TagPill solid fill, PageHero lede colour, and ProductCard layout regressions.

## [1.0.0] - 2026-05-18

First stable release — visual realignment to the [dexterlabs.nl](https://dexterlabs.nl) website design.

### Changed

- `Nav` overhaul to match the website design (B28).
- `Input` chrome — spin buttons, clear-button colour, icon SVG fill (B30).
- `Select` design — right-aligned checkmark, amber panel border (B31).
- `Switch` — off-state dark-mode visibility + label-click toggle (B32).
- Typography realignment — Modal heading; removed the `Heading` `size` prop (B33).
- `Modal` redesign — mono title, variant icons in body, ink-faint close button (B34).
- `Alert` moved to `feedback/` with aligned variants; `Toast` now builds on `Alert` with title + message (B35).
- `PageHero` — `headingContent` snippet prop + `border` prop + em ink-faint styling (B36).

### Fixed

- `Checkbox` no longer shifts down on toggle (B29).

## [0.2.0] - 2026-05-18

### Added

- AI-readable docs — markdown files under `docs/` (B21).
- Layout-primitive gap API — `Spread` `gap` prop; `Inline` `align` prop (B25, B27).
- Typography size / case props on the `Text` and `Heading` primitives (B26).

### Changed

- **BREAKING:** `ToastVariant` values renamed `ok` / `amber` / `danger` → `success` / `warning` / `error` (B37).
- Style-prop cleanup — layout primitives use scoped CSS instead of inline `style=` overrides (B24, B27).
- `Modal` stories rebuilt as trigger-based stories with internal state (B22).

### Fixed

- CSS audit fixes — `NoteCard` hover selector, `Nav` hamburger wrap, `CtaBlock` override (B23).

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
