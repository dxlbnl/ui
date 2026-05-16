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
