<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  interface Props {
    as?: string
    gap?: GapSize
    children?: Snippet
    class?: ClassValue | null
    style?: string | null
    [key: string]: unknown
  }

  let { as = 'div', gap = 'sm', children, class: klass = '', ...rest }: Props = $props()
</script>

<svelte:element this={as} class={['stack', klass]} data-gap={gap} {...rest}>
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
