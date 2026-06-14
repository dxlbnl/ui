// CompareBars — target-vs-actual rows.
// rows = [{ label, value, target, valueLabel }].
// Bar turns --danger when value > target, else --ok; ghost outline marks the target.

function CompareBars({ rows }) {
  const max = Math.max(1, ...rows.map((r) => Math.max(r.target, r.value)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {rows.map((r, i) => {
        const over = r.value > r.target;
        const bw = (r.target / max) * 100,
          sw = (r.value / max) * 100;
        return (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "110px 1fr auto", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 11,
                color: "var(--ink-dim)",
                textTransform: "uppercase",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.label}
            </span>
            <div style={{ position: "relative", height: 16, background: "var(--bg-sunken)", border: "1px solid var(--rule)" }}>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${bw}%`,
                  borderRight: "1px solid var(--rule-strong)",
                  background: "var(--bg-elev)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${Math.min(100, sw)}%`,
                  background: over ? "var(--danger)" : "var(--ok)",
                  transition: "width .35s ease",
                }}
              />
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: over ? "var(--danger)" : "var(--ink-faint)", whiteSpace: "nowrap" }}>
              {r.valueLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { CompareBars });
