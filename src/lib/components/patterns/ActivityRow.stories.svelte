<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ActivityRow from "./ActivityRow.svelte";

  const { Story } = defineMeta({
    title: "Patterns/ActivityRow",
    component: ActivityRow,
    tags: ["autodocs"],
  });
</script>

<Story name="Ok Status" args={{ timestamp: "14:22", description: "PDX-2 thermal check passed", status: "ok" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.firstElementChild;
    await expect(root).toBeVisible();
    await expect(canvas.getByText("14:22")).toBeVisible();
    await expect(canvas.getByText("PDX-2 thermal check passed")).toBeVisible();
    const led = canvasElement.querySelector(".led");
    await expect(led).toBeVisible();
  }} />

<Story name="Amber Status" args={{ timestamp: "13:55", description: "New order: DISTRANS-AR1 · #DXL-0044", status: "amber" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("13:55")).toBeVisible();
    await expect(canvas.getByText(/New order/i)).toBeVisible();
  }} />

<Story name="With Actor" args={{ timestamp: "09:30", actor: "PDX-2", description: "All rails nominal", status: "ok" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("PDX-2")).toBeVisible();
    await expect(canvas.getByText("All rails nominal")).toBeVisible();
  }} />

<Story name="Off Status" args={{ timestamp: "08:00", description: "System boot", status: "off" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.firstElementChild;
    await expect(root).toBeVisible();
    await expect(canvas.getByText("System boot")).toBeVisible();
  }} />

