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
  // Controlled, bindable open + an onclose spy per story (mirrors the Modal idiom).
  // The trigger button toggles open; the component only ever calls onclose, which sets
  // open=false. Spies live in script scope so the inline play functions can read them.
  let openRight = $state(true);
  const closeRight = fn(() => {
    openRight = false;
  });

  let openLeft = $state(true);
  const closeLeft = fn(() => {
    openLeft = false;
  });
</script>

<!--
  Align Right (default) — the hero demo: a real trigger button anchored to a relative
  parent with a styled panel, matching the design-system sample. Its play function folds
  in the bulk of the contract: rendering (AC-2/3), positioning & surface (AC-5/6/7/8/9/10),
  non-modal semantics (AC-18/19), and dismissal (AC-11/12/13/15/16).
-->
<Story name="Align Right"
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const panel = canvasElement.querySelector('[data-testid="pop-right"]') as HTMLElement;

    // AC-2: panel rendered with children visible. AC-3: ...rest forwards data-testid.
    await expect(panel).not.toBeNull();
    await expect(panel).toBeVisible();
    await expect(canvas.getByText("// panel")).toBeVisible();
    await expect(canvas.getByText("Esc")).toBeVisible();

    const style = getComputedStyle(panel);

    // AC-5: absolutely positioned.
    await expect(style.position).toBe("absolute");

    // AC-6: align="right" pins the right edge to 0; the inactive edge resolves to a used
    // length (never "auto"), so we assert right=0 + left≠0, and the inline-style fallback
    // proves the authored `left:auto` intent the CSSOM normalises away.
    await expect(style.right).toBe("0px");
    await expect(style.left).not.toBe("0px");
    await expect(panel.getAttribute("style")).toContain("left: auto");

    // AC-7: default top="100%" passes through as an inline length.
    await expect(panel.getAttribute("style")).toContain("top: 100%");

    // AC-8: a string width passes through (18rem -> 288px at the default 16px root).
    await expect(style.width).toBe("288px");
    await expect(panel.getAttribute("style")).toContain("width: 18rem");

    // AC-9: surface tokens. AC-10: layered above adjacent content.
    await expect(style.backgroundColor).toBe(resolveTokenColor("--bg"));
    await expect(style.borderTopWidth).toBe("1px");
    await expect(style.borderTopStyle).toBe("solid");
    await expect(style.borderTopColor).toBe(resolveTokenColor("--rule-strong"));
    await expect(style.boxShadow).not.toBe("none");
    await expect(parseInt(style.zIndex)).toBeGreaterThanOrEqual(100);

    // AC-18/19: non-modal — the default root is a generic <div> with no implicit role,
    // and no aria-modal / backdrop is rendered.
    await expect(panel.getAttribute("role")).toBeNull();
    await expect(panel.hasAttribute("aria-modal")).toBe(false);

    // AC-15: a plain outside click must NOT dismiss (the handler listens on mousedown).
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeRight).toHaveBeenCalledTimes(0);

    // AC-12: a mousedown inside the panel must NOT dismiss.
    canvas.getByText("// panel").dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeRight).toHaveBeenCalledTimes(0);
    await expect(canvasElement.querySelector('[data-testid="pop-right"]')).not.toBeNull();

    // AC-11: an outside mousedown dismisses exactly once; with bind:open the panel goes.
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeRight).toHaveBeenCalledTimes(1);
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-right"]')).toBeNull();
    });

    // AC-13: re-open via the trigger, then Escape dismisses exactly once more.
    await userEvent.click(canvas.getByRole("button", { name: /align right/i }));
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-right"]')).not.toBeNull();
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeRight).toHaveBeenCalledTimes(2);

    // AC-16: re-opening must not accumulate duplicate listeners — a single outside
    // mousedown after re-open calls onclose exactly once more (not twice).
    await userEvent.click(canvas.getByRole("button", { name: /align right/i }));
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-right"]')).not.toBeNull();
    });
    const before = closeRight.mock.calls.length;
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeRight.mock.calls.length).toBe(before + 1);
  }}>
  {#snippet template()}
    <div style="position:relative;display:inline-block">
      <button class="trigger" onclick={() => (openRight = !openRight)}>
        {openRight ? "Close" : "Open"} · align right
      </button>
      <Popover bind:open={openRight} onclose={closeRight} align="right" width="18rem" data-testid="pop-right">
        <div class="pin">
          <div class="panel-label">// panel</div>
          Outside-click or <span class="esc">Esc</span> dismisses. Anchored to a relative parent.
        </div>
      </Popover>
    </div>
  {/snippet}
</Story>

<!--
  Align Left — mirrors the right variant to the opposite edge, and uses as="section" +
  a numeric width to fold in the remaining contract: left anchoring (AC-6), numeric width
  (AC-8), polymorphic root (AC-4), and the closed-state no-ops (AC-1/14).
-->
<Story name="Align Left"
  play={async ({ canvasElement }) => {
    const panel = canvasElement.querySelector('[data-testid="pop-left"]') as HTMLElement;
    await expect(panel).not.toBeNull();

    // AC-4: as="section" renders a <section> as the panel root.
    await expect(panel.tagName.toLowerCase()).toBe("section");

    const style = getComputedStyle(panel);
    // AC-6: align="left" pins the left edge to 0 (inactive edge resolves to a used
    // length, so assert left=0 + right≠0, plus the authored `right:auto` inline fallback).
    await expect(style.left).toBe("0px");
    await expect(style.right).not.toBe("0px");
    await expect(panel.getAttribute("style")).toContain("right: auto");

    // AC-8: a numeric width maps to px.
    await expect(style.width).toBe("220px");

    // AC-13 → AC-1/14: Escape dismisses; with the panel gone, a further outside mousedown
    // and Escape are no-ops (no listeners active) and do not call onclose again.
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeLeft).toHaveBeenCalledTimes(1);
    await waitFor(async () => {
      await expect(canvasElement.querySelector('[data-testid="pop-left"]')).toBeNull();
    });

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expect(closeLeft).toHaveBeenCalledTimes(1);
    await expect(canvasElement.querySelector('[data-testid="pop-left"]')).toBeNull();
  }}>
  {#snippet template()}
    <div style="position:relative;display:inline-block">
      <button class="trigger" onclick={() => (openLeft = !openLeft)}>
        {openLeft ? "Close" : "Open"} · align left
      </button>
      <Popover bind:open={openLeft} onclose={closeLeft} align="left" width={220} as="section" data-testid="pop-left">
        <div class="pin">
          <div class="panel-label">// panel</div>
          Outside-click or <span class="esc">Esc</span> dismisses. Anchored to a relative parent.
        </div>
      </Popover>
    </div>
  {/snippet}
</Story>

<style>
  .trigger {
    font-family: var(--mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--amber);
    border: 1px solid var(--amber);
    background: none;
    padding: 8px 14px;
    cursor: pointer;
  }
  .pin {
    font-size: 12px;
    color: var(--ink-dim);
    line-height: 1.5;
    padding: 12px 14px;
  }
  .panel-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 6px;
  }
  .esc {
    color: var(--amber);
  }
</style>
