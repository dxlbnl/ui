// SegmentedControl — row of joined buttons, one active.
// options = strings or { value, label }. size = "sm" | "md".

function SegmentedControl({ value, options, onChange, size = "md" }) {
  const pad = size === "sm" ? "5px 10px" : "7px 13px";
  const fs = size === "sm" ? 10 : 11;
  return (
    <div style={{ display: "inline-flex", border: "1px solid var(--rule-strong)", background: "var(--bg-sunken)" }}>
      {options.map((o, i) => {
        const v = typeof o === "string" ? o : o.value;
        const lbl = typeof o === "string" ? o : o.label;
        const active = v === value;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              fontFamily: "var(--mono)",
              fontSize: fs,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: pad,
              cursor: "pointer",
              background: active ? "var(--amber)" : "transparent",
              color: active ? "var(--bg)" : "var(--ink-faint)",
              borderLeft: i ? "1px solid var(--rule-strong)" : "none",
              transition: "background .15s,color .15s",
              whiteSpace: "nowrap",
            }}
          >
            {lbl}
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { SegmentedControl });
