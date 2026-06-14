<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor, fn } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import AppShell from "./AppShell.svelte";

  // No component: — AppShell needs Snippet slots (brand/topLeft/topRight/footer/children)
  // and must be wrapped in a width-controlled element so the @container query resolves
  // deterministically (D65 — mirrors Grid.collapse.stories.svelte). Each story renders a
  // full <AppShell> inside a fixed-width wrapper in the story slot (composition pattern).
  const { Story } = defineMeta({
    title: "Navigation/AppShell",
    tags: ["autodocs"],
  });

  // Shared nav: at least one badged item ("inbox" badge = 3).
  const NAV = [
    { id: "feed", label: "Feed" },
    { id: "inbox", label: "Inbox", badge: 3 },
    { id: "settings", label: "Settings" },
  ];
</script>

<!--
  Story 1 — Desktop Layout (wrapper width 940px ≥ 760px).
  ACs: 1 (container-type on root), 3 (<main> scrollable), 4 (sticky top bar tokens),
  6 (aside visible / tab nav display:none), 7 (rail width/tokens/flex-column),
  8 (brand block + bottom rule), 9 (one rail button per item in order),
  11 (full-height frame), 24 (<main> landmark).
-->
<Story
  name="Desktop Layout"
  play={async ({ canvasElement }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;

    // AC-1: root carries container-type: inline-size (computed 'inline-size' or 'size')
    const ct = getComputedStyle(root).containerType;
    await expect(["inline-size", "size"]).toContain(ct);

    // AC-6: desktop rail <aside> visible, mobile tab nav display:none (wait for @container)
    const aside = root.querySelector("aside") as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await expect(aside).not.toBeNull();
    await expect(tabNav).not.toBeNull();
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).not.toBe("none");
    });
    await expect(getComputedStyle(tabNav).display).toBe("none");

    // AC-7: rail width 212px, right rule, rail bg, flex column
    await expect(getComputedStyle(aside).width).toBe("212px");
    await expect(getComputedStyle(aside).borderRightColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(getComputedStyle(aside).backgroundColor).toBe(
      resolveTokenColor("--bg-rail"),
    );
    await expect(getComputedStyle(aside).display).toBe("flex");
    await expect(getComputedStyle(aside).flexDirection).toBe("column");

    // AC-8: brand block is first region of the rail, has a bottom rule, renders brand text
    const brand = root.querySelector('[data-part="brand"]') as HTMLElement;
    await expect(brand).not.toBeNull();
    await expect(getComputedStyle(brand).borderBottomColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(brand.textContent).toContain("DXLB");

    // AC-9: rail <nav> has one button per item, in order
    const rail = within(aside);
    const railButtons = rail.getAllByRole("button");
    await expect(railButtons.length).toBe(3);
    await expect(railButtons[0]).toHaveAccessibleName("Feed");
    await expect(railButtons[1]).toHaveAccessibleName("Inbox");
    await expect(railButtons[2]).toHaveAccessibleName("Settings");

    // AC-4: sticky top bar — position sticky, top 0, z-index 50, bg + bottom rule tokens
    const topBar = root.querySelector('[data-part="top-bar"]') as HTMLElement;
    await expect(topBar).not.toBeNull();
    await expect(getComputedStyle(topBar).position).toBe("sticky");
    await expect(getComputedStyle(topBar).top).toBe("0px");
    await expect(getComputedStyle(topBar).zIndex).toBe("50");
    await expect(getComputedStyle(topBar).backgroundColor).toBe(
      resolveTokenColor("--bg"),
    );
    await expect(getComputedStyle(topBar).borderBottomColor).toBe(
      resolveTokenColor("--rule"),
    );

    // AC-24: <main> landmark present
    const main = within(canvasElement).getByRole("main");
    await expect(main).toBeVisible();

    // AC-3: <main> is scrollable (overflow-y: auto)
    await expect(getComputedStyle(main).overflowY).toBe("auto");

    // AC-11: full-height frame — only <main> scrolls (root/frame 100vh|100% + overflow hidden)
    const frameHeight = getComputedStyle(root).height;
    await expect(frameHeight === "600px" || /vh|%/.test(frameHeight)).toBe(true);
  }}
