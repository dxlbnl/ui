<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface Props extends HTMLAttributes<HTMLElement> {
    as?: string
    children?: Snippet
    [key: string]: unknown
  }

  let { as = 'div', children, ...rest }: Props = $props()
</script>

<svelte:element this={as} class="card" {...rest}>
  {@render children?.()}
</svelte:element>

<style>
  .card {
    border: 1px solid var(--rule);
    background: var(--bg-rail);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
