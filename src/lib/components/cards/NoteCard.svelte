<script lang="ts">
  import Card from './Card.svelte'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    /** HTML element to render as. @default 'a' */
    as?: string
    /** Numeric index — rendered as a hex ID (e.g. `0x0A`). */
    idx: number
    /** Tag shown in the top-right corner. @default 'LOG' */
    kind?: string
    /** Note title. */
    title: string
    /** Optional lede / excerpt text. */
    lede?: string
    /** Optional date string shown in the footer. */
    date?: string
    /** Resolved image src URL. When set, renders a thumbnail. */
    image?: string
    /** Optional responsive srcset string; ignored when image is unset. */
    imageSrcset?: string
    /** Image placement relative to the text block. @default 'side' */
    imagePlacement?: 'side' | 'top'
    [key: string]: unknown
  }

  let {
    as = 'a',
    idx,
    kind = 'LOG',
    title,
    lede,
    date,
    image,
    imageSrcset,
    imagePlacement = 'side',
    ...rest
  }: Props = $props()

  const hexId = $derived('0x' + idx.toString(16).padStart(2, '0').toUpperCase())
  const cardClass = $derived(`note-card${image ? ` ${imagePlacement}` : ''}`)
</script>

<Card as={as} class={cardClass} {...rest}>
  {#if image && imagePlacement === 'top'}
    <div class="note-card-image">
      <img src={image} srcset={imageSrcset || undefined} alt="" />
    </div>
  {/if}
  <div class="card-body">
    <Stack gap="xs">
      <Spread>
        <Text variant="mono" color="faint" size="xs">{hexId}</Text>
        <Text variant="mono" color="cyan" size="xs">{kind.toUpperCase()}</Text>
      </Spread>
      <Heading level={3}>{title}</Heading>
      {#if lede}
        <Text variant="body" class="note-lede">{lede}</Text>
      {/if}
      {#if date}
        <div class="note-foot">
          <Spread>
            <Text variant="mono" color="faint" size="xs">{date}</Text>
            <Text variant="mono" color="amber" size="xs" aria-hidden="true">READ →</Text>
          </Spread>
        </div>
      {/if}
    </Stack>
  </div>
  {#if image && imagePlacement === 'side'}
    <div class="note-card-image">
      <img src={image} srcset={imageSrcset || undefined} alt="" />
    </div>
  {/if}
</Card>

<style>
  .card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    grid-column: 1 / span 2;
  }

  :global {
    .note-card {
      text-decoration: none;
      color: inherit;
      cursor: pointer;
      transition: border-color var(--transition);

      &:hover {
        border-color: var(--amber);
      }

      &.side {
        display: grid;
        grid-template-columns: 60px 1fr 240px;
        gap: 32px;
        align-items: end;

        .note-card-image {
          align-self: stretch;
          min-height: 0;
        }

        @container (max-width: 720px) {
          grid-template-columns: 40px 1fr;

          .note-card-image {
            display: none;
          }
        }
      }

      &.top {
        display: flex;
        flex-direction: column;

        .note-card-image {
          width: 100%;
          aspect-ratio: 16 / 9;
          margin-bottom: 16px;
        }
      }
    }

    .note-card-image {
      overflow: hidden;
      border: 1px solid var(--rule);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        display: block;
      }
    }
  }

  .card-body {
    :global {
      .note-lede {
        flex: 1;
        color: var(--ink-dim);
      }
    }
  }

  .note-foot {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed var(--rule);
  }
</style>
