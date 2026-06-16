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

  // Viewport-px distance to move so the section's flow-top reaches its pinned slot. Anchored
  // on the NON-sticky .acc-body (whose rect tracks the real scroll position) rather than the
  // <summary>: a pinned sticky <summary> sits at its slot regardless of scroll, so reading its
  // rect reports a ~0 delta and a header already in the top stack would never scroll to its
  // content. The body sits directly below the summary in flow, so the section's flow-top is
  // `body.top - summary.offsetHeight`. Falls back to the summary rect if no body is present.
  function sectionDelta(
    container: HTMLElement,
    summary: HTMLElement,
    body: HTMLElement | null,
    offset: number,
  ): number {
    const flowTop = body
      ? body.getBoundingClientRect().top - summary.offsetHeight
      : summary.getBoundingClientRect().top
    return flowTop - container.getBoundingClientRect().top - offset
  }

  // Distance the container's scrollTop must change to bring this section to its pinned slot,
  // clamped to the scroll range.
  function pinnedScrollTarget(
    container: HTMLElement,
    summary: HTMLElement,
    body: HTMLElement | null,
    offset: number,
  ): number {
    const delta = sectionDelta(container, summary, body, offset)
    const max = container.scrollHeight - container.clientHeight
    return Math.min(Math.max(container.scrollTop + delta, 0), max)
  }

  function scrollIntoPinnedSlot(
    container: HTMLElement,
    summary: HTMLElement,
    body: HTMLElement | null,
    offset: number,
  ): void {
    // Native scroll: the layout-anchored target (sectionDelta uses the non-sticky body, so it
    // is stable as the section pins) lands in one call. Native scrolling is automatically
    // superseded by any later scroll — a user scroll, a programmatic scroll, or another
    // section's smart-scroll — so it never fights an external scroll, and needs no re-measuring
    // loop.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({
      top: pinnedScrollTarget(container, summary, body, offset),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  // Closed → open then scroll: scrolling while the body's height animation (interpolate-size) is
  // still running lands off-slot, because the browser's scroll anchoring adjusts scrollTop as the
  // body grows. So scroll once the height transition has finished (with a timeout fallback for
  // when no transition fires — reduced motion / no interpolate-size support).
  function scrollAfterOpen(
    container: HTMLElement,
    summary: HTMLElement,
    body: HTMLElement | null,
    offset: number,
  ): void {
    if (!body) {
      requestAnimationFrame(() => scrollIntoPinnedSlot(container, summary, body, offset))
      return
    }
    let done = false
    const finish = () => {
      if (done) return
      done = true
      body.removeEventListener('transitionend', onEnd)
      scrollIntoPinnedSlot(container, summary, body, offset)
    }
    const onEnd = (ev: TransitionEvent) => {
      if (ev.target === body && ev.propertyName === 'height') finish()
    }
    body.addEventListener('transitionend', onEnd)
    setTimeout(finish, 350)
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
    const body = details.querySelector<HTMLElement>('.acc-body')
    // `details.open` still reflects the pre-activation state: the native toggle is the
    // click's default action and runs after this handler.
    const wasOpen = details.open

    if (!wasOpen) {
      // Closed → let the native open proceed, then scroll once the body has finished opening.
      scrollAfterOpen(container, summary, body, offset)
      return
    }

    // Open: scroll the section to its readable slot, unless it is already there. We decide on
    // whether a click would actually MOVE the scroll (after clamping to the scroll range), not
    // on whether the whole body fits in the viewport — a body taller than the viewport never
    // "fully fits", so the old fits-check made tall sections impossible to close. If the click
    // would move the scroll (the section is off its slot, e.g. pinned in the top stack with its
    // body scrolled away), scroll to it and keep it open. If it would not move (already at the
    // readable slot, or the container cannot scroll any closer), let the native toggle collapse
    // it — so a section can always be closed once you are looking at it.
    const TOL = 2
    const reachableMove =
      pinnedScrollTarget(container, summary, body, offset) - container.scrollTop

    if (Math.abs(reachableMove) > TOL) {
      // Not at its readable slot → cancel the native collapse, stay open, scroll to it.
      e.preventDefault()
      scrollIntoPinnedSlot(container, summary, body, offset)
    }
    // Already at its readable slot → do nothing; the native toggle collapses the section.
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
