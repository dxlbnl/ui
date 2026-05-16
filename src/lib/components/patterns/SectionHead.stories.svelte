<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import SectionHead from "./SectionHead.svelte";

  const { Story } = defineMeta({
    title: "Patterns/SectionHead",
    component: SectionHead,
    tags: ["autodocs"],
  });
</script>

<Story name="With Eyebrow and Sublabel" args={{ eyebrow: "// 0x01", heading: "Catalogue", sublabel: "PRODUCTION-READY HARDWARE" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Catalogue" })).toBeVisible();
    await expect(canvas.getByText(/\/\/ 0x01/)).toBeVisible();
    await expect(canvas.getByText(/PRODUCTION-READY HARDWARE/i)).toBeVisible();
    await expect(canvasElement.querySelector("section")).not.toBeNull();
    const section = canvasElement.querySelector("section");
    await expect(getComputedStyle(section!).borderBottomStyle).not.toBe("none");
  }} />

<Story name="Heading Only" args={{ heading: "Projects" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Projects" })).toBeVisible();
    await expect(canvasElement.querySelector(".section-num")).toBeNull();
    await expect(canvasElement.querySelector(".section-sub")).toBeNull();
  }} />

<Story name="With Children Slot" args={{ eyebrow: "// 0x02", heading: "Notes" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { level: 2, name: "Notes" })).toBeVisible();
    await expect(canvas.getByText("Recent bench notes and experiments.")).toBeVisible();
  }}>
  <p>Recent bench notes and experiments.</p>
</Story>
