<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet
    [key: string]: unknown
  }

  let { children, ...rest }: AccordionProps = $props()
</script>

<div class="accordion" {...rest}>
  {@render children()}
</div>

<style>
  .accordion {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--rule);
  }
</style>
