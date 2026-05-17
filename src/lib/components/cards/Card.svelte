<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { ClassValue } from 'svelte/elements'

  interface Props {
    as?: string
    children?: Snippet
    class?: ClassValue | null
    [key: string]: unknown
  }

  let { as = 'div', children, class: klass = '', ...rest }: Props = $props()
</script>

<svelte:element this={as} class={['card', klass]} {...rest}>
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
