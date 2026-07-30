import { useEffect } from "react";
import "./LogoutModal.css";

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
    //Fecha com a tecla Esc, comportamento esperado em qualquer modal
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e) {
            if (e.key === "Escape") onClose();
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="logout-modal-overlay" onClick={onClose}>
            <div
                className="logout-modal-content"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-modal-titulo"
            >
                <div className="logout-modal-header">
                    <h2 id="logout-modal-titulo">Sair da conta</h2>
                    <button
                        className="logout-close-btn"
                        onClick={onClose}
                        type="button"
                        aria-label="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <div className="logout-modal-body">
                    <div className="logout-modal-icon">👋</div>
                    <p className="logout-modal-text">Deseja mesmo sair?</p>
                    <p className="logout-modal-subtext">
                        Você precisará entrar novamente para acessar o sistema.
                    </p>
                </div>

                <div className="logout-modal-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="logout-btn-cancelar"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="logout-btn-confirmar"
                        autoFocus
                    >
                        Sair
                    </button>
                </div>
            </div>
        </div>
    );
}
