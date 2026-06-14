// Gauge — radial progress (the radial sibling of ProgressBar).
// pct 0–100; tone = a token name (ok | amber | cyan | danger | ...).

function Gauge({ pct, size = 42, tone = "amber", track = "var(--rule-strong)", width = 4 }) {
  const r = (size - width - 3) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, pct));
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", transform: "rotate(-90deg)", flexShrink: 0 }}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={width} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={`var(--${tone})`}
        strokeWidth={width}
        strokeDasharray={`${(p / 100) * c} ${c}`}
        style={{ transition: "stroke-dasharray .4s ease" }}
      />
    </svg>
  );
}

Object.assign(window, { Gauge });
