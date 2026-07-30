import "./Toast.css";

const ICONS = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i"
};

export default function Toast({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-viewport" role="region" aria-label="Notificações">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
          <p className="toast-message">{toast.message}</p>
          <button
            type="button"
            className="toast-close"
            aria-label="Fechar notificação"
            onClick={() => onDismiss(toast.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}