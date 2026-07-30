import "./LogoutModal.css";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="logout-modal-overlay" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logout-modal-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4M10 17l5-5-5-5M15 12H3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h2 className="logout-modal-titulo">Sair da conta</h2>
        <p className="logout-modal-texto">
          Tem certeza que deseja encerrar sua sessão no StockControl?
        </p>

        <div className="logout-modal-acoes">
          <button
            className="logout-modal-btn logout-modal-btn--cancelar"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="logout-modal-btn logout-modal-btn--confirmar"
            onClick={onConfirm}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
