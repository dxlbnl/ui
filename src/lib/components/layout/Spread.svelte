<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    as?: string
    children?: Snippet
    [key: string]: unknown
  }

  let { as = 'div', children, ...rest }: Props = $props()
</script>

<svelte:element this={as} class="spread" {...rest}>
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
