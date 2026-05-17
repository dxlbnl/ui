<script lang="ts">
  import type { HTMLDialogAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import Inline from '../layout/Inline.svelte'
  import Spread from '../layout/Spread.svelte'
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
      <Inline gap="xs">
        {#if variant === 'destructive' || variant === 'confirm'}
          <span class="modal-icon" aria-hidden="true">!</span>
        {/if}
        <Text variant="mono" as="h2" id="modal-title" size="lg" class="modal-title">{title}</Text>
        <Button variant="ghost" type="button" aria-label="Close dialog" onclick={handleClose}>×</Button>
      </Inline>
    </header>

    <div class="modal-body">
      {@render children?.()}
    </div>

    {#if footer}
      <footer class="modal-footer">
        <Spread>
          {@render footer()}
        </Spread>
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
    background: var(--bg-elev);
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
  }

  .modal-footer {
    padding: var(--u2) var(--u3);
    border-top: 1px solid var(--rule);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--u2);
  }

  .modal-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .modal--confirm .modal-icon {
    background: var(--amber);
    color: var(--bg);
  }

  .modal--destructive .modal-icon {
    background: var(--danger);
    color: var(--bg);
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
  }
</style>
