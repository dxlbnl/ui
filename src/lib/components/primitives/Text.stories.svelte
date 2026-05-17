<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Text from "./Text.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Text",
    component: Text,
    tags: ["autodocs"],
  });
</script>

<!-- AC-4: variant="body" renders <p class="body-text"> -->
<!-- AC-9: default variant renders body-text -->
<Story name="Body" args={{ variant: "body" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("P");
    await expect(root.classList.contains("body-text")).toBe(true);
  }}>
  The quick brown fox jumps over the lazy dog.
</Story>

<!-- AC-5: variant="lede" renders <p class="body-lede"> -->
<Story name="Lede" args={{ variant: "lede" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("P");
    await expect(root.classList.contains("body-lede")).toBe(true);
  }}>
  A brief but compelling opening paragraph that sets the stage.
</Story>

<!-- AC-6: variant="mono" renders <span class="mono-label"> -->
<Story name="Mono" args={{ variant: "mono" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("SPAN");
    await expect(root.classList.contains("mono-label")).toBe(true);
    await expect(getComputedStyle(root).textTransform).toBe("uppercase");
  }}>
  READ →
</Story>

<!-- AC-7: variant="eyebrow" renders <span class="eyebrow"> -->
<Story name="Eyebrow" args={{ variant: "eyebrow" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("SPAN");
    await expect(root.classList.contains("eyebrow")).toBe(true);
    await expect(getComputedStyle(root).textTransform).toBe("uppercase");
  }}>
  Category
</Story>

<!-- AC-10 through AC-14: color prop maps to inline CSS custom properties -->
<Story name="Colors" args={{ variant: "body" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const inkEl = canvas.getByTestId("color-ink");
    await expect(inkEl.getAttribute("style")).toContain("var(--ink)");

    const dimEl = canvas.getByTestId("color-dim");
    await expect(dimEl.getAttribute("style")).toContain("var(--ink-dim)");

    const faintEl = canvas.getByTestId("color-faint");
    await expect(faintEl.getAttribute("style")).toContain("var(--ink-faint)");

    const amberEl = canvas.getByTestId("color-amber");
    await expect(amberEl.getAttribute("style")).toContain("var(--amber)");

    const cyanEl = canvas.getByTestId("color-cyan");
    await expect(cyanEl.getAttribute("style")).toContain("var(--cyan)");

    const okEl = canvas.getByTestId("color-ok");
    await expect(okEl.getAttribute("style")).toContain("var(--ok)");

    const dangerEl = canvas.getByTestId("color-danger");
    await expect(dangerEl.getAttribute("style")).toContain("var(--danger)");

    const noColorEl = canvas.getByTestId("color-none");
    const styleAttr = noColorEl.getAttribute("style");
    await expect(!styleAttr || !styleAttr.includes("color:")).toBe(true);
  }}>
  <Text color="ink" data-testid="color-ink">Ink text</Text>
  <Text color="dim" data-testid="color-dim">Dim text</Text>
  <Text color="faint" data-testid="color-faint">Faint text</Text>
  <Text color="amber" data-testid="color-amber">Amber text</Text>
  <Text color="cyan" data-testid="color-cyan">Cyan text</Text>
  <Text color="ok" data-testid="color-ok">OK text</Text>
  <Text color="danger" data-testid="color-danger">Danger text</Text>
  <Text data-testid="color-none">No color</Text>
</Story>

<!-- AC-8: as prop overrides default tag -->
<Story name="PolymorphicAs" args={{ variant: "body", as: "span" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("SPAN");
    await expect(root.classList.contains("body-text")).toBe(true);
  }}>
  Inline body text rendered as span.
</Story>

<!-- AC-15: extra class is merged alongside variant class -->
<!-- AC-16: data attributes are forwarded -->
<Story name="ClassMerge" args={{ variant: "mono", class: "my-class", "data-testid": "probe" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.classList.contains("mono-label")).toBe(true);
    await expect(root.classList.contains("my-class")).toBe(true);
    await expect(root.getAttribute("data-testid")).toBe("probe");
  }}>
  Merged classes
</Story>

<!-- AC-9: no variant prop defaults to body-text on <p> -->
<Story name="DefaultVariant"
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    await expect(root.tagName).toBe("P");
    await expect(root.classList.contains("body-text")).toBe(true);
  }}>
  Default variant text.
</Story>

<!-- B26 AC-3, AC-17: size="xs" on mono → 12px, data-size="xs" present -->
<Story name="SizeXs" args={{ variant: "mono", size: "xs" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-size")).toBe("xs");
    await expect(getComputedStyle(el).fontSize).toBe("12px");
  }}>
  Micro label
