import "./ConfirmModal.css"

export default function ConfirmModal ({
    isOpen,
    onClose,
    onConfirm,
    loading,
    title = "Confirmar ação",
    message = "Tem certeza que deseja continuar?",
    subtext = "",
    confirmLabel = "Confirmar",
    confirmingLabel = "Confirmando...",
}) {
    if (!isOpen) return null;

    return (
        <>
            <div className="confirm-modal-overlay" onClick ={onClose}>
                <div className="confirm-modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-modal-header">
                        <h3>{title}</h3>
                        <button className="confirm-close-btn" onClick={onClose}>✕</button>
                    </div>

                    <div className="confirm-modal-body">
                        <p className="confirm-text">
                            {message}
                        </p>
                        {subtext && <p className="confirm-subtext">{subtext}</p>}
                    </div>
                    <div className="confirm-modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="confirm-btn-cancelar"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className="confirm-btn-confirmar"
                            disabled={loading}
                        >
                            {loading ? confirmingLabel : confirmLabel}
                        </button>
                            </div>
                </div>
            </div>
        </>
    )

}