<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import RadioGroup from "./RadioGroup.svelte";

  const { Story } = defineMeta({
    title: "Forms/RadioGroup",
    component: RadioGroup,
    tags: ["autodocs"],
  });

  const baseOptions = [
    { value: "osc", label: "Oscillator" },
    { value: "env", label: "Envelope" },
    { value: "util", label: "Utility" },
  ];

  const partiallyDisabledOptions = [
    { value: "osc", label: "Oscillator" },
    { value: "env", label: "Envelope" },
    { value: "util", label: "Utility", disabled: true },
  ];
</script>

<!-- AC-31, AC-32, AC-33, AC-36: fieldset, legend, radios, no selection -->
<Story name="Default — No Selection"
  args={{ legend: "Module type", name: "mod", options: baseOptions }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // AC-32: getByRole('group') returns the fieldset with the legend text as accessible name
    const group = canvas.getByRole("group", { name: "Module type" });
    await expect(group).toBeVisible();
    // AC-31: fieldset contains a legend with the legend prop text
    const legend = canvasElement.querySelector("legend");
    await expect(legend).not.toBeNull();
    await expect(legend!.textContent!.trim()).toBe("Module type");
    // AC-33: one radio per option
    const radios = canvas.getAllByRole("radio");
    await expect(radios.length).toBe(3);
    // AC-36: no radio is checked when value is unset
    for (const radio of radios) {
      await expect(radio).not.toBeChecked();
    }
  }} />

<!-- AC-34, AC-35: name attribute shared, correct radio checked -->
<Story name="With Selection"
  args={{ legend: "Module type", name: "mod", options: baseOptions, value: "env" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // AC-35: the radio matching value is checked
    const envRadio = canvas.getByRole("radio", { name: "Envelope" });
    await expect(envRadio).toBeChecked();
    // AC-35: all other radios are unchecked
    const oscRadio = canvas.getByRole("radio", { name: "Oscillator" });
    const utilRadio = canvas.getByRole("radio", { name: "Utility" });
    await expect(oscRadio).not.toBeChecked();
    await expect(utilRadio).not.toBeChecked();
    // AC-34: all radios share the same name attribute
    const radios = canvas.getAllByRole("radio");
    for (const radio of radios) {
      await expect(radio.getAttribute("name")).toBe("mod");
    }
    // AC-42: selected radio has tabindex="0", others have tabindex="-1"
    await expect(envRadio.getAttribute("tabindex")).toBe("0");
    await expect(oscRadio.getAttribute("tabindex")).toBe("-1");
    await expect(utilRadio.getAttribute("tabindex")).toBe("-1");
  }} />

<!-- AC-37: disabled group — all radios disabled -->
<Story name="Disabled Group"
  args={{ legend: "Module type", name: "mod", options: baseOptions, disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    await expect(radios.length).toBe(3);
    // AC-37: all radios are disabled when group disabled=true
    for (const radio of radios) {
      await expect(radio).toBeDisabled();
    }
  }} />

<!-- AC-38: individual option disabled, others enabled -->
<Story name="Partially Disabled"
  args={{ legend: "Module type", name: "mod", options: partiallyDisabledOptions }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const oscRadio = canvas.getByRole("radio", { name: "Oscillator" });
    const envRadio = canvas.getByRole("radio", { name: "Envelope" });
    const utilRadio = canvas.getByRole("radio", { name: "Utility" });
    // AC-38: only the individually-disabled option is disabled
    await expect(utilRadio).toBeDisabled();
    await expect(oscRadio).not.toBeDisabled();
    await expect(envRadio).not.toBeDisabled();
  }} />

<!-- AC-39, AC-42: ArrowDown moves focus to next radio; roving tabindex -->
<Story name="Keyboard Navigation"
  args={{ legend: "Module type", name: "mod", options: baseOptions, value: "osc" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const oscRadio = canvas.getByRole("radio", { name: "Oscillator" });
    const envRadio = canvas.getByRole("radio", { name: "Envelope" });
    // AC-42: selected radio ("osc") has tabindex="0"
    await expect(oscRadio.getAttribute("tabindex")).toBe("0");
    // Tab into the group — the selected (tabindex=0) radio receives focus
    await userEvent.tab();
    await expect(oscRadio).toHaveFocus();
    // AC-39: ArrowDown moves DOM focus to the next enabled radio
    await userEvent.keyboard("{ArrowDown}");
    await expect(document.activeElement).toBe(envRadio);
    // AC-40: ArrowUp from second radio returns focus to first
    await userEvent.keyboard("{ArrowUp}");
    await expect(document.activeElement).toBe(oscRadio);
  }} />
