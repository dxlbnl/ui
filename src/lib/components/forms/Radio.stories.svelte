<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Radio from "./Radio.svelte";

  const { Story } = defineMeta({
    title: "Forms/Radio",
    component: Radio,
    tags: ["autodocs"],
  });
</script>

<!-- AC-25: unchecked by default -->
<Story name="Default (Unchecked)"
  args={{ label: "Option A", name: "demo", value: "a", checked: false }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("radio");
    await expect(input).toBeVisible();
    await expect(input).not.toBeChecked();
    // AC-28: name and value attributes forwarded via ...rest
    await expect(input.getAttribute("name")).toBe("demo");
    await expect(input.getAttribute("value")).toBe("a");
    // indicator border colour matches var(--rule-strong)
    const indicator = canvasElement.querySelector(".radio-indicator");
    const ruleStrongColor = resolveTokenFgColor("--rule-strong");
    await expect(getComputedStyle(indicator!).borderColor).toBe(ruleStrongColor);
  }} />

<!-- AC-26: checked state -->
<Story name="Checked"
  args={{ label: "Option A", name: "demo", value: "a", checked: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("radio");
    await expect(input).toBeChecked();
    // AC-28: attributes still forwarded in checked state
    await expect(input.getAttribute("name")).toBe("demo");
    await expect(input.getAttribute("value")).toBe("a");
    // indicator ::before pseudo-element colour resolves (amber dot present)
    const indicator = canvasElement.querySelector(".radio-indicator");
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(indicator!, "::before").backgroundColor).toBe(amberColor);
  }} />

<!-- AC-27: disabled — toBeDisabled and wrap opacity 0.4 -->
<Story name="Disabled"
  args={{ label: "Locked", name: "demo", value: "x", disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("radio");
    await expect(input).toBeDisabled();
    // AC-27: wrap opacity 0.4
    const wrap = canvasElement.querySelector(".radio-wrap");
    await expect(getComputedStyle(wrap!).opacity).toBe("0.4");
  }} />

<!-- AC-29: focus styles — keyboard focus reaches the radio input -->
<Story name="Focus Styles"
  args={{ label: "Focus me", name: "demo", value: "f" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("radio");
    await userEvent.tab();
    await expect(input).toHaveFocus();
    // indicator receives the delegated focus outline — it exists in DOM
    const indicator = canvasElement.querySelector(".radio-indicator");
    await expect(indicator).toBeVisible();
  }} />
