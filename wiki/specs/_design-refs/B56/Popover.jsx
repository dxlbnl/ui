// Popover — anchored layer; outside-click + Esc to close.
// Sits relative to a position:relative parent. align = "left" | "right".

function Popover({ children, onClose, align = "right", top = "100%", width = 280 }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const k = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", h);
    window.addEventListener("keydown", k);
    return () => {
      document.removeEventListener("mousedown", h);
      window.removeEventListener("keydown", k);
    };
  }, [onClose]);
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top,
        [align]: 0,
        marginTop: 6,
        width,
        background: "var(--bg)",
        border: "1px solid var(--rule-strong)",
        zIndex: 150,
        boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
      }}
    >
      {children}
    </div>
  );
}

Object.assign(window, { Popover });
