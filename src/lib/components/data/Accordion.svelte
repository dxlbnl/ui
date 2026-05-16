<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Stack from '../layout/Stack.svelte'

  interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet
    [key: string]: unknown
  }

  let { children, ...rest }: AccordionProps = $props()
</script>

<Stack class="accordion" gap="none" style="border: 1px solid var(--rule);" {...rest}>
  {@render children()}
</Stack>
