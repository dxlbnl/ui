<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor, fn } from "storybook/test";
  import {
    resolveTokenColor,
    resolveTokenFgColor,
  } from "$lib/storybook-utils.js";
  import Inbox from "./Inbox.svelte";

  const { Story } = defineMeta({
    title: "Feedback/Inbox",
    component: Inbox,
    tags: ["autodocs"],
  });

  // Canonical 3-item fixture: 2 unread (one amber, one danger), 1 read (ok).
  const items = [
    {
      id: "n1",
      tone: "amber",
      title: "Load high",
      body: "Rail load average crossed 0.88 — investigate scheduler.",
      time: "t.04",
      unread: true,
    },
    {
      id: "n2",
      tone: "danger",
      title: "Power fault",
      body: "Power rail reading −12V on bank 3.",
      time: "12:40",
      unread: true,
    },
    {
      id: "n3",
      tone: "ok",
      title: "Sync complete",
      body: "Nightly sync finished without errors.",
      time: "03:00",
      unread: false,
    },
  ];
  const allRead = items.map((i) => ({ ...i, unread: false }));
</script>

<!--
  The bell anchors a right-aligned Popover, so the panel opens downward and to the LEFT.
  At the canvas origin that panel falls off-screen, so every story renders inside a stage
  that pushes the bell to the right and reserves height below it — purely demo scaffolding.
-->
{#snippet stage(args: Record<string, unknown>)}
  <div class="stage">
    <Inbox {...args} />
  </div>
{/snippet}

<!--
  The resting state: a closed bell announcing its unread count. The play function checks the
  trigger's disclosure semantics and accessible name (the derived count rides in the name),
  that no panel exists yet, and the bell + badge chrome — the amber glyph and the "2" badge
  that signal there's something waiting.
-->
<Story
  name="Unread"
  args={{ items }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // the derived unread count (2) rides in the accessible name; it's a disclosure trigger
    const bell = canvas.getByRole("button", { name: "Notifications, 2 unread" });
    await expect(bell).toBeVisible();
    await expect(bell.getAttribute("aria-haspopup")).toBe("dialog");

    // closed by default — no panel, collapsed
    await expect(canvasElement.querySelector(".popover")).toBeNull();
    await expect(bell.getAttribute("aria-expanded")).toBe("false");

    // bell chrome: 34×34, hairline --rule-strong border on the --bg-rail surface
    const bellStyle = getComputedStyle(bell);
    await expect(bellStyle.width).toBe("34px");
    await expect(bellStyle.height).toBe("34px");
    await expect(bellStyle.borderTopWidth).toBe("1px");
    await expect(bellStyle.borderTopColor).toBe(
      resolveTokenColor("--rule-strong"),
    );
    await expect(bellStyle.backgroundColor).toBe(resolveTokenColor("--bg-rail"));

    // unread > 0 tints the glyph --amber and shows the count badge
    const glyph = canvasElement.querySelector('[data-part="glyph"]') as HTMLElement;
    await expect(getComputedStyle(glyph).color).toBe(
      resolveTokenFgColor("--amber"),
    );
    const badge = canvasElement.querySelector('[data-part="badge"]') as HTMLElement;
    await expect(badge.textContent?.trim()).toBe("2");
    const badgeStyle = getComputedStyle(badge);
    await expect(badgeStyle.backgroundColor).toBe(resolveTokenColor("--amber"));
    await expect(badgeStyle.color).toBe(resolveTokenFgColor("--bg"));
    await expect(badgeStyle.position).toBe("absolute");
    await expect(badgeStyle.borderRadius).toBe("8px");
  }}
>
  {#snippet template(args)}
    {@render stage(args)}
  {/snippet}
</Story>

<!--
  The hero: the open notification panel. The play function clicks the bell open and leaves it
  open so the panel is visible in the story. It walks the whole opened contract — the uppercase
  mono header, the scroll-bound list, one button row per item carrying its body + time, and the
  per-row rendering (the tone LED that blinks only on unread non-ok rows, the heavier title and
  rail background on unread rows, and "unread" surfaced in the row's accessible name). It then
  exercises the two callbacks: "Mark all read" fires onMarkAll, and a row click fires onOpen
  with that item — neither closes the panel.
-->
<Story
  name="Open"
  args={{ items, onOpen: fn(), onMarkAll: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", { name: "Notifications, 2 unread" });

    // click opens the panel and flips the trigger to expanded
    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("true");

    // header: uppercase mono --ink-faint label
    const header = canvasElement.querySelector(
      '[data-part="header-label"]',
    ) as HTMLElement;
    await expect(header.textContent?.trim().toUpperCase()).toBe("NOTIFICATIONS");
    const hs = getComputedStyle(header);
    await expect(hs.textTransform).toBe("uppercase");
    await expect(hs.fontFamily.toLowerCase()).toContain("jetbrains mono");
    await expect(hs.color).toBe(resolveTokenFgColor("--ink-faint"));

    // the list scrolls within a bounded height
    const list = canvasElement.querySelector('[data-part="list"]') as HTMLElement;
    const ls = getComputedStyle(list);
    await expect(ls.maxHeight).toBe("360px");
    await expect(ls.overflowY).toBe("auto");

    // one button row per item, reachable by title, showing body + time; plus per-row rendering
    const rows = Array.from(
      canvasElement.querySelectorAll('[data-part="row"]'),
    ) as HTMLElement[];
    await expect(rows.length).toBe(items.length);
    rows.forEach((row, i) => {
      const item = items[i];
      const byTitle = canvas.getByRole("button", {
        name: new RegExp(item.title),
      });
      expect(byTitle.textContent).toContain(item.body);
      expect(byTitle.textContent).toContain(item.time);

      // LED carries the tone and blinks only when unread and not the calm "ok" tone
      const led = row.querySelector(".led") as HTMLElement;
      expect(led.classList.contains(`led-${item.tone}`)).toBe(true);
      expect(led.classList.contains("blink")).toBe(
        item.unread && item.tone !== "ok",
      );

      // unread rows read heavier and sit on the rail surface; read rows are plain
      const title = row.querySelector('[data-part="title"]') as HTMLElement;
      expect(getComputedStyle(title).fontWeight).toBe(item.unread ? "500" : "400");
      expect(getComputedStyle(row).backgroundColor).toBe(
        item.unread ? resolveTokenColor("--bg-rail") : "rgba(0, 0, 0, 0)",
      );

      // "unread" is surfaced as text for assistive tech
      const accName = (row.getAttribute("aria-label") ?? row.textContent ?? "")
        .toLowerCase();
      expect(accName.includes("unread")).toBe(item.unread);
    });

    // "Mark all read" shows while unread > 0 and fires its callback without closing
    const markAll = canvas.getByRole("button", { name: "Mark all read" });
    await userEvent.click(markAll);
    await expect(args.onMarkAll).toHaveBeenCalledTimes(1);

    // clicking a row fires onOpen with that item, panel stays open
    await userEvent.click(canvas.getByRole("button", { name: new RegExp(items[0].title) }));
    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: items[0].id, title: items[0].title }),
    );
    await expect(canvasElement.querySelector(".popover")).not.toBeNull();
  }}
