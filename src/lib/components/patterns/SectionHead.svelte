<script lang="ts">
  import type { Snippet } from 'svelte'
  import Stack from '../layout/Stack.svelte'
  import Inline from '../layout/Inline.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    eyebrow?: string
    heading: string
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

<Stack as="section" style="gap: 6px; padding: 40px 0 12px; border-bottom: 1px solid var(--rule);" {...rest}>
  {#if eyebrow}
    <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em;">{eyebrow}</Text>
  {/if}
  <Inline style="align-items: baseline; gap: 16px;">
    <Heading level={2} style="font-weight: 500; font-size: var(--t-h3); letter-spacing: -0.01em; margin: 0;">{heading}</Heading>
    {#if sublabel}
      <Text variant="mono" style="margin-left: auto;">{sublabel}</Text>
    {/if}
  </Inline>
  {#if children}
    {@render children()}
  {/if}
</Stack>
