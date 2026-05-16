<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Stack from "./Stack.svelte";
  import Button from "../primitives/Button.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Stack",
    component: Stack,
    tags: ["autodocs"],
  });

  // ── Default Stack ─────────────────────────────────────────────────────────
  const playDefaultStack = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("flex");
    await expect(style.flexDirection).toBe("column");
    // gap="sm" → var(--u2) → 16px
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("16px")).toBe(true);
    // aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  };

  // ── Large Gap ─────────────────────────────────────────────────────────────
  const playLargeGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("32px")).toBe(true);
  };

  // ── Small Gap ─────────────────────────────────────────────────────────────
  const playSmallGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("8px")).toBe(true);
  };

  // ── As Section ────────────────────────────────────────────────────────────
  const playAsSection = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("SECTION");
    // gap="md" → var(--u2) → 16px
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("16px")).toBe(true);
  };

  // ── None Gap ──────────────────────────────────────────────────────────────
  const playNoneGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  };

  // ── XL Gap ────────────────────────────────────────────────────────────────
  const playXlGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("40px")).toBe(true);
  };
</script>

<Story name="Default Stack" args={{ gap: "sm", "aria-label": "test-label" }} play={playDefaultStack}>
  <Button variant="ghost">View All Hardware →</Button>
  <Button variant="ghost">View Projects →</Button>
  <Button variant="ghost">Read the Docs →</Button>
</Story>

<Story name="Large Gap" args={{ gap: "lg" }} play={playLargeGap}>
  <TagPill variant="amber">Featured</TagPill>
  <TagPill>Utility</TagPill>
</Story>

<Story name="Small Gap" args={{ gap: "xs" }} play={playSmallGap}>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
  <span>Item 4</span>
</Story>

<Story name="As Section" args={{ as: "section", gap: "md" }} play={playAsSection}>
  <h2>Section Title</h2>
  <p>Section content paragraph text goes here.</p>
</Story>

<Story name="None Gap" args={{ gap: "none" }} play={playNoneGap}>
  <Button variant="ghost">A</Button>
  <Button variant="ghost">B</Button>
</Story>

<Story name="XL Gap" args={{ gap: "xl" }} play={playXlGap}>
  <Button variant="ghost">Top</Button>
  <Button variant="ghost">Bottom</Button>
</Story>
