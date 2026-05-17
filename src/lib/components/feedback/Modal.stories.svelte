<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor } from "storybook/test";
  import Modal from "./Modal.svelte";
  import Button from "../primitives/Button.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/Modal",
    tags: ["autodocs"],
  });
</script>

<script lang="ts">
  let openDefault     = $state(false);
  let openConfirm     = $state(false);
  let openDestructive = $state(false);
  let openWithFooter  = $state(false);
  let openBackdrop    = $state(false);
  let openNoFooter    = $state(false);
</script>

<!-- AC-5, AC-6, AC-7, AC-13, AC-14 -->
<Story name="Default"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open Modal" });
    // dialog not visible before trigger
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await userEvent.click(trigger);
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getAttribute("aria-modal")).toBe("true");
    await expect(dialog.getAttribute("aria-labelledby")).toBe("modal-title");
    const heading = canvas.getByRole("heading", { level: 2, name: /CONFIRM ACTION/i });
    await expect(heading).toBeVisible();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();
    await expect(closeBtn.getAttribute("type")).toBe("button");
    await userEvent.click(closeBtn);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
  }}>
  <Button onclick={() => { openDefault = true }}>Open Modal</Button>
  <Modal
    open={openDefault}
    title="// CONFIRM ACTION"
    onclose={() => { openDefault = false }}
  >
    <p>This action cannot be undone. Are you sure you want to proceed?</p>
  </Modal>
</Story>

<!-- AC-5, AC-6, AC-8, AC-13, AC-14 -->
<Story name="Confirm Variant"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const icon = canvasElement.querySelector(".modal-icon") as HTMLElement;
    await expect(icon).toBeVisible();
    await expect(icon.getAttribute("aria-hidden")).toBe("true");
    await expect(icon.textContent?.trim()).toBe("!");
    const amberColor = resolveTokenColor("--amber");
    await expect(getComputedStyle(icon).backgroundColor).toBe(amberColor);
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn.getAttribute("type")).toBe("button");
    await userEvent.click(closeBtn);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
  }}>
  <Button onclick={() => { openConfirm = true }}>Open Modal</Button>
  <Modal
    open={openConfirm}
    title="// CONFIRM PURCHASE"
    variant="confirm"
    onclose={() => { openConfirm = false }}
  >
    <p>You are about to place an order for 1× Conduit PDX-2 at €200. Proceed?</p>
  </Modal>
</Story>

<!-- AC-5, AC-6, AC-9, AC-13, AC-14 -->
<Story name="Destructive Variant"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const icon = canvasElement.querySelector(".modal-icon") as HTMLElement;
    await expect(icon).toBeVisible();
    await expect(icon.getAttribute("aria-hidden")).toBe("true");
    await expect(icon.textContent?.trim()).toBe("!");
    const dangerColor = resolveTokenColor("--danger");
    await expect(getComputedStyle(icon).backgroundColor).toBe(dangerColor);
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn.getAttribute("type")).toBe("button");
    await userEvent.click(closeBtn);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
  }}>
  <Button onclick={() => { openDestructive = true }}>Open Modal</Button>
  <Modal
    open={openDestructive}
    title="// DELETE ITEM"
    variant="destructive"
    onclose={() => { openDestructive = false }}
  >
    <p>This will permanently delete the item. This action cannot be undone.</p>
  </Modal>
</Story>

<!-- AC-5, AC-6, AC-10, AC-13, AC-14 -->
<Story name="With Footer"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    await expect(canvas.getByRole("dialog")).toBeVisible();
    const footer = canvasElement.querySelector("footer");
    await expect(footer).toBeInTheDocument();
    const cancelBtn = canvas.getByRole("button", { name: /Cancel/i });
    await expect(cancelBtn).toBeVisible();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn.getAttribute("type")).toBe("button");
    await userEvent.click(closeBtn);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
  }}>
  <Button onclick={() => { openWithFooter = true }}>Open Modal</Button>
  <Modal
    open={openWithFooter}
    title="// WITH FOOTER"
    onclose={() => { openWithFooter = false }}
  >
    <p>This modal includes a footer with action buttons.</p>
    {#snippet footer()}
      <Button variant="ghost" onclick={() => { openWithFooter = false }}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    {/snippet}
  </Modal>
</Story>

<!-- AC-5, AC-6, AC-11, AC-13, AC-14 -->
<Story name="Backdrop Close"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    const dialog = canvas.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn.getAttribute("type")).toBe("button");
    // native .click() dispatches with event.target === dialog, triggering handleDialogClick
    dialog.click();
    // waitFor: Svelte $effect that closes the dialog is async
    await waitFor(() => expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible());
  }}>
  <Button onclick={() => { openBackdrop = true }}>Open Modal</Button>
  <Modal
    open={openBackdrop}
    title="// BACKDROP TEST"
    onclose={() => { openBackdrop = false }}
  >
    <p>Click outside this panel on the backdrop to close.</p>
  </Modal>
</Story>

<!-- AC-5, AC-6, AC-12, AC-13, AC-14 -->
<Story name="No Footer"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await expect(canvasElement.querySelector("footer")).toBeNull();
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeEnabled();
    await expect(closeBtn.getAttribute("type")).toBe("button");
    await userEvent.click(closeBtn);
    await expect(canvas.getByRole("dialog", { hidden: true })).not.toBeVisible();
  }}>
  <Button onclick={() => { openNoFooter = true }}>Open Modal</Button>
  <Modal
    open={openNoFooter}
    title="// NO FOOTER"
    onclose={() => { openNoFooter = false }}
  >
    <p>Informational content shown without a footer action bar.</p>
  </Modal>
</Story>
