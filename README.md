# @dxlbnl/ui

Design system for [dexterlabs.nl](https://dexterlabs.nl). SvelteKit component library with Phosphor (dark) and Paper (light) palettes, built with Svelte 5 and documented in Storybook.

## Install

```bash
pnpm add @dxlbnl/ui
```

## Peer dependencies

```json
{
  "svelte": "^5.0.0",
  "@sveltejs/kit": "^2.0.0"
}
```

## Setup

Import the design token CSS in your global stylesheet or root layout:

```js
// src/app.css  or  src/routes/+layout.svelte
import '@dxlbnl/ui/tokens/tokens.css';
import '@dxlbnl/ui/tokens/typography.css';
```

`tokens.css` defines all CSS custom properties (colours, spacing, typography scale, transitions).
`typography.css` adds base element resets and global typography classes.

## Palette

Set `data-palette` on the `<html>` element to activate a palette:

```html
<!-- Phosphor — dark, terminal-green accent, amber highlights -->
<html data-palette="phosphor">

<!-- Paper — light, warm off-white background, same amber highlights -->
<html data-palette="paper">
```

Both palettes use the same CSS custom property names (`--ink`, `--bg`, `--amber`, etc.) so components switch automatically.

## Usage

```svelte
<script>
  import { Button, Stack, Heading } from '@dxlbnl/ui';
</script>

<Stack gap="md">
  <Heading level={2}>Deploy module</Heading>
  <Button variant="primary">Confirm</Button>
  <Button variant="ghost">Cancel</Button>
</Stack>
```

### Components

| Category | Components |
|----------|-----------|
| Primitives | `Button`, `Led`, `TagPill`, `Text`, `Heading` |
| Layout | `Stack`, `Inline`, `Spread`, `Grid`, `Container`, `Rule`, `Prose` |
| Cards | `Card`, `ProductCard`, `ProjectCard`, `NoteCard` |
| Navigation | `Nav`, `Breadcrumb` |
| Forms | `Input`, `Textarea`, `Select`, `InputWrap`, `Field`, `Checkbox`, `Radio`, `RadioGroup`, `Switch` |
| Feedback | `Modal`, `Alert`, `Toast`, `ToastRegion` |
| Patterns | `CtaBlock`, `StatCard`, `KvList`, `ProgressBar`, `ActivityRow`, `SectionHead`, `SectionFoot`, `PageHero` |
| Data | `Accordion`, `AccordionItem`, `Tabs`, `Table` |

### Toast store

```svelte
<script>
  import { toast, ToastRegion } from '@dxlbnl/ui';
</script>

<!-- Mount once in your root layout -->
<ToastRegion />

<!-- Push a notification from anywhere -->
<button onclick={() => toast.push('Saved', { title: 'Done', variant: 'success' })}>Save</button>
```

## Storybook

Interactive component explorer with play-function tests:

```bash
pnpm storybook   # starts at http://localhost:6006
```
