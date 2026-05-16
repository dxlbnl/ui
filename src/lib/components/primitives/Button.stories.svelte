<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Button from "./Button.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Button",
    tags: ["autodocs"],
  });

  // Helper: resolve a CSS custom property value from the document root.
  const resolveToken = (token: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(token)
      .trim();
  };

  // Helper: get RGB string for a CSS custom property by rendering it on a
  // throw-away element. Returns the computed backgroundColor string.
  const resolveTokenColor = (token: string): string => {
    const el = document.createElement("div");
    el.style.backgroundColor = `var(${token})`;
    el.style.position = "absolute";
    el.style.opacity = "0";
    document.body.appendChild(el);
    const value = getComputedStyle(el).backgroundColor;
    document.body.removeChild(el);
    return value;
  };

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

<Story name="Primary" play={playPrimary}>
  <Button variant="primary">Order Now</Button>
</Story>

<Story name="Primary Disabled" play={playPrimaryDisabled}>
  <Button variant="primary" disabled>Disabled</Button>
</Story>

<Story name="CTA" play={playCTA}>
  <Button variant="cta">View Project →</Button>
</Story>

<Story name="CTA Disabled" play={playCTADisabled}>
  <Button variant="cta" disabled>Disabled</Button>
</Story>

<Story name="Ghost" play={playGhost}>
  <Button variant="ghost">View All Hardware →</Button>
</Story>

<Story name="Back" play={playBack}>
  <Button variant="back">← Back to Catalogue</Button>
</Story>

<Story name="Del" play={playDel}>
  <Button variant="del">Remove</Button>
</Story>

<Story name="As Link" play={playAsLink}>
  <Button as="a" href="#demo" variant="ghost">View Demo →</Button>
</Story>
