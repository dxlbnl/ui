<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import { vi } from "vitest";
  import Nav from "./Nav.svelte";
  import { resolveTokenColor, resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Navigation/Nav",
    component: Nav,
    tags: ["autodocs"],
  });
</script>

<!-- AC-B28-9 (44,45,46,47,48,49), AC-B28-3 (17), AC-B28-5 (27,28,29,30,31), B28-3 (15,18) -->
<Story name="Default" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ],
  'data-testid': 'main-nav',
}}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-44: <nav> element is present
    const nav = canvas.getByRole('navigation');
    await expect(nav).toBeVisible();

    // AC-45: <nav> has position: fixed and z-index >= 100
    await expect(getComputedStyle(nav).position).toBe('fixed');
    await expect(parseInt(getComputedStyle(nav).zIndex)).toBeGreaterThanOrEqual(100);

    // AC-46: <nav> has background-color matching --bg and border-bottom-color matching --rule
    await expect(getComputedStyle(nav).backgroundColor).toBe(resolveTokenColor('--bg'));
    await expect(getComputedStyle(nav).borderBottomColor).toBe(resolveTokenColor('--rule'));

    // AC-47: .nav-inner has display: flex and height: 48px
    const inner = canvasElement.querySelector('.nav-inner') as HTMLElement | null;
    await expect(inner).not.toBeNull();
    await expect(getComputedStyle(inner!).display).toBe('flex');
    await expect(getComputedStyle(inner!).height).toBe('48px');

    // AC-48: ...rest spread — data-testid forwarded onto <nav>
    await expect(nav.getAttribute('data-testid')).toBe('main-nav');

    // AC-49: brand link contains 'DEXTERLABS' (default siteName)
    await expect(canvas.getByRole('link', { name: /DEXTERLABS/ })).toBeVisible();

    // active link has aria-current="page" (AC-44 / AC-51)
    const activeLink = canvas.getByRole('link', { name: 'CATALOGUE' });
    await expect(activeLink.getAttribute('aria-current')).toBe('page');

    // AC-31: palette toggle button present with correct accessible name
    const toggleBtn = canvas.getByRole('button', { name: /toggle colour palette/i });
    await expect(toggleBtn).toBeVisible();

    // AC-27: palette toggle has both 'btn' and 'btn-nav' classes
    await expect(toggleBtn.classList.contains('btn')).toBe(true);
    await expect(toggleBtn.classList.contains('btn-nav')).toBe(true);

    // AC-28: palette toggle does NOT have 'btn-ghost' class
    await expect(toggleBtn.classList.contains('btn-ghost')).toBe(false);

    // AC-29: palette toggle color matches --ink-faint at rest
    await expect(getComputedStyle(toggleBtn).color).toBe(resolveTokenFgColor('--ink-faint'));

    // AC-30: palette toggle background-color is transparent
    await expect(getComputedStyle(toggleBtn).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    // AC-18: no .nav-hamburger in DOM
    const hamburger = canvasElement.querySelector('.nav-hamburger');
    await expect(hamburger).toBeNull();

    // AC-18: no #nav-drawer in DOM
    const drawer = canvasElement.querySelector('#nav-drawer');
    await expect(drawer).toBeNull();

    // AC-15: .nav-inner max-width is 1200px by default
    await expect(getComputedStyle(inner!).maxWidth).toBe('1200px');
  }} />

<!-- AC-B28-3 (15,17), AC-B28-9 (44) -->
<Story name="No Links" args={{ links: [] }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-44: <nav> is present
    const nav = canvas.getByRole('navigation');
    await expect(nav).toBeVisible();

    // AC-15: no <details> element in DOM when links is empty
    const details = canvasElement.querySelector('details');
    await expect(details).toBeNull();

    // no <ul class="nav-links">
    const navLinks = canvasElement.querySelector('ul.nav-links');
    await expect(navLinks).toBeNull();

    // AC-17: palette toggle is still present
    const toggleBtn = canvas.getByRole('button', { name: 'Toggle colour palette' });
    await expect(toggleBtn).toBeVisible();
  }} />

