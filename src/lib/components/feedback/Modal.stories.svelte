<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor } from "storybook/test";
  import Modal from "./Modal.svelte";
  import Button from "../primitives/Button.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Modal",
    tags: ["autodocs"],
  });
</script>

<script lang="ts">
  let openDefault     = $state(false);
  let openConfirm     = $state(false);
  let openDestructive = $state(false);
</script>

<!-- Default story: 12px mono uppercase title, close button right of title -->
<Story name="Default"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open Modal" });
    await userEvent.click(trigger);
    // title is h2#modal-title, visible
    const title = canvasElement.querySelector("h2#modal-title") as HTMLElement;
    await expect(title).not.toBeNull();
    await expect(title).toBeVisible();
    // 12px
    await expect(getComputedStyle(title).fontSize).toBe("12px");
    // uppercase
    await expect(getComputedStyle(title).textTransform).toBe("uppercase");
    // header justify-content space-between
    const header = canvasElement.querySelector(".modal-header") as HTMLElement;
    await expect(getComputedStyle(header).justifyContent).toBe("space-between");
    // close button flex-shrink 0
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
    await expect(getComputedStyle(closeBtn).flexShrink).toBe("0");
    // close button is to the right of title
    await expect(closeBtn.getBoundingClientRect().left).toBeGreaterThan(
      title.getBoundingClientRect().right
    );
    // close modal
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
    {#snippet footer()}
      <Button variant="ghost" onclick={() => { openDefault = false }}>Cancel</Button>
      <Button variant="primary">OK</Button>
    {/snippet}
  </Modal>
</Story>

<!-- Confirm story: icon in body, no icon in header -->
<Story name="Confirm"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    // .modal-variant-icon exists in body
    const body = canvasElement.querySelector(".modal-body") as HTMLElement;
    const confirmIcon = body.querySelector(".modal-variant-icon") as HTMLElement;
    await expect(confirmIcon).not.toBeNull();
    // title visible
    const title = canvasElement.querySelector("h2#modal-title") as HTMLElement;
    await expect(title).toBeVisible();
    // close modal
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
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
    {#snippet footer()}
      <Button variant="ghost" onclick={() => { openConfirm = false }}>Cancel</Button>
      <Button variant="primary">Confirm</Button>
    {/snippet}
  </Modal>
</Story>

<!-- Destructive story: icon in body, title visible -->
<Story name="Destructive"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Open Modal" }));
    // .modal-variant-icon exists in body
    const body = canvasElement.querySelector(".modal-body") as HTMLElement;
    const icon = body.querySelector(".modal-variant-icon") as HTMLElement;
    await expect(icon).not.toBeNull();
    await expect(icon).toBeVisible();
    // title visible
    const title = canvasElement.querySelector("h2#modal-title") as HTMLElement;
    await expect(title).toBeVisible();
    // close modal
    const closeBtn = canvas.getByRole("button", { name: /Close dialog/i });
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
    {#snippet footer()}
      <Button variant="ghost" onclick={() => { openDestructive = false }}>Cancel</Button>
      <Button variant="primary">Delete</Button>
    {/snippet}
  </Modal>
</Story>
