<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { getContext } from 'svelte'
  import type { FieldContext } from './field-context.js'
  import { FIELD_CONTEXT_KEY } from './field-context.js'

  interface Props extends HTMLInputAttributes {
    label: string
    indeterminate?: boolean
    [key: string]: unknown
  }

  let {
    label,
    indeterminate = false,
    checked = $bindable(false),
    disabled,
    ...rest
  }: Props = $props()

  let inputEl: HTMLInputElement | undefined = $state()

  const fieldCtx = getContext<FieldContext | undefined>(FIELD_CONTEXT_KEY)

  let resolvedId = $derived(fieldCtx ? fieldCtx.inputId : (rest.id as string | undefined))
  let resolvedAriaInvalid: boolean | 'true' | 'false' | 'grammar' | 'spelling' | null | undefined = $derived(
    fieldCtx?.hasError ? 'true' : undefined
  )
  let resolvedAriaDescribedby = $derived(fieldCtx?.hasHint ? fieldCtx.hintId : undefined)

  $effect(() => {
    if (inputEl) inputEl.indeterminate = indeterminate
  })
</script>

<label class="checkbox-wrap" class:disabled={disabled}>
  <input
    type="checkbox"
    class="checkbox-input"
    bind:checked
    {disabled}
    bind:this={inputEl}
    id={resolvedId}
    aria-invalid={resolvedAriaInvalid}
    aria-describedby={resolvedAriaDescribedby}
    {...rest}
  />
  <span class="checkbox-indicator" aria-hidden="true"></span>
  <span class="checkbox-label">{label}</span>
</label>

<style>
  .checkbox-wrap {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    font-family: var(--mono);
    font-size: 13px;
    color: var(--ink);
    position: relative;
  }

  .checkbox-wrap.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .checkbox-input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    border: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }

  .checkbox-indicator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    border: 1px solid var(--rule-strong);
    background: transparent;
    border-radius: 0;
    transition: background var(--transition), border-color var(--transition);
    position: relative;
  }

  /* Checked state */
  .checkbox-input:checked + .checkbox-indicator {
    background: var(--amber);
    border-color: var(--amber);
  }

  .checkbox-input:checked + .checkbox-indicator::after {
    content: '✓';
    color: var(--bg);
    font-size: 11px;
    line-height: 1;
  }

  /* Indeterminate state */
  .checkbox-input:indeterminate + .checkbox-indicator {
    background: var(--amber);
    border-color: var(--amber);
    opacity: 0.6;
  }

  .checkbox-input:indeterminate + .checkbox-indicator::after {
    content: '–';
    color: var(--bg);
    font-size: 11px;
    line-height: 1;
  }

  /* Focus-visible delegated to indicator */
  .checkbox-input:focus-visible + .checkbox-indicator {
    outline: 2px solid var(--amber);
    outline-offset: 2px;
  }

  .checkbox-label {
    color: var(--ink);
  }
</style>
