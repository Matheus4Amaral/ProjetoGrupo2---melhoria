import { useEffect, useMemo, useState } from "react";
import "./SupplierPickerModal.css";

export default function SupplierPickerModal({ isOpen, onClose, onSelect }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setBusca("");
      return;
    }

    const fetchFornecedores = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        setLoading(true);

        const response = await fetch("http://localhost:3001/api/supplier", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();
        if (!response.ok) return;

        setFornecedores(Array.isArray(data) ? data : data.fornecedores || []);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFornecedores();
  }, [isOpen]);

  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return fornecedores;

    return fornecedores.filter((f) =>
      (f.nome_fornecedor || "").toLowerCase().includes(termo) ||
      (f.documento || "").toLowerCase().includes(termo) ||
      (f.email || "").toLowerCase().includes(termo)
    );
  }, [fornecedores, busca]);

  const getTipoBadge = (tipo) => {
    if (tipo === "PF") return { label: "Pessoa Física", className: "tipo-pf" };
    if (tipo === "PJ") return { label: "Pessoa Jurídica", className: "tipo-pj" };
    return { label: "Não definido", className: "tipo-nd" };
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay supplier-picker-overlay" onClick={onClose}>
      <div
        className="supplier-picker-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="supplier-picker-header">
          <h2>Selecionar Fornecedor</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="supplier-picker-body">
          <div className="supplier-picker-busca">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20px"
              viewBox="0 -960 960 960"
              width="20px"
              fill="#9ca3af"
            >
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
            </svg>
            <input
              type="text"
              autoFocus
              placeholder="Buscar por nome, documento ou e-mail..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>

          <div className="supplier-picker-lista">
            {loading ? (
              <div className="supplier-picker-empty">Carregando fornecedores...</div>
            ) : fornecedoresFiltrados.length === 0 ? (
              <div className="supplier-picker-empty">
                {busca
                  ? "Nenhum fornecedor encontrado para essa busca."
                  : "Nenhum fornecedor cadastrado ainda."}
              </div>
            ) : (
              fornecedoresFiltrados.map((fornecedor) => {
                const tipo = getTipoBadge(fornecedor.tipo_pessoa);
                return (
                  <button
                    type="button"
                    key={fornecedor.id_fornecedor}
                    className="supplier-picker-item"
                    onClick={() => onSelect(fornecedor)}
                  >
                    <div className="supplier-picker-item-info">
                      <span className="supplier-picker-item-nome">
                        {fornecedor.nome_fornecedor}
                        <span className={`tipo-badge ${tipo.className}`}>
                          {tipo.label}
                        </span>
                      </span>
                      <span className="supplier-picker-item-detalhe">
                        {fornecedor.email || fornecedor.documento || "—"}
                      </span>
                    </div>
                    <span className="supplier-picker-item-selecionar">
                      Selecionar
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
