<script lang="ts">
  import type { Snippet } from 'svelte'
  import Inline from '../layout/Inline.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    /** Small mono label shown above the heading. */
    eyebrow?: string
    /** Hero heading text. */
    heading: string
    /** Subtitle / lede text shown below the heading. */
    lede?: string
    children?: Snippet
    [key: string]: unknown
  }

  let {
    eyebrow,
    heading,
    lede,
    children,
    ...rest
  }: Props = $props()
</script>

<header class="page-hero" {...rest}>
  {#if eyebrow}
    <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.12em; margin-bottom: 12px;">{eyebrow}</Text>
  {/if}
  <Heading level={1} style="font-weight: 500; font-size: var(--t-hero); line-height: 1; letter-spacing: -0.03em; margin: 0;">{heading}</Heading>
  {#if lede}
    <Text color="dim" style="font-size: var(--t-lede); margin-top: 20px; line-height: 1.55; max-width: 62ch;">{lede}</Text>
  {/if}
  {#if children}
    <Inline gap="sm" style="margin-top: 24px;">
      {@render children()}
    </Inline>
  {/if}
</header>

<style>
  .page-hero {
    padding: 48px 0 40px;
    border-bottom: 1px solid var(--rule);
  }
</style>
