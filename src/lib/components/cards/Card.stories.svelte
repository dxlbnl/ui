<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Card from "./Card.svelte";

  const { Story } = defineMeta({
    title: "Cards/Card",
    tags: ["autodocs"],
  });

  // Helper: resolve a CSS custom property to its computed RGB background-color value.
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

  // Helper: resolve a CSS custom property to its computed foreground color value.
  // Used for border-color assertions since border-color resolves as an RGB string.
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
  // AC 12, 15, 16, 17, 18, 19: div default, bg-rail, border solid 1px rule, flex column
  const playDefault = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();

    const style = getComputedStyle(root);

    // AC 15: background-color matches --bg-rail token
    const bgRail = resolveTokenColor("--bg-rail");
    await expect(style.backgroundColor).toBe(bgRail);

    // AC 16: border is 1px solid with color matching --rule
    await expect(style.borderTopStyle).toBe("solid");
    await expect(style.borderTopWidth).toBe("1px");
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(style.borderColor).toBe(ruleColor);

    // AC 17: display flex, flex-direction column
    await expect(style.display).toBe("flex");
    await expect(style.flexDirection).toBe("column");
  };

  // ── As Article ────────────────────────────────────────────────────────────
  // AC 13: as="article" renders <article> element
  const playAsArticle = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.tagName).toBe("ARTICLE");
    await expect(root).toBeVisible();
  };

  // ── As Link ───────────────────────────────────────────────────────────────
  // AC 14: as="a" with href renders a link element with correct href
  const playAsLink = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link");
    await expect(link).toBeVisible();
    await expect(link.getAttribute("href")).toBe("#demo");
  };
</script>

<Story name="Default" play={playDefault}>
  <Card data-testid="card"><p>A simple card body.</p></Card>
</Story>

<Story name="As Article" play={playAsArticle}>
  <Card as="article" data-testid="card">
    <h2>Title</h2>
    <p>Body.</p>
  </Card>
</Story>

<Story name="As Link" play={playAsLink}>
  <Card as="a" href="#demo" data-testid="card"><span>View demo</span></Card>
</Story>
