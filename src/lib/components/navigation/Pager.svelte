<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface Props extends HTMLAttributes<HTMLElement> {
    /** The centered page label, rendered uppercase mono. */
    label: string
    /** Called when the prev (‹) button is clicked and not disabled. */
    onPrev?: () => void
    /** Called when the next (›) button is clicked and not disabled. */
    onNext?: () => void
    /** Disables the prev button (native `disabled`, no `onPrev`). @default false */
    prevDisabled?: boolean
    /** Disables the next button (native `disabled`, no `onNext`). @default false */
    nextDisabled?: boolean
    /** Min width of the label span, in px. @default 132 */
    minWidth?: number
    /** Accessible name (`aria-label`) for the prev button. @default 'Previous' */
    prevLabel?: string
    /** Accessible name (`aria-label`) for the next button. @default 'Next' */
    nextLabel?: string
    /** Polymorphic root element. @default 'nav' */
    as?: string
  }

  let {
    label,
    onPrev,
    onNext,
    prevDisabled = false,
    nextDisabled = false,
    minWidth = 132,
    prevLabel = 'Previous',
    nextLabel = 'Next',
    as = 'nav',
    'aria-label': ariaLabel = 'Pagination',
    ...rest
  }: Props = $props()
</script>

<svelte:element this={as} class="pager" aria-label={ariaLabel} {...rest}>
  <button
    class="pager-arrow"
    type="button"
    aria-label={prevLabel}
    disabled={prevDisabled}
    onclick={onPrev}
  >
    ‹
  </button>
  <span class="pager-label" data-part="label" aria-live="polite" style="min-width: {minWidth}px">
    {label}
  </span>
  <button
    class="pager-arrow"
    type="button"
    aria-label={nextLabel}
    disabled={nextDisabled}
    onclick={onNext}
  >
    ›
  </button>
</svelte:element>

<style>
  .pager {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--rule-strong);
    background: var(--bg-rail);

    .pager-arrow {
      font-family: var(--mono);
      font-size: 14px;
      padding: 6px 12px;
      cursor: pointer;
      color: var(--ink-dim);
      background: transparent;
      border: none;
      line-height: 1;

      &:disabled {
        color: var(--rule-strong);
        cursor: not-allowed;
      }
    }

    .pager-label {
      font-family: var(--mono);
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink);
      padding: 0 10px;
      text-align: center;
    }
  }
</style>
