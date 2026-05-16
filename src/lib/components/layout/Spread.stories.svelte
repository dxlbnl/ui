<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Spread from "./Spread.svelte";
  import Button from "../primitives/Button.svelte";
  import Led from "../primitives/Led.svelte";
  import TagPill from "../primitives/TagPill.svelte";

  const { Story } = defineMeta({
    title: "Layout/Spread",
    component: Spread,
    tags: ["autodocs"],
  });

  // ── Section Header ────────────────────────────────────────────────────────
  const playSectionHeader = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.display).toBe("flex");
    await expect(style.justifyContent).toBe("space-between");
    // aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  };

  // ── Led Status Bar ────────────────────────────────────────────────────────
  const playLedStatusBar = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.justifyContent).toBe("space-between");
    // Spread always has a fixed gap of var(--u2) = 16px — non-zero
    const gap = style.gap || style.columnGap;
    await expect(gap).not.toBe("0px");
  };
</script>

<Story name="Section Header" args={{ "aria-label": "test-label" }} play={playSectionHeader}>
  <span class="mono-label">System Status</span>
  <Button variant="ghost">View All →</Button>
</Story>

<Story name="Led Status Bar" play={playLedStatusBar}>
  <span style="display: flex; align-items: center; gap: 8px;">
    <Led color="ok" aria-label="Status: ok" />
    <span>All systems nominal</span>
  </span>
  <TagPill variant="amber">Live</TagPill>
</Story>
