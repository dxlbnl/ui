// ProportionBar — stacked share bar + legend.
// segments = [{ label, value, color, valueLabel? }]. color is any CSS color/var.

function ProportionBar({ segments, height = 14 }) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  let x = 0;
  const W = 1000;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block", border: "1px solid var(--rule)", background: "var(--bg-sunken)" }}
      >
        {segments.map((s, i) => {
          const w = (Math.max(0, s.value) / total) * W;
          const rect = (
            <rect
              key={i}
              x={x}
              y={0}
              width={Math.max(0, w - (i < segments.length - 1 ? 2 : 0))}
              height={height}
              fill={s.color}
            />
          );
          x += w;
          return rect;
        })}
      </svg>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
        {segments.map((s, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-dim)" }}
          >
            <span style={{ width: 9, height: 9, background: s.color, flexShrink: 0 }} />
            <span style={{ textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-faint)" }}>{s.label}</span>
            {s.valueLabel && <span>{s.valueLabel}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ProportionBar });
