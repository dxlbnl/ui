<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'

  type PopoverAlign = 'left' | 'right'

  interface Props extends HTMLAttributes<HTMLElement> {
    /** Whether the popover panel is rendered/visible. Bindable. @default false */
    open?: boolean
    /** Called when the popover requests dismissal (outside mousedown or Escape). */
    onclose?: () => void
    /** Which edge the panel aligns to within its positioned parent. @default 'right' */
    align?: PopoverAlign
    /** Panel width — number (px) or any CSS length string. @default 280 */
    width?: number | string
    /** Vertical offset of the panel top, relative to the parent. @default '100%' */
    top?: number | string
    /** Polymorphic root element of the panel. @default 'div' */
    as?: string
    /** Panel contents. */
    children?: Snippet
    [key: string]: unknown
  }

  let {
    open = $bindable(false),
    onclose,
    align = 'right',
    width = 280,
    top = '100%',
    as = 'div',
    children,
    ...rest
  }: Props = $props()

  let panelEl = $state<HTMLElement>()

  const toLength = (v: number | string) => (typeof v === 'number' ? `${v}px` : v)

  const panelStyle = $derived(
    align === 'left'
      ? `position:absolute;top:${toLength(top)};left:0;right:auto;width:${toLength(width)}`
      : `position:absolute;top:${toLength(top)};right:0;left:auto;width:${toLength(width)}`,
  )

  $effect(() => {
    if (!open) return

    const handlePointer = (event: Event) => {
      if (panelEl && !panelEl.contains(event.target as Node)) onclose?.()
    }
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onclose?.()
    }

    document.addEventListener('mousedown', handlePointer)
    window.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('mousedown', handlePointer)
      window.removeEventListener('keydown', handleKeydown)
    }
  })
</script>

{#if open}
  <svelte:element
    this={as}
    bind:this={panelEl}
    class="popover"
    style={panelStyle}
    {...rest}
  >
    {@render children?.()}
  </svelte:element>
{/if}

<style>
  .popover {
    background: var(--bg);
    border: 1px solid var(--rule-strong);
    margin-top: 6px;
    z-index: 150;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }
</style>
