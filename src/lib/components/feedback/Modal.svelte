<script lang="ts">
  import type { HTMLDialogAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Text from '../primitives/Text.svelte'
  import Button from '../primitives/Button.svelte'

  type ModalVariant = 'default' | 'confirm' | 'destructive'

  interface Props extends HTMLDialogAttributes {
    /** Whether the dialog is currently open. @default false */
    open?: boolean
    /** Heading text shown in the modal header. */
    title: string
    /** Visual variant — adds a coloured icon to the header. @default 'default' */
    variant?: ModalVariant
    /** Called when the modal requests to close (close button, backdrop, or Escape). */
    onclose?: () => void
    children?: Snippet
    footer?: Snippet
    [key: string]: unknown
  }

  let {
    open = false,
    title,
    variant = 'default',
    onclose,
    children,
    footer,
    ...rest
  }: Props = $props()

  let dialogElement: HTMLDialogElement | undefined = $state()

  function handleClose() {
    onclose?.()
  }

  function handleCancel(event: Event) {
    event.preventDefault()
    handleClose()
  }

  function handleDialogClick(event: MouseEvent) {
    if (event.target === dialogElement) {
      handleClose()
    }
  }

  $effect(() => {
    if (!dialogElement) return
    if (open) {
      dialogElement.showModal()
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    } else {
      if (dialogElement.open) {
        dialogElement.close()
      }
      document.body.style.overflow = ''
    }
  })
</script>

<dialog
  bind:this={dialogElement}
  class="modal modal--{variant}"
  aria-modal="true"
  aria-labelledby="modal-title"
  oncancel={handleCancel}
  onclick={handleDialogClick}
  {...rest}
>
  <div class="modal-inner">
    <header class="modal-header">
      <Text variant="mono" size="xs" as="h2" id="modal-title" class="modal-title">{title}</Text>
      <Button variant="ghost" type="button" aria-label="Close dialog" onclick={handleClose} class="modal-close">×</Button>
    </header>

    <div class="modal-body">
      {#if variant === 'confirm' || variant === 'destructive'}
        <div class="modal-body-row">
          <div class="modal-variant-icon" aria-hidden="true">!</div>
          <div>{@render children?.()}</div>
        </div>
      {:else}
        {@render children?.()}
      {/if}
    </div>

    {#if footer}
      <footer class="modal-footer">
        {@render footer()}
      </footer>
    {/if}
  </div>
</dialog>

<style>
  .modal {
    position: fixed;
    inset: 0;
    border: none;
    padding: 0;
    background: transparent;
    max-width: 100vw;
    max-height: 100vh;
  }

  .modal[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal::backdrop {
    background: rgba(7, 9, 8, 0.85);
  }

  .modal-inner {
    background: var(--overlay);
    border: 1px solid var(--rule-strong);
    width: 100%;
    max-width: 480px;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: var(--u2) var(--u3);
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--u);
  }

  .modal-footer {
    padding: var(--u2) var(--u3);
    border-top: 1px solid var(--rule);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--u2);
  }

  .modal-variant-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-family: var(--mono);
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .modal--confirm .modal-variant-icon {
    border: 2px solid var(--amber);
    color: var(--amber);
  }

  .modal--destructive .modal-variant-icon {
    border: 2px solid var(--danger);
    color: var(--danger);
  }

  .modal-body-row {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: var(--u2);
  }

  .modal-body {
    padding: var(--u3);
    flex: 1;
    font-size: var(--t-body);
    color: var(--ink-dim);
    line-height: 1.5;
  }

  .modal-header :global(.modal-title) {
    flex: 1;
    color: var(--ink);
  }

  .modal-header :global(.modal-close) {
    flex-shrink: 0;
    font-size: 18px;
    line-height: 1;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: var(--ink-faint);
  }
</style>
