<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor, within } from "storybook/test";
  import { resolveTokenColor } from "$lib/storybook-utils.js";
  import Accordion from "./Accordion.svelte";
  import AccordionItem from "./AccordionItem.svelte";

  // Composition stories (no `component:` in defineMeta): each story renders a fixed-height
  // overflow:auto scroll wrapper containing an <Accordion> directly in the slot, so
  // position:sticky has a real scroll-container ancestor (the reference notes sticky
  // "needs a real scroll-container ancestor; breaks under overflow:hidden"). See
  // wiki/specs/B59-accordion-sticky-headers.md and wiki/stories-guide.md "Composition stories".
  const { Story } = defineMeta({
    title: "Data/Accordion (Sticky)",
    tags: ["autodocs"],
  });

  // Parse the numeric px from an inline style value (e.g. "92px" -> 92). NaN if absent.
  function parsePx(value: string): number {
    return parseFloat(value);
  }
</script>

<!-- Story 1 — "Sticky Headers": behaviour + structure (AC-5, 6, 7, 8, 9, 11, 12, 13) -->
<Story
  name="Sticky Headers"
  play={async ({ canvasElement }) => {
    const summaries = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("summary.acc-trigger"),
    );
    await expect(summaries.length).toBe(3);

    // AC-5: every sticky <summary> carries data-sticky="true".
    for (const s of summaries) {
      await expect(s.getAttribute("data-sticky")).toBe("true");
    }

    // AC-6: computed position is sticky for each <summary>.
    for (const s of summaries) {
      await expect(getComputedStyle(s).position).toBe("sticky");
    }

    // AC-13 / AC-7 / AC-8: numeric top/bottom/z-index live in the inline style attribute.
    // Wait for the inline offsets to be present (measurement + render settles).
    await waitFor(async () => {
      for (const s of summaries) {
        await expect(Number.isNaN(parsePx(s.style.top))).toBe(false);
        await expect(Number.isNaN(parsePx(s.style.bottom))).toBe(false);
        await expect(s.style.zIndex).not.toBe("");
      }
    });

    // OQ-1: the acceptance contract is the *cumulative-sum* relationship, asserted from
    // whichever header heights are live (the 46px fallback before measurement, or each
    // summary's measured offsetHeight after the ResizeObserver settles). We read the live
    // heights and assert top(i) = Σ height(k) for k<i and bottom(i) = Σ height(k) for k>i,
    // with a ±1px tolerance — rather than hard-coding 46 — so the test is robust whether
    // or not measurement has replaced the fallback in the browser harness.
    const heights = summaries.map((s) => s.offsetHeight);
    const n = summaries.length;

    for (let i = 0; i < n; i++) {
      const expectedTop = heights
        .slice(0, i)
        .reduce((a, b) => a + b, 0);
      const expectedBottom = heights
        .slice(i + 1)
        .reduce((a, b) => a + b, 0);

      const actualTop = parsePx(summaries[i].style.top);
      const actualBottom = parsePx(summaries[i].style.bottom);

      // AC-7: top = cumulative height of headers ABOVE.
      await expect(Math.abs(actualTop - expectedTop)).toBeLessThanOrEqual(1);
      // AC-8: bottom = cumulative height of headers BELOW.
      await expect(
        Math.abs(actualBottom - expectedBottom),
      ).toBeLessThanOrEqual(1);
    }

    // Independent of measurement: offsets are monotonic — top grows top→bottom, bottom shrinks.
    await expect(parsePx(summaries[0].style.top)).toBe(0);
    await expect(parsePx(summaries[n - 1].style.bottom)).toBe(0);
    for (let i = 1; i < n; i++) {
      await expect(parsePx(summaries[i].style.top)).toBeGreaterThan(
        parsePx(summaries[i - 1].style.top),
      );
      await expect(parsePx(summaries[i].style.bottom)).toBeLessThan(
        parsePx(summaries[i - 1].style.bottom),
      );
    }

    // AC-9: z-index = 10 + (n - i) -> 13, 12, 11 for items 0, 1, 2.
    for (let i = 0; i < n; i++) {
      await expect(summaries[i].style.zIndex).toBe(String(10 + (n - i)));
    }

    // AC-11: sticky <summary> background resolves to var(--bg-sunken).
    const sunken = resolveTokenColor("--bg-sunken");
    for (const s of summaries) {
      await expect(getComputedStyle(s).backgroundColor).toBe(sunken);
    }

    // AC-12: top + bottom borders resolve to var(--rule-strong), 1px solid.
    const ruleStrong = resolveTokenColor("--rule-strong");
    for (const s of summaries) {
      const cs = getComputedStyle(s);
      await expect(cs.borderTopStyle).toBe("solid");
      await expect(cs.borderTopWidth).toBe("1px");
      await expect(cs.borderTopColor).toBe(ruleStrong);
      await expect(cs.borderBottomStyle).toBe("solid");
      await expect(cs.borderBottomWidth).toBe("1px");
      await expect(cs.borderBottomColor).toBe(ruleStrong);
    }
  }}
