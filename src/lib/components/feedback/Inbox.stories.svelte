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
  // Stable ids so onOpen assertions can match by id/title.
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

  // All-read fixture (every item read) for AC 1/2/3/4/15 negative paths.
  const allRead = items.map((i) => ({ ...i, unread: false }));
</script>

<!--
  Story 1 — Closed With Unread.
  ACs: 1 (derived count 2), 2 (glyph --amber), 3 (badge present, text "2"),
       5 (closed by default: no panel, aria-expanded="false"),
       15 (aria-label "Notifications, 2 unread"), 16 (aria-haspopup="dialog"),
       19 (bell chrome 34x34, border 1px solid --rule-strong, bg --bg-rail),
       20 (badge geometry/colour).
-->
<Story
  name="Closed With Unread"
  args={{ items }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-15 / AC-1: bell accessible name carries the derived unread count (2)
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;
    await expect(bell).toBeVisible();
    await expect(bell.tagName.toLowerCase()).toBe("button");

    // AC-16: disclosure semantics on the trigger
    await expect(bell.getAttribute("aria-haspopup")).toBe("dialog");

    // AC-5: closed by default — no panel, aria-expanded="false"
    await expect(canvasElement.querySelector(".popover")).toBeNull();
    await expect(bell.getAttribute("aria-expanded")).toBe("false");

    // AC-19: bell chrome — 34x34, 1px solid --rule-strong border, --bg-rail bg
    const bellStyle = getComputedStyle(bell);
    await expect(bellStyle.width).toBe("34px");
    await expect(bellStyle.height).toBe("34px");
    await expect(bellStyle.borderTopWidth).toBe("1px");
    await expect(bellStyle.borderTopStyle).toBe("solid");
    await expect(bellStyle.borderTopColor).toBe(
      resolveTokenColor("--rule-strong"),
    );
    await expect(bellStyle.backgroundColor).toBe(resolveTokenColor("--bg-rail"));

    // AC-2: glyph colour resolves to --amber when unread > 0
    const glyph = canvasElement.querySelector(
      '[data-part="glyph"]',
    ) as HTMLElement;
    await expect(glyph).not.toBeNull();
    await expect(getComputedStyle(glyph).color).toBe(
      resolveTokenFgColor("--amber"),
    );

    // AC-3: badge present with text "2"
    const badge = canvasElement.querySelector(
      '[data-part="badge"]',
    ) as HTMLElement;
    await expect(badge).not.toBeNull();
    await expect(badge.textContent!.trim()).toBe("2");

    // AC-20: badge geometry/colour
    const badgeStyle = getComputedStyle(badge);
    await expect(badgeStyle.backgroundColor).toBe(resolveTokenColor("--amber"));
    await expect(badgeStyle.color).toBe(resolveTokenFgColor("--bg"));
    await expect(badgeStyle.minWidth).toBe("15px");
    await expect(badgeStyle.height).toBe("15px");
    await expect(badgeStyle.borderRadius).toBe("8px");
    await expect(badgeStyle.position).toBe("absolute");
  }}
/>

<!--
  Story 2 — Opens On Click.
  ACs: 6 (click opens: panel + "NOTIFICATIONS" header + N rows, aria-expanded="true"),
       21 (header uppercase mono --ink-faint),
       22 (list max-height 360 / overflow-y auto),
       12 (each row a button reachable by /title/),
       7 (second click toggles closed — D56 guard path).
