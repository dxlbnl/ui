# dxlb-design

## Overview

`dxlb-design` is a Svelte 5 component library for [dexterlabs.nl](https://dexterlabs.nl), implementing the Dexterlabs design identity: Phosphor (dark, default) and Paper (light) palettes, JetBrains Mono + Inter Tight typefaces, an amber primary accent, and an overall terminal/hardware aesthetic. It is consumed by SvelteKit applications and by AI coding assistants generating Svelte code against the Dexterlabs design system.

## Install

```sh
pnpm add dxlb-design
```

Peer dependencies: Svelte 5 / SvelteKit. No external UI primitive libraries are required.

**Note:** The library is not currently published to npm (personal use). Reference it via a local path or pnpm workspace link until a public version is released:

```sh
# workspace reference (recommended for monorepo setups)
pnpm add dxlb-design --workspace

# local path reference
pnpm add ../path/to/dxlb-design
```

## Global CSS

Import the design tokens and typography classes once at the app root, before any component is rendered. In SvelteKit, add these imports to `src/app.css` (or `src/routes/+layout.svelte`):

```svelte
<script>
  import 'dxlb-design/tokens.css'
  import 'dxlb-design/typography.css'
</script>
```

Alternatively, import from within `src/app.css`:

```css
@import 'dxlb-design/tokens.css';
@import 'dxlb-design/typography.css';
```

Without these imports, all design tokens (`var(--amber)`, `var(--mono)`, etc.) and global typography classes (`body-text`, `h1`, `eyebrow`, etc.) will be undefined and components will render unstyled.

## Palette setup

The library ships two palettes:

- **Phosphor** — dark default. Defined on `:root` in `tokens.css`. Background `#0b0d0c`, amber accent `#ffb347`.
- **Paper** — light override. Activated by setting `data-palette="paper"` on the `<html>` element. Background `#efece4`, amber accent `#a04e00`.

To switch palettes manually:

```ts
document.documentElement.setAttribute('data-palette', 'paper')   // light
document.documentElement.setAttribute('data-palette', 'phosphor') // dark
```

The `Nav` component includes a built-in palette toggle button. It reads and writes the user preference under the `localStorage` key `'dxlb-palette'`, then sets `data-palette` on `<html>`. On first load the toggle reads `localStorage` and applies the stored palette after hydration.

**SSR caveat:** The initial server render always uses the Phosphor (dark) palette. The Paper preference is applied on the client after hydration, causing a brief flash on first load for Paper users. This is expected behaviour.

## Import paths

All components and the `toast` store are exported from the single entry point `'dxlb-design'`.

### Primitives

```ts
import { Button, Led, TagPill, Text, Heading } from 'dxlb-design'
```

### Layout

```ts
import { Stack, Inline, Spread, Grid, Container, Rule, Prose } from 'dxlb-design'
```

### Cards

```ts
import { Card, ProductCard, ProjectCard, NoteCard } from 'dxlb-design'
```

### Navigation

```ts
import { Nav, Breadcrumb, Pager, AppShell } from 'dxlb-design'
```

### Forms

```ts
import { Input, Textarea, Select, InputWrap, Field, Checkbox, Radio, RadioGroup, Switch, SegmentedControl } from 'dxlb-design'
```

### Feedback

```ts
import { Alert, Modal, Toast, ToastRegion, Popover, StatusPill, Inbox, Gauge, ProportionBar, CompareBars } from 'dxlb-design'
import { toast } from 'dxlb-design'
```

### Patterns

```ts
import { CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead, SectionFoot, PageHero } from 'dxlb-design'
```

### Data

```ts
import { Accordion, AccordionItem, Tabs, Table } from 'dxlb-design'
```
