<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Led from "./Led.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Led",
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

  // ── Ok ────────────────────────────────────────────────────────────────────
  const playOk = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("[aria-label]") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    await expect(getComputedStyle(el).width).toBe("7px");
    await expect(getComputedStyle(el).height).toBe("7px");
    const okColor = resolveTokenColor("--ok");
    await expect(getComputedStyle(el).backgroundColor).toBe(okColor);
    await expect(getComputedStyle(el).borderRadius).toBe("50%");
  };

  // ── Amber ─────────────────────────────────────────────────────────────────
  const playAmber = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("[aria-label]") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(el).backgroundColor).toBe(amberColor);
  };

  // ── Cyan ──────────────────────────────────────────────────────────────────
  const playCyan = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("[aria-label]") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    const cyanColor = resolveTokenColor("--cyan");
    await expect(getComputedStyle(el).backgroundColor).toBe(cyanColor);
  };

  // ── Danger ────────────────────────────────────────────────────────────────
  const playDanger = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("[aria-label]") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(el).backgroundColor).toBe(dangerColor);
  };

  // ── Off ───────────────────────────────────────────────────────────────────
  const playOff = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("[aria-label]") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    const inkFaintColor = resolveTokenColor("--ink-faint");
    await expect(getComputedStyle(el).backgroundColor).toBe(inkFaintColor);
    await expect(getComputedStyle(el).boxShadow).toBe("none");
  };

  // ── Blink ─────────────────────────────────────────────────────────────────
  const playBlink = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const el = canvasElement.querySelector("[aria-label]") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    await expect(getComputedStyle(el).animationName).not.toBe("none");
  };

  // ── Paired With Text ──────────────────────────────────────────────────────
  const playPairedWithText = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("[aria-label='System ok']") as HTMLElement;
    await expect(el).not.toBeNull();
    await expect(el).toBeVisible();
    const textSpan = canvas.getByText("System ok");
    await expect(textSpan).toBeVisible();
  };
</script>

<Story name="Ok" play={playOk}>
  <Led color="ok" aria-label="Status: ok" />
</Story>

<Story name="Amber" play={playAmber}>
  <Led color="amber" aria-label="Status: amber" />
</Story>

<Story name="Cyan" play={playCyan}>
  <Led color="cyan" aria-label="Status: cyan" />
</Story>

<Story name="Danger" play={playDanger}>
  <Led color="danger" aria-label="Status: danger" />
</Story>

<Story name="Off" play={playOff}>
  <Led color="off" aria-label="Status: off" />
</Story>

<Story name="Blink" play={playBlink}>
  <Led color="amber" blink={true} aria-label="Status: blinking" />
</Story>

<Story name="Paired With Text" play={playPairedWithText}>
  <div style="display: flex; align-items: center; gap: 8px;">
    <Led color="ok" aria-label="System ok" />
    <span>System ok</span>
  </div>
</Story>
