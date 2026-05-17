<script lang="ts">
  import type { Snippet } from 'svelte'
  import Card from './Card.svelte'
  import TagPill from '../primitives/TagPill.svelte'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'
  import Inline from '../layout/Inline.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    /** HTML element to render as. @default 'a' */
    as?: string
    /** Project slug, shown in the card header. */
    slug: string
    /** Project display title. */
    title: string
    /** Short project description. */
    description: string
    /** Tag labels rendered as TagPills. @default [] */
    tags?: string[]
    /** CTA label in the card footer. @default 'VIEW PROJECT' */
    ctaLabel?: string
    children?: Snippet
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
</script>

<Card as={as} class="project-card" {...rest}>
  <div class="card-img">
    <Text variant="eyebrow">{slug.toUpperCase()} · PROJECT</Text>
  </div>
  <div class="card-body">
    <Stack gap="xs">
      {#if tags.length > 0}
        <Inline gap="xs" class="card-tags">
          {#each tags as tag}
            <TagPill>{tag}</TagPill>
          {/each}
        </Inline>
      {/if}
      <Heading level={3} style="font-size: var(--t-lede);">{title}</Heading>
      <p class="card-desc">{description}</p>
    </Stack>
  </div>
  <div class="card-cta">
    <Spread>
      <Text variant="mono">{ctaLabel}</Text>
      <span aria-hidden="true">→</span>
    </Spread>
  </div>
</Card>

<style>
  .card-body {
    padding: 12px 14px 10px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :global(.project-card) {
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

  .card-desc {
    font-family: var(--mono);
    font-size: var(--t-mono);
    color: var(--ink-dim);
    line-height: 1.4;
    margin: 0;
  }

  .card-cta {
    border-top: 1px solid var(--rule);
    padding: 10px 14px;
    transition: background var(--transition), color var(--transition);
  }

  :global(.project-card):hover .card-cta {
    background: var(--amber);
    color: var(--bg);
  }
</style>
