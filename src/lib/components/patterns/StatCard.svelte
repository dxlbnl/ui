<script lang="ts">
  import Card from '../cards/Card.svelte'
  import Stack from '../layout/Stack.svelte'
  import Text from '../primitives/Text.svelte'

  type StatColor = 'default' | 'ok' | 'amber' | 'danger'

  interface Props {
    label: string
    value: string
    sublabel?: string
    color?: StatColor
    [key: string]: unknown
  }

  let {
    label,
    value,
    sublabel,
    color = 'default',
    ...rest
  }: Props = $props()
</script>

<Card class="stat-card" {...rest}>
  <Stack gap="xs" style="padding: 16px 20px;">
    <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.1em;">{label}</Text>
    <span class="stat-value stat-value--{color}">{value}</span>
    {#if sublabel}
      <Text variant="mono" color="faint" style="font-size: var(--t-micro); letter-spacing: 0.04em;">{sublabel}</Text>
    {/if}
  </Stack>
</Card>

<style>
  .stat-value {
    font-family: var(--mono);
    font-size: 32px;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--ink);
  }

  .stat-value--ok     { color: var(--ok); }
  .stat-value--amber  { color: var(--amber); }
  .stat-value--danger { color: var(--danger); }
</style>
