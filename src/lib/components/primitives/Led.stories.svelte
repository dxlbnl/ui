<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Led from "./Led.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Primitives/Led",
    component: Led,
    tags: ["autodocs"],
  });

  // ── Ok ────────────────────────────────────────────────────────────────────
  const playOk = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = within(canvasElement).getByRole("status");
    await expect(el).toBeVisible();
    await expect(getComputedStyle(el).width).toBe("7px");
    await expect(getComputedStyle(el).height).toBe("7px");
    const okColor = resolveTokenColor("--ok");
    await expect(getComputedStyle(el).backgroundColor).toBe(okColor);
    await expect(getComputedStyle(el).borderRadius).toBe("50%");
  };

  // ── Amber ─────────────────────────────────────────────────────────────────
  const playAmber = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = within(canvasElement).getByRole("status");
    await expect(el).toBeVisible();
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(el).backgroundColor).toBe(amberColor);
  };

  // ── Cyan ──────────────────────────────────────────────────────────────────
  const playCyan = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = within(canvasElement).getByRole("status");
    await expect(el).toBeVisible();
    const cyanColor = resolveTokenColor("--cyan");
    await expect(getComputedStyle(el).backgroundColor).toBe(cyanColor);
  };

  // ── Danger ────────────────────────────────────────────────────────────────
  const playDanger = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = within(canvasElement).getByRole("status");
    await expect(el).toBeVisible();
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(el).backgroundColor).toBe(dangerColor);
  };

  // ── Off ───────────────────────────────────────────────────────────────────
  const playOff = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = within(canvasElement).getByRole("status");
    await expect(el).toBeVisible();
    const inkFaintColor = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(el).backgroundColor).toBe(inkFaintColor);
    await expect(getComputedStyle(el).boxShadow).toBe("none");
  };

  // ── Blink ─────────────────────────────────────────────────────────────────
  const playBlink = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = within(canvasElement).getByRole("status");
    await expect(el).toBeVisible();
    await expect(getComputedStyle(el).animationName).not.toBe("none");
  };
</script>

<Story name="Ok" args={{ color: "ok", "aria-label": "Status: ok" }} play={playOk} />

<Story name="Amber" args={{ color: "amber", "aria-label": "Status: amber" }} play={playAmber} />

<Story name="Cyan" args={{ color: "cyan", "aria-label": "Status: cyan" }} play={playCyan} />

<Story name="Danger" args={{ color: "danger", "aria-label": "Status: danger" }} play={playDanger} />

<Story name="Off" args={{ color: "off", "aria-label": "Status: off" }} play={playOff} />

<Story name="Blink" args={{ color: "amber", blink: true, "aria-label": "Status: blinking" }} play={playBlink} />
