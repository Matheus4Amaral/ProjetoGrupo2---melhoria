import { LuTrash2 } from "react-icons/lu";
import "./DeleteConfirmModal.css";

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="delete-modal-overlay"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="delete-modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="delete-modal-icon">
          <LuTrash2 aria-hidden="true" />
        </div>

        <h2 id="delete-modal-title">Excluir venda?</h2>

        <p id="delete-modal-description">
          Esta venda será removida permanentemente e não poderá ser recuperada.
        </p>

        <div className="delete-modal-buttons">
          <button
            type="button"
            className="delete-btn-cancelar"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="delete-btn-confirmar"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
}
