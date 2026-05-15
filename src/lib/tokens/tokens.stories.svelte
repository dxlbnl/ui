<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ColorSwatch from "./ColorSwatch.svelte";
  import TypeSpecimen from "./TypeSpecimen.svelte";

  const { Story } = defineMeta({
    title: "Tokens/Design Tokens",
    parameters: { layout: "fullscreen" },
  });

  const phosphorGroups = [
    {
      label: "Surfaces",
      tokens: [
        { name: "--bg", value: "#0b0d0c" },
        { name: "--bg-rail", value: "#0f1211" },
        { name: "--bg-elev", value: "#141817" },
        { name: "--bg-sunken", value: "#070908" },
      ],
    },
    {
      label: "Ink",
      tokens: [
        { name: "--ink", value: "#d6e2dc" },
        { name: "--ink-dim", value: "#a4b0a9" },
        { name: "--ink-faint", value: "#7a8580" },
      ],
    },
    {
      label: "Rules",
      tokens: [
        { name: "--rule", value: "#1d2321" },
        { name: "--rule-strong", value: "#2a3330" },
      ],
    },
    {
      label: "Accents",
      tokens: [
        { name: "--amber", value: "#ffb347" },
        { name: "--cyan", value: "#7cc7d1" },
        { name: "--danger", value: "#ff7a6b" },
        { name: "--ok", value: "#8fd48a" },
      ],
    },
  ];

  const paperGroups = [
    {
      label: "Surfaces (Paper)",
      tokens: [
        { name: "--bg", value: "#efece4" },
        { name: "--bg-rail", value: "#e6e2d6" },
        { name: "--bg-elev", value: "#f5f2ea" },
        { name: "--bg-sunken", value: "#dfdbce" },
      ],
    },
    {
      label: "Ink (Paper)",
      tokens: [
        { name: "--ink", value: "#14110b" },
        { name: "--ink-dim", value: "#3f3b30" },
        { name: "--ink-faint", value: "#5f5a4a" },
      ],
    },
    {
      label: "Rules (Paper)",
      tokens: [
        { name: "--rule", value: "#cfcabc" },
        { name: "--rule-strong", value: "#a8a192" },
      ],
    },
    {
      label: "Accents (Paper)",
      tokens: [
        { name: "--amber", value: "#a04e00" },
        { name: "--cyan", value: "#030304" },
        { name: "--danger", value: "#a83224" },
        { name: "--ok", value: "#356b31" },
      ],
    },
  ];

  const playPhosphor = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    const bgSwatch = canvas.getByTestId("--bg");
    await expect(bgSwatch).toBeVisible();
    await expect(getComputedStyle(bgSwatch).backgroundColor).toBe(
      "rgb(11, 13, 12)",
    );
    const amberSwatch = canvas.getByTestId("--amber");
    await expect(getComputedStyle(amberSwatch).backgroundColor).toBe(
      "rgb(255, 179, 71)",
    );
  };

  const playPaper = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    const bgSwatch = canvas.getByTestId("--bg");
    await expect(bgSwatch).toBeVisible();
    await expect(getComputedStyle(bgSwatch).backgroundColor).toBe(
      "rgb(239, 236, 228)",
    );
    const amberSwatch = canvas.getByTestId("--amber");
    await expect(getComputedStyle(amberSwatch).backgroundColor).toBe(
      "rgb(160, 78, 0)",
    );
  };

  const playTypeScale = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    const h1 = canvas.getByTestId("specimen-h1");
    await expect(getComputedStyle(h1).fontSize).toBe("72px");
    const monoLabel = canvas.getByTestId("specimen-mono-label");
    await expect(
      getComputedStyle(monoLabel).fontFamily.toLowerCase(),
    ).toContain("jetbrains mono");
    await expect(getComputedStyle(monoLabel).textTransform).toBe("uppercase");
  };

  const playBaseReset = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    const p = canvas.getByTestId("reset-p");
    await expect(getComputedStyle(p).marginTop).toBe("0px");
    const btn = canvas.getByRole("button");
    await expect(getComputedStyle(btn).backgroundColor).toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(getComputedStyle(btn).paddingTop).toBe("0px");
  };

  const playPaletteSwitching = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const wrapper = canvasElement.querySelector(
      "#palette-wrapper",
    ) as HTMLElement;
    const box = canvasElement.querySelector("#palette-box") as HTMLElement;
    await expect(wrapper).toBeTruthy();

    // Default: Phosphor — --bg = #0b0d0c = rgb(11, 13, 12)
    await expect(getComputedStyle(box).backgroundColor).toBe("rgb(11, 13, 12)");

    // Switch to Paper
    wrapper.setAttribute("data-palette", "paper");
    await expect(getComputedStyle(box).backgroundColor).toBe(
      "rgb(239, 236, 228)",
    );

    // Switch back
    wrapper.removeAttribute("data-palette");
    await expect(getComputedStyle(box).backgroundColor).toBe("rgb(11, 13, 12)");
  };

  const playTypographyClasses = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    await expect(
      getComputedStyle(canvas.getByTestId("specimen-h2")).fontSize,
    ).toBe("36px");
    await expect(
      getComputedStyle(canvas.getByTestId("specimen-h3")).fontSize,
    ).toBe("24px");
    await expect(
      getComputedStyle(canvas.getByTestId("specimen-body-text")).fontSize,
    ).toBe("16px");
    await expect(
      getComputedStyle(canvas.getByTestId("specimen-body-lede")).fontSize,
    ).toBe("19px");
    await expect(
      getComputedStyle(canvas.getByTestId("specimen-eyebrow")).fontSize,
    ).toBe("12px");
  };

  const playSemanticElements = async ({
    canvasElement,
  }: {
    canvasElement: HTMLElement;
  }) => {
    const canvas = within(canvasElement);
    const code = canvas.getByTestId("specimen-code");
    await expect(
      getComputedStyle(code).fontFamily.toLowerCase(),
    ).toContain("jetbrains mono");
    await expect(getComputedStyle(code).color).toBe("rgb(124, 199, 209)");

    const pre = canvas.getByTestId("specimen-pre");
    await expect(
      getComputedStyle(pre).fontFamily.toLowerCase(),
    ).toContain("jetbrains mono");

    const blockquote = canvas.getByTestId("specimen-blockquote");
    await expect(getComputedStyle(blockquote).borderLeftWidth).toBe("2px");
    await expect(getComputedStyle(blockquote).borderLeftStyle).toBe("solid");

    const th = canvas.getByTestId("specimen-th");
    await expect(getComputedStyle(th).textTransform).toBe("uppercase");

    const td = canvas.getByTestId("specimen-td");
    await expect(getComputedStyle(td).paddingTop).toBe("8px");
  };
