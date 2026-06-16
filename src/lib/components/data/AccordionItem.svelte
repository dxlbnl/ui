<script module lang="ts">
  // A single in-flight smart-scroll animation across all AccordionItems. A fresh activation
  // cancels any prior one, so a stale loop (e.g. a header that cannot reach its slot) never
  // fights the current scroll by mutating the shared container's scrollTop. Browser-only.
  let activeScrollRaf = 0

  function cancelActiveScroll(): void {
    if (activeScrollRaf) {
      cancelAnimationFrame(activeScrollRaf)
      activeScrollRaf = 0
    }
  }
</script>

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

  // B67 (D80): the sticky <summary> onclick. Smart-scroll the section's content into its
  // pinned slot rather than merely toggle. All DOM/scroll access lives in this handler
  // (browser-only), never the render path (D52). The non-sticky branch carries no handler.
  function findScrollAncestor(el: HTMLElement): HTMLElement | null {
    let node: HTMLElement | null = el.parentElement
    while (node) {
      const overflowY = getComputedStyle(node).overflowY
      if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
        return node
      }
      node = node.parentElement
    }
    return null
  }

  function pinnedDelta(
    container: HTMLElement,
    summary: HTMLElement,
    offset: number,
  ): number {
    return (
      summary.getBoundingClientRect().top -
      container.getBoundingClientRect().top -
      offset
    )
  }

  function scrollIntoPinnedSlot(
    container: HTMLElement,
    summary: HTMLElement,
    offset: number,
  ): void {
    cancelActiveScroll()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      container.scrollTop += pinnedDelta(container, summary, offset)
      return
    }
    // The summary is position:sticky and the open-body height animation (interpolate-size)
    // shifts layout over several frames, so a single scroll can land off-target. Re-apply
    // each frame until the summary settles at its pinned slot, stopping once it lands, once
    // the container can no longer scroll toward the target (clamped), or after a budget.
    let frames = 0
    const step = () => {
      const delta = pinnedDelta(container, summary, offset)
      const before = container.scrollTop
      container.scrollTop += delta
      const moved = container.scrollTop - before
      frames += 1
      if (Math.abs(delta) <= 0.5 || moved === 0 || frames >= 60) {
        activeScrollRaf = 0
        return
      }
      activeScrollRaf = requestAnimationFrame(step)
    }
    activeScrollRaf = requestAnimationFrame(step)
  }

  function handleStickySummaryClick(e: MouseEvent): void {
    // Defer to the D79 actions guard: if the inner .acc-actions onclick already
    // cancelled the toggle, do nothing — no scroll, no toggle (AC-8).
    if (e.defaultPrevented) return

    const summary = summaryEl
    if (!summary || !sticky || !registry) return

    const details = summary.closest('details')
    if (!details) return

    const container = findScrollAncestor(summary)
    // No scrollable ancestor → degrade to native toggle only, nothing throws (AC-9).
    if (!container) return

    const offset = registry.topOffset(index)
    // `details.open` still reflects the pre-activation state: the native toggle is the
    // click's default action and runs after this handler.
    const wasOpen = details.open

    if (!wasOpen) {
      // Closed → let the native open proceed, then scroll once it has taken effect (AC-3).
      requestAnimationFrame(() => {
        scrollIntoPinnedSlot(container, summary, offset)
      })
      return
    }

    // Open: decide between scroll-no-close and native close based on full visibility.
    const body = details.querySelector<HTMLElement>('.acc-body')
    const TOL = 2
    const c = container.getBoundingClientRect()
    let fullyVisible = false
    if (body) {
      const b = body.getBoundingClientRect()
      fullyVisible = b.top >= c.top + offset - TOL && b.bottom <= c.bottom + TOL
    }

    if (!fullyVisible) {
      // Content not fully visible → cancel the native collapse, stay open, scroll (AC-4).
      e.preventDefault()
      scrollIntoPinnedSlot(container, summary, offset)
    }
    // Fully visible → do nothing; the native toggle collapses the section (AC-5).
  }
</script>

<details class="acc-item" {open}>
  {#if sticky}
    <summary
      class="acc-trigger"
      bind:this={summaryEl}
      data-sticky="true"
      style="top:{top}px;bottom:{bottom}px;z-index:{zIndex};"
      onclick={handleStickySummaryClick}
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
