<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type SegmentSize = "sm" | "md";

  type SegmentOption = string | { value: string; label: string };

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onchange"> {
    /** Options: plain strings (value === label) or `{ value, label }` objects. */
    options: SegmentOption[];
    /** Currently selected value (controlled / bindable). */
    value?: string;
    /** Accessible name for the radiogroup, applied as aria-label. */
    label: string;
    /** Padding + font-size scale. @default 'md' */
    size?: SegmentSize;
    /** Polymorphic root element. @default 'div' */
    as?: string;
    /** Called with the newly selected value string when a segment is activated. */
    onchange?: (value: string) => void;
    [key: string]: unknown;
  }

  let {
    options,
    value = $bindable(undefined),
    label,
    size = "md",
    as = "div",
    onchange,
    ...rest
  }: Props = $props();

  // Normalise heterogeneous options to { value, label }.
  let normalised = $derived(
    options.map((o) =>
      typeof o === "string" ? { value: o, label: o } : o,
    ),
  );

  // Internal committed value — tracks the last selection so the active state
  // reflects the choice even when the caller doesn't feed `value` back.
  let internalValue = $state(value);

  $effect(() => {
    internalValue = value;
  });

  // Roving tabindex: checked segment is 0, or first segment when none selected.
  function getTabIndex(optionValue: string, index: number): number {
    if (internalValue !== undefined) {
      return optionValue === internalValue ? 0 : -1;
    }
    return index === 0 ? 0 : -1;
  }

  function select(newValue: string) {
    internalValue = newValue;
    value = newValue;
    onchange?.(newValue);
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const count = normalised.length;
    let target = -1;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        target = (index + 1) % count;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        target = (index - 1 + count) % count;
        break;
      case "Home":
        event.preventDefault();
        target = 0;
        break;
      case "End":
        event.preventDefault();
        target = count - 1;
        break;
    }
    if (target >= 0) {
      const next = normalised[target];
      select(next.value);
      (event.currentTarget as HTMLElement)
        .closest(".segmented")
        ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
        [target]?.focus();
    }
  }
</script>

<svelte:element
  this={as}
  class="segmented segmented--{size}"
  role="radiogroup"
  aria-label={label}
  {...rest}
>
  {#each normalised as option, i (option.value)}
    <button
      type="button"
      role="radio"
      class="segment"
      class:active={option.value === internalValue}
      aria-checked={option.value === internalValue}
      tabindex={getTabIndex(option.value, i)}
      onclick={() => select(option.value)}
      onkeydown={(e) => handleKeydown(e, i)}
    >
      {option.label}
    </button>
  {/each}
</svelte:element>

<style>
  .segmented {
    display: inline-flex;
    border: 1px solid var(--rule-strong);
    background: var(--bg-sunken);

    .segment {
      font-family: var(--mono);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
      background: transparent;
      color: var(--ink-faint);
      border: none;
      cursor: pointer;

      &:not(:first-child) {
        border-left: 1px solid var(--rule-strong);
      }

      &.active {
        background: var(--amber);
        color: var(--bg);
      }
    }
  }

  .segmented--md .segment {
    padding: 7px 13px;
    font-size: 11px;
  }

  .segmented--sm .segment {
    padding: 5px 10px;
    font-size: 10px;
  }
</style>
