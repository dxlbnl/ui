<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Button from "./Button.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Primitives/Button",
    component: Button,
    tags: ["autodocs"],
  });

  // ── Primary ──────────────────────────────────────────────────────────────
  const playPrimary = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    const amberColor = resolveTokenColor("--amber");
    const bgColor = resolveTokenColor("--bg");
    await expect(getComputedStyle(btn).backgroundColor).toBe(amberColor);
    await expect(getComputedStyle(btn).color).toBe(bgColor);
    await expect(getComputedStyle(btn).textTransform).toBe("uppercase");
  };

  // ── Primary Disabled ─────────────────────────────────────────────────────
  const playPrimaryDisabled = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
    await expect(getComputedStyle(btn).opacity).toBe("0.5");
    await expect(getComputedStyle(btn).cursor).toBe("not-allowed");
  };

  // ── CTA ──────────────────────────────────────────────────────────────────
  const playCTA = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(btn).color).toBe(amberColor);
    await expect(getComputedStyle(btn).borderColor).toBe(amberColor);
  };

  // ── CTA Disabled ─────────────────────────────────────────────────────────
  const playCTADisabled = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
    await expect(getComputedStyle(btn).opacity).toBe("0.5");
  };

  // ── Ghost ─────────────────────────────────────────────────────────────────
  const playGhost = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(getComputedStyle(btn).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(btn).color).toBe(amberColor);
  };

  // ── Back ──────────────────────────────────────────────────────────────────
  const playBack = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    const inkFaintColor = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(btn).color).toBe(inkFaintColor);
  };

  // ── Del ───────────────────────────────────────────────────────────────────
  const playDel = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(getComputedStyle(btn).borderStyle).not.toBe("none");
    const inkFaintColor = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(btn).color).toBe(inkFaintColor);
  };

  // ── As Link ───────────────────────────────────────────────────────────────
  const playAsLink = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "#demo");
    await expect(link.tagName).toBe("A");
  };
</script>

<Story name="Primary" args={{ variant: "primary" }} play={playPrimary}>
  Order Now
</Story>

<Story name="Primary Disabled" args={{ variant: "primary", disabled: true }} play={playPrimaryDisabled}>
  Disabled
</Story>

<Story name="CTA" args={{ variant: "cta" }} play={playCTA}>
  View Project →
</Story>

<Story name="CTA Disabled" args={{ variant: "cta", disabled: true }} play={playCTADisabled}>
  Disabled
</Story>

<Story name="Ghost" args={{ variant: "ghost" }} play={playGhost}>
  View All Hardware →
</Story>

<Story name="Back" args={{ variant: "back" }} play={playBack}>
  ← Back to Catalogue
</Story>

<Story name="Del" args={{ variant: "del" }} play={playDel}>
  Remove
</Story>

<Story name="As Link" args={{ as: "a", href: "#demo", variant: "ghost" }} play={playAsLink}>
  View Demo →
</Story>
