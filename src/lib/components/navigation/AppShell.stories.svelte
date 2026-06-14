<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within, waitFor, fn } from "storybook/test";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";
  import Led from "../primitives/Led.svelte";
  import AppShell from "./AppShell.svelte";

  // No component: — AppShell needs Snippet slots (brand/topLeft/topRight/footer/children)
  // and must be wrapped in a width-controlled element so the @container query resolves
  // deterministically (D65 — mirrors Grid.collapse.stories.svelte). Each story renders a
  // full <AppShell> inside a fixed-width wrapper in the story slot (composition pattern).
  const { Story } = defineMeta({
    title: "Navigation/AppShell",
    tags: ["autodocs"],
  });

  // The design-reference fixture (preview-31-app-shell): a four-item nav with the badge on
  // "Rails", "Rails" active. Reused across stories so they read like the design system.
  const NAV = [
    { id: "home", label: "Home" },
    { id: "rails", label: "Rails", badge: 3 },
    { id: "orders", label: "Orders" },
    { id: "you", label: "You" },
  ];
</script>

<!--
  Shared slot content, mirroring the design demo so every story renders the full shell —
  a brand block with a status LED, a sectioned top bar (breadcrumb + version), a rail
  footer, and a real body. These are demo scaffolding that lives in the story, never in
  the component.
