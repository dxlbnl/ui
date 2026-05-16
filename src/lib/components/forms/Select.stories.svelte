<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Select from "./Select.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const OPTIONS = [
    { value: "osc", label: "Oscillator" },
    { value: "env", label: "Envelope" },
    { value: "util", label: "Utility" },
  ];

  const { Story } = defineMeta({
    title: "Forms/Select",
    component: Select,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ options: OPTIONS, placeholder: "SELECT…" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger).toBeVisible();
    await expect(trigger).toBeEnabled();
    await expect(trigger.textContent).toContain("SELECT…");
    await expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await expect(canvas.queryByRole("listbox")).toBeNull();
  }} />

<Story name="Open Panel" args={{ options: OPTIONS, placeholder: "SELECT…" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await userEvent.click(trigger);
    await expect(canvas.getByRole("listbox")).toBeVisible();
    await expect(canvas.getAllByRole("option")).toHaveLength(3);
    await expect(trigger.getAttribute("aria-expanded")).toBe("true");
  }} />

<Story name="With Selection" args={{ options: OPTIONS, value: "env" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger.textContent).toContain("Envelope");
    await userEvent.click(trigger);
    const options = canvas.getAllByRole("option");
    const envelopeOption = options.find((o) => o.textContent && o.textContent.includes("Envelope"))!;
    await expect(envelopeOption.getAttribute("aria-selected")).toBe("true");
    for (const option of options) {
      if (option !== envelopeOption) {
        await expect(option.getAttribute("aria-selected")).toBe("false");
      }
    }
  }} />

<Story name="Disabled" args={{ options: OPTIONS, disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await expect(trigger).toBeDisabled();
    await expect(getComputedStyle(trigger).opacity).toBe("0.4");
  }} />

<Story name="Error State" args={{ options: OPTIONS, error: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(trigger).borderColor).toBe(dangerColor);
  }} />
