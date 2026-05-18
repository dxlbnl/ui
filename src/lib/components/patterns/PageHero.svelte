<script lang="ts">
  import type { Snippet } from 'svelte'
  import Inline from '../layout/Inline.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    /** Small mono label shown above the heading. */
    eyebrow?: string
    /** Hero heading text. */
    heading?: string
    /** Snippet-based hero heading — takes precedence over `heading` string when provided. */
    headingContent?: Snippet
    /** Subtitle / lede text shown below the heading. */
    lede?: string
    /** Show bottom border rule. @default true */
    border?: boolean
    children?: Snippet
    [key: string]: unknown
  }

  let {
    eyebrow,
    heading,
    headingContent,
    lede,
    border = true,
    children,
    ...rest
  }: Props = $props()
</script>

<header class="page-hero" class:page-hero--bordered={border} {...rest}>
  {#if eyebrow}
    <div class="page-hero-eyebrow"><Text variant="eyebrow">{eyebrow}</Text></div>
  {/if}
  <Heading level={1} variant="hero">{#if headingContent}{@render headingContent()}{:else}{heading}{/if}</Heading>
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
  }

  .page-hero--bordered {
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

  .page-hero :global(.hero-heading em) {
    font-style: normal;
    color: var(--ink-faint);
  }
</style>
