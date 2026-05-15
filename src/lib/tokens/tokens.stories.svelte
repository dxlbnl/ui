<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ColorSwatch from "./ColorSwatch.svelte";

  const { Story } = defineMeta({
    title: "Tokens/Design Tokens",
    parameters: { layout: "fullscreen" },
  });

  const colorGroups = [
    { label: "Surfaces", tokens: ["--bg", "--bg-rail", "--bg-elev", "--bg-sunken"] },
    { label: "Ink", tokens: ["--ink", "--ink-dim", "--ink-faint"] },
    { label: "Rules", tokens: ["--rule", "--rule-strong"] },
    { label: "Accents", tokens: ["--amber", "--cyan", "--danger", "--ok"] },
  ];

  const playColorTokens = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const bgSwatch = canvas.getByTestId("--bg");
    await expect(bgSwatch).toBeVisible();
    await expect(getComputedStyle(bgSwatch).backgroundColor.startsWith("rgb")).toBe(true);
    const amberSwatch = canvas.getByTestId("--amber");
    await expect(amberSwatch).toBeVisible();
    await expect(getComputedStyle(amberSwatch).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  };

  const playTypeScale = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await expect(getComputedStyle(canvas.getByTestId("scale-h1")).fontSize).toBe("72px");
    await expect(getComputedStyle(canvas.getByTestId("scale-h2")).fontSize).toBe("36px");
    await expect(getComputedStyle(canvas.getByTestId("scale-h3")).fontSize).toBe("24px");
    await expect(getComputedStyle(canvas.getByTestId("scale-lede")).fontSize).toBe("19px");
    await expect(getComputedStyle(canvas.getByTestId("scale-body")).fontSize).toBe("16px");
  };

  const playLabels = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const mono = canvas.getByTestId("label-mono");
    await expect(getComputedStyle(mono).fontFamily.toLowerCase()).toContain("jetbrains");
    await expect(getComputedStyle(mono).textTransform).toBe("uppercase");
    const eyebrow = canvas.getByTestId("label-eyebrow");
    await expect(getComputedStyle(eyebrow).fontSize).toBe("12px");
    await expect(getComputedStyle(eyebrow).textTransform).toBe("uppercase");
  };

  const playSemanticElements = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const code = canvas.getByTestId("sem-code");
    await expect(getComputedStyle(code).fontFamily.toLowerCase()).toContain("jetbrains");
    const blockquote = canvas.getByTestId("sem-blockquote");
    await expect(getComputedStyle(blockquote).borderLeftWidth).toBe("2px");
    await expect(getComputedStyle(blockquote).borderLeftStyle).toBe("solid");
    const th = canvas.getByTestId("sem-th");
    await expect(getComputedStyle(th).textTransform).toBe("uppercase");
  };
</script>

<Story name="Color Tokens" play={playColorTokens}>
  <ColorSwatch groups={colorGroups} />
</Story>

<Story name="Type Scale" play={playTypeScale}>
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
      <p data-testid="scale-body" class="body-text">Body text — the quick brown fox jumps over the lazy dog. Regular body copy at 16px with comfortable line height for extended reading.</p>
    </div>
  </div>
</Story>

<Story name="Labels" play={playLabels}>
  <div style="padding: 24px; background: var(--bg); color: var(--ink); display: flex; flex-direction: column; gap: 32px;">
    <div>
      <p class="eyebrow" style="margin-bottom: 12px; color: var(--ink-faint);">.mono-label</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="mono-label" data-testid="label-mono">Status · Active · v1.0</div>
        <div class="mono-label">Project — DXLB-0042 · In Review</div>
        <div class="mono-label" style="color: var(--amber);">Warning · Threshold exceeded</div>
        <div class="mono-label" style="color: var(--cyan);">Info · Sync complete</div>
        <div class="mono-label" style="color: var(--danger);">Error · Connection refused</div>
      </div>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: 12px; color: var(--ink-faint);">.eyebrow</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <p class="eyebrow" data-testid="label-eyebrow">Category label</p>
        <p class="eyebrow">Section heading</p>
        <p class="eyebrow" style="color: var(--amber);">Featured</p>
      </div>
    </div>
  </div>
</Story>

<Story name="Semantic Elements" play={playSemanticElements}>
  <div style="padding: 24px; background: var(--bg); color: var(--ink); display: flex; flex-direction: column; gap: 24px; max-width: 720px;">
    <div>
      <p class="eyebrow" style="margin-bottom: 8px; color: var(--ink-faint);">code</p>
      <p class="body-text">Set the background with <code data-testid="sem-code">var(--bg)</code> and the foreground with <code>var(--ink)</code>.</p>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: 8px; color: var(--ink-faint);">pre</p>
      <pre data-testid="sem-pre">const palette = document.documentElement
  .getAttribute('data-palette') ?? 'phosphor';</pre>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: 8px; color: var(--ink-faint);">blockquote</p>
      <blockquote data-testid="sem-blockquote">Design is not just what it looks like and feels like. Design is how it works.</blockquote>
    </div>
    <div>
      <p class="eyebrow" style="margin-bottom: 8px; color: var(--ink-faint);">table</p>
      <table>
        <thead>
          <tr>
            <th data-testid="sem-th">Token</th>
            <th>Phosphor</th>
            <th>Paper</th>
            <th>Usage</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>--bg</td><td>#0b0d0c</td><td>#efece4</td><td>Page background</td></tr>
          <tr><td>--ink</td><td>#d6e2dc</td><td>#14110b</td><td>Primary text</td></tr>
          <tr><td>--amber</td><td>#ffb347</td><td>#a04e00</td><td>Accent / active</td></tr>
          <tr><td>--rule</td><td>#1d2321</td><td>#cfcabc</td><td>Dividers / borders</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</Story>
