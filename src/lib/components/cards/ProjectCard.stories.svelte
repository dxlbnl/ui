<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProjectCard from "./ProjectCard.svelte";

  const { Story } = defineMeta({
    title: "Cards/ProjectCard",
    component: ProjectCard,
    tags: ["autodocs"],
  });
</script>

<Story name="Open Source" args={{ href: "#zod-fixture", slug: "zod-fixture", title: "zod-fixture", description: "Creating fixtures based on zod schemas automatically.", tags: ["TypeScript", "Open Source"], ctaLabel: "OPEN SOURCE" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // renders as <a> by default
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    // title renders as h3
    const heading = canvas.getByText("zod-fixture");
    await expect(heading).toBeVisible();

    // tags render as TagPill spans with tag text
    const tsTag = canvas.getByText("TypeScript");
    await expect(tsTag).toBeVisible();
    const osTag = canvas.getByText("Open Source");
    await expect(osTag).toBeVisible();

    // footer renders ctaLabel
    const cta = canvas.getByText(/OPEN SOURCE/);
    await expect(cta).toBeVisible();

    // .card-img hatch gradient present and aspect-ratio is 14/9
    const cardImg = canvasElement.querySelector(".card-img") as HTMLElement;
    const imgBg = getComputedStyle(cardImg).backgroundImage;
    await expect(imgBg).not.toBe("none");
    await expect(getComputedStyle(cardImg).aspectRatio).toBe("14 / 9");
  }} />

<Story name="No Tags" args={{ href: "#private-share", slug: "private-share", title: "Private Share", description: "Private file sharing utility." }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Card renders without error
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    // title heading is visible
    const heading = canvas.getByText("Private Share");
    await expect(heading).toBeVisible();

    // no .card-tags element rendered (or it has no children) when tags is empty
    const cardTags = canvasElement.querySelector(".card-tags");
    await expect(cardTags).toBeNull();
  }} />

<Story name="As Div" args={{ as: "div", slug: "zod-fixture", title: "zod-fixture", description: "Creating fixtures based on zod schemas automatically.", tags: ["TypeScript", "Open Source"], ctaLabel: "OPEN SOURCE" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  }} />