</script>

<!-- Phosphor palette — dark default -->
<Story name="PhosphorPalette" play={playPhosphor}>
  <ColorSwatch groups={phosphorGroups} palette="phosphor" />
</Story>

<!-- Paper palette — light override -->
<Story name="PaperPalette" play={playPaper}>
  <ColorSwatch groups={paperGroups} palette="paper" />
</Story>

<!-- Typography scale + semantic elements -->
<Story name="TypeScale" play={playTypeScale}>
  <TypeSpecimen />
</Story>

<!-- Palette switching — dynamic data-palette toggle -->
<Story name="PaletteSwitching" play={playPaletteSwitching}>
  <div id="palette-wrapper" style="padding: 24px; background: var(--bg); color: var(--ink);">
    <div id="palette-box" style="width: 120px; height: 80px; background: var(--bg); border: 1px solid var(--rule);"></div>
  </div>
</Story>

<!-- Typography classes — all utility class computed sizes -->
<Story name="TypographyClasses" play={playTypographyClasses}>
  <TypeSpecimen />
</Story>

<!-- Semantic elements — code, pre, blockquote, table styles -->
<Story name="SemanticElements" play={playSemanticElements}>
  <TypeSpecimen />
</Story>

<!-- Base reset -->
<Story name="BaseReset" play={playBaseReset}>
  <div
    style="padding: 24px; background: var(--bg); color: var(--ink); font-family: var(--sans);"
  >
    <p data-testid="reset-p">Paragraph with margin: 0.</p>
    <button>Unstyled button</button>
  </div>
</Story>
