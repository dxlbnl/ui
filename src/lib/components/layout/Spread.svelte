<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  interface Props {
    /** HTML element to render as. @default 'div' */
    as?: string
    /** Space between children. @default 'none' */
    gap?: GapSize
    children?: Snippet
    class?: ClassValue | null
    style?: string | null
    [key: string]: unknown
  }

  let { as = 'div', gap = 'none', children, class: klass = '', ...rest }: Props = $props()
</script>

<svelte:element this={as} class={['spread', klass]} data-gap={gap} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .spread[data-gap="none"] { gap: 0; }
  .spread[data-gap="xs"]   { gap: var(--u); }
  .spread[data-gap="sm"]   { gap: var(--u2); }
  .spread[data-gap="md"]   { gap: var(--u3); }
  .spread[data-gap="lg"]   { gap: var(--u4); }
  .spread[data-gap="xl"]   { gap: var(--u5); }
</style>
