<script lang="ts">
  import type { Snippet } from 'svelte'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'
  import Text from '../primitives/Text.svelte'

  interface Props {
    /** HTML element to render as. @default 'div' */
    as?: string
    /** Small mono label shown above the heading. */
    eyebrow?: string
    /** Primary heading text. */
    heading: string
    /** Secondary descriptive text below the heading. */
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
  <Spread gap="md">
    <Stack gap="xs">
      {#if eyebrow}
        <Text variant="eyebrow" class="cta-eyebrow">{eyebrow}</Text>
      {/if}
      <span class="cta-heading">{heading}</span>
      {#if subtext}
        <span class="cta-desc">{subtext}</span>
      {/if}
    </Stack>
    {#if children}
      <div class="cta-action">
        {@render children()}
      </div>
    {/if}
  </Spread>
</svelte:element>

<style>
  .cta-block {
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

  .cta-heading {
    font-weight: 500;
    font-size: var(--t-lede);
    letter-spacing: -0.01em;
    color: var(--ink);
  }

  .cta-desc {
    font-family: var(--mono);
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.4;
  }

  .cta-action {
    flex-shrink: 0;
  }
</style>
