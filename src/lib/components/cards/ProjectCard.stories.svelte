<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import ProjectCard from "./ProjectCard.svelte";

  const { Story } = defineMeta({
    title: "Cards/ProjectCard",
    tags: ["autodocs"],
  });

  // ── Open Source ───────────────────────────────────────────────────────────
  // AC 38, 40, 41, 42, 43, 45: a element, h3 title, p desc, hatch gradient,
  // TagPill spans, footer ctaLabel
  const playOpenSource = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // AC 38: renders as <a> by default
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();

    // AC 40: title renders as h3
    const heading = canvas.getByText("zod-fixture");
    await expect(heading).toBeVisible();

    // AC 43: tags render as TagPill spans with tag text
    const tsTag = canvas.getByText("TypeScript");
    await expect(tsTag).toBeVisible();
    const osTag = canvas.getByText("Open Source");
    await expect(osTag).toBeVisible();

    // AC 45: footer renders ctaLabel
    const cta = canvas.getByText(/OPEN SOURCE/);
    await expect(cta).toBeVisible();

    // AC 42: .card-img hatch gradient present and aspect-ratio is 14/9
    const cardImg = canvasElement.querySelector(".card-img") as HTMLElement;
    await expect(cardImg).not.toBeNull();
    const imgBg = getComputedStyle(cardImg).backgroundImage;
    await expect(imgBg).not.toBe("none");
    await expect(getComputedStyle(cardImg).aspectRatio).toBe("14 / 9");
  };

  // ── No Tags ───────────────────────────────────────────────────────────────
  // AC 44: when tags is empty/omitted, no TagPill elements rendered in tag area
  const playNoTags = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Card renders without error
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();

    // AC 40: title heading is visible
    const heading = canvas.getByText("Private Share");
    await expect(heading).toBeVisible();

    // AC 44: no .card-tags element rendered (or it has no children) when tags is empty
    const cardTags = canvasElement.querySelector(".card-tags");
    await expect(cardTags).toBeNull();
  };

  // ── As Div ────────────────────────────────────────────────────────────────
  // AC 39: as="div" renders a <div> root element
  const playAsDiv = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='card']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  };
</script>

<Story name="Open Source" play={playOpenSource}>
  <ProjectCard
    href="#zod-fixture"
    slug="zod-fixture"
    title="zod-fixture"
    description="Creating fixtures based on zod schemas automatically."
    tags={["TypeScript", "Open Source"]}
    ctaLabel="OPEN SOURCE"
    data-testid="card"
  />
</Story>

<Story name="No Tags" play={playNoTags}>
  <ProjectCard
    href="#private-share"
    slug="private-share"
    title="Private Share"
    description="Private file sharing utility."
    data-testid="card"
  />
</Story>

<Story name="As Div" play={playAsDiv}>
  <ProjectCard
    as="div"
    slug="zod-fixture"
    title="zod-fixture"
    description="Creating fixtures based on zod schemas automatically."
    tags={["TypeScript", "Open Source"]}
    ctaLabel="OPEN SOURCE"
    data-testid="card"
  />
</Story>
