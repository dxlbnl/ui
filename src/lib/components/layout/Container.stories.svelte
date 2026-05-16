<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Container from "./Container.svelte";
  import Stack from "./Stack.svelte";
  import Rule from "./Rule.svelte";
  import Button from "../primitives/Button.svelte";

  const { Story } = defineMeta({
    title: "Layout/Container",
    component: Container,
    tags: ["autodocs"],
  });

  // ── Large ─────────────────────────────────────────────────────────────────
  const playLarge = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();
    const style = getComputedStyle(root);
    await expect(style.maxWidth).toBe("1440px");
    await expect(style.paddingBottom).toBe("80px");
    await expect(style.paddingLeft).toBe("32px");
    await expect(style.paddingRight).toBe("32px");
    // margin: 0 auto — both left and right should be equal (auto-resolved)
    await expect(style.marginLeft).toBe(style.marginRight);
    // aria-label forwarded via ...rest
    await expect(root.getAttribute("aria-label")).toBe("test-label");
  };

  // ── Medium ────────────────────────────────────────────────────────────────
  const playMedium = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.maxWidth).toBe("960px");
    await expect(style.paddingBottom).toBe("64px");
    await expect(style.paddingLeft).toBe("32px");
    await expect(style.paddingRight).toBe("32px");
  };

  // ── Small ─────────────────────────────────────────────────────────────────
  const playSmall = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    const style = getComputedStyle(root);
    await expect(style.maxWidth).toBe("640px");
    await expect(style.paddingBottom).toBe("48px");
    await expect(style.paddingLeft).toBe("32px");
    await expect(style.paddingRight).toBe("32px");
  };

  // ── As Main ───────────────────────────────────────────────────────────────
  const playAsMain = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("MAIN");
  };
</script>

<Story name="Large" args={{ size: "lg", "aria-label": "test-label" }} play={playLarge}>
  <p>Large container — max-width 1440px. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <Rule />
</Story>

<Story name="Medium" args={{ size: "md" }} play={playMedium}>
  <Stack gap="sm">
    <Button variant="primary">Order Now</Button>
    <Button variant="ghost">View All →</Button>
  </Stack>
</Story>

<Story name="Small" args={{ size: "sm" }} play={playSmall}>
  <p>Small container — max-width 640px. A narrow reading column for prose content.</p>
</Story>

<Story name="As Main" args={{ as: "main", size: "md" }} play={playAsMain}>
  <p>Rendered as a semantic main element.</p>
</Story>
