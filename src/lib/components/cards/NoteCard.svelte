<script lang="ts">
  import Card from './Card.svelte'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'
  import Text from '../primitives/Text.svelte'
  import Heading from '../primitives/Heading.svelte'

  interface Props {
    as?: string
    idx: number
    kind?: string
    title: string
    lede?: string
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
  <Stack gap="xs" style="padding: 20px; flex: 1;">
    <Spread>
      <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.1em;">{hexId}</Text>
      <Text variant="mono" color="cyan" style="font-size: var(--t-micro); letter-spacing: 0.1em;">{kind.toUpperCase()}</Text>
    </Spread>
    <Heading level={3} style="font-size: var(--t-lede); letter-spacing: -0.01em; margin: 0;">{title}</Heading>
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
</Card>

<style>
  :global(.note-card) {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    transition: border-color var(--transition);
  }

  :global(.note-card:hover) {
    border-color: var(--amber) !important;
  }

  .note-foot {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed var(--rule);
  }
</style>
