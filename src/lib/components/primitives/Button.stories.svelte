<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Button from "./Button.svelte";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Primitives/Button",
    component: Button,
    tags: ["autodocs"],
  });
</script>

<Story name="Primary" args={{ variant: "primary" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    const amberColor = resolveTokenColor("--amber");
    const bgColor = resolveTokenColor("--bg");
    await expect(getComputedStyle(btn).backgroundColor).toBe(amberColor);
    await expect(getComputedStyle(btn).color).toBe(bgColor);
    await expect(getComputedStyle(btn).textTransform).toBe("uppercase");
  }}>
  Order Now
</Story>

<Story name="Primary Disabled" args={{ variant: "primary", disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
    await expect(getComputedStyle(btn).opacity).toBe("0.5");
    await expect(getComputedStyle(btn).cursor).toBe("not-allowed");
  }}>
  Disabled
</Story>

<Story name="CTA" args={{ variant: "cta" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(btn).color).toBe(amberColor);
    await expect(getComputedStyle(btn).borderColor).toBe(amberColor);
  }}>
  View Project →
</Story>

<Story name="CTA Disabled" args={{ variant: "cta", disabled: true }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
    await expect(getComputedStyle(btn).opacity).toBe("0.5");
  }}>
  Disabled
</Story>

<Story name="Ghost" args={{ variant: "ghost" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(getComputedStyle(btn).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(btn).color).toBe(amberColor);
  }}>
  View All Hardware →
</Story>

<Story name="Back" args={{ variant: "back" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    const inkFaintColor = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(btn).color).toBe(inkFaintColor);
  }}>
  ← Back to Catalogue
</Story>

<Story name="Del" args={{ variant: "del" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await expect(getComputedStyle(btn).borderStyle).not.toBe("none");
    const inkFaintColor = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(btn).color).toBe(inkFaintColor);
  }}>
  Remove
</Story>

<Story name="As Link" args={{ as: "a", href: "#demo", variant: "ghost" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link");
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "#demo");
    await expect(link.tagName).toBe("A");
  }}>
  View Demo →
</Story>

<!-- AC-B28-1 (2,3,4) -->
<Story name="Nav Variant" args={{ variant: "nav" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button");
    await expect(btn).toBeVisible();

    // AC-2: element has class btn-nav
    await expect(btn.classList.contains("btn-nav")).toBe(true);

    // AC-3: computed color matches --ink-faint
    const inkFaintColor = resolveTokenFgColor("--ink-faint");
    await expect(getComputedStyle(btn).color).toBe(inkFaintColor);

    // AC-4: background-color is transparent
    await expect(getComputedStyle(btn).backgroundColor).toBe("rgba(0, 0, 0, 0)");
  }}>
  ◐
</Story>
