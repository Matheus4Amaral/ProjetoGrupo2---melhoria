import { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  const showToast = useCallback((toastType, toastMessage) => {
    setType(toastType);
    setMessage(toastMessage);

    // opcional: esconder automaticamente depois de alguns segundos
    setTimeout(() => {
      setMessage("");
    }, 4000);
  }, []);

  const hideToast = () => setMessage("");

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast type={type} message={message} onClose={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}