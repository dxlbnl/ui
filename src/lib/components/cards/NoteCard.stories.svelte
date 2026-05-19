<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import NoteCard from "./NoteCard.svelte";
  import { resolveTokenFgColor } from "$lib/storybook-utils.js";

  const { Story } = defineMeta({
    title: "Cards/NoteCard",
    component: NoteCard,
    tags: ["autodocs"],
  });
</script>

<Story name="With Lede" args={{ href: "#note-0x06", idx: 6, kind: "PROJECT-LOG", title: "Shipping the Site", lede: "Turning a messy prototype into a stable place to document the work and sell hardware.", date: "1 May 2026" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // renders as <a> by default
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    // idx=6 → "0x06" hex ID displayed
    const hexEl = canvas.getByText("0x06");
    await expect(hexEl).toBeVisible();

    // kind label rendered in uppercase
    const kindEl = canvas.getByText("PROJECT-LOG");
    await expect(kindEl).toBeVisible();

    // title renders as h3
    const heading = canvasElement.querySelector("h3") as HTMLElement;
    await expect(heading).toBeVisible();
    await expect(heading.textContent).toContain("Shipping the Site");

    // lede renders as a <p> element
    const ledeEl = canvasElement.querySelector("p.note-lede") as HTMLElement;
    await expect(ledeEl).toBeVisible();
    await expect(ledeEl.textContent).toContain("Turning a messy prototype");

    // date rendered in footer
    const dateEl = canvas.getByText(/1 May 2026/);
    await expect(dateEl).toBeVisible();

    // Footer "READ" is present
    const readEl = canvas.getByText(/READ/);
    await expect(readEl).toBeVisible();

    // resting border-color matches --rule token
    const ruleColor = resolveTokenFgColor("--rule");
    await expect(getComputedStyle(root).borderColor).toBe(ruleColor);
  }} />

<Story name="Minimal" args={{ href: "#note-0x01", idx: 1, kind: "LOG", title: "First entry" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root).toBeVisible();

    // idx=1 → "0x01"
    const hexEl = canvas.getByText("0x01");
    await expect(hexEl).toBeVisible();

    // no lede — .note-lede element should not be present
    const ledeEl = canvasElement.querySelector(".note-lede");
    await expect(ledeEl).toBeNull();

    // no date — .note-foot element should not be present
    const footEl = canvasElement.querySelector(".note-foot");
    await expect(footEl).toBeNull();
  }} />

<Story name="High Index" args={{ href: "#note-0xff", idx: 255, title: "High index" }}
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hexEl = canvas.getByText("0xFF");
    await expect(hexEl).toBeVisible();
  }} />

<Story name="As Div" args={{ as: "div", idx: 1, title: "Test" }}
  play={async ({ canvasElement }) => {
    const root = canvasElement.firstElementChild as HTMLElement;
    await expect(root.tagName).toBe("DIV");
    await expect(root).toBeVisible();
  }} />

<!-- B27 AC-21: .note-lede Text must have no style="flex: 1" attribute -->
<Story name="No Inline Flex Style" args={{ href: "#note-0x03", idx: 3, title: "Bench Notes", lede: "An excerpt from the bench." }}
  play={async ({ canvasElement }) => {
    // Before B27: <Text class="note-lede" style="flex: 1;"> carries a style= attribute.
    // After B27: flex: 1 moves to scoped CSS via .note-lede rule; no style= on the element.
    const ledeEl = canvasElement.querySelector('.note-lede') as HTMLElement;
    await expect(ledeEl.getAttribute('style')).toBeNull();
  }} />

<!-- B43 AC-16: Side image placement (default) — visual catalogue only, no play assertions -->
<Story name="Side With Image" args={{ href: "#note-0x07", idx: 7, kind: "PROJECT-LOG", title: "Building the Image Pipeline", lede: "How we wire Vercel's image transformation API into the notes index for responsive thumbnails.", date: "19 May 2026", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=480", imageSrcset: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=240 240w, https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=480 480w", imagePlacement: "side" }} />

<!-- B43 AC-17: Top image placement — visual catalogue only, no play assertions -->
<Story name="Top With Image" args={{ href: "#note-0x08", idx: 8, kind: "LOG", title: "Card Grid Explorations", lede: "Trying out a 3-column grid of NoteCards with the image stacked above the text.", date: "19 May 2026", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800", imagePlacement: "top" }} />