-->
{#snippet brandMark()}
  <div style="display:flex; align-items:center; gap:8px;">
    <Led />
    <span
      style="font-family:var(--mono); font-weight:700; font-size:13px; letter-spacing:0.12em; text-transform:uppercase;"
      >DEXTERLABS</span
    >
  </div>
{/snippet}
{#snippet topLeftMark()}
  <span
    style="font-family:var(--mono); font-size:12px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-dim);"
    >// Rails</span
  >
{/snippet}
{#snippet topRightMark()}
  <span style="font-family:var(--mono); font-size:11px; color:var(--ink-faint);"
    >v3.0</span
  >
{/snippet}
{#snippet footerMark()}
  <span
    style="font-family:var(--mono); font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--ink-faint);"
    >Est. 2019 · Delft</span
  >
{/snippet}
{#snippet bodyMark()}
  <div style="padding:28px;">
    <div
      style="font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-faint); margin-bottom:8px;"
    >
      // Rails
    </div>
    <h1 style="font-weight:500; font-size:var(--t-h2); letter-spacing:-0.01em;">
      Resize me
    </h1>
    <p style="margin-top:12px; color:var(--ink-dim); max-width:52ch; line-height:1.6;">
      Below 760px this frame swaps the sidebar rail for a bottom tab bar. The rail
      badge becomes a tab dot.
    </p>
  </div>
{/snippet}

<!--
  Desktop (≥ 760px) — the full app frame. The rail sits beside the content with the brand
  on top and the footer pinned to the bottom; the sticky top bar carries the breadcrumb and
  version. The play function walks the desktop contract end to end: the container context and
  the rail-beside-content layout, the rail tokens/width, the brand + footer rules, the nav
  order, the active "Rails" item (amber border + colour + aria-current) and its count pill,
  the mono/uppercase labels, the sticky top-bar tokens, and that only <main> scrolls.
-->
<Story
  name="Desktop"
  play={async ({ canvasElement }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;

    // container context lives on the root (AC-1)
    await expect(["inline-size", "size"]).toContain(
      getComputedStyle(root).containerType,
    );

    // desktop rail visible, mobile tab nav hidden (wait for @container to resolve)
    const aside = root.querySelector("aside") as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).not.toBe("none");
    });
    await expect(getComputedStyle(tabNav).display).toBe("none");

    // rail chrome: 212px, right rule, rail surface, flex column
    await expect(getComputedStyle(aside).width).toBe("212px");
    await expect(getComputedStyle(aside).borderRightColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(getComputedStyle(aside).backgroundColor).toBe(
      resolveTokenColor("--bg-rail"),
    );
    await expect(getComputedStyle(aside).display).toBe("flex");
    await expect(getComputedStyle(aside).flexDirection).toBe("column");

    // the rail sits BESIDE the content (flex row), not stacked above it — guards the
    // container-query self-reference bug (an element can't query its own container-type)
    const frame = root.querySelector('[data-part="frame"]') as HTMLElement;
    const railRect = aside.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    await expect(frameRect.left).toBeGreaterThanOrEqual(railRect.right - 1);
    await expect(Math.abs(railRect.top - frameRect.top)).toBeLessThan(1);

    // brand block: first region, bottom rule, renders the brand
    const brand = root.querySelector('[data-part="brand"]') as HTMLElement;
    await expect(getComputedStyle(brand).borderBottomColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(brand.textContent).toContain("DEXTERLABS");

    // one rail button per item, in order
    const rail = within(aside);
    const railButtons = rail.getAllByRole("button");
    await expect(railButtons.map((b) => b.textContent?.trim().slice(0, 4))).toEqual(
      ["Home", "Rail", "Orde", "You"],
    );

    // active "Rails": amber border-left + colour + aria-current; inactive "Home": transparent
    // border + ink-dim + no aria-current
    const amberFg = resolveTokenFgColor("--amber");
    const activeBtn = rail.getByRole("button", { name: "Rails" });
    const inactiveBtn = rail.getByRole("button", { name: "Home" });
    await expect(getComputedStyle(activeBtn).borderLeftColor).toBe(amberFg);
    await expect(getComputedStyle(activeBtn).color).toBe(amberFg);
    await expect(activeBtn.getAttribute("aria-current")).toBe("page");
    await expect(getComputedStyle(inactiveBtn).borderLeftColor).toBe("rgba(0, 0, 0, 0)");
    await expect(getComputedStyle(inactiveBtn).color).toBe(
      resolveTokenFgColor("--ink-dim"),
    );
    await expect(inactiveBtn.hasAttribute("aria-current")).toBe(false);

    // count pill on the badged item only (amber bg, --bg text)
    const pill = activeBtn.querySelector('[data-part="rail-badge"]') as HTMLElement;
    await expect(pill.textContent).toContain("3");
    await expect(getComputedStyle(pill).backgroundColor).toBe(
      resolveTokenColor("--amber"),
    );
    await expect(getComputedStyle(pill).color).toBe(resolveTokenFgColor("--bg"));
    await expect(inactiveBtn.querySelector('[data-part="rail-badge"]')).toBeNull();

    // rail labels are mono + uppercase
    await expect(
      getComputedStyle(inactiveBtn).fontFamily.toLowerCase(),
    ).toContain("mono");
    await expect(getComputedStyle(inactiveBtn).textTransform).toBe("uppercase");

    // footer pinned to the bottom of the rail, with a top rule
    const footer = root.querySelector('[data-part="footer"]') as HTMLElement;
    await expect(getComputedStyle(footer).borderTopColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(footer.textContent).toContain("Delft");

    // sticky top bar: position/offset/z-index + bg + bottom rule, carrying its slots
    const topBar = root.querySelector('[data-part="top-bar"]') as HTMLElement;
    await expect(getComputedStyle(topBar).position).toBe("sticky");
    await expect(getComputedStyle(topBar).top).toBe("0px");
    await expect(getComputedStyle(topBar).zIndex).toBe("50");
    await expect(getComputedStyle(topBar).backgroundColor).toBe(
      resolveTokenColor("--bg"),
    );
    await expect(getComputedStyle(topBar).borderBottomColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(topBar.textContent).toContain("// Rails");
    await expect(topBar.textContent).toContain("v3.0");

    // <main> is the landmark, holds the body, and is the only scroll region
    const main = within(canvasElement).getByRole("main");
    await expect(main).toBeVisible();
    await expect(main.textContent).toContain("Resize me");
    await expect(getComputedStyle(main).overflowY).toBe("auto");

    // full-height frame (only <main> scrolls)
    const frameHeight = getComputedStyle(root).height;
    await expect(frameHeight === "600px" || /vh|%/.test(frameHeight)).toBe(true);
  }}
>
  <div style="width: 940px; height: 600px;">
    <AppShell
      brand={brandMark}
      topLeft={topLeftMark}
      topRight={topRightMark}
      footer={footerMark}
      nav={NAV}
      current="rails"
      onNavigate={() => {}}
      children={bodyMark}
    />
  </div>
</Story>

<!--
  Desktop navigation: clicking a rail button calls onNavigate exactly once with that item's
  id (clicking the inactive "Orders" while "Rails" is current).
-->
<Story
  name="Desktop — Navigate"
  args={{ onNavigate: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const aside = root.querySelector("aside") as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).not.toBe("none");
    });

    await userEvent.click(within(aside).getByRole("button", { name: "Orders" }));
    await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).toHaveBeenCalledWith("orders");
  }}
>
  {#snippet template(args)}
    <div style="width: 940px; height: 600px;">
      <AppShell
        brand={brandMark}
        topLeft={topLeftMark}
        topRight={topRightMark}
        footer={footerMark}
        nav={NAV}
        current="rails"
        onNavigate={args.onNavigate}
        children={bodyMark}
      />
    </div>
  {/snippet}
</Story>

<!--
  Mobile (< 760px) — the same frame with the rail collapsed to a bottom tab bar; the rail
  badge becomes a glowing dot. The play function checks the swap (rail hidden, tab nav shown
  with its tokens), the tab order, and the active "Rails" tab's rendering: aria-current, the
  amber indicator bar, the amber Led, the amber label, and the badge dot — each absent on the
  inactive "Home" tab — plus that only <main> scrolls.
-->
<Story
  name="Mobile"
  play={async ({ canvasElement }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const aside = root.querySelector("aside") as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;

    // rail hidden, tab nav visible at < 760px
    await waitFor(async () => {
      await expect(getComputedStyle(aside).display).toBe("none");
    });
    await expect(getComputedStyle(tabNav).display).toBe("flex");

    // tab nav chrome: top rule + rail surface
    await expect(getComputedStyle(tabNav).borderTopColor).toBe(
      resolveTokenColor("--rule"),
    );
    await expect(getComputedStyle(tabNav).backgroundColor).toBe(
      resolveTokenColor("--bg-rail"),
    );

    // one tab per item, in order
    const tabs = within(tabNav);
    const tabButtons = tabs.getAllByRole("button");
    await expect(tabButtons.map((b) => b.textContent?.trim().slice(0, 4))).toEqual(
      ["Home", "Rail", "Orde", "You"],
    );

    const amberFg = resolveTokenFgColor("--amber");
    const amberBg = resolveTokenColor("--amber");
    const activeTab = tabs.getByRole("button", { name: "Rails" });
    const inactiveTab = tabs.getByRole("button", { name: "Home" });

    // aria-current on the active tab only
    await expect(activeTab.getAttribute("aria-current")).toBe("page");
    await expect(inactiveTab.hasAttribute("aria-current")).toBe(false);

    // active indicator bar amber, inactive transparent
    await expect(
      getComputedStyle(activeTab.querySelector('[data-part="tab-bar"]')!).backgroundColor,
    ).toBe(amberBg);
    await expect(
      getComputedStyle(inactiveTab.querySelector('[data-part="tab-bar"]')!).backgroundColor,
    ).toBe("rgba(0, 0, 0, 0)");

    // active Led led-amber, inactive led-off
    await expect(
      activeTab.querySelector(".led")!.classList.contains("led-amber"),
    ).toBe(true);
    await expect(
      inactiveTab.querySelector(".led")!.classList.contains("led-off"),
    ).toBe(true);

    // active label amber, inactive ink-faint
    await expect(
      getComputedStyle(activeTab.querySelector('[data-part="tab-label"]')!).color,
    ).toBe(amberFg);
    await expect(
      getComputedStyle(inactiveTab.querySelector('[data-part="tab-label"]')!).color,
    ).toBe(resolveTokenFgColor("--ink-faint"));

    // badge dot amber on the badged tab; absent on the un-badged tab
    await expect(
      getComputedStyle(activeTab.querySelector('[data-part="tab-badge"]')!).backgroundColor,
    ).toBe(amberBg);
    await expect(inactiveTab.querySelector('[data-part="tab-badge"]')).toBeNull();

    // <main> still the only scroll region
    const main = within(canvasElement).getByRole("main");
    await expect(getComputedStyle(main).overflowY).toBe("auto");
  }}
>
  <div style="width: 600px; height: 600px;">
    <AppShell
      brand={brandMark}
      topLeft={topLeftMark}
      topRight={topRightMark}
      footer={footerMark}
      nav={NAV}
      current="rails"
      onNavigate={() => {}}
      children={bodyMark}
    />
  </div>
</Story>

<!--
  Mobile navigation: tapping a tab calls onNavigate exactly once with that item's id.
-->
<Story
  name="Mobile — Navigate"
  args={{ onNavigate: fn() }}
  play={async ({ canvasElement, args, userEvent }) => {
    const wrapper = canvasElement.firstElementChild as HTMLElement;
    const root = wrapper.firstElementChild as HTMLElement;
    const tabNav = root.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(tabNav).display).not.toBe("none");
    });

    await userEvent.click(within(tabNav).getByRole("button", { name: "Orders" }));
    await expect(args.onNavigate).toHaveBeenCalledTimes(1);
    await expect(args.onNavigate).toHaveBeenCalledWith("orders");
  }}
