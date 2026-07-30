import "./Toast.css";

export default function Toast({ type = "info", message, onClose }) {
  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
