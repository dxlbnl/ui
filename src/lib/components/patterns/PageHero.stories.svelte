<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import PageHero from "./PageHero.svelte";
  import Button from "$lib/components/primitives/Button.svelte";

  const { Story } = defineMeta({
    title: "Patterns/PageHero",
    component: PageHero,
    tags: ["autodocs"],
  });
</script>

<Story name="Full" args={{ eyebrow: "// DEXTERLABS · WORKBENCH · 2026", heading: "Things built in the lab.", lede: "Software engineer by day; hardware builder by night." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Things built in the lab." })).toBeVisible();
    await expect(canvas.getByText(/DEXTERLABS · WORKBENCH/i)).toBeVisible();
    await expect(canvas.getByText(/Software engineer by day/i)).toBeVisible();
    await expect(canvas.getByRole("button", { name: "View Catalogue" })).toBeVisible();
    await expect(canvasElement.querySelector("header")).not.toBeNull();
    const header = canvasElement.querySelector("header");
    await expect(getComputedStyle(header!).borderBottomStyle).not.toBe("none");
  }}>
  <Button variant="primary">View Catalogue</Button>
  <Button variant="ghost">View Projects →</Button>
</Story>

<Story name="Heading Only" args={{ heading: "Catalogue" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Catalogue" })).toBeVisible();
    await expect(canvasElement.querySelector(".page-hero-eyebrow")).toBeNull();
    await expect(canvasElement.querySelector(".page-hero-lede")).toBeNull();
    await expect(canvasElement.querySelector(".page-hero-actions")).toBeNull();
  }} />

<Story name="No Slot" args={{ eyebrow: "// SECTION", heading: "Projects", lede: "Open source and web work." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
    await expect(canvas.getByText("Open source and web work.")).toBeVisible();
    await expect(canvasElement.querySelector(".page-hero-actions")).toBeNull();
  }} />
