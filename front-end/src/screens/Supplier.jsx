import { useState, useEffect } from "react";
import "./Supplier.css";

import AppShell from "../components/AppShell";
import CardResumo from "../components/CardResumo";
import TabelaFornecedores from "../components/TabelaFornecedores";
import RegisterSupplier from "../components/RegisterSupplier";
import { useAlert } from "../contexts/AlertContext";

export default function Supplier() {
  const showAlert = useAlert();

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle do modal de cadastro
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Fornecedor selecionado para edição (null = criação)
  const [fornecedorParaEditar, setFornecedorParaEditar] = useState(null);

  /* ── buscar fornecedores ── */
  async function fetchFornecedores() {
    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("Usuário não autenticado.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3001/api/supplier", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.message || "Erro ao carregar fornecedores.");
        return;
      }

      // O backend retorna { fornecedores: [...] } quando não há search
      const lista = Array.isArray(data)
        ? data
        : Array.isArray(data.fornecedores)
        ? data.fornecedores
        : [];

      setFornecedores(lista);
    } catch (error) {
      showAlert(`Erro ao carregar fornecedores: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(fetchFornecedores);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── cards de resumo ── */
  const totalFornecedores = fornecedores.length;
  const totalPF = fornecedores.filter((f) => f.tipo_pessoa === "PF").length;
  const totalPJ = fornecedores.filter((f) => f.tipo_pessoa === "PJ").length;

  /* ── abrir modal de edição ── */
  function handleEditFornecedor(fornecedor) {
    setFornecedorParaEditar(fornecedor);
    setIsRegisterOpen(true);
  }

  /* ── abrir modal de cadastro ── */
  function handleNovoFornecedor() {
    setFornecedorParaEditar(null);
    setIsRegisterOpen(true);
  }

  /* ── fechar modal ── */
  function handleCloseModal() {
    setIsRegisterOpen(false);
    setFornecedorParaEditar(null);
  }

  /* ── após salvar ── */
  async function handleSave() {
    await fetchFornecedores();
    handleCloseModal();
  }

  return (
    <>
      <AppShell
            title="Fornecedores"
            buttonText="Novo Fornecedor"
            onButtonClick={handleNovoFornecedor}
            contentClassName="supplier-page-main"
          >
            {/* Cards de resumo */}
            <div className="supplier-page-cards">
              <CardResumo
                title="Total de Fornecedores"
                value={loading ? "..." : totalFornecedores}
              />
              <CardResumo
                title="Pessoa Física"
                value={loading ? "..." : totalPF}
              />
              <CardResumo
                title="Pessoa Jurídica"
                value={loading ? "..." : totalPJ}
              />
            </div>

            {/* Tabela */}
            <TabelaFornecedores
              fornecedores={fornecedores}
              loading={loading}
              onReload={fetchFornecedores}
              onEditFornecedor={handleEditFornecedor}
            />
      </AppShell>

      {/* Modal de cadastro / edição */}
      <RegisterSupplier
        isOpen={isRegisterOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        fornecedorParaEditar={fornecedorParaEditar}
      />
    </>
  );
}
