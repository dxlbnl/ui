<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Stack from '../layout/Stack.svelte'

  type ProgressColor = 'ok' | 'amber' | 'danger'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    value: number
    label?: string
    color?: ProgressColor
    [key: string]: unknown
  }

  let {
    value,
    label,
    color = 'ok',
    ...rest
  }: Props = $props()

  const clampedValue = $derived(Math.min(100, Math.max(0, value)))
</script>

<Stack gap="xs" style="width: 100%;" {...rest}>
  {#if label}
    <div class="progress-header" aria-hidden="true">
      <span>{label}</span>
      <span class="progress-pct progress-pct--{color}">{clampedValue}%</span>
    </div>
  {/if}
  <div
    class="progress-track"
    role="progressbar"
    aria-valuenow={clampedValue}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={label ?? 'Progress'}
  >
    <div
      class="progress-fill progress-fill--{color}"
      style="width: {clampedValue}%"
    ></div>
  </div>
</Stack>

<style>
  .progress-header {
    display: flex;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .progress-pct--ok     { color: var(--ok); }
  .progress-pct--amber  { color: var(--amber); }
  .progress-pct--danger { color: var(--danger); }

  .progress-track {
    height: 5px;
    background: var(--bg-sunken);
    border: 1px solid var(--rule);
  }

  .progress-fill {
    height: 100%;
    background: var(--ok);
    transition: width 0.3s;
  }

  .progress-fill--amber  { background: var(--amber); }
  .progress-fill--danger { background: var(--danger); }
</style>
