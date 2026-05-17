<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import type { Snippet } from 'svelte'
  import { setContext } from 'svelte'
  import Stack from '../layout/Stack.svelte'
  import { FIELD_CONTEXT_KEY } from './field-context.js'

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string
    inputId: string
    hint?: string
    error?: string
    children: Snippet
    [key: string]: unknown
  }

  let {
    label,
    inputId,
    hint,
    error,
    children,
    ...rest
  }: Props = $props()

  let hintId = $derived(`${inputId}-hint`)
  let hasError = $derived(!!error)
  let hasHint = $derived(!!(hint || error))
  let hintText = $derived(error ?? hint)

  // Provide context so nested Input/Textarea/Checkbox/Radio/Switch
  // can auto-wire aria-invalid, aria-describedby, and id.
  // Use a getter object so children re-read reactive values on each render.
  const ctx = {
    get inputId() { return inputId },
    get hintId() { return hintId },
    get hasHint() { return hasHint },
    get hasError() { return hasError },
  }
  setContext(FIELD_CONTEXT_KEY, ctx)
</script>

<Stack gap="xs" style="min-width: 0;" {...rest}>
  <label for={inputId} class="field-label">{label}</label>
  {@render children()}
  {#if hintText}
    <span id={hintId} class="field-hint" class:err={hasError} aria-live="polite">
      {hintText}
    </span>
  {/if}
</Stack>

<style>
  .field-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    display: block;
  }

  .field-hint {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.04em;
    color: var(--ink-faint);
  }

  .field-hint.err {
    color: var(--danger);
  }
</style>
