// Inbox — bell + unread badge + notification list in a Popover.
// Depends on Led + Popover (loaded from window).
// items = [{ id, tone, title, body, time, unread }].

function Inbox({ items, onOpen, onMarkAll, glyph = "◔" }) {
  const [open, setOpen] = React.useState(false);
  const unread = items.filter((n) => n.unread).length;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 34,
          height: 34,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--rule-strong)",
          background: "var(--bg-rail)",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <span style={{ fontFamily: "var(--mono)", fontSize: 15, color: unread ? "var(--amber)" : "var(--ink-dim)" }}>{glyph}</span>
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              minWidth: 15,
              height: 15,
              padding: "0 3px",
              borderRadius: 8,
              background: "var(--amber)",
              color: "var(--bg)",
              fontFamily: "var(--mono)",
              fontSize: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <Popover onClose={() => setOpen(false)} align="right" width={320}>
          <div
            style={{
              padding: "11px 14px",
              borderBottom: "1px solid var(--rule)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-faint)" }}>
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={onMarkAll}
                style={{ fontFamily: "var(--mono)", fontSize: 10, textTransform: "uppercase", color: "var(--ink-faint)", cursor: "pointer" }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => onOpen(n)}
                style={{
                  display: "flex",
                  gap: 11,
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderBottom: "1px solid var(--rule)",
                  cursor: "pointer",
                  background: n.unread ? "var(--bg-rail)" : "transparent",
                }}
              >
                <Led tone={n.tone} blink={n.unread && n.tone !== "ok"} size={7} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: n.unread ? 500 : 400 }}>{n.title}</span>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--ink-faint)" }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.45, marginTop: 3 }}>{n.body}</div>
                </div>
              </button>
            ))}
          </div>
        </Popover>
      )}
    </div>
  );
}

Object.assign(window, { Inbox });
