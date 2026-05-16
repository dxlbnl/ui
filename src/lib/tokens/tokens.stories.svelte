<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ColorSwatch from "./ColorSwatch.svelte";

  const { Story } = defineMeta({
    title: "Design Tokens/Palette",
    parameters: { layout: "fullscreen" },
  });

  const colorGroups = [
    { label: "Surfaces", tokens: ["--bg", "--bg-rail", "--bg-elev", "--bg-sunken"] },
    { label: "Ink", tokens: ["--ink", "--ink-dim", "--ink-faint"] },
    { label: "Rules", tokens: ["--rule", "--rule-strong"] },
    { label: "Accents", tokens: ["--amber", "--cyan", "--danger", "--ok"] },
  ];
</script>

<Story name="Color Palette"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bgSwatch = canvas.getByTestId("--bg");
    await expect(getComputedStyle(bgSwatch).backgroundColor.startsWith("rgb")).toBe(true);
    const amberSwatch = canvas.getByTestId("--amber");
    await expect(getComputedStyle(amberSwatch).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  }}>
  <ColorSwatch groups={colorGroups} />
</Story>

<Story name="Typography Scale"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByTestId("scale-h1")).fontSize).toBe("72px");
    await expect(getComputedStyle(canvas.getByTestId("scale-h2")).fontSize).toBe("36px");
    await expect(getComputedStyle(canvas.getByTestId("scale-h3")).fontSize).toBe("24px");
    await expect(getComputedStyle(canvas.getByTestId("scale-lede")).fontSize).toBe("19px");
    await expect(getComputedStyle(canvas.getByTestId("scale-body")).fontSize).toBe("16px");
    const mono = canvas.getByTestId("scale-mono");
    await expect(getComputedStyle(mono).textTransform).toBe("uppercase");
    await expect(getComputedStyle(mono).fontFamily.toLowerCase().includes("jetbrains") || getComputedStyle(mono).fontFamily.toLowerCase().includes("mono")).toBe(true);
    const eyebrow = canvas.getByTestId("scale-eyebrow");
    await expect(getComputedStyle(eyebrow).fontSize).toBe("12px");
  }}>
  <div style="padding: 24px; background: var(--bg); color: var(--ink); display: flex; flex-direction: column; gap: 20px;">
    <div>
      <p class="eyebrow" style="margin-bottom: 6px; color: var(--ink-faint);">.display-heading</p>
      <div class="display-heading" style="overflow: hidden; line-height: 1; max-height: 160px;">Dx</div>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: 6px; color: var(--ink-faint);">.hero-heading</p>
      <div class="hero-heading" style="overflow: hidden; white-space: nowrap;">Dexterlabs</div>
    </div>
    <div style="border-top: 1px solid var(--rule); padding-top: 20px; display: flex; flex-direction: column; gap: 16px;">
      <div data-testid="scale-h1" class="h1">H1 — Design System</div>
      <div data-testid="scale-h2" class="h2">H2 — Design System</div>
      <div data-testid="scale-h3" class="h3">H3 — Design System</div>
    </div>
    <div style="border-top: 1px solid var(--rule); padding-top: 20px; display: flex; flex-direction: column; gap: 12px;">
      <p data-testid="scale-lede" class="body-lede">Lede — a brief, impactful opening sentence that draws the reader in.</p>
      <p data-testid="scale-body" class="body-text">Body text — the quick brown fox jumps over the lazy dog.</p>
      <div data-testid="scale-mono" class="mono-label">Status · Active · v1.0</div>
      <p data-testid="scale-eyebrow" class="eyebrow">Category label</p>
    </div>
  </div>
</Story>

<Story name="Spacing Scale"
  play={async ({ canvasElement }) => {
    await expect(canvasElement.firstElementChild).toBeVisible();
    const probe = document.createElement("div");
    probe.style.width = "var(--u4)";
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).width;
    document.body.removeChild(probe);
    await expect(resolved).toBe("32px");
  }}>
  <div style="padding: 24px; background: var(--bg); color: var(--ink); display: flex; flex-direction: column; gap: 16px;">
    <p class="eyebrow" style="color: var(--ink-faint); margin-bottom: 8px;">Spacing Scale — base unit 8px</p>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <span class="mono-label" style="width: 60px; color: var(--ink-faint);">--u</span>
        <div style="height: 16px; width: var(--u); background: var(--amber);"></div>
        <span class="mono-label" style="color: var(--ink-dim);">8px</span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span class="mono-label" style="width: 60px; color: var(--ink-faint);">--u2</span>
        <div style="height: 16px; width: var(--u2); background: var(--amber);"></div>
        <span class="mono-label" style="color: var(--ink-dim);">16px</span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span class="mono-label" style="width: 60px; color: var(--ink-faint);">--u3</span>
        <div style="height: 16px; width: var(--u3); background: var(--amber);"></div>
        <span class="mono-label" style="color: var(--ink-dim);">24px</span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span class="mono-label" style="width: 60px; color: var(--ink-faint);">--u4</span>
        <div style="height: 16px; width: var(--u4); background: var(--amber);"></div>
        <span class="mono-label" style="color: var(--ink-dim);">32px</span>
      </div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <span class="mono-label" style="width: 60px; color: var(--ink-faint);">--u5</span>
        <div style="height: 16px; width: var(--u5); background: var(--amber);"></div>
        <span class="mono-label" style="color: var(--ink-dim);">40px</span>
      </div>
    </div>
  </div>
</Story>
