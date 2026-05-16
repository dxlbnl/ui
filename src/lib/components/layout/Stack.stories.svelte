<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Stack from "./Stack.svelte";
  import Button from "../primitives/Button.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Stack",
    tags: ["autodocs"],
  });

  // ── Default Stack ─────────────────────────────────────────────────────────
  // AC 15, 18, 22, 71: display flex, flex-direction column, gap 16px, aria-label forwarded
  const playDefaultStack = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='stack-root']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("flex");
    await expect(style.flexDirection).toBe("column");
    // gap="sm" → var(--u2) → 16px
    const gap = style.gap || style.columnGap;
    await expect(gap.includes("16px")).toBe(true);
    // AC 22: aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  };

  // ── Large Gap ─────────────────────────────────────────────────────────────
  // AC 20, 72: gap="lg" → 32px
  const playLargeGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='stack-large']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("32px")).toBe(true);
  };

  // ── Small Gap ─────────────────────────────────────────────────────────────
  // AC 17, 73: gap="xs" → 8px
  const playSmallGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='stack-small']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("8px")).toBe(true);
  };

  // ── As Section ────────────────────────────────────────────────────────────
  // AC 14, 19, 74: as="section" renders <section> tag; gap="md" → 16px
  const playAsSection = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='stack-section']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.tagName).toBe("SECTION");
    // AC 19: gap="md" → var(--u2) → 16px
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("16px")).toBe(true);
  };

  // ── None Gap ──────────────────────────────────────────────────────────────
  // AC 16: gap="none" → 0px
  const playNoneGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='stack-none']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap === "0px" || gap === "0").toBe(true);
  };

  // ── XL Gap ────────────────────────────────────────────────────────────────
  // AC 21: gap="xl" → var(--u5) → 40px
  const playXlGap = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='stack-xl']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    const gap = style.gap || style.rowGap;
    await expect(gap.includes("40px")).toBe(true);
  };
</script>

<Story name="Default Stack" play={playDefaultStack}>
  <Stack gap="sm" data-testid="stack-root" aria-label="test-label">
    <Button variant="ghost">View All Hardware →</Button>
    <Button variant="ghost">View Projects →</Button>
    <Button variant="ghost">Read the Docs →</Button>
  </Stack>
</Story>

<Story name="Large Gap" play={playLargeGap}>
  <Stack gap="lg" data-testid="stack-large">
    <TagPill variant="amber">Featured</TagPill>
    <TagPill>Utility</TagPill>
  </Stack>
</Story>

<Story name="Small Gap" play={playSmallGap}>
  <Stack gap="xs" data-testid="stack-small">
    <span>Item 1</span>
    <span>Item 2</span>
    <span>Item 3</span>
    <span>Item 4</span>
  </Stack>
</Story>

<Story name="As Section" play={playAsSection}>
  <Stack as="section" gap="md" data-testid="stack-section">
    <h2>Section Title</h2>
    <p>Section content paragraph text goes here.</p>
  </Stack>
</Story>

<Story name="None Gap" play={playNoneGap}>
  <Stack gap="none" data-testid="stack-none">
    <Button variant="ghost">A</Button>
    <Button variant="ghost">B</Button>
  </Stack>
</Story>

<Story name="XL Gap" play={playXlGap}>
  <Stack gap="xl" data-testid="stack-xl">
    <Button variant="ghost">Top</Button>
    <Button variant="ghost">Bottom</Button>
  </Stack>
</Story>
