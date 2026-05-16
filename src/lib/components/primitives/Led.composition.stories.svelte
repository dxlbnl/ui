<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Led from "./Led.svelte";

  const { Story } = defineMeta({
    title: "Primitives/Led Composition",
    tags: ["autodocs"],
  });

  // ── Paired With Text ──────────────────────────────────────────────────────
  const playPairedWithText = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const el = canvasElement.querySelector("[aria-label='System ok']") as HTMLElement;
    await expect(el).toBeVisible();
    const textSpan = canvas.getByText("System ok");
    await expect(textSpan).toBeVisible();
  };
</script>

<Story name="Paired With Text" play={playPairedWithText}>
  <div style="display: flex; align-items: center; gap: 8px;">
    <Led color="ok" aria-label="System ok" />
    <span>System ok</span>
  </div>
</Story>
