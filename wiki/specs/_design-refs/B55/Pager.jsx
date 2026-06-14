// Pager — prev / label / next stepper.

function Pager({ label, onPrev, onNext, prevDisabled, nextDisabled, minWidth = 132 }) {
  const arrow = (dis) => ({
    padding: "6px 12px",
    fontFamily: "var(--mono)",
    fontSize: 14,
    color: dis ? "var(--rule-strong)" : "var(--ink-dim)",
    cursor: dis ? "not-allowed" : "pointer",
  });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--rule-strong)", background: "var(--bg-rail)" }}>
      <button onClick={onPrev} disabled={prevDisabled} style={arrow(prevDisabled)}>
        ‹
      </button>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ink)",
          padding: "0 10px",
          minWidth,
          textAlign: "center",
        }}
      >
        {label}
      </span>
      <button onClick={onNext} disabled={nextDisabled} style={arrow(nextDisabled)}>
        ›
      </button>
    </div>
  );
}

Object.assign(window, { Pager });
