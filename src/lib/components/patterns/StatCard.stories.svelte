<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import StatCard from "./StatCard.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/StatCard",
    component: StatCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{ label: "Modules", value: "12", sublabel: "across 2 cases" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.firstElementChild;
    await expect(root).toBeVisible();
    await expect(canvas.getByText("12")).toBeVisible();
    await expect(canvas.getByText(/modules/i)).toBeVisible();
    await expect(canvas.getByText(/across 2 cases/i)).toBeVisible();
    const inkColor = resolveTokenFgColor("--ink");
    await expect(getComputedStyle(canvas.getByText("12")).color).toBe(inkColor);
  }} />

<Story name="Ok Color" args={{ label: "+12V draw", value: "68%", color: "ok", sublabel: "2.04A / 3.0A" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const okColor = resolveTokenFgColor("--ok");
    await expect(getComputedStyle(canvas.getByText("68%")).color).toBe(okColor);
  }} />

<Story name="Amber Color" args={{ label: "Orders open", value: "2", color: "amber", sublabel: "awaiting shipment" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(canvas.getByText("2")).color).toBe(amberColor);
  }} />

<Story name="Danger Color" args={{ label: "Thermal", value: "97%", color: "danger" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dangerColor = resolveTokenFgColor("--danger");
    await expect(getComputedStyle(canvas.getByText("97%")).color).toBe(dangerColor);
  }} />

<Story name="No Sublabel" args={{ label: "Projects", value: "5" }}
  play={async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(".stat-sub")).toBeNull();
  }} />

<!-- B27 AC-17: Stack inside StatCard must have no style="padding: 16px 20px" attribute -->
<Story name="No Inline Padding Style" args={{ label: "Modules", value: "12" }}
  play={async ({ canvasElement }) => {
    // The Stack root inside the card carries style="padding: 16px 20px;" before B27.
    // After B27 the padding moves to scoped CSS; the Stack must have no style= attribute.
    const stackRoot = canvasElement.querySelector(".stack") as HTMLElement;
    await expect(stackRoot.getAttribute("style")).toBeNull();
  }} />
