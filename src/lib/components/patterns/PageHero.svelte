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
    <Text variant="eyebrow" style="margin-bottom: 12px;">{eyebrow}</Text>
  {/if}
  <Heading level={1} variant="hero">{heading}</Heading>
  {#if lede}
    <Text variant="lede" style="margin-top: 20px; max-width: 62ch;">{lede}</Text>
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
