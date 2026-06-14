<script lang="ts">
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'
  import Text from '../primitives/Text.svelte'

  type ProgressColor = 'ok' | 'amber' | 'danger'

  interface Props {
    /** Progress percentage (0–100). Clamped automatically. */
    value: number
    /** Optional label shown above the bar alongside the percentage. */
    label?: string
    /** Bar colour variant. @default 'ok' */
    color?: ProgressColor
    /** Opt in to over-budget rendering when `value` exceeds 100. @default false */
    overflow?: boolean
    [key: string]: unknown
  }

  let {
    value,
    label,
    color = 'ok',
    overflow = false,
    ...rest
  }: Props = $props()

  const clampedValue = $derived(Math.min(100, Math.max(0, value)))
  const over = $derived(overflow === true && value > 100)
  const readout = $derived(over ? Math.round(value) : clampedValue)
</script>

<div class="progress-bar" {...rest}>
  <Stack gap="xs">
    {#if label}
      <Spread aria-hidden="true">
        <Text variant="mono" color="faint" size="xs">{label}</Text>
        <Text variant="mono" color={over ? 'danger' : color} size="xs">{readout}%</Text>
      </Spread>
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
        class="progress-fill progress-fill--{over ? 'danger' : color}"
        style="width: {clampedValue}%"
      ></div>
      {#if over}
        <div class="progress-notch" data-part="notch"></div>
      {/if}
    </div>
  </Stack>
</div>

<style>
  .progress-bar {
    width: 100%;
  }

  .progress-track {
    position: relative;
    height: 5px;
    background: var(--bg-sunken);
    border: 1px solid var(--rule);
  }

  .progress-notch {
    position: absolute;
    top: -1px;
    bottom: -1px;
    right: 0;
    width: 3px;
    background: var(--danger);
  }

  .progress-fill {
    height: 100%;
    background: var(--ok);
    transition: width 0.3s;
  }

  .progress-fill--amber  { background: var(--amber); }
  .progress-fill--danger { background: var(--danger); }
</style>
