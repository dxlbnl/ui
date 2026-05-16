<script lang="ts">
  import type { HTMLAnchorAttributes } from 'svelte/elements'
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'

  interface Props extends HTMLAnchorAttributes {
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

<Stack {as} gap="xs" class="note-card" style="border: 1px solid var(--rule); background: var(--bg-rail); padding: 20px; text-decoration: none; color: inherit; cursor: pointer; transition: border-color var(--transition);" {...rest}>
  <div class="note-head">
    <Spread>
      <span class="note-hex">{hexId}</span>
      <span class="note-kind">{kind.toUpperCase()}</span>
    </Spread>
  </div>
  <h3 class="note-title">{title}</h3>
  {#if lede}
    <p class="note-lede">{lede}</p>
  {/if}
  {#if date}
    <div class="note-foot">
      <Spread>
        <span class="note-date">{date}</span>
        <span class="note-read" aria-hidden="true">READ →</span>
      </Spread>
    </div>
  {/if}
</Stack>

<style>
  :global(.note-card:hover) {
    border-color: var(--amber) !important;
  }

  .note-head {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .note-hex {
    color: var(--ink-faint);
  }

  .note-kind {
    color: var(--cyan);
  }

  .note-title {
    font-weight: 500;
    font-size: var(--t-lede);
    letter-spacing: -0.01em;
    margin: 0;
  }

  .note-lede {
    font-size: var(--t-body);
    color: var(--ink-dim);
    line-height: 1.5;
    flex: 1;
    margin: 0;
  }

  .note-foot {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    color: var(--ink-faint);
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px dashed var(--rule);
  }

  .note-date {
    color: var(--ink-faint);
  }

  .note-read {
    color: var(--amber);
  }
</style>
