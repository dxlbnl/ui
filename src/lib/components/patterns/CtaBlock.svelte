<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  interface Props extends HTMLAttributes<HTMLElement> {
    as?: string
    eyebrow?: string
    heading: string
    subtext?: string
    children?: Snippet
    [key: string]: unknown
  }

  let {
    as = 'div',
    eyebrow,
    heading,
    subtext,
    children,
    ...rest
  }: Props = $props()
</script>

<svelte:element this={as} class="cta-block" {...rest}>
  <div class="cta-body">
    {#if eyebrow}
      <span class="cta-eyebrow">{eyebrow}</span>
    {/if}
    <span class="cta-heading">{heading}</span>
    {#if subtext}
      <span class="cta-desc">{subtext}</span>
    {/if}
  </div>
  {#if children}
    <div class="cta-action">
      {@render children()}
    </div>
  {/if}
</svelte:element>

<style>
  .cta-block {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    border: 1px solid var(--amber);
    padding: 24px 32px;
    color: inherit;
    transition: background var(--transition);
    cursor: pointer;
    text-decoration: none;
  }

  .cta-block:hover {
    background: color-mix(in srgb, var(--amber) 6%, transparent);
  }

  .cta-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .cta-eyebrow {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.12em;
    color: var(--ink-faint);
    text-transform: uppercase;
  }

  .cta-heading {
    font-weight: 500;
    font-size: var(--t-lede);
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .cta-desc {
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.4;
  }

  .cta-action {
    flex-shrink: 0;
  }
</style>
