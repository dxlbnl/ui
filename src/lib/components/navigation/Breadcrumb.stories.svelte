<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Breadcrumb from "./Breadcrumb.svelte";

  const { Story } = defineMeta({
    title: "Navigation/Breadcrumb",
    component: Breadcrumb,
    tags: ["autodocs"],
  });
</script>

<!-- AC 25: Default story — 3-crumb trail -->
<Story
  name="Default"
  args={{
    crumbs: [
      { label: "Home", href: "/" },
      { label: "Catalogue", href: "/catalogue" },
      { label: "Conduit PDX-2", href: "/catalogue/conduit-pdx2" },
    ],
  }}
  play={async ({ canvasElement }) => {
    // AC 5 / AC 25: <nav> with aria-label="breadcrumb" is present
    const nav = within(canvasElement).getByRole("navigation", {
      name: "breadcrumb",
    });
    await expect(nav).toBeVisible();

    // AC 6: direct child is <ol>
    const ol = nav.querySelector("ol");
    await expect(ol).not.toBeNull();
    await expect(ol!.tagName).toBe("OL");

    // AC 8 / AC 25: exactly 3 <li> elements
    const items = ol!.querySelectorAll("li");
    await expect(items.length).toBe(3);

    // AC 11 / AC 25: "Home" does NOT have aria-current
    const homeLink = within(canvasElement).getByRole("link", { name: "Home" });
    await expect(homeLink).not.toHaveAttribute("aria-current");

    // AC 11 / AC 25: "Catalogue" does NOT have aria-current
    const catalogueLink = within(canvasElement).getByRole("link", {
      name: "Catalogue",
    });
    await expect(catalogueLink).not.toHaveAttribute("aria-current");

    // AC 10 / AC 25: last crumb "Conduit PDX-2" has aria-current="page"
    const currentLink = within(canvasElement).getByRole("link", {
      name: "Conduit PDX-2",
    });
    await expect(currentLink).toHaveAttribute("aria-current", "page");

    // AC 12 / AC 25: exactly 2 aria-hidden separator elements
    const separators = canvasElement.querySelectorAll('[aria-hidden="true"]');
    await expect(separators.length).toBe(2);

    // AC 9: "Home" link href is "/"
    await expect(homeLink).toHaveAttribute("href", "/");

    // AC 9: "Catalogue" link href is "/catalogue"
    await expect(catalogueLink).toHaveAttribute("href", "/catalogue");
  }}
/>

<!-- AC 26: Root Only — single crumb -->
<Story
  name="Root Only"
  args={{
    crumbs: [{ label: "Home", href: "/" }],
  }}
  play={async ({ canvasElement }) => {
    // AC 5: <nav> with aria-label="breadcrumb" is present
    const nav = within(canvasElement).getByRole("navigation", {
      name: "breadcrumb",
    });
    await expect(nav).toBeVisible();

    // AC 15 / AC 26: exactly 1 <li> element
    const items = canvasElement.querySelectorAll("li");
    await expect(items.length).toBe(1);

    // AC 13 / AC 26: single crumb has aria-current="page"
    const homeLink = within(canvasElement).getByRole("link", { name: "Home" });
    await expect(homeLink).toHaveAttribute("aria-current", "page");

    // AC 14 / AC 26: zero separator elements
    const separators = canvasElement.querySelectorAll('[aria-hidden="true"]');
    await expect(separators.length).toBe(0);
  }}
/>

<!-- AC 27: Two Crumbs — intermediate depth -->
<Story
  name="Two Crumbs"
  args={{
    crumbs: [
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
    ],
  }}
  play={async ({ canvasElement }) => {
    // AC 27: exactly 2 <li> elements
    const items = canvasElement.querySelectorAll("li");
    await expect(items.length).toBe(2);

    // AC 27: "Home" does NOT have aria-current
    const homeLink = within(canvasElement).getByRole("link", { name: "Home" });
    await expect(homeLink).not.toHaveAttribute("aria-current");

    // AC 27: "Projects" has aria-current="page"
    const projectsLink = within(canvasElement).getByRole("link", {
      name: "Projects",
    });
    await expect(projectsLink).toHaveAttribute("aria-current", "page");

    // AC 27: exactly 1 separator element
    const separators = canvasElement.querySelectorAll('[aria-hidden="true"]');
    await expect(separators.length).toBe(1);
  }}
/>
