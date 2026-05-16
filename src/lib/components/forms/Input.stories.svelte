<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Input from "./Input.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Forms/Input",
    component: Input,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ type: "text", placeholder: "Placeholder…" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    const bgSunken = resolveTokenColor("--bg-sunken");
    await expect(getComputedStyle(input).backgroundColor).toBe(bgSunken);
    await expect(getComputedStyle(input).borderTopStyle).toBe("solid");
    await expect(getComputedStyle(input).borderTopWidth).toBe("1px");
    await expect(getComputedStyle(input).fontFamily).toContain("JetBrains Mono");
  }} />

<Story name="With Value" args={{ type: "text", value: "CONDUIT-PDX2" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toHaveValue("CONDUIT-PDX2");
  }} />

<Story name="Error State" args={{ type: "text", value: "bad@input", error: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(input).borderColor).toBe(dangerColor);
  }} />

<Story name="Disabled" args={{ type: "text", value: "read-only", disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input).toBeDisabled();
    await expect(getComputedStyle(input).opacity).toBe("0.4");
    await expect(getComputedStyle(input).cursor).toBe("not-allowed");
  }} />

<Story name="Email" args={{ type: "email", placeholder: "you@domain.com" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await expect(input.getAttribute("type")).toBe("email");
  }} />
