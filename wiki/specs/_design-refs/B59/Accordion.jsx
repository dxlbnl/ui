// Accordion — titled, collapsible sections. One component, several variants:
//   multiple   : allow many sections open at once (default: single-open)
//   sticky     : headers pin to the top AND bottom while scrolling a tall list
//                (the "sticky sections" mode). Offsets are measured live so the
//                headers tile into a top stack + a bottom stack instead of all
//                piling onto bottom:0 and overlapping.
//   controlled : pass openIds (Set | array) + onToggle; otherwise it manages its
//                own state (seed with defaultOpenIds).
//   flush      : render bodies with no padding (defaults on when sticky, so the
//                caller's rows sit flush; off otherwise for a padded text body).
//
// sections = [{ id, title, count?, controls?, body }]
// When sticky, needs a real scroll-container ancestor; breaks under overflow:hidden.

function Accordion({
  sections,
  multiple = false,
  sticky = false,
  openIds,
  onToggle,
  defaultOpenIds,
  flush = sticky,
  fallbackHeaderHeight = 46,
}) {
  const controlled = openIds != null && typeof onToggle === "function";
  const toSet = (v) => (v instanceof Set ? new Set(v) : new Set(v || []));
  const [internal, setInternal] = React.useState(() => {
    if (defaultOpenIds) return toSet(defaultOpenIds);
    return !multiple && sections.length ? new Set([sections[0].id]) : new Set();
  });
  const open = controlled ? toSet(openIds) : internal;
  const toggle = (id) => {
    if (controlled) return onToggle(id);
    setInternal((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!multiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  // ── Sticky offset measurement (only runs in sticky mode) ──
  const refs = React.useRef({});
  const [heights, setHeights] = React.useState({});
  React.useLayoutEffect(() => {
    if (!sticky) return;
    const measure = () => {
      const next = {};
      let changed = false;
      sections.forEach((s) => {
        const el = refs.current[s.id];
        if (el) {
          next[s.id] = el.offsetHeight;
          if (next[s.id] !== heights[s.id]) changed = true;
        }
      });
      if (changed) setHeights(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    sections.forEach((s) => {
      const el = refs.current[s.id];
      if (el) ro.observe(el);
    });
    return () => ro.disconnect();
    // eslint-disable-next-line
  }, [sticky, sections, open]);

  const n = sections.length;
  const hh = (id) => heights[id] || fallbackHeaderHeight;
  const topOff = [];
  const botOff = [];
  if (sticky) {
    let acc = 0;
    for (let i = 0; i < n; i++) {
      topOff[i] = acc;
      acc += hh(sections[i].id);
    }
    acc = 0;
    for (let i = n - 1; i >= 0; i--) {
      botOff[i] = acc;
      acc += hh(sections[i].id);
    }
  }

  return (
    <div style={{ border: "1px solid var(--rule)" }}>
      {sections.map((s, i) => {
        const isOpen = open.has(s.id);
        const stickyStyle = sticky
          ? { position: "sticky", top: topOff[i], bottom: botOff[i], zIndex: 10 + (n - i) }
          : {};
        return (
          <React.Fragment key={s.id}>
            <div
              ref={(el) => (refs.current[s.id] = el)}
              style={{
                ...stickyStyle,
                background: sticky ? "var(--bg-sunken)" : isOpen ? "var(--bg-elev)" : "var(--bg-rail)",
                borderTop: i ? `1px solid ${sticky ? "var(--rule-strong)" : "var(--rule)"}` : "none",
                borderBottom: sticky ? "1px solid var(--rule-strong)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                flexWrap: "wrap",
                transition: "background 0.15s",
              }}
            >
              <button
                onClick={() => toggle(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 auto", minWidth: 0, textAlign: "left", background: "none", cursor: "pointer" }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: isOpen ? "var(--amber)" : "var(--ink-faint)", width: 12 }}>{isOpen ? "▾" : "▸"}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</span>
                {s.count != null && <span style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", color: "var(--ink-faint)", flexShrink: 0 }}>{s.count}</span>}
              </button>
              {s.controls && (
                <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: 8 }}>{s.controls}</div>
              )}
            </div>
            {isOpen && (
              <div style={flush ? {} : { padding: "12px 16px", background: "var(--bg-sunken)", borderTop: "1px solid var(--rule)", fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.6 }}>
                {s.body}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, { Accordion });
