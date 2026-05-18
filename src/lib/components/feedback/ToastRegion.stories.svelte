<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor } from "storybook/test";
  import ToastRegion from "./ToastRegion.svelte";
  import Button from "../primitives/Button.svelte";
  import { toast } from "$lib/stores/toast.js";

  // AC 69: no component: in defineMeta — ToastRegion is a singleton portal (composition-only)
  const { Story } = defineMeta({
    title: "Feedback/ToastRegion",
    tags: ["autodocs"],
  });
</script>

<!-- Interactive demo — trigger buttons with duration:0 so toasts persist -->
<Story name="Interactive">
  <div style="display: flex; gap: 8px; padding: 1rem;">
    <Button onclick={() => toast.push('Build complete.', { title: 'Success', variant: 'success', duration: 0 })}>Success</Button>
    <Button onclick={() => toast.push('+12V rail at 88%.', { title: 'Warning', variant: 'warning', duration: 0 })}>Warning</Button>
    <Button onclick={() => toast.push('Thermal fault detected.', { title: 'Error', variant: 'error', duration: 0 })}>Error</Button>
  </div>
  <ToastRegion position="bottom-right" />
</Story>

<!-- AC 39, 40, 66 — push one toast and verify it renders in the region -->
<Story name="Single Toast"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // AC 40: push a toast and it appears
    const id = toast.push('Hello from ToastRegion.', { variant: 'success' });

    // AC 39: ToastRegion renders one Toast per active store item
    await waitFor(() => expect(canvas.getByRole('status')).toBeVisible());
    await expect(canvas.getByText('Hello from ToastRegion.')).toBeVisible();

    // AC 27: close button present
    await expect(canvas.getByRole('button', { name: /Dismiss notification/i })).toBeVisible();

    // AC 66: region has aria-label="Notifications"
    const region = canvasElement.querySelector('.toast-region');
    await expect(region).not.toBeNull();
    await expect(region!.getAttribute('aria-label')).toBe('Notifications');

    // Cleanup (AC 73: store cleanup to avoid state leak between tests)
    toast.dismiss(id);
  }}>
  <ToastRegion position="bottom-right" />
</Story>

<!-- AC 39, 41 — three variants: success + warning = status (×2), error = alert (×1) -->
<Story name="Three Variants"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Push three toasts with different variants
    const id1 = toast.push('Build passed.', { variant: 'success' });
    const id2 = toast.push('Memory at 85%.', { variant: 'warning' });
    const id3 = toast.push('Connection lost.', { variant: 'error' });

    // AC 39: all items render
    await waitFor(() => {
      const statuses = canvas.getAllByRole('status');
      expect(statuses.length).toBe(2);
    });

    // AC 16+17: success and warning get role=status
    const statuses = canvas.getAllByRole('status');
    await expect(statuses.length).toBe(2);

    // AC 18: danger gets role=alert
    const alerts = canvas.getAllByRole('alert');
    await expect(alerts.length).toBe(1);

    // AC 26: all three messages visible
    await expect(canvas.getByText('Build passed.')).toBeVisible();
    await expect(canvas.getByText('Memory at 85%.')).toBeVisible();
    await expect(canvas.getByText('Connection lost.')).toBeVisible();

    // Cleanup (AC 73)
    toast.dismiss(id1);
    toast.dismiss(id2);
    toast.dismiss(id3);
  }}>
  <ToastRegion position="bottom-right" />
</Story>

<!-- AC 42 — with limit=3, pushing 5 toasts shows only the newest 3 -->
<Story name="Stack Limit"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Push 5 toasts
    const ids = [
      toast.push('Toast 1', { variant: 'success' }),
      toast.push('Toast 2', { variant: 'success' }),
      toast.push('Toast 3', { variant: 'success' }),
      toast.push('Toast 4', { variant: 'success' }),
      toast.push('Toast 5', { variant: 'success' }),
    ];

    // AC 42: only 3 toasts are visible (oldest 2 dismissed by limit enforcement)
    await waitFor(() => {
      const visible = canvas.getAllByRole('status');
      expect(visible.length).toBe(3);
    });

    // The newest 3 messages should be present
    await expect(canvas.getByText('Toast 3')).toBeVisible();
    await expect(canvas.getByText('Toast 4')).toBeVisible();
    await expect(canvas.getByText('Toast 5')).toBeVisible();

    // The oldest 2 should have been dismissed from the DOM
    await expect(canvas.queryByText('Toast 1')).toBeNull();
    await expect(canvas.queryByText('Toast 2')).toBeNull();

    // Cleanup remaining (Toast 1+2 already dismissed by limit enforcement)
    toast.dismiss(ids[2]);
    toast.dismiss(ids[3]);
    toast.dismiss(ids[4]);
  }}>
  <ToastRegion position="bottom-right" limit={3} />
</Story>

<!-- AC 44 — toast with duration:1000 auto-dismisses after ~1000ms -->
<Story name="Auto-Dismiss"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 44: push with short duration
    const id = toast.push('Short-lived.', { variant: 'success', duration: 1000 });

    // Immediately visible
    await waitFor(() => expect(canvas.getByText('Short-lived.')).toBeVisible());

    // AC 44: wait 1200ms — toast should have been auto-dismissed
    await new Promise((r) => setTimeout(r, 1200));

    await expect(canvas.queryByText('Short-lived.')).toBeNull();

    // Cleanup (should already be gone but dismiss is a no-op if not present — AC 13)
    toast.dismiss(id);
  }}>
  <ToastRegion position="bottom-right" />
</Story>

<!-- AC 41, 45, 46 — manual close removes toast and cancels its auto-dismiss timer -->
<Story name="Manual Dismiss via Button"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC 46: push with a real timer so we can verify cancellation
    const id = toast.push('Manual dismiss only.', { variant: 'warning', duration: 800 });

    await waitFor(() => expect(canvas.getByText('Manual dismiss only.')).toBeVisible());

    // AC 41: clicking close button removes the toast
    const closeBtn = canvas.getByRole('button', { name: /Dismiss notification/i });
    await expect(closeBtn).toBeVisible();
    closeBtn.click();

    // Toast dismissed immediately
    await waitFor(() => expect(canvas.queryByText('Manual dismiss only.')).toBeNull());

    // AC 46: wait past the original 800ms duration — toast must not reappear
    await new Promise((r) => setTimeout(r, 1000));
    await expect(canvas.queryByText('Manual dismiss only.')).toBeNull();

    // Cleanup (no-op — already gone)
    toast.dismiss(id);
  }}>
  <ToastRegion position="bottom-right" />
</Story>

<!-- AC 48, 51 — position="top-left" renders .toast-region--top-left -->
<Story name="Position Top-Left"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const id = toast.push('Top-left toast.', { variant: 'success' });

    await waitFor(() => expect(canvas.getByText('Top-left toast.')).toBeVisible());

    // AC 51: correct position class applied
    const region = canvasElement.querySelector('.toast-region--top-left');
    await expect(region).not.toBeNull();

    // Cleanup (AC 73)
    toast.dismiss(id);
  }}>
  <ToastRegion position="top-left" />
</Story>

<!-- AC 37 — when no toasts are pushed the region is empty (or SSR-unrendered) -->
<Story name="No Toasts"
  play={async ({ canvasElement }) => {
    // AC 37: no toast elements rendered when store is empty
    // The region may or may not be present (mounted guard), but no role=status/alert
    await expect(
      canvasElement.querySelectorAll('[role="status"], [role="alert"]').length
    ).toBe(0);
  }}>
  <ToastRegion position="bottom-right" />
</Story>
