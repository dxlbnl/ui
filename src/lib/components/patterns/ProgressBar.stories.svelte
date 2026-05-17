<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProgressBar from "./ProgressBar.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Patterns/ProgressBar",
    component: ProgressBar,
    tags: ["autodocs"],
  });
</script>

<Story name="Ok 68 Percent" args={{ value: 68, label: "+12V load", color: "ok" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeVisible();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "68");
    await expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    await expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    await expect(canvas.getByText("+12V load")).toBeVisible();
    await expect(canvas.getByText("68%")).toBeVisible();
    const fill = canvasElement.querySelector(".progress-fill");
    await expect(getComputedStyle(fill!).width).not.toBe("0px");
    const okColor = resolveTokenColor("--ok");
    await expect(getComputedStyle(fill!).backgroundColor).toBe(okColor);
  }} />

<Story name="Amber 88 Percent" args={{ value: 88, label: "-12V load", color: "amber" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "88");
    const fill = canvasElement.querySelector(".progress-fill");
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(fill!).backgroundColor).toBe(amberColor);
  }} />

<Story name="Danger 97 Percent" args={{ value: 97, label: "Thermal", color: "danger" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "97");
    const fill = canvasElement.querySelector(".progress-fill");
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(fill!).backgroundColor).toBe(dangerColor);
  }} />

<Story name="No Label" args={{ value: 50 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toBeVisible();
    await expect(progressbar).toHaveAttribute("aria-label", "Progress");
    await expect(canvasElement.querySelector(".progress-header")).toBeNull();
  }} />

<Story name="Clamped at 100" args={{ value: 150, label: "Overflow", color: "danger" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "100");
    await expect(canvas.getByText("100%")).toBeVisible();
  }} />

<Story name="Clamped at 0" args={{ value: -10, label: "Underflow", color: "ok" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progressbar = canvas.getByRole("progressbar");
    await expect(progressbar).toHaveAttribute("aria-valuenow", "0");
    await expect(canvas.getByText("0%")).toBeVisible();
  }} />

<!-- B27 AC-18: Stack root must have no style="width: 100%" attribute -->
<Story name="No Inline Width Style" args={{ value: 50, label: "Load" }}
  play={async ({ canvasElement }) => {
    // Before B27: <Stack style="width: 100%;"> is the root — it carries a style= attribute.
    // After B27: width: 100% moves to scoped CSS; the Stack root must have no style= attribute.
    // The Stack root is the first element child of the canvas (it receives {...rest}).
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.getAttribute("style")).toBeNull();
  }} />
