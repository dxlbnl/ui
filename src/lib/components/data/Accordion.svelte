<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet
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
    gap: 0;
    border: 1px solid var(--rule);
  }
</style>
