// StatusPill — status dot + label that opens a detail Popover.
// Depends on Led + Popover (loaded from window). Caller supplies tone, label,
// optional detail, and the popover children.

function StatusPill({ tone = "ok", label, detail, blink = false, children, align = "right", popoverWidth = 300 }) {
  const [open, setOpen] = React.useState(false);
  const accent = tone === "ok" ? "var(--rule-strong)" : `var(--${tone})`;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 11px",
          border: `1px solid ${accent}`,
          background: "var(--bg-rail)",
          cursor: "pointer",
        }}
      >
        <Led tone={tone} blink={blink} size={7} />
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: tone === "ok" ? "var(--ink-dim)" : `var(--${tone})`,
            whiteSpace: "nowrap",
          }}
        >
          {label}
          {detail && <span style={{ color: "var(--ink-faint)" }}> · {detail}</span>}
        </span>
      </button>
      {open && children && (
        <Popover onClose={() => setOpen(false)} align={align} width={popoverWidth}>
          {children}
        </Popover>
      )}
    </div>
  );
}

Object.assign(window, { StatusPill });
