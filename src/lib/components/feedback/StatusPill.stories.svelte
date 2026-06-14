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

  // The label span carries the mono/uppercase typography (AC-11/12). We query it
  // structurally as the first <span> inside the trigger that holds the label text;
  // the detail suffix (AC-13) is a nested <span> within it. Stable structural hooks
  // are used so the component author is free in markup detail, while the contract
  // (a label span + a nested detail span) is what these tests pin.
</script>

<!--
  Story 1 — OK.
  ACs: 1 (button), 2 (led-ok), 3 (label verbatim), 4 (· nominal suffix),
       9 (neutral --ink-dim label + --rule-strong border, NOT --ok),
       10 (--bg-rail background), 11/12 (mono uppercase), 13 (faint detail).
-->
<Story
  name="OK"
  args={{ tone: "ok", label: "All systems", detail: "nominal" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-1: trigger is a real <button>, queryable by role
    const btn = canvas.getByRole("button") as HTMLButtonElement;
    await expect(btn).toBeVisible();
    await expect(btn.tagName.toLowerCase()).toBe("button");

    // AC-2: LED is present and carries led-ok (1:1 tone -> class)
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    await expect(led.classList.contains("led-ok")).toBe(true);

    // AC-3 / AC-4: label verbatim + " · nominal" suffix in the button text
    await expect(btn.textContent).toContain("All systems");
    await expect(btn.textContent).toContain("nominal");
    await expect(btn.textContent).toContain("·");

    // AC-10: button background resolves to --bg-rail
    const btnStyle = getComputedStyle(btn);
    await expect(btnStyle.backgroundColor).toBe(resolveTokenColor("--bg-rail"));

    // AC-9: ok tone is neutral — border resolves to --rule-strong, NOT --ok
    await expect(btnStyle.borderTopWidth).toBe("1px");
    await expect(btnStyle.borderTopStyle).toBe("solid");
    await expect(btnStyle.borderTopColor).toBe(resolveTokenColor("--rule-strong"));
    await expect(btnStyle.borderTopColor).not.toBe(resolveTokenColor("--ok"));

    // AC-9: ok label colour resolves to --ink-dim, NOT --ok
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(label).not.toBeNull();
    const labelStyle = getComputedStyle(label);
    await expect(labelStyle.color).toBe(resolveTokenFgColor("--ink-dim"));
    await expect(labelStyle.color).not.toBe(resolveTokenFgColor("--ok"));

    // AC-11: mono font stack (JetBrains Mono leads the --mono token)
    await expect(labelStyle.fontFamily.toLowerCase()).toContain("jetbrains mono");
    // AC-12: uppercase
    await expect(labelStyle.textTransform).toBe("uppercase");

    // AC-13: detail suffix renders in faint ink
    const detail = canvasElement.querySelector('[data-part="detail"]') as HTMLElement;
    await expect(detail).not.toBeNull();
    await expect(detail.textContent).toContain("nominal");
    await expect(getComputedStyle(detail).color).toBe(resolveTokenFgColor("--ink-faint"));
  }}
>
  <p class="pin">All systems nominal — uptime 142d.</p>
</Story>

<!--
  Story 2 — Amber.
  ACs: 2 (led-amber), 7 (--amber label), 8 (--amber border).
-->
<Story
  name="Amber"
  args={{ tone: "amber", label: "Load high", detail: "88%" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-2: LED carries led-amber
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    await expect(led.classList.contains("led-amber")).toBe(true);

    // AC-7: label colour resolves to --amber
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(label).not.toBeNull();
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--amber"));

    // AC-8: border colour resolves to --amber, 1px solid
    const btnStyle = getComputedStyle(btn);
    await expect(btnStyle.borderTopWidth).toBe("1px");
    await expect(btnStyle.borderTopStyle).toBe("solid");
    await expect(btnStyle.borderTopColor).toBe(resolveTokenColor("--amber"));
  }}
>
  <p class="pin">Load average 0.88 across the rail.</p>
</Story>

<!--
  Story 3 — Cyan (no detail snippet).
  ACs: 2 (led-cyan), 7 (--cyan label), 8 (--cyan border),
       17 (clicking does NOT open a Popover when no children).
