<script module lang="ts">
  import type { Snippet } from 'svelte'

  /** Context key under which the sticky-offset registry is provided. */
  export const STICKY_CONTEXT_KEY = 'dxl-accordion-sticky'

  /** Reactive registry shared with AccordionItems to coordinate sticky offsets. */
  export interface StickyRegistry {
    /** Register an item; returns its DOM-order index. */
    register(): number
    /** Deregister an item by index. */
    unregister(index: number): void
    /** Record the measured header height for an item. */
    setHeight(index: number, height: number): void
    /** Cumulative height of headers above item `i`. */
    topOffset(index: number): number
    /** Cumulative height of headers below item `i`. */
    bottomOffset(index: number): number
    /** Tiered z-index — earlier headers sit above later ones. */
    zIndex(index: number): number
  }
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import { setContext, untrack } from 'svelte'

  interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    /** Enable sticky section headers. @default false */
    sticky?: boolean
    /** Per-header height used before live measurement / during SSR. @default 46 */
    fallbackHeaderHeight?: number
    children: Snippet
    [key: string]: unknown
  }

  let {
    sticky = false,
    fallbackHeaderHeight = 46,
    children,
    ...rest
  }: AccordionProps = $props()

  let count = $state(0)
  let heights = $state<Array<number | null>>([])

  function height(k: number): number {
    return heights[k] ?? fallbackHeaderHeight
  }

  const registry: StickyRegistry = {
    register() {
      const index = count
      count += 1
      heights[index] = null
      return index
    },
    unregister(index) {
      heights[index] = null
    },
    setHeight(index, h) {
      heights[index] = h
    },
    topOffset(index) {
      let sum = 0
      for (let k = 0; k < index; k++) sum += height(k)
      return sum
    },
    bottomOffset(index) {
      let sum = 0
      for (let k = index + 1; k < count; k++) sum += height(k)
      return sum
    },
    zIndex(index) {
      return 10 + (count - index)
    },
  }

  // setContext runs once at init; `sticky` is read a single time here, so
  // untrack() it to silence the state_referenced_locally hint.
  setContext<StickyRegistry | null>(
    STICKY_CONTEXT_KEY,
    untrack(() => sticky) ? registry : null,
  )
</script>

<div class="accordion" {...rest}>
  {@render children()}
</div>

<style>
  .accordion {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--rule);
  }
</style>