>
  <div style="width: 940px; height: 600px;">
    {#snippet brandSnippet()}
      <strong>DXLB</strong>
    {/snippet}
    {#snippet topLeftSnippet()}
      <span>Workspace</span>
    {/snippet}
    {#snippet topRightSnippet()}
      <button type="button">Account</button>
    {/snippet}
    {#snippet content()}
      <p>Main content region.</p>
    {/snippet}
    <AppShell
      brand={brandSnippet}
      topLeft={topLeftSnippet}
      topRight={topRightSnippet}
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content}
    />
  </div>
</Story>

<!--
  Story 2 — Desktop Active + Badge (940px ≥ 760px).
  ACs: 16 (active rail item amber border-left + amber colour, inactive transparent +
  ink-dim), 17 (aria-current="page" on active only), 18 (badge pill amber bg / bg text on
  badged item, absent on others), 20 (label mono + uppercase).
-->
<Story
  name="Desktop Active + Badge"
  play={async ({ canvasElement }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const aside = root.querySelector("aside") as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).not.toBe("none");
    });
    const rail = within(aside);

    const amberFg = resolveTokenFgColor("--amber");
    const inkDim = resolveTokenFgColor("--ink-dim");

    // current="inbox" → Inbox is active
    const activeBtn = rail.getByRole("button", { name: "Inbox" });
    const inactiveBtn = rail.getByRole("button", { name: "Feed" });

    // AC-16: active rail item border-left + colour = --amber
    await expect(getComputedStyle(activeBtn).borderLeftColor).toBe(amberFg);
    await expect(getComputedStyle(activeBtn).color).toBe(amberFg);

    // AC-16: inactive rail item transparent border-left + --ink-dim colour
    await expect(getComputedStyle(inactiveBtn).borderLeftColor).toBe(
      "rgba(0, 0, 0, 0)",
    );
    await expect(getComputedStyle(inactiveBtn).color).toBe(inkDim);

    // AC-17: aria-current="page" on active only
    await expect(activeBtn.getAttribute("aria-current")).toBe("page");
    await expect(inactiveBtn.hasAttribute("aria-current")).toBe(false);

    // AC-18: badged item renders a pill (amber bg, --bg text) containing the badge text
    const pill = activeBtn.querySelector('[data-part="rail-badge"]') as HTMLElement;
    await expect(pill).not.toBeNull();
    await expect(pill.textContent).toContain("3");
    await expect(getComputedStyle(pill).backgroundColor).toBe(
      resolveTokenColor("--amber"),
    );
    await expect(getComputedStyle(pill).color).toBe(resolveTokenFgColor("--bg"));

    // AC-18: a NavItem with no badge renders no pill
    await expect(
      inactiveBtn.querySelector('[data-part="rail-badge"]'),
    ).toBeNull();

    // AC-20: rail label uses mono font + uppercase
    const labelFont = getComputedStyle(inactiveBtn).fontFamily.toLowerCase();
    await expect(
      labelFont.includes("jetbrains") || labelFont.includes("mono"),
    ).toBe(true);
    await expect(getComputedStyle(inactiveBtn).textTransform).toBe("uppercase");
  }}
>
  <div style="width: 940px; height: 600px;">
    {#snippet content()}
      <p>Body.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      nav={NAV}
      current="inbox"
      onNavigate={() => {}}
      children={content}
    />
  </div>
</Story>

<!--
  Story 3 — Desktop Navigate (940px ≥ 760px).
  AC-19: clicking a rail button calls onNavigate exactly once with that item's id.
-->
<Story
  name="Desktop Navigate"
  args={{ onNavigate: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const aside = root.querySelector("aside") as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).not.toBe("none");
    });
    const rail = within(aside);

    const settingsBtn = rail.getByRole("button", { name: "Settings" });
    await userEvent.click(settingsBtn);

    // AC-19: spy called exactly once with the item id
    await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).toHaveBeenCalledWith("settings");
  }}
