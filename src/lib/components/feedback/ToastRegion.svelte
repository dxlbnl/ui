<script lang="ts">
  import { toast } from '$lib/stores/toast.js'
  import Toast from './Toast.svelte'

  interface Props {
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
    limit?: number
  }

  let { position = 'bottom-right', limit = 5 }: Props = $props()

  let mounted = $state(false)

  $effect(() => {
    mounted = true
  })

  // Dismiss oldest items when store exceeds limit
  $effect(() => {
    const all = $toast
    if (all.length > limit) {
      const toRemove = all.slice(0, all.length - limit)
      toRemove.forEach((t) => toast.dismiss(t.id))
    }
  })

  let visibleToasts = $derived($toast.slice(-limit))

  function handleDismiss(id: string) {
    toast.dismiss(id)
  }

  // Auto-dismiss timers — recreated whenever visibleToasts changes
  $effect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const item of visibleToasts) {
      if (item.duration > 0) {
        const t = setTimeout(() => toast.dismiss(item.id), item.duration)
        timers.push(t)
      }
    }
    return () => timers.forEach(clearTimeout)
  })
</script>

{#if mounted}
  <div
    class="toast-region toast-region--{position}"
    role="region"
    aria-label="Notifications"
  >
    {#each visibleToasts as item (item.id)}
      <Toast
        id={item.id}
        message={item.message}
        variant={item.variant}
        ondismiss={handleDismiss}
      />
    {/each}
  </div>
{/if}

<style>
  .toast-region {
    position: fixed;
    z-index: 9000;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    pointer-events: none;
    max-width: 440px;
  }

  .toast-region--bottom-right {
    bottom: 0;
    right: 0;
    align-items: flex-end;
  }

  .toast-region--bottom-left {
    bottom: 0;
    left: 0;
    align-items: flex-start;
  }

  .toast-region--top-right {
    top: 0;
    right: 0;
    align-items: flex-end;
    flex-direction: column-reverse;
  }

  .toast-region--top-left {
    top: 0;
    left: 0;
    align-items: flex-start;
    flex-direction: column-reverse;
  }
</style>
