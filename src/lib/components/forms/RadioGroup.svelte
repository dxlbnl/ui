<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'
  import Radio from './Radio.svelte'

  interface RadioOption {
    value: string
    label: string
    disabled?: boolean
  }

  interface Props extends Omit<HTMLAttributes<HTMLFieldSetElement>, 'onchange'> {
    /** `<legend>` text for the fieldset. */
    legend: string
    /** `name` attribute shared by all radio inputs in the group. */
    name: string
    /** Array of `{ value, label, disabled? }` options. */
    options: RadioOption[]
    /** Currently selected value. */
    value?: string
    /** Disable all radios in the group. @default false */
    disabled?: boolean
    /** Called with the newly selected value string. */
    onchange?: (value: string) => void
    [key: string]: unknown
  }

  let {
    legend,
    name,
    options,
    value,
    disabled = false,
    onchange,
    ...rest
  }: Props = $props()

  // Returns the tabindex for each radio: 0 for the selected (or first enabled if none selected), -1 for all others
  function getTabIndex(optionValue: string, index: number): number {
    if (value !== undefined) {
      return optionValue === value ? 0 : -1
    }
    // No selection: first enabled radio gets tabindex=0
    const firstEnabledIndex = options.findIndex(o => !o.disabled && !disabled)
    return index === firstEnabledIndex ? 0 : -1
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLInputElement
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) return

    event.preventDefault()

    // Find all enabled radio inputs inside the fieldset
    const fieldset = target.closest('fieldset')
    if (!fieldset) return
    const inputs = Array.from(fieldset.querySelectorAll<HTMLInputElement>('input[type="radio"]:not([disabled])'))
    if (inputs.length === 0) return

    const currentIndex = inputs.indexOf(target)
    if (currentIndex === -1) return

    let nextIndex: number
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % inputs.length
    } else {
      nextIndex = (currentIndex - 1 + inputs.length) % inputs.length
    }

    const nextInput = inputs[nextIndex]
    nextInput.focus()

    // Find the option value for this input and fire onchange
    const nextValue = nextInput.value
    onchange?.(nextValue)
  }
</script>

<fieldset class="radio-group" class:disabled={disabled} {disabled} onkeydown={handleKeydown} {...rest}>
  <legend class="radio-group-legend">{legend}</legend>
  {#each options as option, i}
    <Radio
      {name}
      value={option.value}
      label={option.label}
      checked={option.value === value}
      disabled={disabled || option.disabled}
      tabindex={getTabIndex(option.value, i)}
      onchange={() => onchange?.(option.value)}
    />
  {/each}
</fieldset>

<style>
  .radio-group {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .radio-group-legend {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 4px;
  }

  .radio-group.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