-->
<Story
  name="Opens On Click"
  args={{ items }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;

    // closed to start
    await expect(canvasElement.querySelector(".popover")).toBeNull();
    await expect(bell.getAttribute("aria-expanded")).toBe("false");

    // AC-6: click opens — panel rendered, aria-expanded="true"
    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("true");

    // AC-6 / AC-21: header "NOTIFICATIONS" present
    const header = canvasElement.querySelector(
      '[data-part="header-label"]',
    ) as HTMLElement;
    await expect(header).not.toBeNull();
    await expect(header.textContent!.trim().toUpperCase()).toBe(
      "NOTIFICATIONS",
    );

    // AC-21: header is uppercase mono, colour --ink-faint
    const headerStyle = getComputedStyle(header);
    await expect(headerStyle.textTransform).toBe("uppercase");
    await expect(headerStyle.fontFamily.toLowerCase()).toContain(
      "jetbrains mono",
    );
    await expect(headerStyle.color).toBe(resolveTokenFgColor("--ink-faint"));

    // AC-6 / AC-12: one button row per item, reachable by title
    for (const item of items) {
      const row = canvas.getByRole("button", {
        name: new RegExp(item.title),
      }) as HTMLButtonElement;
      await expect(row).toBeVisible();
      // row renders body + time visible text
      await expect(row.textContent).toContain(item.body);
      await expect(row.textContent).toContain(item.time);
    }

    // AC-22: list container scroll bound
    const list = canvasElement.querySelector(
      '[data-part="list"]',
    ) as HTMLElement;
    await expect(list).not.toBeNull();
    const listStyle = getComputedStyle(list);
    await expect(listStyle.maxHeight).toBe("360px");
    await expect(listStyle.overflowY).toBe("auto");

    // AC-7: second click toggles closed (D56 stopPropagation guard path)
    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("false");
  }}
/>

<!--
  Story 3 — Item Rendering.
  ACs: 13 (per-row led-{tone} + blink on unread non-ok, no blink on read/ok),
       14 (unread title weight 500 + --bg-rail bg; read title 400 + transparent bg),
       17 (unread row accessible name includes "unread", read row does not).
-->
<Story
  name="Item Rendering"
  args={{ items }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;

    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });

    const rows = Array.from(
      canvasElement.querySelectorAll('[data-part="row"]'),
    ) as HTMLElement[];
    await expect(rows.length).toBe(items.length);

    // map rows to fixture by title (order preserved, but assert by matching)
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      const row = rows[idx];

      // AC-13: row LED carries led-{tone}
      const led = row.querySelector(".led") as HTMLElement;
      await expect(led).not.toBeNull();
      await expect(led.classList.contains(`led-${item.tone}`)).toBe(true);

      // AC-13: blink iff unread and tone !== 'ok'
      const shouldBlink = item.unread && item.tone !== "ok";
      await expect(led.classList.contains("blink")).toBe(shouldBlink);

      // AC-14: title weight 500 when unread else 400
      const title = row.querySelector('[data-part="title"]') as HTMLElement;
      await expect(title).not.toBeNull();
      await expect(getComputedStyle(title).fontWeight).toBe(
        item.unread ? "500" : "400",
      );

      // AC-14: unread row bg --bg-rail; read row transparent
      const rowBg = getComputedStyle(row).backgroundColor;
      if (item.unread) {
        await expect(rowBg).toBe(resolveTokenColor("--bg-rail"));
      } else {
        await expect(rowBg).toBe("rgba(0, 0, 0, 0)");
      }

      // AC-17: unread surfaced as text in the accessible name
      const accName = (
        row.getAttribute("aria-label") ?? row.textContent ?? ""
      ).toLowerCase();
      if (item.unread) {
        await expect(accName).toContain("unread");
      } else {
        await expect(accName).not.toContain("unread");
      }
    }
  }}
/>

<!--
  Story 4 — Click Item Fires onOpen.
  ACs: 10 (clicking a row calls onOpen once with the matching item).
-->
<Story
  name="Click Item Fires onOpen"
  args={{ items, onOpen: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;

    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });

    // AC-10: click the first row -> onOpen once with that item
    const target = items[0];
    const row = canvas.getByRole("button", {
      name: new RegExp(target.title),
    }) as HTMLButtonElement;
    await userEvent.click(row);

    await expect(args.onOpen).toHaveBeenCalledTimes(1);
    await expect(args.onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ id: target.id, title: target.title }),
    );
  }}
/>

<!--
  Story 5 — Mark All Fires onMarkAll.
  ACs: 4 (mark-all present when unread > 0), 11 (clicking it calls onMarkAll once),
       18 (reachable by accessible name "Mark all read").
