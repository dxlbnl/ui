<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import SectionFoot from "./SectionFoot.svelte";

  const { Story } = defineMeta({
    title: "Patterns/SectionFoot",
    component: SectionFoot,
    tags: ["autodocs"],
  });
</script>

<Story name="With Count and Meta" args={{ href: "/hardware", label: "VIEW ALL HARDWARE →", count: 4, meta: "SHIPPED BY DEXTERLABS · DELFT, NL" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "VIEW ALL HARDWARE →" });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/hardware");
    await expect(canvas.getByText(/SHIPPED BY DEXTERLABS/i)).toBeVisible();
    await expect(canvasElement.querySelector("footer")).not.toBeNull();
    const footer = canvasElement.querySelector("footer");
    await expect(getComputedStyle(footer!).borderTopStyle).not.toBe("none");
  }} />

<Story name="Link Only" args={{ href: "/projects", label: "VIEW ALL PROJECTS →" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "VIEW ALL PROJECTS →" })).toBeVisible();
    await expect(canvasElement.querySelector(".section-foot-meta")).toBeNull();
  }} />

<Story name="Count Only" args={{ href: "/notes", label: "VIEW ALL NOTES →", count: 12 }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link")).toBeVisible();
    await expect(canvas.getByText("12")).toBeVisible();
  }} />
