<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import TagPill from '../primitives/TagPill.svelte'
  import Stack from '../layout/Stack.svelte'
  import Inline from '../layout/Inline.svelte'
  import Spread from '../layout/Spread.svelte'

  interface Props extends HTMLAnchorAttributes {
    as?: string
    slug: string
    title: string
    description: string
    tags?: string[]
    ctaLabel?: string
    [key: string]: unknown
  }

  let {
    as = 'a',
    slug,
    title,
    description,
    tags = [],
    ctaLabel = 'VIEW PROJECT',
    ...rest
  }: Props = $props()

  const resolvedCtaLabel = $derived(ctaLabel)
</script>

<svelte:element this={as} class="project-card" {...rest}>
  <div class="card-img">
    <span class="card-img-label">{slug.toUpperCase()} · PROJECT</span>
  </div>
  <Stack gap="xs" style="padding: 12px 14px 10px; flex: 1;">
    {#if tags.length > 0}
      <Inline gap="xs" class="card-tags">
        {#each tags as tag}
          <TagPill>{tag}</TagPill>
        {/each}
      </Inline>
    {/if}
    <h3 class="card-title">{title}</h3>
    <p class="card-desc">{description}</p>
  </Stack>
  <div class="card-cta">
    <Spread>
      <span>{resolvedCtaLabel} →</span>
    </Spread>
  </div>
</svelte:element>

<style>
  .project-card {
    border: 1px solid var(--rule);
    background: var(--bg-rail);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .card-img {
    aspect-ratio: 14 / 9;
    background: repeating-linear-gradient(
      135deg,
      var(--bg-sunken) 0 10px,
      var(--bg-elev) 10px 20px
    );
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-img-label {
    font-family: var(--mono);
    font-size: var(--t-micro);
    color: var(--ink-faint);
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .card-title {
    font-weight: 500;
    font-size: var(--t-lede);
    letter-spacing: -0.01em;
    line-height: 1.2;
    margin: 0;
  }

  .card-desc {
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.4;
    margin: 0;
  }

  .card-cta {
    border-top: 1px solid var(--rule);
    padding: 10px 14px;
    font-family: var(--mono);
    font-size: var(--t-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-dim);
    transition: background var(--transition), color var(--transition);
  }

  .project-card:hover .card-cta {
    background: var(--amber);
    color: var(--bg);
  }
</style>
