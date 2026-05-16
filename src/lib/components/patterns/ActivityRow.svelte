<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Led from '../primitives/Led.svelte'
  import Inline from '../layout/Inline.svelte'

  type LedStatus = 'ok' | 'amber' | 'danger' | 'off'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    timestamp: string
    actor?: string
    description: string
    status?: LedStatus
    [key: string]: unknown
  }

  let {
    timestamp,
    actor,
    description,
    status = 'off',
    ...rest
  }: Props = $props()
</script>

<div class="activity-row" {...rest}>
  <Inline gap="sm">
    <span class="activity-time">{timestamp}</span>
    <Led color={status} />
    <span class="activity-msg">
      {#if actor}
        <span class="activity-actor">{actor}</span>
        <span aria-hidden="true"> · </span>
      {/if}
      {description}
    </span>
  </Inline>
</div>

<style>
  .activity-row {
    padding: 7px 0;
    border-bottom: 1px dashed var(--rule);
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.04em;
  }

  .activity-row:last-child {
    border-bottom: none;
  }

  .activity-time {
    color: var(--ink-faint);
    flex-shrink: 0;
  }

  .activity-msg {
    color: var(--ink-dim);
    flex: 1;
  }

  .activity-actor {
    color: var(--ink);
  }
</style>