>
  {#snippet template(args)}
    <div style="width: 940px; height: 600px;">
      {#snippet content()}
        <p>Body.</p>
      {/snippet}
      <AppShell
        brand="DXLB"
        nav={NAV}
        current="feed"
        onNavigate={args.onNavigate}
        children={content}
      />
    </div>
  {/snippet}
</Story>

<!--
  Story 4 — Desktop Footer Present / Absent (both at 940px ≥ 760px in one story).
  AC-10: with footer set, footer region renders with a top rule + content; with footer
  omitted, no footer region is rendered.
-->
<Story
  name="Desktop Footer"
  play={async ({ canvasElement }) => {
    const wrappers = canvasElement.querySelectorAll(":scope > div");
    const withFooter = wrappers[0].firstElementChild as HTMLElement;
    const noFooter = wrappers[1].firstElementChild as HTMLElement;

    const withAside = withFooter.querySelector("aside") as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(withAside).display).not.toBe("none");
    });

    // AC-10: footer region present with top rule + content
    const footer = withFooter.querySelector('[data-part="footer"]') as HTMLElement;
    await expect(footer).not.toBeNull();
    await expect(getComputedStyle(footer).borderTopColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(footer.textContent).toContain("v1.0");

    // AC-10: footer omitted → no footer region
    await expect(noFooter.querySelector('[data-part="footer"]')).toBeNull();
  }}
>
  <div style="width: 940px; height: 600px;">
    {#snippet content()}
      <p>With footer.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      footer="v1.0"
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content}
    />
  </div>
  <div style="width: 940px; height: 600px;">
    {#snippet content2()}
      <p>No footer.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content2}
    />
  </div>
</Story>

<!--
  Story 5 — Mobile Layout (wrapper width 600px < 760px).
  ACs: 3 (<main> scrollable), 12 (aside display:none / tab nav visible),
  13 (tab nav bottom rule + bg tokens + display flex), 14 (one tab button per item in order).
-->
<Story
  name="Mobile Layout"
  play={async ({ canvasElement }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const aside = root.querySelector("aside") as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await expect(aside).not.toBeNull();
    await expect(tabNav).not.toBeNull();

    // AC-12: aside hidden, tab nav visible at < 760px (wait for @container)
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).toBe("none");
    });
    await expect(getComputedStyle(tabNav).display).not.toBe("none");

    // AC-13: tab nav bottom rule + rail bg + display flex (tabs share the row)
    await expect(getComputedStyle(tabNav).borderTopColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(getComputedStyle(tabNav).backgroundColor).toBe(
      resolveTokenColor("--bg-rail"),
    );
    await expect(getComputedStyle(tabNav).display).toBe("flex");

    // AC-14: one tab button per item, in order
    const tabs = within(tabNav).getAllByRole("button");
    await expect(tabs.length).toBe(3);
    await expect(tabs[0]).toHaveAccessibleName("Feed");
    await expect(tabs[1]).toHaveAccessibleName("Inbox");
    await expect(tabs[2]).toHaveAccessibleName("Settings");

    // AC-3: <main> scrollable
    const main = within(canvasElement).getByRole("main");
    await expect(getComputedStyle(main).overflowY).toBe("auto");
  }}
>
  <div style="width: 600px; height: 600px;">
    {#snippet content()}
      <p>Mobile body.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content}
    />
  </div>
</Story>

<!--
  Story 6 — Mobile Active + Led + Badge (600px < 760px).
  ACs: 21b (aria-current on active only), 21c (active top-bar amber / inactive transparent),
  21d (active Led led-amber / inactive led-off), 21e (active label --amber / inactive
  --ink-faint), 21f (badge dot amber on badged item, absent otherwise).
