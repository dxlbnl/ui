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
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Button',
    component: Button,
    tags: ['autodocs'],
  });
</script>

<Story name="Primary" args={{ variant: 'primary' }} />

<Story name="Ghost" args={{ variant: 'ghost' }} />
```

Always use `lang="ts"` on the `<script module>` block.

## Passing args to components

When `component` is set in `defineMeta`, `args` are forwarded automatically — no
template needed for simple cases:

```svelte
<Story name="Primary" args={{ variant: 'primary', disabled: false }} />
```

For custom slot content or composition, use `{@render template(args)}` inside the
`<Story>` tag. Define the template as a snippet bound to `args`:

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    title: 'Primitives/Button',
    component: Button,
    args: { variant: 'primary' },
  });
</script>

{#snippet template(args)}
  <Button {...args}>Custom label</Button>
{/snippet}

<Story name="WithLabel" {template} args={{ variant: 'cta' }} />
```

The `{template}` shorthand passes the snippet as the `template` prop. Storybook merges
`meta.args` with story-level `args` before passing them to the snippet.

For stories that need completely different markup per variant, skip the shared template
and put markup directly in the `<Story>` slot:

```svelte
<Story name="IconOnly">
  <Button variant="ghost" aria-label="Close">×</Button>
</Story>
```

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
    component: Button,
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

## Token / no-component stories

For documentation stories with no single component, omit `component` from `defineMeta`
and put content directly in the `<Story>` slot:

```svelte
<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { expect, within } from 'storybook/test';
  import ColorSwatch from './ColorSwatch.svelte';

  const { Story } = defineMeta({
    title: 'Tokens/Colors',
    parameters: { layout: 'fullscreen' },
  });

  const playPhosphor = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const swatch = canvas.getByTestId('--bg');
    await expect(getComputedStyle(swatch).backgroundColor).toBe('rgb(11, 13, 12)');
  };
</script>

<Story name="Phosphor" play={playPhosphor}>
  <ColorSwatch name="--bg" value="#0b0d0c" />
</Story>
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
