<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor, fn } from "storybook/test";
  import Popover from "./Popover.svelte";
  import { resolveTokenColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/Popover",
    component: Popover,
    tags: ["autodocs"],
  });
</script>

<script lang="ts">
  // Local controlled state + spies for the dismissal stories (mirrors the Modal idiom).
  // Spies live in script scope so the inline play functions (no TS annotations allowed)
  // can read them, and the template can wire them to onclose.
  let openOutside = $state(true);
  const outsideSpy = fn(() => {
    openOutside = false;
  });

  let openInside = $state(true);
  const insideSpy = fn(() => {
    openInside = false;
  });

  let openEscape = $state(true);
  const escapeSpy = fn(() => {
    openEscape = false;
  });

  let openToggle = $state(true);
  const toggleSpy = fn(() => {
    openToggle = false;
  });
</script>

<!--
  Story 1 — Align Right (default).
  ACs: 2 (renders panel + children), 5 (position:absolute), 6 (right=0/left=auto),
       9 (surface tokens: --bg / --rule-strong / non-none box-shadow), 10 (z-index >= 100).
  The Popover renders its own panel root; data-testid forwards via ...rest (AC-3),
  so the test queries that root and asserts the visual contract on it.
-->
<Story name="Align Right" args={{ open: true, align: "right", "data-testid": "pop-panel" }}
  play={async ({ canvasElement }) => {
    // AC-2: panel rendered with children visible
    const panel = canvasElement.querySelector('[data-testid="pop-panel"]') as HTMLElement;
    await expect(panel).not.toBeNull();
    await expect(panel).toBeVisible();
    await expect(within(canvasElement).getByText("Panel contents")).toBeVisible();

    const style = getComputedStyle(panel);

    // AC-5: absolutely positioned
    await expect(style.position).toBe("absolute");

    // AC-6: align="right" anchors the panel to the right edge of its positioned
    // parent. For a position:absolute element the inactive edge resolves to a used
    // length (never "auto"), so we assert the active edge pins to 0px while the
    // inactive edge does not — proving right-anchoring. (Inline style fallback below
    // confirms the authored intent.)
    await expect(style.right).toBe("0px");
    await expect(style.left).not.toBe("0px");
    // Inline-style fallback proves the authored `left:auto` intent that the CSSOM
    // resolves away (the serialized style is browser-normalized, e.g. "left: auto").
    await expect(panel.getAttribute("style")).toContain("left: auto");

    // AC-9: surface tokens
    await expect(style.backgroundColor).toBe(resolveTokenColor("--bg"));
    await expect(style.borderTopWidth).toBe("1px");
    await expect(style.borderTopStyle).toBe("solid");
    await expect(style.borderTopColor).toBe(resolveTokenColor("--rule-strong"));
    await expect(style.boxShadow).not.toBe("none");

    // AC-10: layered above adjacent content
    await expect(parseInt(style.zIndex)).toBeGreaterThanOrEqual(100);
  }}>
  <p class="pin">Panel contents</p>
</Story>

<!--
  Story 2 — Align Left.
  ACs: 6 (left=0/right=auto).
-->
<Story name="Align Left" args={{ open: true, align: "left", "data-testid": "pop-panel" }}
  play={async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-testid="pop-panel"]') as HTMLElement;
    await expect(panel).not.toBeNull();

    const style = getComputedStyle(panel);
    // AC-6: align="left" anchors the panel to the left edge. As above, the inactive
    // edge resolves to a used length (never "auto"), so assert the active edge pins
    // to 0px while the inactive edge does not, plus the inline-style fallback.
    await expect(style.left).toBe("0px");
    await expect(style.right).not.toBe("0px");
    // Inline-style fallback proves the authored `right:auto` intent that the CSSOM
    // resolves away (the serialized style is browser-normalized, e.g. "right: auto").
    await expect(panel.getAttribute("style")).toContain("right: auto");
  }}>
  <p class="pin">Panel contents</p>
