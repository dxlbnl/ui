<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Nav from "./Nav.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Navigation/Nav",
    component: Nav,
    tags: ["autodocs"],
  });
</script>

<Story name="Default" args={{
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
    const canvas = within(canvasElement);

    // <nav> element is present
    const nav = canvas.getByRole('navigation');
    await expect(nav).toBeVisible();

    // brand link contains 'DEXTERLABS' (default siteName)
    await expect(canvas.getByRole('link', { name: /DEXTERLABS/ })).toBeVisible();

    // active link has aria-current="page"
    const activeLink = canvas.getByRole('link', { name: 'CATALOGUE' });
    await expect(activeLink.getAttribute('aria-current')).toBe('page');

    // palette toggle button is present and visible
    const toggleBtn = canvas.getByRole('button', { name: 'Toggle colour palette' });
    await expect(toggleBtn).toBeVisible();
  }} />

<Story name="No Links" args={{ links: [] }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // <nav> is present
    const nav = canvas.getByRole('navigation');
    await expect(nav).toBeVisible();

    // no <li> elements in the canvas
    const items = canvasElement.querySelectorAll('li');
    await expect(items.length).toBe(0);

    // palette toggle is still present
    const toggleBtn = canvas.getByRole('button', { name: 'Toggle colour palette' });
    await expect(toggleBtn).toBeVisible();
  }} />

<Story name="Custom Site Name" args={{ links: [], siteName: 'LAB' }}
  play={async ({ canvasElement }) => {
    // brand link contains the custom siteName
    await expect(within(canvasElement).getByRole('link', { name: /LAB/ })).toBeVisible();
  }} />

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

<Story name="Mobile Menu" args={{
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
    // hamburger exists in DOM at all viewport widths
    const btn = canvasElement.querySelector('.nav-hamburger') as HTMLButtonElement;
    await expect(btn).not.toBeNull();
    await expect(btn.getAttribute('aria-label')).toBe('Open menu');

    const drawer = canvasElement.querySelector('#nav-drawer')!;

    // drawer starts hidden
    await expect(drawer.getAttribute('aria-hidden')).not.toBe(null);

    // native click works regardless of display:none; await tick for Svelte to update DOM
    btn.click();
    await new Promise(r => setTimeout(r, 0));
    await expect(drawer.getAttribute('aria-hidden')).toBeNull();
    await expect(btn.getAttribute('aria-label')).toBe('Close menu');

    // click again hides the drawer
    btn.click();
    await new Promise(r => setTimeout(r, 0));
    await expect(drawer.getAttribute('aria-hidden')).not.toBe(null);
    await expect(btn.getAttribute('aria-label')).toBe('Open menu');
  }} />

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
    const canvas = within(canvasElement);

    // get the NOTES anchor by visible text
    const anchor = canvas.getByText('NOTES');

    // aria-current is set to 'page'
    await expect(anchor.getAttribute('aria-current')).toBe('page');

    // border-bottom-color matches the --amber token
    const amberColor = resolveTokenFgColor('--amber');
    await expect(getComputedStyle(anchor).borderBottomColor).toBe(amberColor);
  }} />
