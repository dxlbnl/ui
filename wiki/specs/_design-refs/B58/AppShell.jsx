// AppShell — responsive frame: sidebar rail on desktop → bottom tab bar on mobile.
// Depends on useMediaQuery + Led (loaded from window).
// Slots: brand, topLeft, topRight, children, footer. nav = [{ id, label, badge? }].

function NavItem({ item, active, onClick, mode, badge }) {
  if (mode === "rail")
    return (
      <button
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          textAlign: "left",
          fontFamily: "var(--mono)",
          fontSize: 12,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding: "11px 18px",
          cursor: "pointer",
          borderLeft: `2px solid ${active ? "var(--amber)" : "transparent"}`,
          color: active ? "var(--amber)" : "var(--ink-dim)",
        }}
      >
        {item.label}
        {badge ? (
          <span
            style={{
              marginLeft: "auto",
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 8,
              background: "var(--amber)",
              color: "var(--bg)",
              fontFamily: "var(--mono)",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {badge}
          </span>
        ) : null}
      </button>
    );
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "9px 0 7px", cursor: "pointer", position: "relative" }}
    >
      <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 22, height: 2, background: active ? "var(--amber)" : "transparent" }} />
      <Led tone={active ? "amber" : "off"} size={6} />
      <span style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: active ? "var(--amber)" : "var(--ink-faint)" }}>
        {item.label}
      </span>
      {badge ? (
        <span style={{ position: "absolute", top: 5, right: "calc(50% - 22px)", width: 7, height: 7, borderRadius: "50%", background: "var(--amber)", boxShadow: "0 0 5px var(--amber)" }} />
      ) : null}
    </button>
  );
}

function AppShell({ brand, nav, current, onNavigate, topLeft, topRight, footer, children }) {
  const desktop = useMediaQuery("(min-width: 760px)");
  const topBar = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: desktop ? "12px 28px" : "10px 14px",
        borderBottom: "1px solid var(--rule)",
        background: "var(--bg)",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ minWidth: 0 }}>{topLeft}</div>
      <div style={{ display: "flex", alignItems: "center", gap: desktop ? 9 : 7 }}>{topRight}</div>
    </div>
  );
  if (desktop)
    return (
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <aside style={{ width: 212, borderRight: "1px solid var(--rule)", background: "var(--bg-rail)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "18px 18px 16px", borderBottom: "1px solid var(--rule)" }}>{brand}</div>
          <nav style={{ flex: 1, paddingTop: 8 }}>
            {nav.map((it) => (
              <NavItem key={it.id} item={it} mode="rail" active={current === it.id} onClick={() => onNavigate(it.id)} badge={it.badge} />
            ))}
          </nav>
          {footer && <div style={{ padding: "14px 18px", borderTop: "1px solid var(--rule)" }}>{footer}</div>}
        </aside>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {topBar}
          <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)" }}>{children}</main>
        </div>
      </div>
    );
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {topBar}
      <main style={{ flex: 1, overflowY: "auto", background: "var(--bg)", paddingBottom: 8 }}>{children}</main>
      <nav style={{ display: "flex", borderTop: "1px solid var(--rule)", background: "var(--bg-rail)", flexShrink: 0 }}>
        {nav.map((it) => (
          <NavItem key={it.id} item={it} mode="tab" active={current === it.id} onClick={() => onNavigate(it.id)} badge={it.badge} />
        ))}
      </nav>
    </div>
  );
}

Object.assign(window, { AppShell, NavItem });
