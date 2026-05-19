<script lang="ts">
  import type { Snippet } from "svelte";
  import Inline from "../layout/Inline.svelte";
  import Text from "../primitives/Text.svelte";
  import Heading from "../primitives/Heading.svelte";

  interface Props {
    /** Eyebrow label. String renders inside <Text variant="eyebrow">; a Snippet renders as-is. */
    eyebrow?: string | Snippet;
    /** Hero heading. String renders as text; a Snippet renders as-is. */
    heading?: string | Snippet;
    /** Heading scale variant. @default 'title' */
    variant?: "hero" | "title";
    /** Subtitle / lede text shown below the heading. */
    lede?: string;
    /** Show bottom border rule. @default false */
    border?: boolean;
    children?: Snippet;
    [key: string]: unknown;
  }

  let {
    eyebrow,
    heading,
    variant = "title",
    lede,
    border = false,
    children,
    ...rest
  }: Props = $props();
</script>

<header class="page-hero" class:page-hero--bordered={border} {...rest}>
  {#if eyebrow}
    <div class="page-hero-eyebrow">
      {#if typeof eyebrow === "function"}{@render eyebrow()}{:else}<Text
          variant="eyebrow">{eyebrow}</Text
        >{/if}
    </div>
  {/if}
  <Heading level={1} {variant}>
    {#if typeof heading === "function"}{@render heading()}{:else}{heading}{/if}
  </Heading>
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
    padding: var(--u6) 0 var(--u4);
  }

  .page-hero--bordered {
    border-bottom: 1px solid var(--rule);
  }

  .page-hero-eyebrow {
    margin-bottom: 12px;
  }

  .page-hero-lede {
    margin-top: var(--u2);
    max-width: 62ch;
  }

  .page-hero-actions {
    margin-top: var(--u4);
  }

  .page-hero :global(.hero-heading em),
  .page-hero :global(.title-heading em) {
    font-style: normal;
    color: var(--ink-faint);
  }

  @media (max-width: 720px) {
    .page-hero {
      padding: var(--u6) 0 var(--u4);
    }
  }
</style>