</Story>

<!--
  Story 3 — Closed.
  ACs: 1 (open:false renders nothing — panel absent),
       14 (outside mousedown + Escape are no-ops; onclose spy never called).
-->
<Story name="Closed"
  play={async ({ canvasElement, args }) => {
    // AC-1: no panel element rendered while closed
    await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).toBeNull();

    // AC-14: outside mousedown is a no-op (no listeners active) and does not throw
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    // AC-14: Escape is a no-op
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    // AC-14: onclose was never called while closed
    await expect(args.onclose).toHaveBeenCalledTimes(0);

    // AC-1 still holds — nothing got rendered
    await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).toBeNull();
  }}
  args={{ open: false, onclose: fn(), "data-testid": "pop-panel" }}>
  <p class="pin">Panel contents</p>
</Story>

<!--
  Story 4 — Width And Top.
  ACs: 7 (numeric top={12} -> top:12px), 8 (numeric width={220} -> 220px;
       string width="20rem" -> 320px at default root font-size).
-->
<Story name="Width And Top"
  play={async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-testid="pop-px"]') as HTMLElement;
    await expect(panel).not.toBeNull();

    const style = getComputedStyle(panel);
    // AC-7: numeric top maps to px
    await expect(style.top).toBe("12px");
    // AC-8: numeric width maps to px
    await expect(style.width).toBe("220px");

    // AC-8: string width passes through (20rem -> 320px at default 16px root font-size)
    const remPanel = canvasElement.querySelector('[data-testid="pop-rem"]') as HTMLElement;
    await expect(remPanel).not.toBeNull();
    await expect(getComputedStyle(remPanel).width).toBe("320px");
  }}>
  {#snippet template()}
    <div style="position:relative;height:40px">
      <Popover open width={220} top={12} data-testid="pop-px">
        <p class="pin">Panel contents</p>
      </Popover>
    </div>
    <div style="position:relative;height:40px">
      <Popover open width="20rem" data-testid="pop-rem">
        <p class="pin">Rem width</p>
      </Popover>
    </div>
  {/snippet}
</Story>

<!--
  Story 5 — Dismiss On Outside Click.
  ACs: 11 (outside mousedown calls onclose exactly once),
       15 (listens for mousedown, not click),
       16 (bind:open -> panel disappears after dismiss).
-->
<Story name="Dismiss On Outside Click"
  play={async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-testid="pop-panel"]') as HTMLElement;
    await expect(panel).not.toBeNull();

    // AC-15: a plain click outside must NOT trigger dismissal (handler listens on mousedown)
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(outsideSpy).toHaveBeenCalledTimes(0);

    // AC-11: an outside mousedown calls onclose exactly once
    await expect(panel.contains(document.body)).toBe(false);
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(outsideSpy).toHaveBeenCalledTimes(1);

    // AC-16: with bind:open the panel disappears after the dismiss
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).toBeNull();
    });
  }}>
  {#snippet template()}
    <div style="position:relative;display:inline-block">
      <button>Trigger</button>
      <Popover bind:open={openOutside} onclose={outsideSpy} data-testid="pop-panel">
        <p class="pin">Panel contents</p>
      </Popover>
    </div>
  {/snippet}
</Story>

<!--
  Story 6 — Keep Open On Inside Click.
  ACs: 12 (mousedown on an element contained by the panel does NOT call onclose).
  Note: a positive control runs first — an OUTSIDE mousedown MUST dismiss. This proves
  the popover's dismiss machinery is actually wired (a no-op component would fail here),
  so the subsequent "inside does not dismiss" assertion is non-trivial.
-->
<Story name="Keep Open On Inside Click"
  play={async ({ canvasElement }) => {
    const inside = within(canvasElement).getByText("Inside target");
    await expect(canvasElement.contains(inside)).toBe(true);

    // AC-12: a mousedown inside the panel does NOT call onclose
    inside.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(insideSpy).toHaveBeenCalledTimes(0);

    // panel is still present after the inside interaction
    await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).not.toBeNull();

    // Positive control: an OUTSIDE mousedown MUST dismiss (proves the dismiss
    // machinery is wired — distinguishes a real component from a no-op stub).
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(insideSpy).toHaveBeenCalledTimes(1);
  }}>
  {#snippet template()}
    <div style="position:relative;display:inline-block">
      <button>Trigger</button>
      <Popover bind:open={openInside} onclose={insideSpy} data-testid="pop-panel">
        <p class="pin">Inside target</p>
      </Popover>
    </div>
  {/snippet}
</Story>

<!--
  Story 7 — Dismiss On Escape.
  ACs: 13 (Escape keydown calls onclose exactly once),
       14 (Escape while closed is a no-op).
-->
<Story name="Dismiss On Escape"
  play={async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-testid="pop-panel"]');
    await expect(panel).not.toBeNull();

    // AC-13: Escape on document closes the open popover (onclose called once)
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(escapeSpy).toHaveBeenCalledTimes(1);

    // AC-16/AC-14: panel gone after dismiss (bind:open)
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).toBeNull();
    });

    // AC-14: a second Escape while closed is a no-op (spy count unchanged)
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(escapeSpy).toHaveBeenCalledTimes(1);
  }}>
  {#snippet template()}
    <div style="position:relative;display:inline-block">
      <button>Trigger</button>
      <Popover bind:open={openEscape} onclose={escapeSpy} data-testid="pop-panel">
        <p class="pin">Panel contents</p>
      </Popover>
    </div>
  {/snippet}
</Story>

<!--
  Story 8 — No Duplicate Listeners.
  ACs: 16 (toggling open true->false->true does not accumulate handlers;
       a single outside mousedown after re-open calls onclose exactly once more).
-->
<Story name="No Duplicate Listeners"
  play={async ({ canvasElement }) => {
    // panel starts open
    await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).not.toBeNull();

    // Close via Escape -> listeners should be torn down
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).toBeNull();
    });
    const callsAfterClose = toggleSpy.mock.calls.length;

    // Re-open via the trigger button
    await within(canvasElement).getByRole("button", { name: "Reopen" }).click();
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-panel"]')).not.toBeNull();
    });

    // AC-16: a single outside mousedown after re-open calls onclose exactly once more
    // (not twice — which would indicate a duplicate, leaked listener from the first open).
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(toggleSpy.mock.calls.length).toBe(callsAfterClose + 1);
  }}>
  {#snippet template()}
    <div style="position:relative;display:inline-block">
      <button onclick={() => (openToggle = true)}>Reopen</button>
      <Popover bind:open={openToggle} onclose={toggleSpy} data-testid="pop-panel">
        <p class="pin">Panel contents</p>
      </Popover>
    </div>
  {/snippet}
</Story>

<!--
  Story 9 — Polymorphic As / Rest Forwarding.
  ACs: 3 (...rest forwarded: data-testid, role, aria-label),
       4 (as="section" renders a <section>).
-->
<Story name="Polymorphic As / Rest Forwarding"
  args={{
    open: true,
    as: "section",
    "data-testid": "pop",
    role: "dialog",
    "aria-label": "Details",
  }}
  play={async ({ canvasElement }) => {
    // AC-4: as="section" renders a <section> element as the panel root
    const panel = canvasElement.querySelector('[data-testid="pop"]') as HTMLElement;
    await expect(panel).not.toBeNull();
    await expect(panel.tagName.toLowerCase()).toBe("section");

    // AC-3: forwarded attributes present on the panel root
    await expect(panel.getAttribute("data-testid")).toBe("pop");
    await expect(panel.getAttribute("role")).toBe("dialog");
    await expect(panel.getAttribute("aria-label")).toBe("Details");

    // queryable by role + accessible name
    await expect(within(canvasElement).getByRole("dialog", { name: "Details" })).toBeVisible();
  }}>
  <p class="pin">Panel contents</p>
</Story>
