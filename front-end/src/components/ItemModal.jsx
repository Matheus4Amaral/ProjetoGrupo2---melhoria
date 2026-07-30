import { useEffect, useState, useRef } from "react";
import "./ItemModal.css";
import RegisterSupplier from "./RegisterSupplier";

export default function ItemModal({
  isOpen,
  onClose,
  estoqueAtual,
  onSuccess,
  mode = "create",
  itemSelecionado = null
}) {
  const initialFormData = {
    nome_produto: "",
    categoria: "",
    quantidade_inicial: "",
    preco_compra: "",
    preco_venda: "",
    id_fornecedor: "",
    descricao: "",
    peso: "",
    volume: "",
    lote: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [fornecedores, setFornecedores] = useState([]);
  const [loadingFornecedores, setLoadingFornecedores] = useState(false);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Carrega os fornecedores apenas quando o modal abre
  useEffect(() => {
    let isMounted = true;

    if (!isOpen) {
      setFormData(initialFormData);
      setFornecedores([]);
      setSaving(false);
      setOpenSupplierModal(false);
      return;
    }

    async function carregarModal() {
      const token = localStorage.getItem("token");
      let listaFornecedores = [];

      if (token) {
        try {
          setLoadingFornecedores(true);
          const response = await fetch("http://localhost:3001/api/supplier", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });

          const data = await response.json();

          if (response.ok) {
            listaFornecedores = Array.isArray(data) ? data : data.fornecedores || [];
            if (isMounted) setFornecedores(listaFornecedores);
          }
        } catch (error) {
          console.error("Erro ao carregar lista de fornecedores:", error);
        } finally {
          if (isMounted) setLoadingFornecedores(false);
        }
      }

      // Preenche dados para edição ou visualização
      if ((isEditMode || isViewMode) && itemSelecionado) {
        if (isMounted) {
          setFormData({
            nome_produto: itemSelecionado.nome_produto || "",
            categoria: itemSelecionado.categoria || "",
            quantidade_inicial: itemSelecionado.quantidade_estoque_total ?? "",
            preco_compra: itemSelecionado.preco_compra ?? "",
            preco_venda: itemSelecionado.preco_venda ?? "",
            id_fornecedor: itemSelecionado.id_fornecedor ? String(itemSelecionado.id_fornecedor) : "",
            descricao: itemSelecionado.descricao || "",
            peso: itemSelecionado.peso ?? "",
            volume: itemSelecionado.volume ?? "",
            lote: itemSelecionado.lote ?? ""
          });
        }
      } else if (isMounted) {
        setFormData(initialFormData);
      }
    }

    carregarModal();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Usuário não autenticado.");
      return;
    }

    if (!formData.nome_produto.trim()) {
      alert("Informe o nome do produto.");
      return;
    }

    if (!formData.categoria.trim()) {
      alert("Informe a categoria.");
      return;
    }

    if (!estoqueAtual?.id_estoque && isCreateMode) {
      alert("Nenhum estoque encontrado.");
      return;
    }

    const payload = {
      nome_produto: formData.nome_produto.trim(),
      categoria: formData.categoria.trim(),
      quantidade_inicial:
        formData.quantidade_inicial === "" ? 0 : Number(formData.quantidade_inicial),
      preco_compra: formData.preco_compra === "" ? 0 : Number(formData.preco_compra),
      preco_venda: formData.preco_venda === "" ? 0 : Number(formData.preco_venda),
      descricao: formData.descricao.trim() || null,
      peso: formData.peso === "" ? null : Number(formData.peso),
      volume: formData.volume === "" ? null : Number(formData.volume),
      lote: formData.lote === "" ? null : Number(formData.lote),
      id_fornecedor: formData.id_fornecedor ? Number(formData.id_fornecedor) : null
    };

    if (isCreateMode) {
      payload.id_estoque = estoqueAtual.id_estoque;
    }

    try {
      setSaving(true);

      const url = isEditMode
        ? `http://localhost:3001/api/products/${itemSelecionado.id_produto}`
        : "http://localhost:3001/api/products";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            (isEditMode ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.")
        );
        return;
      }

      alert(isEditMode ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      alert(`Erro ao salvar item: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="item-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="item-modal-header">
            <h2>
              {isCreateMode
                ? "Cadastrar Novo Item"
                : isEditMode
                ? "Editar Item"
                : "Visualizar Item"}
            </h2>

            <button className="close-btn" onClick={onClose} type="button">
              ✕
            </button>
          </div>

          <form className="item-modal-body" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Produto</label>
                <input
                  type="text"
                  name="nome_produto"
                  value={formData.nome_produto}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  disabled={isViewMode}
                >
                  <option value="">Selecione</option>
                  <option value="Ferramenta">Ferramenta</option>
                  <option value="Elétrica">Elétrica</option>
                  <option value="Acessório">Acessório</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade Inicial</label>
                <input
                  type="number"
                  name="quantidade_inicial"
                  value={formData.quantidade_inicial}
                  onChange={handleChange}
                  min="0"
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group">
                <label>Lote</label>
                <input
                  type="number"
                  name="lote"
                  value={formData.lote}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group">
                <label>Peso</label>
                <input
                  type="number"
                  step="0.01"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group">
                <label>Volume</label>
                <input
                  type="number"
                  step="0.01"
                  name="volume"
                  value={formData.volume}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group">
                <label>Preço de Compra</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco_compra"
                  value={formData.preco_compra}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>

              <div className="form-group">
                <label>Preço de Venda</label>
                <input
                  type="number"
                  step="0.01"
                  name="preco_venda"
                  value={formData.preco_venda}
                  onChange={handleChange}
                  disabled={isViewMode}
                />
              </div>

              {/* SELECT PADRÃO NATIVO ESTILIZADO DE FORNECEDORES */}
              <div className="form-group full-width">
                <label>Fornecedor</label>
                <select
                  name="id_fornecedor"
                  value={formData.id_fornecedor}
                  onChange={handleChange}
                  disabled={isViewMode || loadingFornecedores}
                >
                  <option value="">
                    {loadingFornecedores ? "Carregando fornecedores..." : "Selecione um fornecedor"}
                  </option>
                  {fornecedores.map((f) => {
                    const nome = f.nome_fornecedor || f.nome_empresa || f.nome;
                    const doc = f.documento ? ` (Doc: ${f.documento})` : "";
                    return (
                      <option key={f.id_fornecedor} value={f.id_fornecedor}>
                        {nome}{doc}
                      </option>
                    );
                  })}
                </select>

                {/* BOTÃO + CADASTRAR FORNECEDOR LOGO ABAIXO */}
                {!isViewMode && (
                  <div className="supplier-btn-wrapper">
                    <button
                      type="button"
                      className="btn-add-supplier"
                      onClick={() => setOpenSupplierModal(true)}
                    >
                      + Cadastrar Fornecedor
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group full-width">
                <label>Descrição ou Especificações</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows="4"
                  disabled={isViewMode}
                />
              </div>
            </div>

            <div className="item-modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancelar"
                disabled={saving}
              >
                {isViewMode ? "Fechar" : "Cancelar"}
              </button>

              {!isViewMode && (
                <button
                  type="submit"
                  className="btn-confirmar"
                  disabled={saving}
                >
                  {saving
                    ? isEditMode
                      ? "Atualizando..."
                      : "Salvando..."
                    : isEditMode
                    ? "Atualizar Item"
                    : "Salvar Item"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {!isViewMode && (
        <RegisterSupplier
          isOpen={openSupplierModal}
          onClose={() => setOpenSupplierModal(false)}
          onSave={(novoFornecedor) => {
            if (!novoFornecedor) return;

            setFornecedores((prev) => [...prev, novoFornecedor]);
            setFormData((prev) => ({
              ...prev,
              id_fornecedor: String(novoFornecedor.id_fornecedor)
            }));

            setOpenSupplierModal(false);
          }}
        />
      )}
    </>
  );
}