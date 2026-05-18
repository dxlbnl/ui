<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { ToastVariant } from "$lib/stores/toast.js";
  import Alert from "./Alert.svelte";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    /** Unique toast ID (used by the dismiss callback). */
    id: string;
    /** Text content of the notification. */
    message: string;
    /** Optional title text shown above the message. */
    title?: string;
    /** Colour variant — also sets the ARIA live region type. @default 'success' */
    variant?: ToastVariant;
    /** Called with the toast `id` when the dismiss button is clicked. */
    ondismiss: (id: string) => void;
  }

  let {
    id,
    message,
    title = '',
    variant = "success",
    ondismiss,
    ...rest
  }: Props = $props();

  let role = $derived(variant === "error" ? "alert" : "status");
  let ariaLive: "assertive" | "polite" = $derived(
    variant === "error" ? "assertive" : "polite",
  );
</script>

<div
  class="toast toast--{variant}"
  {role}
  aria-live={ariaLive}
  aria-atomic="true"
  {...rest}
>
  <Alert variant={variant} {title} {message} ondismiss={() => ondismiss(id)} />
</div>

<style>
  .toast {
    min-width: 260px;
    max-width: 400px;
    pointer-events: all;
  }
</style>
