import "./DeleteConfirmModal.css";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, loading }) {
    if (!isOpen) return null;

    return (
        <div className="delete-modal-overlay" onClick={onClose}>
            <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="delete-modal-header">
                    <h2>Confirmar Exclusão</h2>
                    <button className="delete-close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="delete-modal-body">
                    <div className="warning-icon">⚠️</div>
                    <p className="warning-text">
                        Deseja mesmo excluir esse pedido?
                    </p>
                    <p className="warning-subtext">
                        Se excluir, não haverá como recuperá-lo!
                    </p>
                </div>

                <div className="delete-modal-footer">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="delete-btn-cancelar"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={onConfirm} 
                        className="delete-btn-confirmar"
                        disabled={loading}
                    >
                        {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
                    </button>
                </div>
            </div>
        </div>
    );
}
