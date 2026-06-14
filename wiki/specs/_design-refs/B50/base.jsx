// Dexterlabs DS — shared base
// useMediaQuery: matchMedia hook underpinning AppShell + responsive Modal.
// Led: status dot primitive (used by StatusPill, Inbox, AppShell).
// Both export to window so sibling babel files can read them as globals.

function useMediaQuery(query) {
  const get = () =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia(query).matches
      : false;
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatches(m.matches);
    on();
    m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () =>
      m.removeEventListener
        ? m.removeEventListener("change", on)
        : m.removeListener(on);
  }, [query]);
  return matches;
}

function Led({ tone = "ok", blink = false, size = 7 }) {
  const c =
    { ok: "var(--ok)", amber: "var(--amber)", cyan: "var(--cyan)", danger: "var(--danger)", off: "var(--ink-faint)" }[tone] ||
    "var(--ok)";
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: c,
        boxShadow: tone !== "off" ? `0 0 5px ${c}` : "none",
        flexShrink: 0,
        animation: blink ? "led-blink 1.6s steps(2,end) infinite" : "none",
      }}
    />
  );
}

Object.assign(window, { useMediaQuery, Led });
