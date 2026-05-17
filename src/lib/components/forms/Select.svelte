<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Button from "../primitives/Button.svelte";

  interface SelectOption {
    value: string;
    label: string;
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onchange"> {
    options: SelectOption[];
    value?: string;
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
    onchange?: (value: string) => void;
    [key: string]: unknown;
  }

  let {
    options,
    value = undefined,
    placeholder = "SELECT…",
    error = false,
    disabled = false,
    onchange,
    ...rest
  }: Props = $props();

  let open = $state(false);
  let rootEl: HTMLDivElement | undefined = $state(undefined);
  let highlightedIndex = $state(-1);
  // internal committed value — tracks the last selection so displayLabel
  // reflects the user's choice even when the caller doesn't update the value prop
  let internalValue = $state(value);

  // keep internalValue in sync when the value prop changes from outside
  $effect(() => {
    internalValue = value;
  });

  let displayLabel = $derived(
    options?.find((o) => o.value === internalValue)?.label ?? placeholder,
  );

  function handleTriggerClick() {
    if (disabled) return;
    open = !open;
    if (open) {
      const idx = options?.findIndex((o) => o.value === internalValue) ?? -1;
      highlightedIndex = idx >= 0 ? idx : 0;
    } else {
      highlightedIndex = -1;
    }
  }

  function handleSelect(newValue: string) {
    internalValue = newValue;
    open = false;
    highlightedIndex = -1;
    onchange?.(newValue);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      open = false;
      highlightedIndex = -1;
      return;
    }
    if (!open) return;
    const count = options.length;
    if (count === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % count;
        break;
      case "ArrowUp":
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + count) % count;
        break;
      case "Home":
        e.preventDefault();
        highlightedIndex = 0;
        break;
      case "End":
        e.preventDefault();
        highlightedIndex = count - 1;
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleSelect(options[highlightedIndex].value);
        }
        break;
    }
  }

  $effect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootEl && !rootEl.contains(e.target as Node)) {
        open = false;
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  });
</script>

<div
  class="select"
  class:disabled
  bind:this={rootEl}
  onkeydown={handleKeydown}
  role="presentation"
  {...rest}
>
  <Button
    variant="ghost"
    type="button"
    class={[open && "open", error && "err"].filter(Boolean).join(" ")}
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-disabled={disabled}
    aria-activedescendant={open && highlightedIndex >= 0
      ? `select-opt-${highlightedIndex}`
      : undefined}
    {disabled}
    onclick={handleTriggerClick}
  >
    <span class="select-value">{displayLabel}</span>
    <span class="select-chevron" aria-hidden="true">›</span>
  </Button>
  {#if open}
    <ul class="select-panel" role="listbox" aria-label="Options">
      {#each options as option, i}
        <li
          id="select-opt-{i}"
          class="select-option"
          class:selected={option.value === internalValue}
          class:highlighted={i === highlightedIndex}
          role="option"
          aria-selected={option.value === internalValue}
          onclick={() => handleSelect(option.value)}
        >
          {option.label}
          {#if option.value === internalValue}
            <span class="select-check" aria-hidden="true">✓</span>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .select {
    position: relative;
    width: 100%;
    user-select: none;
  }

  :global(.select .btn) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: 13px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: var(--bg-sunken);
    color: var(--ink);
    border: 1px solid var(--rule-strong);
    padding: 7px 10px;
    width: 100%;
    cursor: pointer;
    transition: border-color var(--transition);
    border-radius: 0;
  }

  :global(.select .btn:hover) {
    border-color: var(--amber);
  }

  :global(.select .btn.open) {
    border-color: var(--amber);
    border-left-width: 3px;
    padding-left: 8px;
  }

  :global(.select .btn.err) {
    border-color: var(--danger);
  }

  :global(.select .btn:disabled) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .select-chevron {
    font-family: var(--mono);
    font-size: 14px;
    color: var(--amber);
    transition: transform var(--transition);
  }

  :global(.select .btn.open) .select-chevron {
    transform: rotate(90deg);
  }

  .select-panel {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    background: var(--bg-elev);
    border: 1px solid var(--amber);
    border-top: none;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .select-option {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 8px 10px;
    cursor: pointer;
    color: var(--ink-dim);
    border-bottom: 1px solid var(--rule);
  }

  .select-option:last-child {
    border-bottom: none;
  }

  .select-option:hover {
    background: var(--bg-rail);
    color: var(--ink);
  }

  .select-option.selected {
    color: var(--amber);
  }

  .select-option.highlighted {
    background: var(--bg-rail);
    color: var(--ink);
    outline: 2px solid var(--amber);
    outline-offset: -2px;
  }

  .select-check {
    font-size: 11px;
    color: var(--amber);
  }
</style>
