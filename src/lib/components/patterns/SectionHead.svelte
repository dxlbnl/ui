<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Inline from '../layout/Inline.svelte'

  interface Props extends HTMLAttributes<HTMLElement> {
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

<section class="section-head" {...rest}>
  {#if eyebrow}
    <span class="section-num">{eyebrow}</span>
  {/if}
  <Inline style="align-items: baseline; gap: 16px;">
    <h2 class="section-title">{heading}</h2>
    {#if sublabel}
      <span class="section-sub">{sublabel}</span>
    {/if}
  </Inline>
  {#if children}
    {@render children()}
  {/if}
</section>

<style>
  .section-head {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 40px 0 12px;
    border-bottom: 1px solid var(--rule);
  }

  .section-num {
    font-family: var(--mono);
    font-size: var(--t-mono);
    color: var(--ink-faint);
    letter-spacing: 0.12em;
  }

  .section-title {
    font-weight: 500;
    font-size: var(--t-h3);
    letter-spacing: -0.01em;
    margin: 0;
    color: var(--ink);
  }

  .section-sub {
    margin-left: auto;
    font-family: var(--mono);
    font-size: var(--t-mono);
    color: var(--ink-dim);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
</style>