>
  {#snippet template(args)}
    <div style="width: 600px; height: 600px;">
      <AppShell
        brand={brandMark}
        topLeft={topLeftMark}
        topRight={topRightMark}
        footer={footerMark}
        nav={NAV}
        current="rails"
        onNavigate={args.onNavigate}
        children={bodyMark}
      />
    </div>
  {/snippet}
</Story>

<!--
  Accessibility: exactly one nav is exposed per width. Both navs always render (so the layout
  is pure CSS), each <nav> has a non-empty aria-label, and the one hidden at a given width is
  aria-hidden="true" — checked at desktop and mobile widths side by side.
-->
<Story
  name="A11y — One Nav Exposed"
  play={async ({ canvasElement }) => {
    const wrappers = canvasElement.querySelectorAll(":scope > div");
    const desktopRoot = wrappers[0].firstElementChild as HTMLElement;
    const mobileRoot = wrappers[1].firstElementChild as HTMLElement;

    // exactly two <nav> landmarks per shell, each with a non-empty aria-label
    const desktopNavs = desktopRoot.querySelectorAll("nav");
    await expect(desktopNavs.length).toBe(2);
    for (const nav of Array.from(desktopNavs)) {
      await expect((nav.getAttribute("aria-label") ?? "").length).toBeGreaterThan(0);
    }

    // desktop: rail exposed, tab nav hidden + aria-hidden
    const desktopAside = desktopRoot.querySelector("aside") as HTMLElement;
    const desktopTabNav = desktopRoot.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(desktopAside).display).not.toBe("none");
    });
    await expect(getComputedStyle(desktopTabNav).display).toBe("none");
    await expect(desktopTabNav.getAttribute("aria-hidden")).toBe("true");

    // mobile: tab nav exposed, rail nav hidden + aria-hidden
    const mobileAside = mobileRoot.querySelector("aside") as HTMLElement;
    const mobileRailNav = mobileAside.querySelector("nav") as HTMLElement;
    const mobileTabNav = mobileRoot.querySelector('[data-part="tab-nav"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(mobileAside).display).toBe("none");
    });
    await expect(getComputedStyle(mobileTabNav).display).not.toBe("none");
    await expect(mobileRailNav.getAttribute("aria-hidden")).toBe("true");
  }}