>
  {#snippet template(args)}
    {@render stage(args)}
  {/snippet}
</Story>

<!--
  Nothing waiting: with every item read the count is 0, so the name drops the suffix, the
  glyph goes quiet (--ink-dim), and no badge renders. Opened, the panel omits "Mark all read"
  since there's nothing to clear. Left open so the all-read rows are visible.
-->
<Story
  name="All Read"
  args={{ items: allRead }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    const bell = canvas.getByRole("button", { name: "Notifications" });
    await expect(bell.getAttribute("aria-label")).toBe("Notifications");

    const glyph = canvasElement.querySelector('[data-part="glyph"]') as HTMLElement;
    await expect(getComputedStyle(glyph).color).toBe(
      resolveTokenFgColor("--ink-dim"),
    );
    await expect(canvasElement.querySelector('[data-part="badge"]')).toBeNull();

    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(
      canvas.queryByRole("button", { name: "Mark all read" }),
    ).toBeNull();
  }}
>
  {#snippet template(args)}
    {@render stage(args)}
  {/snippet}
</Story>

<!--
  The three ways the panel dismisses, run in sequence on one bell: a second click on the
  trigger toggles it shut, an outside mousedown closes it, and Escape closes it. Each path
  ends collapsed with the panel removed.
-->
<Story
  name="Dismissal"
  args={{ items }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", { name: "Notifications, 2 unread" });

    const open = async () => {
      await userEvent.click(bell);
      await waitFor(async () => {
        await expect(canvasElement.querySelector(".popover")).not.toBeNull();
      });
      await expect(bell.getAttribute("aria-expanded")).toBe("true");
    };
    const expectClosed = async () => {
      await waitFor(async () => {
        await expect(canvasElement.querySelector(".popover")).toBeNull();
      });
      await expect(bell.getAttribute("aria-expanded")).toBe("false");
    };

    // second click on the trigger toggles closed
    await open();
    await userEvent.click(bell);
    await expectClosed();

    // outside mousedown dismisses
    await open();
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await expectClosed();

    // Escape dismisses
    await open();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await new Promise((r) => setTimeout(r, 0));
    await expectClosed();
  }}
>
  {#snippet template(args)}
    {@render stage(args)}
  {/snippet}
</Story>

<!--
  The trigger is polymorphic and transparent to attributes: `as` sets its element and `...rest`
  (id, data-testid) forwards onto it, while a consumer-supplied aria-label overrides the
  unread-count default — so the bell can be wired into an existing toolbar.
-->
<Story
  name="Polymorphic / Forwarding"
  args={{
    items,
    as: "button",
    id: "notif-bell",
    "data-testid": "bell",
    "aria-label": "Open notifications",
  }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvasElement.querySelector(
      '[data-testid="bell"]',
    ) as HTMLElement;
    await expect(trigger.tagName.toLowerCase()).toBe("button");
    await expect(trigger.getAttribute("id")).toBe("notif-bell");

    // consumer aria-label wins over the "Notifications, 2 unread" default
    await expect(trigger.getAttribute("aria-label")).toBe("Open notifications");
    await expect(
      canvas.getByRole("button", { name: "Open notifications" }),
    ).toBeVisible();
  }}
>
  {#snippet template(args)}
    {@render stage(args)}
  {/snippet}
</Story>

<style>
  .stage {
    display: flex;
    justify-content: flex-end;
    /* keep the bell at its natural 34px height — without this the flex item stretches to
       the stage height and the popover's top:100% anchor lands at the very bottom */
    align-items: flex-start;
    padding: 16px;
    min-height: 480px;
    max-width: 560px;
  }
</style>
