<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import type { ComponentProps } from 'svelte'
  import Led from '../primitives/Led.svelte'
  import Popover from './Popover.svelte'

  type PopoverAlign = 'left' | 'right'
  type LedColor = ComponentProps<typeof Led>['color']

  interface InboxItem {
    id: string | number
    tone: string
    title: string
    body: string
    time: string
    unread: boolean
  }

  interface Props extends HTMLButtonAttributes {
    /** Notification items rendered in the panel list. @default [] */
    items?: InboxItem[]
    /** Called with the clicked item when a list row is activated. */
    onOpen?: (item: InboxItem) => void
    /** Called when "Mark all read" is clicked (only shown when unread > 0). */
    onMarkAll?: () => void
    /** Glyph shown inside the bell button. @default '◔' */
    glyph?: string
    /** Accessible base name for the bell trigger. @default 'Notifications' */
    label?: string
    /** Popover edge alignment, forwarded to Popover. @default 'right' */
    align?: PopoverAlign
    /** Popover panel width, forwarded to Popover. @default 320 */
    width?: number | string
    /** Polymorphic trigger element. @default 'button' */
    as?: string
    [key: string]: unknown
  }

  let {
    items = [],
    onOpen,
    onMarkAll,
    glyph = '◔',
    label = 'Notifications',
    align = 'right',
    width = 320,
    as = 'button',
    ...rest
  }: Props = $props()

  let open = $state(false)

  const unread = $derived(items.filter((i) => i.unread).length)
  const ariaLabel = $derived(unread > 0 ? `${label}, ${unread} unread` : label)
</script>

<div class="inbox">
  <svelte:element
    this={as}
    class="bell"
    data-unread={unread > 0}
    aria-haspopup="dialog"
    aria-expanded={open}
    aria-label={ariaLabel}
    onmousedown={(e: MouseEvent) => e.stopPropagation()}
    onclick={() => (open = !open)}
    {...rest}
  >
    <span class="glyph" data-part="glyph">{glyph}</span>
    {#if unread > 0}
      <span class="badge" data-part="badge">{unread}</span>
    {/if}
  </svelte:element>

  {#if open}
    <Popover bind:open onclose={() => (open = false)} {align} {width}>
      <div class="header">
        <span class="header-label" data-part="header-label">NOTIFICATIONS</span>
        {#if unread > 0}
          <button type="button" class="mark-all" onclick={() => onMarkAll?.()}>
            Mark all read
          </button>
        {/if}
      </div>
      <div class="list" data-part="list">
        {#each items as item (item.id)}
          <button
            type="button"
            class="row"
            data-part="row"
            data-unread={item.unread}
            onclick={() => onOpen?.(item)}
          >
            <Led color={item.tone as LedColor} blink={item.unread && item.tone !== 'ok'} />
            <span class="row-body">
              <span class="row-top">
                <span class="title" data-part="title">{item.title}</span>
                <span class="time">{item.time}</span>
              </span>
              <span class="body">{item.body}</span>
            </span>
            {#if item.unread}<span class="sr-only">unread</span>{/if}
          </button>
        {/each}
      </div>
    </Popover>
  {/if}
</div>

<style>
  .inbox {
    position: relative;
    display: inline-block;
  }

  .bell {
    position: relative;
    width: 34px;
    height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--rule-strong);
    background: var(--bg-rail);
    cursor: pointer;
  }

  .glyph {
    font-size: 15px;
    color: var(--ink-dim);

    .bell[data-unread='true'] & {
      color: var(--amber);
    }
  }

  .badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 15px;
    height: 15px;
    border-radius: 8px;
    background: var(--amber);
    color: var(--bg);
    font-size: 9px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 14px;
    border-bottom: 1px solid var(--rule);
  }

  .header-label {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faint);
  }

  .mark-all {
    font-family: var(--mono);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-dim);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .list {
    max-height: 360px;
    overflow-y: auto;
  }

  .row {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    width: 100%;
    padding: 12px 14px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--rule);
    text-align: left;
    cursor: pointer;

    &[data-unread='true'] {
      background: var(--bg-rail);
    }
  }

  .row-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .row-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .title {
    font-size: 13px;
    color: var(--ink);
    font-weight: 400;

    .row[data-unread='true'] & {
      font-weight: 500;
    }
  }

  .time {
    font-family: var(--mono);
    font-size: 9px;
    color: var(--ink-faint);
  }

  .body {
    font-size: 12px;
    line-height: 1.45;
    color: var(--ink-dim);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    clip: rect(0, 0, 0, 0);
    overflow: hidden;
    white-space: nowrap;
  }
</style>
