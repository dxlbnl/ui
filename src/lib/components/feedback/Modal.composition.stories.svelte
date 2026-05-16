<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Modal from "./Modal.svelte";
  import Button from "$lib/components/primitives/Button.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/Modal Composition",
    tags: ["autodocs"],
  });
</script>

<Story name="Confirm Variant"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const heading = canvas.getByRole("heading", { level: 2, name: /CONFIRM PURCHASE/i });
    await expect(heading).toBeVisible();
    const icon = canvasElement.querySelector(".modal-icon") as HTMLElement;
    await expect(icon).toBeVisible();
    await expect(icon.getAttribute("aria-hidden")).toBe("true");
    await expect(icon.textContent?.trim()).toBe("!");
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(icon).backgroundColor).toBe(amberColor);
    const confirmBtn = canvas.getByRole("button", { name: "Confirm" });
    await expect(confirmBtn).toBeVisible();
    const cancelBtn = canvas.getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeVisible();
  }}>
  <Modal
    open={true}
    title="// CONFIRM PURCHASE"
    variant="confirm"
    onclose={() => {}}
  >
    {#snippet footer()}
      <Button variant="ghost">Cancel</Button>
      <Button variant="primary">Confirm</Button>
    {/snippet}
    <p>You are about to place an order for 1× Conduit PDX-2 at €200. Proceed?</p>
  </Modal>
</Story>

<Story name="Destructive Variant"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const heading = canvas.getByRole("heading", { level: 2, name: /DELETE ITEM/i });
    await expect(heading).toBeVisible();
    const icon = canvasElement.querySelector(".modal-icon") as HTMLElement;
    await expect(icon).toBeVisible();
    await expect(icon.getAttribute("aria-hidden")).toBe("true");
    await expect(icon.textContent?.trim()).toBe("!");
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(icon).backgroundColor).toBe(dangerColor);
    const deleteBtn = canvas.getByRole("button", { name: "Delete" });
    await expect(deleteBtn).toBeVisible();
    const cancelBtn = canvas.getByRole("button", { name: "Cancel" });
    await expect(cancelBtn).toBeVisible();
  }}>
  <Modal
    open={true}
    title="// DELETE ITEM"
    variant="destructive"
    onclose={() => {}}
  >
    {#snippet footer()}
      <Button variant="ghost">Cancel</Button>
      <Button variant="del">Delete</Button>
    {/snippet}
    <p>This will permanently delete the item. This action cannot be undone.</p>
  </Modal>
</Story>
