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

## Minimal story skeleton

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Button',
    tags: ['autodocs'],
    // ⚠️  Do NOT set `component:` here — see warning below
  });
</script>

<Story name="Primary">
  <Button variant="primary">Order Now</Button>
</Story>

<Story name="Ghost">
  <Button variant="ghost">View All →</Button>
</Story>
```

Always use `lang="ts"` on the `<script module>` block.

## ⚠️  Never set `component:` in `defineMeta`

Setting `component: MyComponent` in `defineMeta` causes `@storybook/addon-svelte-csf`
to wrap every story's children with that component. When the story slot already contains
`<MyComponent>`, the result is a double-render:

```html
<!-- WRONG — causes two <button> elements, getByRole('button') throws -->
<button class="btn-primary">        <!-- CSF wrapper from component: Button -->
  <button class="btn-primary">...   <!-- explicit <Button> in the Story slot -->
  </button>
</button>
```

**Always omit `component:`**. Put the component directly in the `<Story>` slot.
The `tags: ['autodocs']` line is still useful for autodoc generation and can stay.

## Putting markup directly in Story slots

Every story renders its markup directly in the slot — no args system, no template
snippets needed:

```svelte
<Story name="Primary Disabled">
  <Button variant="primary" disabled>Disabled</Button>
</Story>

<Story name="As Link">
  <Button as="a" href="/docs" variant="ghost">Read the docs →</Button>
</Story>

<Story name="Pill Row">
  <div style="display:flex;gap:8px;">
    <TagPill>Utility</TagPill>
    <TagPill variant="amber">Latest</TagPill>
  </div>
</Story>
```

For token / CSS documentation stories with no component at all, this is the same
pattern — just put the HTML directly in the slot.

## Play functions (interaction tests)

Define play functions as **named variables** in the `<script module lang="ts">` block.
Do **not** write inline arrow functions in the `play={...}` attribute — TypeScript syntax
(`as`, type annotations) is not valid in template attribute expressions.

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Button',
  });

  const playClick = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /submit/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  };
</script>

<Story name="Primary" args={{ variant: 'primary' }} play={playClick} />
```

### Key rules for play functions

- Import `expect` and `within` from **`'storybook/test'`** (no `@` prefix).
- Type the parameter as `{ canvasElement: HTMLElement }` — `canvas` is not a context
  property; build it with `within(canvasElement)`.
- Always `await` both `userEvent` calls and `expect` assertions.
- `userEvent` is available as a context parameter if needed:
  ```ts
  const playType = async ({ canvasElement, userEvent }: { canvasElement: HTMLElement; userEvent: any }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'hello');
  };
  ```


## A11y

Every story is audited by `@storybook/addon-a11y`. Violations show in the Storybook
panel and as `todo` items in `pnpm test` output (`a11y.test: 'todo'` in
`.storybook/preview.ts`). Fix all violations before marking a backlog item done.

## Running tests

```bash
pnpm test       # all story play functions via Vitest browser mode
pnpm storybook  # visual review + interaction panel
```
