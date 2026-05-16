# Writing Stories — dxlb-design

Stories are the **only test artefact** in this project. No `.test.ts` files exist.
Every `<Story>` with a `play` prop is a test executed by `@storybook/addon-vitest`
via `pnpm test`.

## Format: Svelte CSF (`.stories.svelte`)

All stories use the Svelte CSF format via `@storybook/addon-svelte-csf`. Files are
named `<ComponentName>.stories.svelte` and live **co-located** with the component:

```
src/lib/components/primitives/
  Button.svelte
  Button.stories.svelte     ← co-located
```

Always use `lang="ts"` on the `<script module>` block.

---

## The standard pattern

Set `component:` in `defineMeta`. Pass props via story `args`. Put only the
**content/children** in the story slot — never the component itself.

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs'],
  });
</script>

<!-- Props in args, children in the slot -->
<Story name="Primary" args={{ variant: 'primary' }}
  play={async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('button', { name: 'Order Now' })).toBeVisible();
  }}>
  Order Now
</Story>

<Story name="Ghost" args={{ variant: 'ghost' }}>
  View All →
</Story>

<!-- Self-closing when there are no children -->
<Story name="OK" args={{ color: 'ok' }} />
```

For layout components, the component arranges its children — the slot still holds
only the children, and layout props go in `args`:

```svelte
const { Story } = defineMeta({
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
});

<Story name="Default" args={{ gap: 'sm' }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild;
    await expect(getComputedStyle(root).flexDirection).toBe('column');
  }}>
  <Button variant="ghost">View Hardware →</Button>
  <Button variant="ghost">View Projects →</Button>
</Story>
```

### ⚠️ Never put the component in the slot when `component:` is set

`component:` wraps the story slot with the component. If the slot also contains
`<Button>`, you get a double render — `<button><button>…</button></button>`:

```svelte
<!-- WRONG — double render -->
<Story name="Primary" args={{ variant: 'primary' }}>
  <Button variant="primary">Order Now</Button>   ← remove this
</Story>
```

### Composition stories — multiple instances

When a story needs to show **multiple instances** of the same component side by side,
use a wrapping layout element in the slot and omit `component:` from that story's file,
or create a separate `*.composition.stories.svelte` file without `component:`:

```svelte
<!-- TagPill.composition.stories.svelte — no component: in defineMeta -->
<Story name="Pill Row">
  <div style="display:flex;gap:8px;">
    <TagPill>Utility</TagPill>
    <TagPill variant="amber">Latest</TagPill>
    <TagPill variant="cyan">New</TagPill>
  </div>
</Story>
```

---

## Play functions

Write play functions as **named `const` variables in the `<script module>` block**. This
allows full TypeScript annotations and keeps the template clean.

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';
  import Button from './Button.svelte';

  const { Story } = defineMeta({ title: 'Primitives/Button', tags: ['autodocs'] });

  const playPrimary = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const btn = within(canvasElement).getByRole('button', { name: 'Order Now' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  };
</script>

<Story name="Primary" args={{ variant: 'primary' }} play={playPrimary}>
  Order Now
</Story>
```

For trivial single-assertion stories, an inline arrow is acceptable — but named consts
are preferred whenever there are two or more assertions or TypeScript types are needed.

### Rules

- Import `expect` and `within` from **`'storybook/test'`** (no `@` prefix).
- Prefer named `const` play functions in the module script — TypeScript annotations are
  allowed there (`:` type syntax is **not** valid inside template `play={...}` expressions).
- **No null checks.** Queries throw if the element is missing — a guard is redundant.
- Always `await` every `expect` assertion.

### Querying elements — priority order

Prefer queries that reflect how a real user or assistive technology perceives the UI:

1. `getByRole('button', { name: /submit/i })` — role + accessible name (best)
2. `getByLabelText('Email')` — form fields with labels
3. `getByText('Order Now')` — visible text content
4. `canvasElement.querySelector('h3')` / `querySelector('hr')` — structural semantic tags
5. `getByTestId('...')` — **last resort**, only when no accessible handle exists
   (e.g. a layout wrapper div with no role or text)

Avoid class-selector `querySelector` (`.card-img`) when a semantic alternative exists.

For layout component roots with no accessible role, use `canvasElement.firstElementChild`
(the component is the direct child of the story canvas) or give it a semantic tag via
`as` and then query by role:

```svelte
<!-- query the layout root via firstElementChild -->
play={async ({ canvasElement }) => {
  const root = canvasElement.firstElementChild;
  await expect(getComputedStyle(root).gap).toBe('32px');
}}

<!-- or give it a semantic element and query by role -->
<Story name="As Nav" args={{ as: 'nav', 'aria-label': 'Site links' }}
  play={async ({ canvasElement }) => {
    const nav = within(canvasElement).getByRole('navigation', { name: 'Site links' });
    await expect(getComputedStyle(nav).flexWrap).toBe('wrap');
  }}>
  <a href="/">Home</a>
</Story>
```

### userEvent

```svelte
play={async ({ canvasElement, userEvent }) => {
  await userEvent.click(within(canvasElement).getByRole('button'));
  await expect(within(canvasElement).getByRole('dialog')).toBeVisible();
}}
```

---

## Token color resolution

To assert a computed colour matches a CSS custom property:

```svelte
play={async ({ canvasElement }) => {
  const probe = document.createElement('div');
  probe.style.cssText = 'color:var(--amber);position:absolute;opacity:0';
  document.body.appendChild(probe);
  const amberRgb = getComputedStyle(probe).color;
  document.body.removeChild(probe);

  const pill = within(canvasElement).getByText('Featured');
  await expect(getComputedStyle(pill).color).toBe(amberRgb);
}}
```

For background tokens swap `color` for `backgroundColor` when setting `probe.style` and
reading `getComputedStyle(probe).backgroundColor`.

---

## A11y

Every story is audited by `@storybook/addon-a11y`. Violations show in the Storybook
panel and as `todo` items in `pnpm test` output. Fix all violations before marking a
backlog item done.

---

## Running tests

```bash
pnpm test       # all story play functions via Vitest browser mode
pnpm storybook  # visual review + interaction panel
```
