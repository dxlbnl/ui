<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor } from "storybook/test";
  import StatusPill from "./StatusPill.svelte";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Feedback/StatusPill",
    component: StatusPill,
    tags: ["autodocs"],
  });
</script>

<!--
  Shared detail-panel content, mirroring the design-system sample's `// rail detail`
  popover (a label + dashed key/value rows). Rendered as each pill's children so a
  click opens a faithful panel. Authored here so the story <style> scopes it.
-->
{#snippet railDetail()}
  <div class="detail">
    <div class="detail-label">// rail detail</div>
    <div class="kv"><span class="k">+12V</span><span class="v ok">2.04A</span></div>
    <div class="kv"><span class="k">−12V</span><span class="v">0.63A</span></div>
    <div class="kv"><span class="k">Temp</span><span class="v amber">48°C</span></div>
  </div>
{/snippet}

<!--
  OK (default, neutral chrome) — the hero demo. Its play function carries the structure,
  typography, ok-neutral colour contract, rest-forwarding, and the full disclosure
  lifecycle: AC-1/2/3/4/6/9/10/11/12/13/14/15/16/21.
-->
<Story
  name="OK"
  args={{
    tone: "ok",
    label: "All systems",
    detail: "nominal",
    id: "rail-ok",
    "data-testid": "ok-pill",
    "aria-label": "All systems status",
  }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-1: trigger is a real <button>
    await expect(btn.tagName.toLowerCase()).toBe("button");
    await expect(btn).toBeVisible();

    // AC-6: ...rest forwarded onto the trigger
    await expect(btn.getAttribute("data-testid")).toBe("ok-pill");
    await expect(btn.getAttribute("id")).toBe("rail-ok");
    await expect(btn.getAttribute("aria-label")).toBe("All systems status");

    // AC-2: LED carries led-ok (1:1 tone -> class)
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    await expect(led.classList.contains("led-ok")).toBe(true);

    // AC-3 / AC-4: label verbatim + " · nominal" suffix
    await expect(btn.textContent).toContain("All systems");
    await expect(btn.textContent).toContain("·");
    await expect(btn.textContent).toContain("nominal");

    // AC-10: button background resolves to --bg-rail
    const btnStyle = getComputedStyle(btn);
    await expect(btnStyle.backgroundColor).toBe(resolveTokenColor("--bg-rail"));

    // AC-9: ok tone is neutral — border --rule-strong (NOT --ok), 1px solid
    await expect(btnStyle.borderTopWidth).toBe("1px");
    await expect(btnStyle.borderTopStyle).toBe("solid");
    await expect(btnStyle.borderTopColor).toBe(resolveTokenColor("--rule-strong"));
    await expect(btnStyle.borderTopColor).not.toBe(resolveTokenColor("--ok"));

    // AC-9 / AC-11 / AC-12: ok label --ink-dim (NOT --ok), mono, uppercase
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    const labelStyle = getComputedStyle(label);
    await expect(labelStyle.color).toBe(resolveTokenFgColor("--ink-dim"));
    await expect(labelStyle.color).not.toBe(resolveTokenFgColor("--ok"));
    await expect(labelStyle.fontFamily.toLowerCase()).toContain("jetbrains mono");
    await expect(labelStyle.textTransform).toBe("uppercase");

    // AC-13: detail suffix renders in faint ink
    const detail = canvasElement.querySelector('[data-part="detail"]') as HTMLElement;
    await expect(detail.textContent).toContain("nominal");
    await expect(getComputedStyle(detail).color).toBe(resolveTokenFgColor("--ink-faint"));

    // AC-21 / AC-14: disclosure semantics + closed by default
    await expect(btn.getAttribute("aria-haspopup")).toBe("dialog");
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
    await expect(canvasElement.querySelector(".popover")).toBeNull();

    // AC-15: click opens — panel + detail content visible, aria-expanded="true"
    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(canvas.getByText("// rail detail")).toBeVisible();
    await expect(btn.getAttribute("aria-expanded")).toBe("true");

    // AC-16: second click toggles closed
    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
  }}
>
  {@render railDetail()}
</Story>

