<script lang="ts">
  import type { ClassValue } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface Props {
    as?: string
    children?: Snippet
    class?: ClassValue | null
    style?: string | null
    [key: string]: unknown
  }

  let { as = 'div', children, class: klass = '', ...rest }: Props = $props()
</script>

<svelte:element this={as} class={['spread', klass]} {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .spread {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--u2);
  }
</style>
