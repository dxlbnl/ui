<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { untrack } from "svelte";
  import Button from "../primitives/Button.svelte";

  interface SelectOption {
    value: string;
    label: string;
  }

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "onchange"> {
    /** Array of `{ value, label }` option objects. */
    options: SelectOption[];
    /** Currently selected value. */
    value?: string;
    /** Label shown when no value is selected. @default 'SELECT…' */
    placeholder?: string;
    /** Show the error (danger-border) state. @default false */
    error?: boolean;
    /** Disable the select — prevents opening the dropdown. @default false */
    disabled?: boolean;
    /** Called with the new value string when the user selects an option. */
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
  let panelEl: HTMLUListElement | undefined = $state(undefined);
  let highlightedIndex = $state(-1);
  // internal committed value — tracks the last selection so displayLabel
  // reflects the user's choice even when the caller doesn't update the value prop.
  // Intentional one-time read of the initial `value`; the $effect below keeps it
  // in sync afterward, so untrack() to silence the state_referenced_locally hint.
  let internalValue = $state(untrack(() => value));

  // Unique per-instance name so multiple Selects on a page don't share an anchor.
  const anchorName = `--sel-${Math.random().toString(36).slice(2, 9)}`;
  const cssAnchorSupported =
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("anchor-name", "--x");

  // keep internalValue in sync when the value prop changes from outside
  $effect(() => {
    internalValue = value;
  });

  let displayLabel = $derived(
    options?.find((o) => o.value === internalValue)?.label ?? placeholder,
  );

  // Promote panel to top layer and position it once it mounts.
  // showPopover() runs after the DOM update that created the element,
  // so panelEl is always set when this effect fires with a non-null value.
  $effect(() => {
    if (!panelEl) return;
    panelEl.showPopover();
    if (rootEl) {
      const rect = rootEl.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      // anchor() is invalid in max-height, so always set it via JS
      panelEl.style.maxHeight = `${Math.max(spaceBelow, spaceAbove)}px`;
      if (!cssAnchorSupported) {
        panelEl.style.left = `${rect.left}px`;
        panelEl.style.width = `${rect.width}px`;
        if (spaceBelow >= spaceAbove) {
          panelEl.style.top = `${rect.bottom}px`;
          panelEl.style.bottom = "";
        } else {
          panelEl.style.top = "";
          panelEl.style.bottom = `${window.innerHeight - rect.top}px`;
        }
      }
    }
  });

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

  // showPopover() does not move the element in the DOM — the panel stays inside
  // rootEl, so rootEl.contains() correctly excludes panel clicks from outside-close.
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
    style={cssAnchorSupported ? `anchor-name: ${anchorName}` : undefined}
  >
    <span class="select-value">{displayLabel}</span>
    <span class="select-chevron" aria-hidden="true">›</span>
  </Button>
  {#if open}
    <ul
      class="select-panel"
      popover="manual"
      role="listbox"
      aria-label="Options"
      bind:this={panelEl}
      style={cssAnchorSupported ? `position-anchor: ${anchorName}` : undefined}
    >
      {#each options as option, i (option.value)}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- Listbox keyboard nav is handled on the container via aria-activedescendant
             (Arrow/Home/End/Enter); options are not individually focusable by design. -->
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

    :global(.btn) {
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

      &.open {
        border-left: 3px solid var(--amber);
        padding-left: 8px;

        .select-chevron {
          transform: rotate(90deg);
        }
      }

      &.err {
        border-color: var(--danger);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  }

  .select-chevron {
    font-family: var(--mono);
    font-size: 14px;
    color: var(--amber);
    transition: transform var(--transition);
  }

  @position-try --panel-above {
    bottom: anchor(top);
    top: auto;
  }

  .select-panel {
    /* Top layer via popover API — escapes overflow/scroll ancestors */
    position: fixed;
    /* CSS anchor positioning (Chrome 125+); JS fallback sets inline top/left/width */
    top: anchor(bottom);
    left: anchor(left);
    width: anchor-size(width);
    /* anchor() is invalid in max-height; JS always sets it inline. 60dvh is a backstop. */
    max-height: 60dvh;
    overflow-y: auto;
    position-try-fallbacks: --panel-above;
    /* Reset popover UA styles */
    border: none;
    padding: 0;
    margin: 0;
    background: var(--bg-elev);
    list-style: none;
  }

  .select-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 8px 10px;
    cursor: pointer;
    color: var(--ink-dim);
    border-bottom: 1px solid var(--rule);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: var(--bg-rail);
      color: var(--ink);
    }

    &.selected {
      color: var(--amber);
    }

    &.highlighted {
      background: var(--bg-rail);
      color: var(--amber);
    }
  }

  .select-check {
    font-size: 11px;
    color: var(--amber);
  }
</style>