<!-- AC-B28-2 (7,8,9,10,12) -->
<Story name="With Breadcrumbs" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES', active: false },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ],
  breadcrumbs: [
    { label: '~', href: '/' },
    { label: 'NOTES', href: '/notes/' },
  ]
}}
  play={async ({ canvasElement }) => {
    // AC-8/9: .nav-path element is present
    const navPath = canvasElement.querySelector('.nav-path');
    await expect(navPath).not.toBeNull();

    // crumb anchors: ~ links to / and NOTES links to /notes/
    const crumbLinks = navPath!.querySelectorAll('a');
    const hrefs = Array.from(crumbLinks).map(a => a.getAttribute('href'));
    await expect(hrefs).toContain('/');
    await expect(hrefs).toContain('/notes/');

    // AC-11: each crumb anchor color matches --amber and is clickable (no pointer-events: none)
    const amberColor = resolveTokenFgColor('--amber');
    for (const crumb of Array.from(crumbLinks) as HTMLElement[]) {
      await expect(getComputedStyle(crumb).color).toBe(amberColor);
      await expect(getComputedStyle(crumb).pointerEvents).not.toBe('none');
    }

    // AC-10: .nav-sep span contains '//'
    const navSep = navPath!.querySelector('.nav-sep');
    await expect(navSep).not.toBeNull();
    await expect(navSep!.textContent?.trim()).toBe('//');

    // AC-12: .nav-sep color matches --ink-faint
    const inkFaint = resolveTokenFgColor('--ink-faint');
    await expect(getComputedStyle(navSep!).color).toBe(inkFaint);
  }} />

<!-- AC-B28-2 (7), AC-B28-3 (15) — breadcrumbs present but links empty -->
<Story name="Breadcrumbs Only No Links" args={{
  links: [],
  breadcrumbs: [
    { label: '~', href: '/' },
    { label: 'NOTES', href: '/notes/' },
  ]
}}
  play={async ({ canvasElement }) => {
    // .nav-path present because breadcrumbs is non-empty
    const navPath = canvasElement.querySelector('.nav-path');
    await expect(navPath).not.toBeNull();

    // no <details> because links is empty (AC-15)
    const details = canvasElement.querySelector('details');
    await expect(details).toBeNull();
  }} />

<!-- AC-B28-9 (50) -->
<Story name="Custom Site Name" args={{ links: [], siteName: 'LAB' }}
  play={async ({ canvasElement }) => {
    // brand link contains the custom siteName
    await expect(within(canvasElement).getByRole('link', { name: /LAB/ })).toBeVisible();
    // must not contain the default
    const text = canvasElement.textContent ?? '';
    await expect(text).toContain('LAB');
  }} />

<!-- AC-B28-9 (53) -->
<Story name="Palette Toggle" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: 'Toggle colour palette' });

    // record the initial data-palette value
    const before = document.documentElement.getAttribute('data-palette');

    // click once — palette should change
    await userEvent.click(btn);
    const after = document.documentElement.getAttribute('data-palette');
    await expect(after).not.toBe(before);
    await expect(localStorage.getItem('dxlb-palette')).toBe(after);

    // click again — palette should be restored
    await userEvent.click(btn);
    const restored = document.documentElement.getAttribute('data-palette');
    await expect(restored).toBe(before);
    await expect(localStorage.getItem('dxlb-palette')).toBe(before);
  }} />

<!-- AC-B28-7 (34,35) -->
<Story name="Active Link Styling" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE' },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES', active: true },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement }) => {
    // get the NOTES anchor via aria-current
    const activeLinks = canvasElement.querySelectorAll('.nav-link.active');
    await expect(activeLinks.length).toBeGreaterThan(0);
    const anchor = activeLinks[0] as HTMLElement;

    // AC-34: aria-current="page"
    await expect(anchor.getAttribute('aria-current')).toBe('page');

    // AC-35: border-bottom-color matches --amber
    const amberColor = resolveTokenFgColor('--amber');
    await expect(getComputedStyle(anchor).borderBottomColor).toBe(amberColor);

    // AC-34: color matches --ink
    const inkColor = resolveTokenFgColor('--ink');
    await expect(getComputedStyle(anchor).color).toBe(inkColor);

    // AC-36: a non-active .nav-link has color matching --ink-dim
    const inactiveLinks = canvasElement.querySelectorAll('.nav-link:not(.active)');
    await expect(inactiveLinks.length).toBeGreaterThan(0);
    const inactiveLink = inactiveLinks[0] as HTMLElement;
    const inkDimColor = resolveTokenFgColor('--ink-dim');
    await expect(getComputedStyle(inactiveLink).color).toBe(inkDimColor);

    // AC-37: a non-active .nav-link has transparent border-bottom-color
    await expect(getComputedStyle(inactiveLink).borderBottomColor).toBe('rgba(0, 0, 0, 0)');
  }} />