-->
<Story
  name="Cyan"
  args={{ tone: "cyan", label: "Sync", detail: "t.04", "data-testid": "cyan-pill" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-2: LED carries led-cyan
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    await expect(led.classList.contains("led-cyan")).toBe(true);

    // AC-7: label colour resolves to --cyan
    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(label).not.toBeNull();
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--cyan"));

    // AC-8: border colour resolves to --cyan
    await expect(getComputedStyle(btn).borderTopColor).toBe(resolveTokenColor("--cyan"));

    // AC-17: no children -> clicking must NOT open a Popover panel
    await userEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    await expect(canvasElement.querySelector(".popover")).toBeNull();
  }}
/>

<!--
  Story 4 — Danger.
  ACs: 2 (led-danger), 7 (--danger label), 8 (--danger border).
-->
<Story
  name="Danger"
  args={{ tone: "danger", label: "Fault", detail: "rail −12V" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    await expect(led.classList.contains("led-danger")).toBe(true);

    const label = canvasElement.querySelector('[data-part="label"]') as HTMLElement;
    await expect(label).not.toBeNull();
    await expect(getComputedStyle(label).color).toBe(resolveTokenFgColor("--danger"));

    await expect(getComputedStyle(btn).borderTopColor).toBe(resolveTokenColor("--danger"));
  }}
>
  <p class="pin">Power rail reading −12V — investigate.</p>
</Story>

<!--
  Story 5 — Blinking.
  ACs: 5 (blink forwards to LED -> .blink class present).
-->
<Story
  name="Blinking"
  args={{ tone: "amber", label: "Pulsing", blink: true }}
  play={async ({ canvasElement }) => {
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    // AC-5: blink forwarded -> LED carries the blink class + an active animation
    await expect(led.classList.contains("blink")).toBe(true);
    await expect(getComputedStyle(led).animationName).not.toBe("none");
  }}
>
  <p class="pin">Telemetry pulse active.</p>
</Story>

<!--
  Story 6 — Without Detail Suffix.
  ACs: 4 negative (no detail -> no "·" separator; no detail part rendered),
       5 negative (no blink -> LED has no blink class).
-->
<Story
  name="Without Detail Suffix"
  args={{ tone: "ok", label: "Idle" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-3: label still present
    await expect(btn.textContent).toContain("Idle");
    // AC-4 negative: no "·" separator anywhere in the button text
    await expect(btn.textContent).not.toContain("·");
    // AC-4 negative: no detail span rendered
    await expect(canvasElement.querySelector('[data-part="detail"]')).toBeNull();

    // AC-5 negative: blink defaults false -> LED has no blink class
    const led = canvasElement.querySelector(".led") as HTMLElement;
    await expect(led).not.toBeNull();
    await expect(led.classList.contains("blink")).toBe(false);
  }}
>
  <p class="pin">Nothing running right now.</p>
</Story>

<!--
  Story 7 — Opens On Click.
  ACs: 14 (closed by default: no panel, aria-expanded="false"),
       15 (click opens: panel + detail visible, aria-expanded="true"),
       16 (second click toggles closed),
       21 (aria-haspopup="dialog").
-->
<Story
  name="Opens On Click"
  args={{ tone: "ok", label: "All systems", detail: "nominal" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // AC-21: disclosure semantics on the trigger
    await expect(btn.getAttribute("aria-haspopup")).toBe("dialog");

    // AC-14: closed by default — no panel, aria-expanded="false"
    await expect(canvasElement.querySelector(".popover")).toBeNull();
    await expect(btn.getAttribute("aria-expanded")).toBe("false");

    // AC-15: click opens — panel rendered, detail content visible, aria-expanded="true"
    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(within(canvasElement).getByText("Detail panel body")).toBeVisible();
    await expect(btn.getAttribute("aria-expanded")).toBe("true");

    // AC-16: second click toggles closed — panel removed, aria-expanded="false"
    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
  }}
>
  <p class="pin">Detail panel body</p>
</Story>