</Story>

<!-- B26 AC-4: size="sm" on mono → 14px -->
<Story name="SizeSm" args={{ variant: "mono", size: "sm" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-size")).toBe("sm");
    await expect(getComputedStyle(el).fontSize).toBe("14px");
  }}>
  Small label
</Story>

<!-- B26 AC-5, AC-41: size="md" on mono → 16px -->
<Story name="SizeMd" args={{ variant: "mono", size: "md" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-size")).toBe("md");
    await expect(getComputedStyle(el).fontSize).toBe("16px");
  }}>
  Medium mono text.
</Story>

<!-- B26 AC-6: size="lg" on lede → 19px -->
<Story name="SizeLg" args={{ variant: "lede", size: "lg" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-size")).toBe("lg");
    await expect(getComputedStyle(el).fontSize).toBe("19px");
  }}>
  Large lede text.
</Story>

<!-- B26 AC-7, AC-41: size="xl" on body → 24px -->
<Story name="SizeXl" args={{ variant: "body", size: "xl" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-size")).toBe("xl");
    await expect(getComputedStyle(el).fontSize).toBe("24px");
  }}>
  Extra-large body text.
</Story>

<!-- B26 AC-8: natural defaults — no size prop → variant's natural font-size -->
<Story name="NaturalDefaults" args={{ variant: "body" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const eyebrow = canvas.getByTestId("natural-eyebrow");
    await expect(getComputedStyle(eyebrow).fontSize).toBe("12px");
    const mono = canvas.getByTestId("natural-mono");
    await expect(getComputedStyle(mono).fontSize).toBe("14px");
    const body = canvas.getByTestId("natural-body");
    await expect(getComputedStyle(body).fontSize).toBe("16px");
    const lede = canvas.getByTestId("natural-lede");
    await expect(getComputedStyle(lede).fontSize).toBe("19px");
  }}>
  <Text variant="eyebrow" data-testid="natural-eyebrow">Eyebrow</Text>
  <Text variant="mono" data-testid="natural-mono">Mono</Text>
  <Text variant="body" data-testid="natural-body">Body</Text>
  <Text variant="lede" data-testid="natural-lede">Lede</Text>
</Story>

<!-- B26 AC-9: size overrides font-size only; other variant properties (letterSpacing, textTransform) preserved -->
<Story name="SizePreservesVariant" args={{ variant: "eyebrow", size: "lg" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(getComputedStyle(el).fontSize).toBe("19px");
    await expect(getComputedStyle(el).letterSpacing).toBe("2.28px");
    await expect(getComputedStyle(el).textTransform).toBe("uppercase");
  }}>
  Eyebrow at lede size
</Story>

<!-- B26 AC-20, AC-42: case="none" suppresses uppercase on mono -->
<Story name="CaseNone" args={{ variant: "mono", case: "none" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-case")).toBe("none");
    await expect(getComputedStyle(el).textTransform).toBe("none");
  }}>
  not uppercase
</Story>

<!-- B26 AC-18, AC-42: case="lower" produces lowercase -->
<Story name="CaseLower" args={{ variant: "mono", case: "lower" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-case")).toBe("lower");
    await expect(getComputedStyle(el).textTransform).toBe("lowercase");
  }}>
  lowercase label
</Story>

<!-- B26 AC-19, AC-42: case="upper" produces uppercase on body variant -->
<Story name="CaseUpper" args={{ variant: "body", case: "upper" }}
  play={async ({ canvasElement }) => {
    const el = canvasElement.firstElementChild!;
    await expect(el.getAttribute("data-case")).toBe("upper");
    await expect(getComputedStyle(el).textTransform).toBe("uppercase");
  }}>
  Uppercased body text.
</Story>

<!-- B26 AC-21: mono and eyebrow default to uppercase; body defaults to none (no case prop) -->
<Story name="DefaultCase" args={{ variant: "body" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const monoEl = canvas.getByTestId("default-case-mono");
    await expect(getComputedStyle(monoEl).textTransform).toBe("uppercase");
    const bodyEl = canvas.getByTestId("default-case-body");
    await expect(getComputedStyle(bodyEl).textTransform).toBe("none");
    const eyebrowEl = canvas.getByTestId("default-case-eyebrow");
    await expect(getComputedStyle(eyebrowEl).textTransform).toBe("uppercase");
  }}>
  <Text variant="mono" data-testid="default-case-mono">Mono default</Text>
  <Text variant="body" data-testid="default-case-body">Body default</Text>
  <Text variant="eyebrow" data-testid="default-case-eyebrow">Eyebrow</Text>
</Story>
