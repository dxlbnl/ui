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

<svelte:element this={as} class={['inline', klass]} data-gap={gap} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .inline {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }

  .inline[data-gap="none"] { gap: 0; }
  .inline[data-gap="xs"]   { gap: var(--u); }
  .inline[data-gap="sm"]   { gap: var(--u2); }
  .inline[data-gap="md"]   { gap: var(--u2); }
  .inline[data-gap="lg"]   { gap: var(--u4); }
  .inline[data-gap="xl"]   { gap: var(--u5); }
</style>
