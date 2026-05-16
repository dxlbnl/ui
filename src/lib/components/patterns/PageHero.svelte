<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface Props extends HTMLAttributes<HTMLElement> {
    eyebrow?: string
    heading: string
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
    <div class="page-hero-eyebrow">{eyebrow}</div>
  {/if}
  <h1 class="page-hero-heading">{heading}</h1>
  {#if lede}
    <p class="page-hero-lede">{lede}</p>
  {/if}
  {#if children}
    <div class="page-hero-actions">
      {@render children()}
    </div>
  {/if}
</header>

<style>
  .page-hero {
    padding: 48px 0 40px;
    border-bottom: 1px solid var(--rule);
  }

  .page-hero-eyebrow {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.12em;
    color: var(--ink-faint);
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .page-hero-heading {
    font-weight: 500;
    font-size: var(--t-hero);
    line-height: 1;
    letter-spacing: -0.03em;
    margin: 0;
    color: var(--ink);
  }

  .page-hero-lede {
    margin-top: 20px;
    font-size: var(--t-lede);
    color: var(--ink-dim);
    line-height: 1.55;
    max-width: 62ch;
  }

  .page-hero-actions {
    margin-top: 24px;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
</style>