-->
<Story
  name="Mark All Fires onMarkAll"
  args={{ items, onMarkAll: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;

    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });

    // AC-4 / AC-18: mark-all button present, reachable by accessible name
    const markAll = canvas.getByRole("button", {
      name: "Mark all read",
    }) as HTMLButtonElement;
    await expect(markAll).toBeVisible();

    // AC-11: clicking it fires onMarkAll exactly once
    await userEvent.click(markAll);
    await expect(args.onMarkAll).toHaveBeenCalledTimes(1);
  }}
/>

<!--
  Story 6 — All Read.
  ACs: 1 (count 0), 2 (glyph --ink-dim), 3 (no badge),
       15 (aria-label "Notifications"), 4 (no "Mark all read" when open).
-->
<Story
  name="All Read"
  args={{ items: allRead }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);

    // AC-15 / AC-1: count 0 -> aria-label is just "Notifications"
    const bell = canvas.getByRole("button", {
      name: "Notifications",
    }) as HTMLButtonElement;
    await expect(bell).toBeVisible();
    await expect(bell.getAttribute("aria-label")).toBe("Notifications");

    // AC-2: glyph colour resolves to --ink-dim when unread === 0
    const glyph = canvasElement.querySelector(
      '[data-part="glyph"]',
    ) as HTMLElement;
    await expect(glyph).not.toBeNull();
    await expect(getComputedStyle(glyph).color).toBe(
      resolveTokenFgColor("--ink-dim"),
    );

    // AC-3: no badge element exists
    await expect(canvasElement.querySelector('[data-part="badge"]')).toBeNull();

    // AC-4: open -> no "Mark all read" button
    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(
      canvas.queryByRole("button", { name: "Mark all read" }),
    ).toBeNull();
  }}
/>

<!--
  Story 7 — Dismiss On Outside Click.
  ACs: 8 (outside mousedown closes the open panel: removed, aria-expanded="false").
  Positive control: the panel actually opens first (B56 positive-control ADR).
-->
<Story
  name="Dismiss On Outside Click"
  args={{ items }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;

    // open (positive control)
    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("true");

    // AC-8: outside mousedown dismisses
    document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("false");
  }}
/>

<!--
  Story 8 — Dismiss On Escape.
  ACs: 9 (Escape keydown closes the open panel: removed, aria-expanded="false").
-->
<Story
  name="Dismiss On Escape"
  args={{ items }}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const bell = canvas.getByRole("button", {
      name: "Notifications, 2 unread",
    }) as HTMLButtonElement;

    await userEvent.click(bell);
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).not.toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("true");

    // AC-9: Escape on document dismisses
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await new Promise((r) => setTimeout(r, 0));
    await waitFor(async () => {
      await expect(canvasElement.querySelector(".popover")).toBeNull();
    });
    await expect(bell.getAttribute("aria-expanded")).toBe("false");
  }}
/>

<!--
  Story 9 — Polymorphic As / Rest Forwarding.
  ACs: 15 override path (consumer aria-label wins over the unread-count default),
       ...rest forwarding onto the trigger (id, data-testid). StatusPill Story 12 idiom.
-->
<Story
  name="Polymorphic As / Rest Forwarding"
  args={{
    items,
    as: "button",
    id: "notif-bell",
    "data-testid": "bell",
    "aria-label": "Open notifications",
  }}
  play={async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector(
      '[data-testid="bell"]',
    ) as HTMLElement;
    await expect(trigger).not.toBeNull();
    await expect(trigger.tagName.toLowerCase()).toBe("button");

    // ...rest forwarded onto the trigger
    await expect(trigger.getAttribute("id")).toBe("notif-bell");
    await expect(trigger.getAttribute("data-testid")).toBe("bell");

    // AC-15 override: consumer aria-label wins (NOT "Notifications, 2 unread")
    await expect(trigger.getAttribute("aria-label")).toBe("Open notifications");
    await expect(
      within(canvasElement).getByRole("button", {
        name: "Open notifications",
      }),
    ).toBeVisible();
  }}
/>
