<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    as?: string
    gap?: GapSize
    children?: Snippet
    [key: string]: unknown
  }

  let { as = 'div', gap = 'sm', children, ...rest }: Props = $props()
</script>

<svelte:element this={as} class="stack" data-gap={gap} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .stack {
    display: flex;
    flex-direction: column;
  }

  .stack[data-gap="none"] { gap: 0; }
  .stack[data-gap="xs"]   { gap: var(--u); }
  .stack[data-gap="sm"]   { gap: var(--u2); }
  .stack[data-gap="md"]   { gap: var(--u2); }
  .stack[data-gap="lg"]   { gap: var(--u4); }
  .stack[data-gap="xl"]   { gap: var(--u5); }
</style>
