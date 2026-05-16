<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Alert from "./Alert.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/Alert",
    component: Alert,
    tags: ["autodocs"],
  });
</script>

<Story name="Ok" args={{ variant: "ok", title: "Build successful", message: "All rails nominal." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("status");
    await expect(root).toBeVisible();
    await expect(canvas.getByText("Build successful")).toBeVisible();
    await expect(canvas.getByText("All rails nominal.")).toBeVisible();
    const tag = canvas.getByText("ok");
    await expect(tag).toHaveAttribute("aria-hidden", "true");
    const okColor = resolveTokenFgColor("--ok");
    await expect(getComputedStyle(root).borderLeftColor).toBe(okColor);
  }} />

<Story name="Amber" args={{ variant: "amber", title: "High load", message: "+12V rail at 88%." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("status");
    await expect(root).toBeVisible();
    await expect(canvas.getByText("High load")).toBeVisible();
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(root).borderLeftColor).toBe(amberColor);
  }} />

<Story name="Danger" args={{ variant: "danger", title: "Thermal fault", message: "Over-temperature protection triggered." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("status");
    await expect(root).toBeVisible();
    await expect(canvas.getByText("Thermal fault")).toBeVisible();
    const dangerColor = resolveTokenFgColor("--danger");
    await expect(getComputedStyle(root).borderLeftColor).toBe(dangerColor);
  }} />

<Story name="Info" args={{ variant: "info", title: "Firmware update available", message: "v2.1.0 → v2.2.0." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("status");
    await expect(root).toBeVisible();
    const cyanColor = resolveTokenFgColor("--cyan");
    await expect(getComputedStyle(root).borderLeftColor).toBe(cyanColor);
  }} />

<Story name="No Message" args={{ variant: "ok", title: "Status OK" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("status");
    await expect(root).toBeVisible();
    await expect(canvas.getByText("Status OK")).toBeVisible();
    await expect(canvasElement.querySelector(".alert-msg")).toBeNull();
  }} />
