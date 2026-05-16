<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import TagPill from "./TagPill.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Primitives/TagPill Composition",
    tags: ["autodocs"],
  });

  // ── Multiple Pills ────────────────────────────────────────────────────────
  const playMultiplePills = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const utility = canvas.getByText("Utility");
    const powerSupply = canvas.getByText("Power Supply");
    const latest = canvas.getByText("Latest");
    await expect(utility).toBeVisible();
    await expect(powerSupply).toBeVisible();
    await expect(latest).toBeVisible();
    // "Latest" pill uses variant="amber" — its color must differ from --ink-faint
    const inkFaintColor = resolveTokenFgColor("--ink-faint");
    await expect(getComputedStyle(latest).color).not.toBe(inkFaintColor);
  };
</script>

<Story name="Multiple Pills" play={playMultiplePills}>
  <div style="display: flex; align-items: center; gap: 8px;">
    <TagPill>Utility</TagPill>
    <TagPill>Power Supply</TagPill>
    <TagPill variant="amber">Latest</TagPill>
  </div>
</Story>