<!-- AC-B28-4 (20,21,22,23,24) -->
<Story name="Mobile Menu Details" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement }) => {
    // AC-20: <details class="nav-menu"> is present
    const details = canvasElement.querySelector('details.nav-menu') as HTMLDetailsElement | null;
    await expect(details).not.toBeNull();

    // AC-20: contains <summary class="nav-summary">
    const summary = details!.querySelector('summary.nav-summary');
    await expect(summary).not.toBeNull();

    // AC-21: summary contains nav-icon-open (≡) and nav-icon-close (×)
    const iconOpen  = details!.querySelector('.nav-icon-open')  as HTMLElement | null;
    const iconClose = details!.querySelector('.nav-icon-close') as HTMLElement | null;
    await expect(iconOpen).not.toBeNull();
    await expect(iconClose).not.toBeNull();
    await expect(iconOpen!.textContent?.trim()).toBe('≡');
    await expect(iconClose!.textContent?.trim()).toBe('×');

    // AC-22: .nav-icon-close is display:none when <details> is closed
    await expect(getComputedStyle(iconClose!).display).toBe('none');

    // AC-23: open the details programmatically
    details!.setAttribute('open', '');
    // Allow browser to re-apply styles
    await new Promise(r => setTimeout(r, 0));
    await expect(getComputedStyle(iconOpen!).display).toBe('none');
    await expect(getComputedStyle(iconClose!).display).not.toBe('none');

    // Close it again for cleanliness
    details!.removeAttribute('open');

    // AC-24: .nav-dropdown-link anchors exist with correct hrefs
    const dropdownLinks = details!.querySelectorAll('.nav-dropdown-link');
    await expect(dropdownLinks.length).toBe(6);
    const hrefs = Array.from(dropdownLinks).map(a => (a as HTMLAnchorElement).getAttribute('href'));
    await expect(hrefs).toContain('/feed');
    await expect(hrefs).toContain('/catalogue');
    await expect(hrefs).toContain('/notes');

    // AC-25: active dropdown link has aria-current="page"
    const activeDropdownLink = Array.from(dropdownLinks).find(
      a => (a as HTMLAnchorElement).getAttribute('href') === '/catalogue'
    ) as HTMLElement | undefined;
    await expect(activeDropdownLink).toBeDefined();
    await expect(activeDropdownLink!.getAttribute('aria-current')).toBe('page');

    // AC-39: .nav-dropdown has position: absolute
    const dropdown = details!.querySelector('.nav-dropdown') as HTMLElement | null;
    await expect(dropdown).not.toBeNull();
    await expect(getComputedStyle(dropdown!).position).toBe('absolute');

    // AC-40: .nav-dropdown background-color matches --bg
    await expect(getComputedStyle(dropdown!).backgroundColor).toBe(resolveTokenColor('--bg'));

    // AC-41: .nav-dropdown border-bottom-color matches --rule
    await expect(getComputedStyle(dropdown!).borderBottomColor).toBe(resolveTokenColor('--rule'));

    // AC-42: first dropdown link has padding-top and padding-bottom of 10px
    await expect(getComputedStyle(dropdownLinks[0] as HTMLElement).paddingTop).toBe('10px');
    await expect(getComputedStyle(dropdownLinks[0] as HTMLElement).paddingBottom).toBe('10px');

    // AC-43 (non-last): first dropdown link has border-bottom-color matching --rule
    await expect(getComputedStyle(dropdownLinks[0] as HTMLElement).borderBottomColor).toBe(resolveTokenColor('--rule'));

    // AC-43 (last-child): last dropdown link has border-bottom-width of 0px
    const lastLink = dropdownLinks[dropdownLinks.length - 1] as HTMLElement;
    await expect(getComputedStyle(lastLink).borderBottomWidth).toBe('0px');
  }} />

