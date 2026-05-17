<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { ToastVariant } from '$lib/stores/toast.js'
  import Button from '$lib/components/primitives/Button.svelte'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    id: string
    message: string
    variant?: ToastVariant
    ondismiss: (id: string) => void
  }

  let { id, message, variant = 'ok', ondismiss, ...rest }: Props = $props()

  const ICONS: Record<ToastVariant, string> = { ok: 'ok', amber: '!!', danger: 'err' }

  let role = $derived(variant === 'danger' ? 'alert' : 'status')
  let ariaLive: 'assertive' | 'polite' = $derived(variant === 'danger' ? 'assertive' : 'polite')
  let icon = $derived(ICONS[variant])
</script>

<div
  class="toast toast--{variant}"
  {role}
  aria-live={ariaLive}
  aria-atomic="true"
  {...rest}
>
  <span class="toast-icon" aria-hidden="true">{icon}</span>
  <span class="toast-message">{message}</span>
  <div class="toast-close-wrap">
    <Button
      variant="ghost"
      type="button"
      aria-label="Dismiss notification"
      onclick={() => ondismiss(id)}
    >×</Button>
  </div>
</div>

<style>
  .toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    min-width: 260px;
    max-width: 400px;
    border: 1px solid;
    background: var(--bg-elev);
    font-size: var(--t-body);
    line-height: 1.4;
    pointer-events: all;
  }

  .toast--ok    { border-color: var(--ok); }
  .toast--amber { border-color: var(--amber); }
  .toast--danger { border-color: var(--danger); }

  .toast-icon {
    font-family: var(--mono);
    font-size: var(--t-micro);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .toast--ok    .toast-icon { color: var(--ok); }
  .toast--amber .toast-icon { color: var(--amber); }
  .toast--danger .toast-icon { color: var(--danger); }

  .toast-message {
    flex: 1;
    color: var(--ink-dim);
  }

  .toast-close-wrap {
    flex-shrink: 0;
    margin-left: auto;
  }
</style>
