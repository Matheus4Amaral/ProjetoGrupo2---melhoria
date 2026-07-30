import { createContext, useCallback, useContext, useRef, useState } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++idRef.current;

      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    warning: (message, duration) => showToast(message, "warning", duration),
    info: (message, duration) => showToast(message, "info", duration)
  };

  return (
    <ToastContext.Provider value={{ showToast, toast, removeToast }}>
      {children}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast precisa ser usado dentro de um ToastProvider");
  }
  return context;
}