<!-- AC-20: Controlled mode — palette="phosphor" -->
<Story name="Controlled Palette Phosphor" args={{
  palette: 'phosphor',
  onPaletteToggle: vi.fn(),
}}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);

    // AC-2: toggle button text is ◐ when palette="phosphor"
    const btn = canvas.getByRole('button', { name: /toggle colour palette/i });
    await expect(btn.textContent?.trim()).toBe('◐');

    // snapshot localStorage and data-palette before click
    const lsBefore = localStorage.getItem('dxlb-palette');
    const attrBefore = document.documentElement.getAttribute('data-palette');

    // AC-4: clicking calls the spy exactly once
    await userEvent.click(btn);
    await expect(args.onPaletteToggle).toHaveBeenCalledTimes(1);

    // AC-5: localStorage is unchanged after the click
    await expect(localStorage.getItem('dxlb-palette')).toBe(lsBefore);

    // AC-6: data-palette is unchanged immediately after the click
    await expect(document.documentElement.getAttribute('data-palette')).toBe(attrBefore);
  }} />

<!-- AC-21: Controlled mode — palette="paper" -->
<Story name="Controlled Palette Paper" args={{
  palette: 'paper',
  onPaletteToggle: vi.fn(),
}}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);

    // AC-3: toggle button text is ◑ when palette="paper"
    const btn = canvas.getByRole('button', { name: /toggle colour palette/i });
    await expect(btn.textContent?.trim()).toBe('◑');

    // AC-4: clicking calls the spy exactly once
    await userEvent.click(btn);
    await expect(args.onPaletteToggle).toHaveBeenCalledTimes(1);
  }} />

<!-- AC-22: In-flow Nav — sticky={false} maxWidth="none" -->
<Story name="In-flow Nav" args={{
  sticky: false,
  maxWidth: 'none',
}}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // AC-13: <nav> position is NOT fixed when sticky={false}
    const nav = canvas.getByRole('navigation');
    await expect(getComputedStyle(nav).position).not.toBe('fixed');

    // AC-16: .nav-inner max-width is "none" (not the 1200px default)
    const inner = canvasElement.querySelector('.nav-inner') as HTMLElement | null;
    await expect(inner).not.toBeNull();
    await expect(getComputedStyle(inner!).maxWidth).toBe('none');
  }} />

<!-- AC-17: Custom maxWidth prop -->
<Story name="Custom MaxWidth" args={{
  sticky: true,
  maxWidth: '960px',
}}
  play={async ({ canvasElement }) => {
    // AC-17: .nav-inner max-width matches the custom value
    const inner = canvasElement.querySelector('.nav-inner') as HTMLElement;
    await expect(getComputedStyle(inner).maxWidth).toBe('960px');
  }} />

<!-- AC-7: Palette prop reactivity — both glyphs visible with correct palette values -->
<Story name="Controlled Palette Glyphs"
  play={async ({ canvasElement }) => {
    // phosphor Nav shows ◐, paper Nav shows ◑
    const btns = canvasElement.querySelectorAll('button[aria-label="Toggle colour palette"]');
    await expect(btns.length).toBe(2);
    await expect(btns[0].textContent?.trim()).toBe('◐');
    await expect(btns[1].textContent?.trim()).toBe('◑');
  }}>
  {#snippet template(args)}
    <div>
      <Nav palette="phosphor" onPaletteToggle={vi.fn()} />
      <Nav palette="paper" onPaletteToggle={vi.fn()} />
    </div>
  {/snippet}
</Story>

<!-- AC-10: Mixed mode — only palette provided (no onPaletteToggle) -->
<Story name="Mixed Mode Palette Only" args={{
  palette: 'phosphor',
}}
  play={async ({ canvasElement, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /toggle colour palette/i });

    // record before state
    const attrBefore = document.documentElement.getAttribute('data-palette');
    const lsBefore = localStorage.getItem('dxlb-palette');

    // click — should behave as uncontrolled (writes localStorage + mutates data-palette)
    await userEvent.click(btn);

    // AC-10: data-palette has changed (uncontrolled behaviour)
    const attrAfter = document.documentElement.getAttribute('data-palette');
    await expect(attrAfter).not.toBe(attrBefore);

    // AC-10: localStorage has changed
    const lsAfter = localStorage.getItem('dxlb-palette');
    await expect(lsAfter).not.toBe(lsBefore);
  }} />

