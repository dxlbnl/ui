<script lang="ts">
  import Stack from '../layout/Stack.svelte'
  import Spread from '../layout/Spread.svelte'
  import Text from '../primitives/Text.svelte'

  type ProgressColor = 'ok' | 'amber' | 'danger'

  interface Props {
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
    <Spread aria-hidden="true">
      <Text variant="mono" color="faint" style="font-size: var(--t-micro);">{label}</Text>
      <Text variant="mono" color={color} style="font-size: var(--t-micro);">{clampedValue}%</Text>
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
      class="progress-fill progress-fill--{color}"
      style="width: {clampedValue}%"
    ></div>
  </div>
</Stack>

<style>
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
