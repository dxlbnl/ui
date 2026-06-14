// ProgressBar — linear progress with over-budget state.
// pct accepts 0–120. Fill is var(--<tone>) up to 100; switches to --danger when
// >100, with a 3px --danger notch pinned to the right edge to signal overflow.

function ProgressBar({ pct = 0, tone = "ok", label, showPct = true }) {
  const over = pct > 100;
  const clamped = Math.max(0, Math.min(100, pct));
  const fill = over ? "var(--danger)" : `var(--${tone})`;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "100%" }}>
      {(label || showPct) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--mono)",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-faint)",
          }}
        >
          <span>{label}</span>
          {showPct && <span style={{ color: over ? "var(--danger)" : `var(--${tone})` }}>{Math.round(pct)}%</span>}
        </div>
      )}
      <div style={{ position: "relative", height: 5, background: "var(--bg-sunken)", border: "1px solid var(--rule)" }}>
        <div style={{ height: "100%", width: `${clamped}%`, background: fill, transition: "width 0.3s" }} />
        {over && <div style={{ position: "absolute", top: -1, bottom: -1, right: 0, width: 3, background: "var(--danger)" }} />}
      </div>
    </div>
  );
}

Object.assign(window, { ProgressBar });
