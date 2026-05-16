<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Container from "./Container.svelte";
  import Stack from "./Stack.svelte";
  import Rule from "./Rule.svelte";
  import Button from "../primitives/Button.svelte";

  const { Story } = defineMeta({
    title: "Layout/Container",
    tags: ["autodocs"],
  });

  // ── Large ─────────────────────────────────────────────────────────────────
  // AC 54, 59, 85: max-width 1440px, margin centering, padding-bottom 80px, padding-left/right 32px, aria-label forwarded
  const playLarge = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='container-large']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.maxWidth).toBe("1440px");
    await expect(style.paddingBottom).toBe("80px");
    await expect(style.paddingLeft).toBe("32px");
    await expect(style.paddingRight).toBe("32px");
    // margin: 0 auto — both left and right should be equal (auto-resolved)
    await expect(style.marginLeft).toBe(style.marginRight);
    // AC 59: aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  };

  // ── Medium ────────────────────────────────────────────────────────────────
  // AC 55, 86: max-width 960px, padding-bottom 64px, padding-left/right 32px
  const playMedium = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='container-medium']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    await expect(style.maxWidth).toBe("960px");
    await expect(style.paddingBottom).toBe("64px");
    await expect(style.paddingLeft).toBe("32px");
    await expect(style.paddingRight).toBe("32px");
  };

  // ── Small ─────────────────────────────────────────────────────────────────
  // AC 56, 87: max-width 640px, padding-bottom 48px, padding-left/right 32px
  const playSmall = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='container-small']") as HTMLElement;
    await expect(root).not.toBeNull();
    const style = getComputedStyle(root);
    await expect(style.maxWidth).toBe("640px");
    await expect(style.paddingBottom).toBe("48px");
    await expect(style.paddingLeft).toBe("32px");
    await expect(style.paddingRight).toBe("32px");
  };

  // ── As Main ───────────────────────────────────────────────────────────────
  // AC 52, 88: as="main" renders <main> tag
  const playAsMain = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.querySelector("[data-testid='container-main']") as HTMLElement;
    await expect(root).not.toBeNull();
    await expect(root.tagName).toBe("MAIN");
  };
</script>

<Story name="Large" play={playLarge}>
  <Container size="lg" data-testid="container-large" aria-label="test-label">
    <p>Large container — max-width 1440px. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    <Rule />
  </Container>
</Story>

<Story name="Medium" play={playMedium}>
  <Container size="md" data-testid="container-medium">
    <Stack gap="sm">
      <Button variant="primary">Order Now</Button>
      <Button variant="ghost">View All →</Button>
    </Stack>
  </Container>
</Story>

<Story name="Small" play={playSmall}>
  <Container size="sm" data-testid="container-small">
    <p>Small container — max-width 640px. A narrow reading column for prose content.</p>
  </Container>
</Story>

<Story name="As Main" play={playAsMain}>
  <Container as="main" size="md" data-testid="container-main">
    <p>Rendered as a semantic main element.</p>
  </Container>
</Story>