-->
<Story
  name="Mobile Active + Led + Badge"
  play={async ({ canvasElement }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(tabNav).display).not.toBe("none");
    });
    const tabs = within(tabNav);

    const amberFg = resolveTokenFgColor("--amber");
    const amberBg = resolveTokenColor("--amber");
    const inkFaint = resolveTokenFgColor("--ink-faint");

    // current="inbox" → Inbox is the active tab
    const activeTab = tabs.getByRole("button", { name: "Inbox" });
    const inactiveTab = tabs.getByRole("button", { name: "Feed" });

    // AC-21b: aria-current on active only
    await expect(activeTab.getAttribute("aria-current")).toBe("page");
    await expect(inactiveTab.hasAttribute("aria-current")).toBe(false);

    // AC-21c: active top active-bar amber, inactive transparent
    const activeBar = activeTab.querySelector('[data-part="tab-bar"]') as HTMLElement;
    const inactiveBar = inactiveTab.querySelector('[data-part="tab-bar"]') as HTMLElement;
    await expect(activeBar).not.toBeNull();
    await expect(inactiveBar).not.toBeNull();
    await expect(getComputedStyle(activeBar).backgroundColor).toBe(amberBg);
    await expect(getComputedStyle(inactiveBar).backgroundColor).toBe(
      "rgba(0, 0, 0, 0)",
    );

    // AC-21d: active tab Led has class led-amber; inactive has led-off
    const activeLed = activeTab.querySelector(".led") as HTMLElement;
    const inactiveLed = inactiveTab.querySelector(".led") as HTMLElement;
    await expect(activeLed).not.toBeNull();
    await expect(inactiveLed).not.toBeNull();
    await expect(activeLed.classList.contains("led-amber")).toBe(true);
    await expect(inactiveLed.classList.contains("led-off")).toBe(true);

    // AC-21e: active label --amber, inactive label --ink-faint
    const activeLabel = activeTab.querySelector('[data-part="tab-label"]') as HTMLElement;
    const inactiveLabel = inactiveTab.querySelector(
      '[data-part="tab-label"]',
    ) as HTMLElement;
    await expect(activeLabel).not.toBeNull();
    await expect(inactiveLabel).not.toBeNull();
    await expect(getComputedStyle(activeLabel).color).toBe(amberFg);
    await expect(getComputedStyle(inactiveLabel).color).toBe(inkFaint);

    // AC-21f: badge dot amber on badged item; absent on un-badged item
    const dot = activeTab.querySelector('[data-part="tab-badge"]') as HTMLElement;
    await expect(dot).not.toBeNull();
    await expect(getComputedStyle(dot).backgroundColor).toBe(amberBg);
    await expect(inactiveTab.querySelector('[data-part="tab-badge"]')).toBeNull();
  }}
>
  <div style="width: 600px; height: 600px;">
    {#snippet content()}
      <p>Mobile body.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      nav={NAV}
      current="inbox"
      onNavigate={() => {}}
      children={content}
    />
  </div>
</Story>

<!--
  Story 7 — Mobile Navigate (600px < 760px).
  AC-21g: clicking a tab button calls onNavigate exactly once with that item's id.
-->
<Story
  name="Mobile Navigate"
  args={{ onNavigate: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(tabNav).display).not.toBe("none");
    });

    const inboxTab = within(tabNav).getByRole("button", { name: "Inbox" });
    await userEvent.click(inboxTab);

    // AC-21g: spy called exactly once with the item id
    await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).toHaveBeenCalledWith("inbox");
  }}
>
  {#snippet template(args)}
    <div style="width: 600px; height: 600px;">
      {#snippet content()}
        <p>Mobile body.</p>
      {/snippet}
      <AppShell
        brand="DXLB"
        nav={NAV}
        current="feed"
        onNavigate={args.onNavigate}
        children={content}
      />
    </div>
  {/snippet}
</Story>

<!--
  Story 8 — A11y: One Nav Exposed (two wrappers — desktop + mobile width).
  ACs: 5 (exactly two <nav> landmarks in the DOM each with a non-empty aria-label),
  23 (the hidden nav at a given width is aria-hidden="true"), 26 (a11y audit passes).
-->
<Story
  name="A11y One Nav Exposed"
  play={async ({ canvasElement }) => {
    const wrappers = canvasElement.querySelectorAll(":scope > div");
    const desktopRoot = wrappers[0].firstElementChild as HTMLElement;
    const mobileRoot = wrappers[1].firstElementChild as HTMLElement;

    // AC-5: exactly two <nav> landmarks in each AppShell, each with a non-empty aria-label
    const desktopNavs = desktopRoot.querySelectorAll("nav");
    await expect(desktopNavs.length).toBe(2);
    for (const nav of Array.from(desktopNavs)) {
      await expect((nav.getAttribute("aria-label") ?? "").length).toBeGreaterThan(0);
    }

    // AC-23 (desktop): the rail is visible, the tab nav is hidden + aria-hidden="true"
    const desktopAside = desktopRoot.querySelector("aside") as HTMLElement;
    const desktopTabNav = desktopRoot.querySelector(
      '[data-part="tab-nav"]',
    ) as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(desktopAside).display).not.toBe("none");
    });
    await expect(getComputedStyle(desktopTabNav).display).toBe("none");
    await expect(desktopTabNav.getAttribute("aria-hidden")).toBe("true");

    // AC-23 (mobile): the tab nav is visible, the rail nav is hidden + aria-hidden="true"
    const mobileAside = mobileRoot.querySelector("aside") as HTMLElement;
    const mobileRailNav = mobileAside.querySelector("nav") as HTMLElement;
    const mobileTabNav = mobileRoot.querySelector(
      '[data-part="tab-nav"]',
    ) as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(mobileAside).display).toBe("none");
    });
    await expect(getComputedStyle(mobileTabNav).display).not.toBe("none");
    await expect(mobileRailNav.getAttribute("aria-hidden")).toBe("true");
  }}
