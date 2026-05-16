<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Card from "./Card.svelte";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Cards/Card",
    component: Card,
    tags: ["autodocs"],
  });
</script>

<Story name="Default"
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    const style = getComputedStyle(root);

    // background-color matches --bg-rail token
    const bgRail = resolveTokenColor("--bg-rail");
    await expect(style.backgroundColor).toBe(bgRail);

    // border is 1px solid with color matching --rule
    await expect(style.borderTopStyle).toBe("solid");
    await expect(style.borderTopWidth).toBe("1px");
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(style.borderColor).toBe(ruleColor);

    // display flex, flex-direction column
    await expect(style.display).toBe("flex");
    await expect(style.flexDirection).toBe("column");
  }}>
  <p>A simple card body.</p>
</Story>

<Story name="As Article" args={{ as: "article" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("ARTICLE");
    await expect(root).toBeVisible();
  }}>
  <h2>Title</h2>
  <p>Body.</p>
</Story>

<Story name="As Link" args={{ as: "a", href: "#demo" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link");
    await expect(link).toBeVisible();
    await expect(link.getAttribute("href")).toBe("#demo");
  }}>
  <span>View demo</span>
</Story>

<Story name="Computed Styles"
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild!;
    const bgRail = resolveTokenColor("--bg-rail");
    await expect(getComputedStyle(root).backgroundColor).toBe(bgRail);
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(getComputedStyle(root).borderTopColor).toBe(ruleColor);
    await expect(getComputedStyle(root).borderTopWidth).toBe("1px");
    await expect(getComputedStyle(root).borderTopStyle).toBe("solid");
    await expect(getComputedStyle(root).overflow).toBe("hidden");
  }}>
  <p>Card with computed style assertions.</p>
</Story>

<Story name="Hover Border"
  play={async ({ canvasElement }) => {
    // Card base component has no :hover CSS rule — hover behaviour lives in
    // composite cards (ProjectCard, ProductCard, NoteCard).
    // This story verifies the card renders correctly.
    // On hover: composite cards transition border-color to var(--amber).
    const root = canvasElement.firstElementChild!;
    await expect(root).toBeVisible();
  }}>
  <p>Hover documentation story — card renders and is visible.</p>
</Story>