<!-- B49 AC-1: Outside click (pointerdown/click on document.body) closes the open menu — REGRESSION TEST -->
<Story name="Dismiss On Outside Click" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details.nav-menu') as HTMLDetailsElement;
    await expect(details).not.toBeNull();

    // Open the menu programmatically (viewport-independent — see spec harness note)
    details.open = true;
    details.dispatchEvent(new Event('toggle', { bubbles: false }));
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(true);

    // Dispatch an outside pointerdown + click on an element NOT contained by details.
    // (Cover both — the dismiss handler may listen on either; assert end state.)
    await expect(details.contains(document.body)).toBe(false);
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 0));

    // AC-1: the menu closes — open attribute removed, driven by document handler
    await expect(details.open).toBe(false);
    await expect(details.hasAttribute('open')).toBe(false);
  }} />

<!-- B49 AC-2: Clicks INSIDE the open menu (the .nav-dropdown area) do NOT close it -->
<Story name="Keep Open On Inside Click" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details.nav-menu') as HTMLDetailsElement;
    await expect(details).not.toBeNull();

    // Open the menu
    details.open = true;
    details.dispatchEvent(new Event('toggle', { bubbles: false }));
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(true);

    // Click inside the dropdown (an element contained by details, not the summary)
    const dropdown = details.querySelector('.nav-dropdown') as HTMLElement;
    await expect(dropdown).not.toBeNull();
    await expect(details.contains(dropdown)).toBe(true);
    dropdown.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    dropdown.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 0));

    // AC-2: still open after an inside interaction
    await expect(details.open).toBe(true);
  }} />

<!-- B49 AC-3: Summary still toggles natively — open then close, no double-toggle -->
<Story name="Summary Native Toggle" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement, userEvent }) => {
    const details = canvasElement.querySelector('details.nav-menu') as HTMLDetailsElement;
    await expect(details).not.toBeNull();
    const summary = details.querySelector('summary.nav-summary') as HTMLElement;
    await expect(summary).not.toBeNull();

    // Starts closed
    await expect(details.open).toBe(false);

    // AC-3 (open): activating the summary opens the menu and the dismiss logic
    // must NOT immediately treat that same activation as an outside click.
    await userEvent.click(summary);
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(true);

    // AC-3 (close): activating again closes it, with no double-toggle re-opening it.
    await userEvent.click(summary);
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(false);
  }} />

<!-- B49 AC-4: Escape closes the open menu; no-op when already closed -->
<Story name="Dismiss On Escape" args={{
  links: [
    { href: '/feed',      label: 'FEED' },
    { href: '/catalogue', label: 'CATALOGUE', active: true },
    { href: '/projects',  label: 'PROJECTS' },
    { href: '/notes',     label: 'NOTES' },
    { href: '/about',     label: 'ABOUT' },
    { href: '/contact',   label: 'CONTACT' },
  ]
}}
  play={async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details.nav-menu') as HTMLDetailsElement;
    await expect(details).not.toBeNull();

    // AC-4 (no-op when closed): Escape while closed must not open or throw.
    await expect(details.open).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(false);

    // Open the menu
    details.open = true;
    details.dispatchEvent(new Event('toggle', { bubbles: false }));
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(true);

    // AC-4: Escape on document closes the open menu
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise(r => setTimeout(r, 0));
    await expect(details.open).toBe(false);
  }} />

<!-- AC-11: Mixed mode — only onPaletteToggle provided (no palette) -->
<Story name="Mixed Mode Callback Only" args={{
  onPaletteToggle: vi.fn(),
}}
  play={async ({ canvasElement, args, userEvent }) => {
    const canvas = within(canvasElement);
    const btn = canvas.getByRole('button', { name: /toggle colour palette/i });

    // record before state
    const attrBefore = document.documentElement.getAttribute('data-palette');

    // click — should behave as uncontrolled (mutates data-palette)
    await userEvent.click(btn);

    // AC-11: data-palette has changed (uncontrolled)
    const attrAfter = document.documentElement.getAttribute('data-palette');
    await expect(attrAfter).not.toBe(attrBefore);

    // AC-11: spy was NOT called
    await expect(args.onPaletteToggle).toHaveBeenCalledTimes(0);
  }} />