>
  <div style="width: 940px; height: 600px;">
    {#snippet content()}
      <p>Desktop.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content}
    />
  </div>
  <div style="width: 600px; height: 600px;">
    {#snippet content2()}
      <p>Mobile.</p>
    {/snippet}
    <AppShell
      brand="DXLB"
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content2}
    />
  </div>
</Story>

<!--
  Story 9 — Snippet & String Slots (two wrappers — strings + snippets, both desktop width).
  ACs: 22a (string slots render their text), 22b (snippet slots render their markup —
  asserted by a data-testid marker), 22c (children renders inside <main>).
-->
<Story
  name="Slots — String and Snippet"
  play={async ({ canvasElement }) => {
    const wrappers = canvasElement.querySelectorAll(":scope > div");
    const strRoot = wrappers[0].firstElementChild as HTMLElement;
    const snipRoot = wrappers[1].firstElementChild as HTMLElement;

    const strAside = strRoot.querySelector("aside") as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(strAside).display).not.toBe("none");
    });

    // AC-22a: string slots render their text in the corresponding regions
    await expect(
      (strRoot.querySelector('[data-part="brand"]') as HTMLElement).textContent,
    ).toContain("BRAND-STR");
    const strTopBar = strRoot.querySelector('[data-part="top-bar"]') as HTMLElement;
    await expect(strTopBar.textContent).toContain("LEFT-STR");
    await expect(strTopBar.textContent).toContain("RIGHT-STR");
    await expect(
      (strRoot.querySelector('[data-part="footer"]') as HTMLElement).textContent,
    ).toContain("FOOT-STR");

    // AC-22b: snippet slots render their markup (data-testid markers present)
    await expect(snipRoot.querySelector('[data-testid="brand-marker"]')).not.toBeNull();
    await expect(snipRoot.querySelector('[data-testid="topleft-marker"]')).not.toBeNull();
    await expect(snipRoot.querySelector('[data-testid="topright-marker"]')).not.toBeNull();
    await expect(snipRoot.querySelector('[data-testid="footer-marker"]')).not.toBeNull();

    // AC-22c: children renders inside <main>
    const main = within(snipRoot).getByRole("main");
    await expect(
      within(main).getByTestId("children-marker"),
    ).toBeVisible();
  }}
>
  <div style="width: 940px; height: 600px;">
    {#snippet content()}
      <p>Body.</p>
    {/snippet}
    <AppShell
      brand="BRAND-STR"
      topLeft="LEFT-STR"
      topRight="RIGHT-STR"
      footer="FOOT-STR"
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={content}
    />
  </div>
  <div style="width: 940px; height: 600px;">
    {#snippet brandSnippet()}
      <span data-testid="brand-marker">Brand</span>
    {/snippet}
    {#snippet topLeftSnippet()}
      <span data-testid="topleft-marker">Left</span>
    {/snippet}
    {#snippet topRightSnippet()}
      <span data-testid="topright-marker">Right</span>
    {/snippet}
    {#snippet footerSnippet()}
      <span data-testid="footer-marker">Footer</span>
    {/snippet}
    {#snippet childrenSnippet()}
      <p data-testid="children-marker">Main content body.</p>
    {/snippet}
    <AppShell
      brand={brandSnippet}
      topLeft={topLeftSnippet}
      topRight={topRightSnippet}
      footer={footerSnippet}
      nav={NAV}
      current="feed"
      onNavigate={() => {}}
      children={childrenSnippet}
    />
  </div>
</Story>