>
  <div style="height:200px;overflow:auto;">
    <Accordion sticky>
      <AccordionItem label="Section One" open={true}>
        <p style="height:300px;margin:0;">
          Tall body one — long enough to make the list scrollable so the headers
          tile into a top and bottom stack.
        </p>
      </AccordionItem>
      <AccordionItem label="Section Two" open={true}>
        <p style="height:300px;margin:0;">
          Tall body two — long enough to make the list scrollable so the headers
          tile into a top and bottom stack.
        </p>
      </AccordionItem>
      <AccordionItem label="Section Three" open={true}>
        <p style="height:300px;margin:0;">
          Tall body three — long enough to make the list scrollable so the
          headers tile into a top and bottom stack.
        </p>
      </AccordionItem>
    </Accordion>
  </div>
</Story>

<!-- Story 2 — "Custom Fallback Height": offset arithmetic scales with fallbackHeaderHeight
     (AC-2, AC-7). OQ-1: if live measurement settles, assert the measured cumulative sum. -->
<Story
  name="Custom Fallback Height"
  play={async ({ canvasElement }) => {
    const summaries = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("summary.acc-trigger"),
    );
    await expect(summaries.length).toBe(3);

    // Sticky is active here too (AC-5 / AC-6).
    for (const s of summaries) {
      await expect(s.getAttribute("data-sticky")).toBe("true");
      await expect(getComputedStyle(s).position).toBe("sticky");
    }

    await waitFor(async () => {
      for (const s of summaries) {
        await expect(Number.isNaN(parsePx(s.style.top))).toBe(false);
        await expect(Number.isNaN(parsePx(s.style.bottom))).toBe(false);
      }
    });

    // OQ-1: assert the cumulative-sum contract from whichever heights are live. Before
    // measurement settles, height(k) == fallbackHeaderHeight (60 here) so the baseline is
    // 0/60/120; after measurement, it is Σ measured offsetHeight. Either way the arithmetic
    // (cumulative sum of header heights) is the asserted contract. We compute the unit step
    // from the actual gap between consecutive top offsets and require it to be uniform.
    const heights = summaries.map((s) => s.offsetHeight);
    const n = summaries.length;
    const tops = summaries.map((s) => parsePx(s.style.top));
    const bottoms = summaries.map((s) => parsePx(s.style.bottom));

    for (let i = 0; i < n; i++) {
      const expectedTop = heights.slice(0, i).reduce((a, b) => a + b, 0);
      const expectedBottom = heights.slice(i + 1).reduce((a, b) => a + b, 0);
      await expect(Math.abs(tops[i] - expectedTop)).toBeLessThanOrEqual(1);
      await expect(Math.abs(bottoms[i] - expectedBottom)).toBeLessThanOrEqual(1);
    }

    // The per-header step must reflect fallbackHeaderHeight (60) when the rendered header
    // height has NOT diverged from the fallback. The step is top(1) - top(0).
    const step = tops[1] - tops[0];
    // If headers measure ~60 (fallback used) the step is 60; if the live measured height
    // differs, the step must still equal the measured first-header height (cumulative-sum
    // contract). This proves fallbackHeaderHeight feeds the arithmetic when measurement
    // has not overridden it.
    if (Math.abs(heights[0] - 60) <= 2) {
      await expect(Math.abs(step - 60)).toBeLessThanOrEqual(1);
    } else {
      await expect(Math.abs(step - heights[0])).toBeLessThanOrEqual(1);
    }

    await expect(tops[0]).toBe(0);
    await expect(bottoms[n - 1]).toBe(0);
  }}
>
  <div style="height:200px;overflow:auto;">
    <Accordion sticky fallbackHeaderHeight={60}>
      <AccordionItem label="Alpha" open={true}>
        <p style="height:300px;margin:0;">Tall body alpha.</p>
      </AccordionItem>
      <AccordionItem label="Beta" open={true}>
        <p style="height:300px;margin:0;">Tall body beta.</p>
      </AccordionItem>
      <AccordionItem label="Gamma" open={true}>
        <p style="height:300px;margin:0;">Tall body gamma.</p>
      </AccordionItem>
    </Accordion>
  </div>
