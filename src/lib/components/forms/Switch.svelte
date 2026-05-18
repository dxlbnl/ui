<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements'
  import { getContext } from 'svelte'
  import type { FieldContext } from './field-context.js'
  import { FIELD_CONTEXT_KEY } from './field-context.js'

  interface Props extends HTMLButtonAttributes {
    /** Accessible label rendered next to the toggle track. */
    label: string
    /** Whether the switch is on. Bindable. @default false */
    checked?: boolean
    [key: string]: unknown
  }

  let {
    label,
    checked = $bindable(false),
    disabled,
    ...rest
  }: Props = $props()

  const fieldCtx = getContext<FieldContext | undefined>(FIELD_CONTEXT_KEY)

  let resolvedAriaInvalid: boolean | 'true' | 'false' | 'grammar' | 'spelling' | null | undefined = $derived(
    fieldCtx?.hasError ? 'true' : undefined
  )
  let resolvedAriaDescribedby = $derived(fieldCtx?.hasHint ? fieldCtx.hintId : undefined)
  // Explicit boolean for aria-checked (avoids unknown from index signature)
  let ariaChecked: boolean = $derived(!!checked)
</script>

<span class="switch-wrap" class:disabled={disabled}>
  <button
    type="button"
    class="switch"
    class:on={checked}
    role="switch"
    aria-checked={ariaChecked}
    aria-label={label}
    {disabled}
    aria-disabled={disabled}
    aria-invalid={resolvedAriaInvalid}
    aria-describedby={resolvedAriaDescribedby}
    onclick={() => { if (!disabled) checked = !checked }}
    {...rest}
  >
    <span class="switch-knob" aria-hidden="true"></span>
  </button>
  <span class="switch-label" onclick={() => { if (!disabled) checked = !checked }}>{label}</span>
</span>

<style>
  .switch-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--mono);
    font-size: 13px;
    color: var(--ink);
  }

  .switch-wrap.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .switch {
    display: inline-flex;
    align-items: center;
    width: 40px;
    height: 22px;
    border-radius: 11px;
    border: 1px solid var(--rule);
    background: var(--bg-sunken);
    cursor: pointer;
    padding: 0;
    position: relative;
    transition: background var(--transition), border-color var(--transition);
    flex-shrink: 0;
  }

  .switch:disabled {
    cursor: not-allowed;
  }

  .switch:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }

  .switch.on {
    background: var(--amber);
    border-color: var(--amber);
  }

  .switch-knob {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--bg);
    transform: translateX(2px);
    transition: transform var(--transition);
  }

  .switch.on .switch-knob {
    transform: translateX(20px);
  }

  .switch-label {
    color: var(--ink);
  }
</style>
