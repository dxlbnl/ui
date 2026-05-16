<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import TagPill from "./TagPill.svelte";

  const { Story } = defineMeta({
    title: "Primitives/TagPill",
    tags: ["autodocs"],
  });

  // Helper: resolve a CSS custom property to its computed RGB value.
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

  // Helper: resolve a CSS custom property to its computed color (foreground).
  const resolveTokenFgColor = (token: string): string => {
    const el = document.createElement("div");
    el.style.color = `var(${token})`;
    el.style.position = "absolute";
    el.style.opacity = "0";
    document.body.appendChild(el);
    const value = getComputedStyle(el).color;
    document.body.removeChild(el);
    return value;
  };

  // ── Default ───────────────────────────────────────────────────────────────
  const playDefault = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("Utility");
    await expect(pill).toBeVisible();
    await expect(getComputedStyle(pill).fontFamily.toLowerCase()).toContain("jetbrains");
    await expect(getComputedStyle(pill).textTransform).toBe("uppercase");
    const inkFaintColor = resolveTokenFgColor("--ink-faint");
    await expect(getComputedStyle(pill).color).toBe(inkFaintColor);
  };

  // ── Amber ─────────────────────────────────────────────────────────────────
  const playAmber = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("Featured");
    await expect(pill).toBeVisible();
    const amberColor = resolveTokenFgColor("--amber");
    await expect(getComputedStyle(pill).color).toBe(amberColor);
    // borderColor resolves as an RGB value; use same helper via background trick
    const amberBgColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(pill).borderColor).toBe(amberBgColor);
  };

  // ── Cyan ──────────────────────────────────────────────────────────────────
  const playCyan = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const pill = canvas.getByText("New");
    await expect(pill).toBeVisible();
    const cyanColor = resolveTokenFgColor("--cyan");
    await expect(getComputedStyle(pill).color).toBe(cyanColor);
    const cyanBgColor = resolveTokenColor("--cyan");
    await expect(getComputedStyle(pill).borderColor).toBe(cyanBgColor);
  };

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

<Story name="Default" play={playDefault}>
  <TagPill>Utility</TagPill>
</Story>

<Story name="Amber" play={playAmber}>
  <TagPill variant="amber">Featured</TagPill>
</Story>

<Story name="Cyan" play={playCyan}>
  <TagPill variant="cyan">New</TagPill>
</Story>

<Story name="Multiple Pills" play={playMultiplePills}>
  <div style="display: flex; align-items: center; gap: 8px;">
    <TagPill>Utility</TagPill>
    <TagPill>Power Supply</TagPill>
    <TagPill variant="amber">Latest</TagPill>
  </div>
</Story>