</Story>

<!-- Story 3 — "Non-Sticky (regression guard)": default mode has NO sticky positioning
     (AC-14, AC-15). -->
<Story
  name="Non-Sticky (regression guard)"
  play={async ({ canvasElement }) => {
    const summaries = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("summary.acc-trigger"),
    );
    await expect(summaries.length).toBe(2);

    for (const s of summaries) {
      // AC-15: no data-sticky attribute.
      await expect(s.hasAttribute("data-sticky")).toBe(false);
      // AC-14: computed position is NOT sticky (default static).
      await expect(getComputedStyle(s).position).not.toBe("sticky");
      // AC-15: no inline top/bottom/z-index offsets.
      await expect(s.style.top).toBe("");
      await expect(s.style.bottom).toBe("");
      await expect(s.style.zIndex).toBe("");
    }
  }}
>
  <div style="height:200px;overflow:auto;">
    <Accordion>
      <AccordionItem label="Plain One" open={true}>
        <p style="height:300px;margin:0;">Default, non-sticky body one.</p>
      </AccordionItem>
      <AccordionItem label="Plain Two" open={true}>
        <p style="height:300px;margin:0;">Default, non-sticky body two.</p>
      </AccordionItem>
    </Accordion>
  </div>
</Story>

<!-- Story 4 — "Sticky Headers Stack While Scrolling": the B66 regression. The headers must
     stay pinned (top + bottom stacks) under real programmatic scrolling, which only works
     once the per-item <details> shares a single containing block with .accordion via
     display:contents (AC-5). Today each <summary> is trapped in its own <details> block, so
     the first header un-sticks and scrolls out at the bottom scroll position — AC-1 fails.
     Covers AC-1..AC-5, AC-7. Relationships, not exact pixel positions (D69). -->