<!--
  Amber (blinking) — accent tone. Folds in blink forwarding (AC-5), amber label/border
  (AC-7/8), Popover align+width forwarding (AC-20), and Escape dismissal (AC-19).
-->
<Story
  name="Amber"
  args={{ tone: "amber", label: "Load high", detail: "88%", blink: true, align: "left", width: 220 }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-2: led-amber. AC-5: blink forwarded -> blink class + active animation
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led.classList.contains("led-amber")).toBe(true);
    await expect(led.classList.contains("blink")).toBe(true);
    await expect(getComputedStyle(led).animationName).not.toBe("none");

    // AC-7: label --amber. AC-8: border --amber, 1px solid
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--amber"));
    const btnStyle = getComputedStyle(btn);
    await expect(btnStyle.borderTopWidth).toBe("1px");
    await expect(btnStyle.borderTopStyle).toBe("solid");
    await expect(btnStyle.borderTopColor).toBe(resolveTokenColor("--amber"));

    // open the detail popover
    await userEvent.click(btn);
    const panel = (await waitFor(() => {
      const p = canvasElement.querySelector(".popover") as HTMLElement | null;
      if (!p) throw new Error("popover not yet open");
      return p;
    })) as HTMLElement;

    // AC-20: align="left" -> left:0 / right:auto fallback; width=220 -> 220px
    const style = getComputedStyle(panel);
    await expect(style.left).toBe("0px");
    await expect(style.right).not.toBe("0px");
    await expect(panel.getAttribute("style")).toContain("right: auto");
    await expect(style.width).toBe("220px");

    // AC-19: Escape dismisses the open popover
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
  }}
>
  {@render railDetail()}
</Story>

<!--
  Danger — accent tone. Folds in danger label/border (AC-7/8) and outside-click
  dismissal inherited from Popover (AC-18).
-->
<Story
  name="Danger"
  args={{ tone: "danger", label: "Fault", detail: "rail −12V" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-2: led-danger
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led.classList.contains("led-danger")).toBe(true);

    // AC-7: label --danger. AC-8: border --danger
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--danger"));
    await expect(getComputedStyle(btn).borderTopColor).toBe(resolveTokenColor("--danger"));

    // open, then AC-18: an outside mousedown dismisses the popover
    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("true");

    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
  }}
>
  {@render railDetail()}
</Story>

<!--
  Cyan (badge only) — no detail, no children: the minimal pill. Folds in the cyan tone
  (AC-2/7/8) and every negative branch: no detail suffix (AC-4 neg), no blink class
  (AC-5 neg), no disclosure semantics + clicking opens no panel (AC-14/17/21 neg).
-->
<Story
  name="Cyan"
  args={{ tone: "cyan", label: "Sync" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-2: led-cyan. AC-5 neg: blink defaults false -> no blink class
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led.classList.contains("led-cyan")).toBe(true);
    await expect(led.classList.contains("blink")).toBe(false);

    // AC-7: label --cyan. AC-8: border --cyan
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--cyan"));
    await expect(getComputedStyle(btn).borderTopColor).toBe(resolveTokenColor("--cyan"));

    // AC-4 neg: no detail -> no "·" separator, no detail part rendered
    await expect(btn.textContent).toContain("Sync");
    await expect(btn.textContent).not.toContain("·");
    await expect(canvasElement.querySelector('[data-part="detail"]')).toBeNull();

    // AC-21 neg / AC-14 / AC-17: no children -> no disclosure semantics, click opens nothing
    await expect(btn.getAttribute("aria-haspopup")).toBeNull();
    await userEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    await expect(canvasElement.querySelector(".popover")).toBeNull();
  }}
/>

<style>
  .detail {
    padding: 12px 14px;
  }
  .detail-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-faint);
    margin-bottom: 8px;
  }
  .kv {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    font-family: var(--mono);
    font-size: 11px;
    padding: 5px 0;
    border-bottom: 1px dashed var(--rule);
  }
  .kv:last-child {
    border-bottom: none;
  }
  .kv .k {
    color: var(--ink-faint);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .kv .v {
    color: var(--ink);
  }
  .kv .v.ok {
    color: var(--ok);
  }
  .kv .v.amber {
    color: var(--amber);
  }
</style>