<!--
  Story 8 — No Popover Without Detail.
  ACs: 17 (no children -> clicking does NOT render a panel, play does not throw).
  Positive control: Story 7 ("Opens On Click", with detail) proves the disclosure
  machinery actually opens a panel, so this negative assertion is non-vacuous.
-->
<Story
  name="No Popover Without Detail"
  args={{ tone: "ok", label: "Badge only" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // closed to start
    await expect(canvasElement.querySelector(".popover")).toBeNull();

    // AC-17: clicking with no children never renders a Popover panel
    await userEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    await expect(canvasElement.querySelector(".popover")).toBeNull();

    // a second click is still a no-op (does not throw, no panel appears)
    await userEvent.click(btn);
    await new Promise((r) => setTimeout(r, 0));
    await expect(canvasElement.querySelector(".popover")).toBeNull();
  }}
/>

<!--
  Story 9 — Dismiss On Outside Click.
  ACs: 18 (outside mousedown closes the open popover: panel removed, aria-expanded="false").
  Inherited from Popover, asserted here at the StatusPill level.
-->
<Story
  name="Dismiss On Outside Click"
  args={{ tone: "cyan", label: "Sync", detail: "t.04" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    // open via click (positive control that the panel actually appears)
    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("true");

    // AC-18: an outside mousedown dismisses the popover
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
  }}
>
  <p class="pin">Sync detail panel</p>
</Story>

<!--
  Story 10 — Dismiss On Escape.
  ACs: 19 (Escape keydown closes the open popover: panel removed, aria-expanded="false").
-->
<Story
  name="Dismiss On Escape"
  args={{ tone: "amber", label: "Load high", detail: "88%" }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    await userEvent.click(btn);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("true");

    // AC-19: Escape on document dismisses the popover
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(btn.getAttribute("aria-expanded")).toBe("false");
  }}
>
  <p class="pin">Load detail panel</p>
</Story>

<!--
  Story 11 — Align And Width Forwarded.
  ACs: 20 (align="left" -> panel left:0px / right:auto fallback; width=220 -> 220px).
  Asserted on an open, with-detail instance.
-->
<Story
  name="Align And Width Forwarded"
  args={{ tone: "ok", label: "Anchored", detail: "left", align: "left", width: 220 }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole("button") as HTMLButtonElement;

    await userEvent.click(btn);
    const panel = (await waitFor(() => {
      const p = canvasElement.querySelector(".popover") as HTMLElement | null;
      if (!p) throw new Error("popover not yet open");
      return p;
    })) as HTMLElement;

    const style = getComputedStyle(panel);
    // AC-20: align="left" -> left edge pinned, right edge is the auto fallback
    await expect(style.left).toBe("0px");
    await expect(style.right).not.toBe("0px");
    await expect(panel.getAttribute("style")).toContain("right: auto");

    // AC-20: width forwarded -> 220px
    await expect(style.width).toBe("220px");
  }}
>
  <p class="pin">Left-anchored detail</p>
</Story>

<!--
  Story 12 — Polymorphic As / Rest Forwarding.
  ACs: 6 (...rest forwarded onto the trigger: data-testid, aria-label, id;
       as prop sets the trigger element tag).
-->
<Story
  name="Polymorphic As / Rest Forwarding"
  args={{
    tone: "ok",
    label: "Power rail",
    as: "button",
    id: "rail-pill",
    "data-testid": "pill",
    "aria-label": "Power rail status",
  }}
  play={async ({ canvasElement }) => {
    // AC-6: forwarded attributes present on the trigger
    const trigger = canvasElement.querySelector('[data-testid="pill"]') as HTMLElement;
    await expect(trigger).not.toBeNull();
    await expect(trigger.getAttribute("data-testid")).toBe("pill");
    await expect(trigger.getAttribute("id")).toBe("rail-pill");
    await expect(trigger.getAttribute("aria-label")).toBe("Power rail status");

    // as="button" -> trigger renders as a <button>, queryable by accessible name
    await expect(trigger.tagName.toLowerCase()).toBe("button");
    await expect(
      within(canvasElement).getByRole("button", { name: "Power rail status" }),
    ).toBeVisible();
  }}
>
  <p class="pin">Power rail detail</p>
</Story>
