<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { resolveTokenColor } from "$lib/storybook-utils.js";
  import Switch from "./Switch.svelte";

  const { Story } = defineMeta({
    title: "Forms/Switch",
    component: Switch,
    tags: ["autodocs"],
  });
</script>

<!-- AC-44, AC-45, AC-46, AC-47, AC-50: Off state + Space key toggle -->
<Story name="Off (Default)" args={{ label: "Dark mode", checked: false }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    // AC-44: renders a button with role="switch"
    // AC-46: accessible name provided by aria-label={label}
    const sw = canvas.getByRole("switch", { name: "Dark mode" });
    await expect(sw).toBeVisible();
    // AC-45: aria-checked is "false" when off
    await expect(sw.getAttribute("aria-checked")).toBe("false");
    // AC-47: track background matches var(--bg-sunken) when off
    const bgSunken = resolveTokenColor("--bg-sunken");
    await expect(getComputedStyle(sw).backgroundColor).toBe(bgSunken);
    // AC-1: off-state border resolves to --rule
    const ruleColor = resolveTokenColor("--rule");
    await expect(getComputedStyle(sw).borderColor).toBe(ruleColor);
    // AC-2: border is NOT invisible (not the same as --bg)
    const bgColor = resolveTokenColor("--bg");
    await expect(getComputedStyle(sw).borderColor).not.toBe(bgColor);
    // AC-5: clicking the label text toggles the switch on
    await userEvent.click(canvas.getByText("Dark mode"));
    await expect(sw.getAttribute("aria-checked")).toBe("true");
    // AC-8: clicking the button itself flips it back to off
    await userEvent.click(sw);
    await expect(sw.getAttribute("aria-checked")).toBe("false");
    // AC-50: Space key toggles switch from off to on
    sw.focus();
    await expect(sw).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(sw.getAttribute("aria-checked")).toBe("true");
  }} />

<!-- AC-45, AC-48, AC-52: On state + amber track + pill shape dimensions -->
<Story name="On" args={{ label: "Dark mode", checked: true }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch", { name: "Dark mode" });
    // AC-45: aria-checked is "true" when on
    await expect(sw.getAttribute("aria-checked")).toBe("true");
    // AC-48: track background matches var(--amber) when on
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(sw).backgroundColor).toBe(amberColor);
    // AC-3: on-state border resolves to --amber
    await expect(getComputedStyle(sw).borderColor).toBe(amberColor);
    // AC-52: pill shape — borderRadius is 11px, width 40px, height 22px
    await expect(getComputedStyle(sw).borderRadius).toBe("11px");
    await expect(getComputedStyle(sw).width).toBe("40px");
    await expect(getComputedStyle(sw).height).toBe("22px");
    // AC-6: clicking the label text toggles the switch off
    await userEvent.click(canvas.getByText("Dark mode"));
    await expect(sw.getAttribute("aria-checked")).toBe("false");
  }} />

<!-- AC-49: disabled — toBeDisabled, wrap opacity 0.4, no-toggle, and disabled-on aria-checked -->
<Story name="Disabled" args={{ label: "Feature flag", disabled: true, checked: false }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const sw = canvas.getByRole("switch", { name: "Feature flag" });
    await expect(sw).toBeDisabled();
    // AC-49: wrap opacity is 0.4
    const wrap = canvasElement.querySelector(".switch-wrap");
    await expect(getComputedStyle(wrap!).opacity).toBe("0.4");
    // AC-4: disabled off-state border still resolves to --rule
    const ruleColor = resolveTokenColor("--rule");
    await expect(getComputedStyle(sw).borderColor).toBe(ruleColor);
    // AC-7: clicking the label on a disabled switch must NOT toggle it
    await userEvent.click(canvas.getByText("Feature flag"));
    await expect(sw.getAttribute("aria-checked")).toBe("false");
  }} />
