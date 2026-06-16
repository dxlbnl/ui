<script lang="ts">
  import type { Snippet } from 'svelte'
  import { getContext } from 'svelte'
  import { STICKY_CONTEXT_KEY, type StickyRegistry } from './Accordion.svelte'

  interface AccordionItemProps {
    /** Summary / trigger text for the accordion row. */
    label: string
    /** Whether the item starts expanded. @default false */
    open?: boolean
    /** Optional inline controls rendered as the trailing element of the summary header, after the title. */
    actions?: Snippet
    children: Snippet
  }

  let { label, open = false, actions, children }: AccordionItemProps = $props()

  const registry = getContext<StickyRegistry | null>(STICKY_CONTEXT_KEY)
  const sticky = registry != null
  const index = sticky ? registry!.register() : -1

  let summaryEl = $state<HTMLElement | null>(null)

  const top = $derived(sticky ? registry!.topOffset(index) : 0)
  const bottom = $derived(sticky ? registry!.bottomOffset(index) : 0)
  const zIndex = $derived(sticky ? registry!.zIndex(index) : 0)

  $effect(() => {
    if (!sticky || !summaryEl) return
    const el = summaryEl
    const measure = () => registry!.setHeight(index, el.offsetHeight)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      observer.disconnect()
      registry!.unregister(index)
    }
  })
</script>

<details class="acc-item" {open}>
  {#if sticky}
    <summary
      class="acc-trigger"
      bind:this={summaryEl}
      data-sticky="true"
      style="top:{top}px;bottom:{bottom}px;z-index:{zIndex};"
    >
      <span class="acc-icon" aria-hidden="true"></span>
      <span class="acc-title">{label}</span>
      {#if actions}
        <!-- The wrapper's only handler is a preventDefault guard cancelling the
             native <summary> toggle (covers mouse + keyboard via the synthetic
             bubbling click); it is not an interactive control — the caller's
             controls inside the snippet carry their own roles/handlers (D75). -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span class="acc-actions" onclick={(e) => e.preventDefault()}>
          {@render actions()}
        </span>
      {/if}
    </summary>
  {:else}
    <summary class="acc-trigger">
      <span class="acc-icon" aria-hidden="true"></span>
      <span class="acc-title">{label}</span>
      {#if actions}
        <!-- The wrapper's only handler is a preventDefault guard cancelling the
             native <summary> toggle (covers mouse + keyboard via the synthetic
             bubbling click); it is not an interactive control — the caller's
             controls inside the snippet carry their own roles/handlers (D75). -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span class="acc-actions" onclick={(e) => e.preventDefault()}>
          {@render actions()}
        </span>
      {/if}
    </summary>
  {/if}
  <div class="acc-body">
    {@render children()}
  </div>
</details>

<style>
  .acc-item {
    border-bottom: 1px solid var(--rule);

    &:last-child {
      border-bottom: none;
    }

    /* Sticky mode only: drop the <details> box so its <summary> and .acc-body
       become layout children of .accordion — one shared containing block — so
       the B59 top/bottom offsets tile the headers into a top + bottom stack
       (B66 / D78). Keyed on the sticky <summary>, so it never fires in default
       mode (the border-bottom above stays intact there). */
    &:has(> [data-sticky="true"]) {
      display: contents;
    }
  }

  .acc-trigger {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    background: var(--bg-rail);
    transition: background var(--transition);
    user-select: none;
    list-style: none;
  }

  .acc-trigger[data-sticky="true"] {
    position: sticky;
    background-color: var(--bg-sunken);
    border-top: 1px solid var(--rule-strong);
    border-bottom: 1px solid var(--rule-strong);
  }

  .acc-trigger::-webkit-details-marker {
    display: none;
  }

  .acc-trigger:hover {
    background: var(--bg-elev);
  }

  details[open] .acc-trigger {
    background: var(--bg-elev);
  }

  details[open] .acc-trigger[data-sticky="true"] {
    background-color: var(--bg-sunken);
  }

  .acc-title {
    flex: 1 1 auto;
    min-width: 0;
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .acc-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .acc-icon {
    font-family: var(--mono);
    font-size: 12px;
    width: 12px;
    color: var(--ink-faint);
    flex-shrink: 0;
  }

  .acc-icon::before {
    content: "▸";
  }

  details[open] .acc-icon {
    color: var(--amber);
  }

  details[open] .acc-icon::before {
    content: "▾";
  }

  .acc-body {
    padding: 14px 16px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--ink-dim);
    border-top: 1px solid var(--rule);
    background: var(--bg-sunken, var(--bg));
  }

  @supports (interpolate-size: allow-keywords) {
    details.acc-item {
      interpolate-size: allow-keywords;
    }

    .acc-body {
      overflow: hidden;
      height: 0;
      transition: height var(--transition), opacity var(--transition);
      opacity: 0;
    }

    details[open] .acc-body {
      height: auto;
      opacity: 1;
    }

    @starting-style {
      details[open] .acc-body {
        height: 0;
        opacity: 0;
      }
    }
  }
</style>
