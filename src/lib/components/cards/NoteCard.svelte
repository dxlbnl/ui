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
    [key: string]: unknown
  }

  let {
    as = 'a',
    idx,
    kind = 'LOG',
    title,
    lede,
    date,
    ...rest
  }: Props = $props()

  const hexId = $derived('0x' + idx.toString(16).padStart(2, '0').toUpperCase())
</script>

<Card as={as} class="note-card" {...rest}>
  <div class="card-body">
    <Stack gap="xs">
      <Spread>
        <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.1em;">{hexId}</Text>
        <Text variant="mono" color="cyan" style="font-size: var(--t-micro); letter-spacing: 0.1em;">{kind.toUpperCase()}</Text>
      </Spread>
      <Heading level={3} style="font-size: var(--t-lede);">{title}</Heading>
      {#if lede}
        <Text variant="body" color="dim" class="note-lede" style="flex: 1;">{lede}</Text>
      {/if}
      {#if date}
        <div class="note-foot">
          <Spread>
            <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.08em;">{date}</Text>
            <Text variant="mono" color="amber" style="font-size: var(--t-micro); letter-spacing: 0.08em;" aria-hidden="true">READ →</Text>
          </Spread>
        </div>
      {/if}
    </Stack>
  </div>
</Card>

<style>
  .card-body {
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :global(.note-card) {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: border-color var(--transition);
  }

  :global(.note-card):hover {
    border-color: var(--amber);
  }

  .note-foot {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed var(--rule);
  }
</style>