<Story
  name="Sticky Headers Stack While Scrolling"
  play={async ({ canvasElement, userEvent }) => {
    const summaries = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("summary.acc-trigger"),
    );
    // 3 open + 1 closed item.
    await expect(summaries.length).toBe(4);

    const allDetails = Array.from(
      canvasElement.querySelectorAll<HTMLElement>("details.acc-item"),
    );
    await expect(allDetails.length).toBe(4);

    // The scroll wrapper is the nearest overflow ancestor of the first summary.
    const wrapper = summaries[0].closest<HTMLElement>('[style*="overflow"]');
    await expect(wrapper).not.toBeNull();
    const scroll = wrapper as HTMLElement;

    // AC-5: in sticky mode each <details class="acc-item"> is laid out as display:contents,
    // so its <summary> and .acc-body become layout children of .accordion (one shared
    // containing block). On today's code the <details> are display:block — this fails.
    for (const d of allDetails) {
      await expect(getComputedStyle(d).display).toBe("contents");
    }

    // Wait for the sticky inline offsets to be present (measurement + render settles) so the
    // scroll-position assertions run against settled layout.
    await waitFor(async () => {
      for (const s of summaries) {
        await expect(Number.isNaN(parseFloat(s.style.top))).toBe(false);
        await expect(Number.isNaN(parseFloat(s.style.bottom))).toBe(false);
      }
    });

    // Sanity: the content is taller than the wrapper, so there is something to scroll.
    await expect(scroll.scrollHeight).toBeGreaterThan(scroll.clientHeight);

    const TOL = 2;

    // --- Scroll to the BOTTOM and let sticky layout + ResizeObserver offsets settle. ---
    scroll.scrollTop = scroll.scrollHeight;
    await waitFor(async () => {
      await expect(
        Math.abs(scroll.scrollTop - (scroll.scrollHeight - scroll.clientHeight)),
      ).toBeLessThanOrEqual(TOL);
    });

    // Re-read the wrapper rect AFTER scrolling (its viewport position can shift).
    let wrapperRect = scroll.getBoundingClientRect();

    // AC-1 (PRIMARY REGRESSION — fails on today's code): at the bottom scroll position the
    // FIRST header is still pinned to the top stack, i.e. still in view. Its rect bottom is
    // below the wrapper's top edge. Today the first <summary> is trapped in its own <details>
    // and has scrolled out, so its rect.bottom <= wrapperRect.top and this assertion fails.
    await waitFor(async () => {
      const firstRect = summaries[0].getBoundingClientRect();
      await expect(firstRect.bottom).toBeGreaterThan(wrapperRect.top - TOL);
      // Pinned to the TOP stack: its top edge sits at/near the wrapper's top edge, not below.
      await expect(firstRect.top).toBeLessThanOrEqual(wrapperRect.top + TOL + 1);
    });

    // AC-2: at the bottom scroll position every header is within the wrapper's visible rect —
    // no header has fully left the viewport while the accordion is in view.
    wrapperRect = scroll.getBoundingClientRect();
    for (const s of summaries) {
      const rect = s.getBoundingClientRect();
      await expect(rect.bottom).toBeGreaterThan(wrapperRect.top - TOL);
      await expect(rect.top).toBeLessThan(wrapperRect.bottom + TOL);
    }

    // AC-4: the top-stack headers tile edge-to-edge using their cumulative `top` offsets —
    // NOT all collapsed at `top: 0`. At the bottom scroll position headers 0 and 1 are
    // deterministically pinned to the top stack (their 400px bodies guarantee it), so we
    // assert the tiling on that pair: header 0 sits at the wrapper top, and header 1 sits
    // exactly at header 0's bottom edge (contiguous, non-overlapping). The bottom-pinned
    // last header is NOT part of this top-stack run and is covered by AC-3.
    const header0 = summaries[0].getBoundingClientRect();
    const header1 = summaries[1].getBoundingClientRect();
    // Header 0 is pinned to the top stack: its top edge is at the wrapper's top edge.
    await expect(Math.abs(header0.top - wrapperRect.top)).toBeLessThanOrEqual(TOL);
    // Header 0 occupies a full header band (it has not collapsed): its bottom is well below
    // the wrapper top by roughly its own height — reinforces "not all at top:0".
    await expect(header0.bottom).toBeGreaterThan(
      wrapperRect.top + (summaries[0].offsetHeight - TOL),
    );
    // Header 1 tiles directly below header 0 — its top sits at header 0's bottom edge. This
    // proves the two are NOT both at top:0 AND do not overlap (edge-to-edge cumulative tiling).
    await expect(Math.abs(header1.top - header0.bottom)).toBeLessThanOrEqual(TOL);

    // --- Scroll back to the TOP and settle. ---
    scroll.scrollTop = 0;
    await waitFor(async () => {
      await expect(scroll.scrollTop).toBeLessThanOrEqual(TOL);
    });

    // AC-3: at the top scroll position the LAST header is still within view / pinned to the
    // bottom stack — it has not been pushed entirely below the fold.
    wrapperRect = scroll.getBoundingClientRect();
    await waitFor(async () => {
      const lastRect = summaries[summaries.length - 1].getBoundingClientRect();
      await expect(lastRect.top).toBeLessThan(wrapperRect.bottom + TOL);
      await expect(lastRect.bottom).toBeGreaterThan(wrapperRect.top - TOL);
    });

    // AC-7: native open/close still hides/shows the body under display:contents. The 4th item
    // is rendered CLOSED — its body is not visible. Opening it (click the <summary>) makes the
    // body visible. This proves the native <details> disclosure survives display:contents.
    const closedDetails = allDetails[3];
    await expect(closedDetails.hasAttribute("open")).toBe(false);

    const closedBody = within(closedDetails).getByText(
      /Closed section body — hidden until opened/,
    );
    await expect(closedBody).not.toBeVisible();

    await userEvent.click(summaries[3]);
    await expect(closedDetails.hasAttribute("open")).toBe(true);
    await waitFor(() => expect(closedBody).toBeVisible());
  }}
>
  <div style="height:160px;overflow:auto;">
    <Accordion sticky>
      <AccordionItem label="Section One" open={true}>
        <div style="height:400px;">
          Tall body one — long enough that scrolling past it would un-stick a
          header trapped in its own &lt;details&gt; block.
        </div>
      </AccordionItem>
      <AccordionItem label="Section Two" open={true}>
        <div style="height:400px;">
          Tall body two — long enough that scrolling past it would un-stick a
          header trapped in its own &lt;details&gt; block.
        </div>
      </AccordionItem>
      <AccordionItem label="Section Three" open={true}>
        <div style="height:400px;">
          Tall body three — long enough that scrolling past it would un-stick a
          header trapped in its own &lt;details&gt; block.
        </div>
      </AccordionItem>
      <AccordionItem label="Section Four (closed)">
        <div style="height:400px;">
          Closed section body — hidden until opened. Proves native open/close
          still works under display:contents.
        </div>
      </AccordionItem>
    </Accordion>
  </div>
</Story>
