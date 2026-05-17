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
    <div class="page-hero-eyebrow"><Text variant="eyebrow">{eyebrow}</Text></div>
  {/if}
  <Heading level={1} variant="hero">{heading}</Heading>
  {#if lede}
    <div class="page-hero-lede"><Text variant="lede">{lede}</Text></div>
  {/if}
  {#if children}
    <div class="page-hero-actions">
      <Inline gap="sm">
        {@render children()}
      </Inline>
    </div>
  {/if}
</header>

<style>
  .page-hero {
    padding: 48px 0 40px;
    border-bottom: 1px solid var(--rule);
  }

  .page-hero-eyebrow {
    margin-bottom: 12px;
  }

  .page-hero-lede {
    margin-top: 20px;
    max-width: 62ch;
  }

  .page-hero-actions {
    margin-top: 24px;
  }
</style>
