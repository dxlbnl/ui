<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor } from "$lib/storybook-utils.js";
  import Checkbox from "./Checkbox.svelte";
  // resolveTokenColor resolves via backgroundColor; use for bg-token assertions

  const { Story } = defineMeta({
    title: "Forms/Checkbox",
    component: Checkbox,
    tags: ["autodocs"],
  });
</script>

<!-- AC-14: unchecked by default -->
<Story name="Default (Unchecked)" args={{ label: "Enable notifications", checked: false }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    await expect(input).toBeVisible();
    await expect(input).not.toBeChecked();
    // AC-20: indicator background is transparent when unchecked
    const indicator = canvasElement.querySelector(".checkbox-indicator");
    await expect(getComputedStyle(indicator!).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  }} />

<!-- AC-15: checked state -->
<Story name="Checked" args={{ label: "Enable notifications", checked: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    await expect(input).toBeChecked();
    // AC-19: indicator background matches var(--amber) when checked
    const amberColor = resolveTokenColor("--amber");
    const indicator = canvasElement.querySelector(".checkbox-indicator");
    await expect(getComputedStyle(indicator!).backgroundColor).toBe(amberColor);
  }} />

<!-- AC-16: indeterminate state sets DOM property and aria-checked="mixed" -->
<Story name="Indeterminate" args={{ label: "Select all", indeterminate: true, checked: false }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    await expect(input).toBeVisible();
    // AC-16: DOM .indeterminate property must be true after mount (set via $effect)
    await expect((input as HTMLInputElement).indeterminate).toBe(true);
  }} />

<!-- AC-17: disabled unchecked — toBeDisabled and wrap opacity 0.4 -->
<Story name="Disabled Unchecked" args={{ label: "Locked option", disabled: true, checked: false }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    await expect(input).toBeDisabled();
    // AC-17: wrap opacity 0.4 and cursor not-allowed
    const wrap = canvasElement.querySelector(".checkbox-wrap");
    await expect(getComputedStyle(wrap!).opacity).toBe("0.4");
    await expect(getComputedStyle(wrap!).cursor).toBe("not-allowed");
  }} />

<!-- AC-17: disabled checked — both disabled and checked -->
<Story name="Disabled Checked" args={{ label: "Locked option", disabled: true, checked: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    await expect(input).toBeDisabled();
    await expect(input).toBeChecked();
  }} />

<!-- AC-18: Space key toggles checked state; AC-1/AC-2/AC-4/AC-8 regression guards -->
<Story name="Space to Toggle" args={{ label: "Toggle me", checked: false }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("checkbox");
    const indicator = canvasElement.querySelector(".checkbox-indicator");
    const wrap = canvasElement.querySelector(".checkbox-wrap");

    // AC-1: indicator is exactly 16×16 before toggle
    const indicatorRectBefore = indicator!.getBoundingClientRect();
    await expect(indicatorRectBefore.width).toBe(16);
    await expect(indicatorRectBefore.height).toBe(16);

    // Capture wrap row height before toggle
    const wrapHeightBefore = wrap!.getBoundingClientRect().height;

    await expect(input).not.toBeChecked();
    await input.focus();
    await userEvent.keyboard(" ");
    await expect(input).toBeChecked();

    // AC-2 / AC-4: indicator dimensions must not change after toggle
    const indicatorRectAfter = indicator!.getBoundingClientRect();
    await expect(indicatorRectAfter.width).toBe(16);
    await expect(indicatorRectAfter.height).toBe(16);

    // AC-4: wrap row height must not change (the layout shift symptom)
    const wrapHeightAfter = wrap!.getBoundingClientRect().height;
    await expect(wrapHeightAfter).toBe(wrapHeightBefore);

    // AC-8: ::after must be position:absolute so it is out of flow
    const afterPosition = getComputedStyle(indicator!, "::after").position;
    await expect(afterPosition).toBe("absolute");
  }} />