>
  <div style="width: 940px; height: 600px;">
    <AppShell
      brand={brandMark}
      topLeft={topLeftMark}
      topRight={topRightMark}
      footer={footerMark}
      nav={NAV}
      current="rails"
      onNavigate={() => {}}
      children={bodyMark}
    />
  </div>
  <div style="width: 600px; height: 600px;">
    <AppShell
      brand={brandMark}
      topLeft={topLeftMark}
      topRight={topRightMark}
      footer={footerMark}
      nav={NAV}
      current="rails"
      onNavigate={() => {}}
      children={bodyMark}
    />
  </div>
</Story>

<!--
  Slots: every region is text-or-snippet (D43). The first shell passes plain strings to brand
  / topLeft / topRight / footer; the second passes snippets (with markers) and omits the
  footer to show the region disappears when unset. children always renders inside <main>.
-->
<Story
  name="Slots — Strings & Snippets"
  play={async ({ canvasElement }) => {
    const wrappers = canvasElement.querySelectorAll(":scope > div");
    const strRoot = wrappers[0].firstElementChild as HTMLElement;
    const snipRoot = wrappers[1].firstElementChild as HTMLElement;

    const strAside = strRoot.querySelector("aside") as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(strAside).display).not.toBe("none");
    });

    // string slots render their text in the right regions
    await expect(
      (strRoot.querySelector('[data-part="brand"]') as HTMLElement).textContent,
    ).toContain("BRAND-STR");
    const strTopBar = strRoot.querySelector('[data-part="top-bar"]') as HTMLElement;
    await expect(strTopBar.textContent).toContain("LEFT-STR");
    await expect(strTopBar.textContent).toContain("RIGHT-STR");
    await expect(
      (strRoot.querySelector('[data-part="footer"]') as HTMLElement).textContent,
    ).toContain("FOOT-STR");

    // snippet slots render their markup (markers present)
    await expect(snipRoot.querySelector('[data-testid="brand-marker"]')).not.toBeNull();
    await expect(snipRoot.querySelector('[data-testid="topleft-marker"]')).not.toBeNull();
    await expect(snipRoot.querySelector('[data-testid="topright-marker"]')).not.toBeNull();

    // footer omitted → no footer region
    await expect(snipRoot.querySelector('[data-part="footer"]')).toBeNull();

    // children renders inside <main>
    const main = within(snipRoot).getByRole("main");
    await expect(within(main).getByTestId("children-marker")).toBeVisible();
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
      current="rails"
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
    {#snippet childrenSnippet()}
      <p data-testid="children-marker">Main content body.</p>
    {/snippet}
    <AppShell
      brand={brandSnippet}
      topLeft={topLeftSnippet}
      topRight={topRightSnippet}
      nav={NAV}
      current="rails"
      onNavigate={() => {}}
      children={childrenSnippet}
    />
  </div>
</Story>
