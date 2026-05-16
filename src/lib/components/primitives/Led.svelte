<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  type LedColor = 'ok' | 'amber' | 'cyan' | 'danger' | 'off'

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    color?: LedColor
    blink?: boolean
  }

  let { color = 'ok', blink = false, ...rest }: Props = $props()
</script>

<span
  role="status"
  class="led led-{color}"
  class:blink
  {...rest}
></span>

<style>
  .led {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    display: inline-block;
    flex-shrink: 0;
  }

  .led-ok {
    background: var(--ok);
    box-shadow: 0 0 6px var(--ok);
  }

  .led-amber {
    background: var(--amber);
    box-shadow: 0 0 6px var(--amber);
  }

  .led-cyan {
    background: var(--cyan);
    box-shadow: 0 0 6px var(--cyan);
  }

  .led-danger {
    background: var(--danger);
    box-shadow: 0 0 6px var(--danger);
  }

  .led-off {
    background: var(--ink-faint);
  }

  .blink {
    animation: blink 1.6s steps(2, end) infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0.25;
    }
  }
</style>
