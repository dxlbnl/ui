<script lang="ts">
  import type { Snippet } from 'svelte'
  import Stack from '../layout/Stack.svelte'
  import Inline from '../layout/Inline.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    /** Small mono label shown above the heading. */
    eyebrow?: string
    /** Primary section heading. */
    heading: string
    /** Secondary label shown inline after the heading. */
    sublabel?: string
    children?: Snippet
    [key: string]: unknown
  }

  let {
    eyebrow,
    heading,
    sublabel,
    children,
    ...rest
  }: Props = $props()
</script>

<section class="section-head" {...rest}>
  <Stack style="gap: 6px;">
    {#if eyebrow}
      <Text variant="eyebrow">{eyebrow}</Text>
    {/if}
    <Inline gap="sm" style="align-items: baseline;">
      <Heading level={2} variant="h3">{heading}</Heading>
      {#if sublabel}
        <Text variant="mono" style="margin-left: auto;">{sublabel}</Text>
      {/if}
    </Inline>
    {#if children}
      {@render children()}
    {/if}
  </Stack>
</section>

<style>
  .section-head {
    padding: 40px 0 12px;
    border-bottom: 1px solid var(--rule);
  }
</style>
