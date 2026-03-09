import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import "./Toast.css";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, { duration = 2500 } = {}) => {
    const id = Date.now();
    setToast({ id, message });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), duration);
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  const value = useMemo(() => ({ showToast, hideToast }), [showToast, hideToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="tm-toast" role="status" aria-live="polite">
          <div className="tm-toast__icon">🔔</div>
          <div className="tm-toast__text">{toast.message}</div>
          <button className="tm-toast__close" onClick={hideToast} aria-label="Close">
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
