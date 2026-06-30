import { useState, useEffect, useCallback, useRef } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return { toasts, addToast };
}

const ICONS = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const COLORS = {
  success: { bg: "var(--color-gain-bg)", border: "var(--color-gain-border)", text: "var(--color-gain)" },
  error: { bg: "var(--color-loss-bg)", border: "var(--color-loss-border)", text: "var(--color-loss)" },
  info: { bg: "var(--color-surface-container)", border: "var(--color-outline-variant)", text: "var(--color-on-surface)" },
};

export default function ToastContainer({ toasts }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }) {
  const [visible, setVisible] = useState(false);
  const colors = COLORS[toast.type] || COLORS.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        borderRadius: 10,
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        pointerEvents: "auto",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.3s, transform 0.3s",
        maxWidth: 360,
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: colors.text }}>
        {ICONS[toast.type] || "info"}
      </span>
      {toast.message}
    </div>
  );
}
