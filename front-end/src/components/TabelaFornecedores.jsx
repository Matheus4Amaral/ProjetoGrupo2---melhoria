import { useMemo, useState } from "react";
import "./DataTable.css";
import "./TabelaFornecedores.css";
import { useAlert } from "../contexts/AlertContext";

export default function TabelaFornecedores({
  fornecedores = [],
  loading = false,
  onReload = () => {},
  onEditFornecedor = () => {},
}) {
  const [busca, setBusca] = useState("");
  const [tipoPessoaFiltro, setTipoPessoaFiltro] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const showAlert = useAlert();

  /* ── filtros locais ── */
  const fornecedoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return fornecedores.filter((f) => {
      const correspondeBusca =
        termo === "" ||
        String(f.id_fornecedor).toLowerCase().includes(termo) ||
        (f.nome_fornecedor || "").toLowerCase().includes(termo) ||
        (f.documento || "").toLowerCase().includes(termo) ||
        (f.email || "").toLowerCase().includes(termo);

      const correspondeTipo =
        tipoPessoaFiltro === "" || f.tipo_pessoa === tipoPessoaFiltro;

      return correspondeBusca && correspondeTipo;
    });
  }, [fornecedores, busca, tipoPessoaFiltro]);

  /* ── badge de tipo de pessoa ── */
  const getTipoBadge = (tipo) => {
    if (tipo === "PF") return { label: "Pessoa Física", className: "tipo-pf" };
    if (tipo === "PJ") return { label: "Pessoa Jurídica", className: "tipo-pj" };
    return { label: "Não definido", className: "tipo-nd" };
  };

  /* ── excluir fornecedor ── */
  async function handleDelete(fornecedor) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o fornecedor "${fornecedor.nome_fornecedor}"?`
    );
    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {
      setDeletingId(fornecedor.id_fornecedor);

      const response = await fetch(
        `http://localhost:3001/api/supplier/${fornecedor.id_fornecedor}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.message || "Erro ao excluir fornecedor.");
        return;
      }

      showAlert("Fornecedor excluído com sucesso.");
      await onReload();
    } catch (error) {
      showAlert(`Erro ao excluir fornecedor: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="data-table-card tabela-fornecedores">
      <h3 className="tabela-titulo">Lista de Fornecedores</h3>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-busca">
          <svg
            className="filtro-icon"
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
            placeholder="Buscar por nome, documento, e-mail..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtro-select">
          <select
            value={tipoPessoaFiltro}
            onChange={(e) => setTipoPessoaFiltro(e.target.value)}
          >
            <option value="">Tipo de Pessoa</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">Carregando fornecedores...</div>
                </td>
              </tr>
            ) : fornecedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    {busca || tipoPessoaFiltro
                      ? "Nenhum fornecedor encontrado para os filtros aplicados."
                      : "Nenhum fornecedor cadastrado ainda."}
                  </div>
                </td>
              </tr>
            ) : (
              fornecedoresFiltrados.map((f) => {
                const tipo = getTipoBadge(f.tipo_pessoa);
                return (
                  <tr key={f.id_fornecedor}>
                    <td>#{f.id_fornecedor}</td>
                    <td title={f.nome_fornecedor}>{f.nome_fornecedor}</td>
                    <td>
                      <span className={`tipo-badge ${tipo.className}`}>
                        {tipo.label}
                      </span>
                    </td>
                    <td title={f.email || "—"}>{f.email || "—"}</td>
                    <td>{f.telefone || "—"}</td>
                    <td>
                      <div className="acoes-container">
                        {/* Editar */}
                        <button
                          className="btn-acao"
                          type="button"
                          title="Editar"
                          onClick={() => onEditFornecedor(f)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="18px"
                            viewBox="0 -960 960 960"
                            width="18px"
                            fill="#4B5563"
                          >
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                          </svg>
                        </button>

                        {/* Excluir */}
                        <button
                          className="btn-acao"
                          type="button"
                          title="Excluir"
                          disabled={deletingId === f.id_fornecedor}
                          onClick={() => handleDelete(f)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="18px"
                            viewBox="0 -960 960 960"
                            width="18px"
                            fill="#4B5563"
                          >
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
