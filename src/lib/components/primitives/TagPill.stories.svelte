<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import TagPill from "./TagPill.svelte";
  import Inline from "$lib/components/layout/Inline.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Primitives/TagPill",
    component: TagPill,
    tags: ["autodocs"],
  });
</script>

<Story
  name="Default"
  args={{ variant: "default" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("Utility");
    await expect(pill).toBeVisible();
    await expect(getComputedStyle(pill).fontFamily.toLowerCase()).toContain(
      "jetbrains",
    );
    await expect(getComputedStyle(pill).textTransform).toBe("uppercase");
    const bgColor = resolveTokenFgColor("--bg");
    await expect(getComputedStyle(pill).color).toBe(bgColor);
    const dimBgColor = resolveTokenColor("--ink-dim");
    await expect(getComputedStyle(pill).backgroundColor).toBe(dimBgColor);
  }}
>
  Utility
</Story>

<Story
  name="Amber"
  args={{ variant: "amber" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("Featured");
    await expect(pill).toBeVisible();
    const bgColor = resolveTokenFgColor("--bg");
    await expect(getComputedStyle(pill).color).toBe(bgColor);
    const amberBgColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(pill).backgroundColor).toBe(amberBgColor);
  }}
>
  Featured
</Story>

<Story
  name="Cyan"
  args={{ variant: "cyan" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("New");
    await expect(pill).toBeVisible();
    const bgColor = resolveTokenFgColor("--bg");
    await expect(getComputedStyle(pill).color).toBe(bgColor);
    const cyanBgColor = resolveTokenColor("--cyan");
    await expect(getComputedStyle(pill).backgroundColor).toBe(cyanBgColor);
  }}
>
  New
</Story>

<Story
  name="Multiple Pills"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const utility = canvas.getByText("Utility");
    const powerSupply = canvas.getByText("Power Supply");
    const latest = canvas.getByText("Latest");
    await expect(utility).toBeVisible();
    await expect(powerSupply).toBeVisible();
    await expect(latest).toBeVisible();
    const inkFaintColor = resolveTokenFgColor("--ink-faint");
    await expect(getComputedStyle(latest).color).not.toBe(inkFaintColor);
  }}
>
  {#snippet template()}
    <Inline gap="sm">
      <TagPill>Utility</TagPill>
      <TagPill>Power Supply</TagPill>
      <TagPill variant="amber">Latest</TagPill>
    </Inline>
  {/snippet}
</Story>
