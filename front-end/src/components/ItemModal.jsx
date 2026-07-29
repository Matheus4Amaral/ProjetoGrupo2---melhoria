import { useEffect, useState } from "react";
import "./ItemModal.css";
import RegisterSupplier from "./RegisterSupplier";
import { useAlert } from "../contexts/AlertContext";
import { IMaskInput } from "react-imask";

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
    fornecedor: "",
    descricao: "",
    peso: "",
    volume: "",
    lote: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [fornecedores, setFornecedores] = useState([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [openSupplierModal, setOpenSupplierModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const showAlert = useAlert();

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const converterMoeda = (valor) => {
    if (!valor) return 0;

    return Number(
      valor
        .replace("R$", "")
        .trim()
        .replace(/\./g, "")
        .replace(",", ".")
    );
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setFornecedores([]);
      setFornecedorSelecionado(null);
      setMostrarSugestoes(false);
      setSaving(false);
      setOpenSupplierModal(false);
      return;
    }

    if ((isEditMode || isViewMode) && itemSelecionado) {
      const nomeFornecedor =
        itemSelecionado.nome_fornecedor ||
        itemSelecionado.fornecedor_nome ||
        "";

      setFormData({
        nome_produto: itemSelecionado.nome_produto || "",
        categoria: itemSelecionado.categoria || "",
        quantidade_inicial: itemSelecionado.quantidade_estoque_total ?? "",
        preco_compra: itemSelecionado.preco_compra ?? "",
        preco_venda: itemSelecionado.preco_venda ?? "",
        fornecedor: nomeFornecedor,
        descricao: itemSelecionado.descricao || "",
        peso: itemSelecionado.peso ?? "",
        volume: itemSelecionado.volume ?? "",
        lote: itemSelecionado.lote ?? ""
      });

      if (itemSelecionado.id_fornecedor || nomeFornecedor) {
        setFornecedorSelecionado({
          id_fornecedor: itemSelecionado.id_fornecedor ?? null,
          nome_fornecedor: nomeFornecedor
        });
      } else {
        setFornecedorSelecionado(null);
      }
    } else {
      setFormData(initialFormData);
      setFornecedorSelecionado(null);
    }
  }, [isOpen, mode, itemSelecionado]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchFornecedores = async (search = "") => {
    const token = localStorage.getItem("token");
    if (!token) return [];
    
    try {
      const url = search
        ? `http://localhost:3001/api/supplier?search=${encodeURIComponent(search)}`
        : `http://localhost:3001/api/supplier`;
        
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();
      if (!response.ok) return [];
      
      return Array.isArray(data) ? data : data.fornecedores || [];
    } catch (error) {
      console.error("Erro ao buscar fornecedores:", error);
      return [];
    }
  };

  const buscarFornecedores = async () => {
    if (isViewMode) return;
    const data = await fetchFornecedores();
    setFornecedores(data);
    setMostrarSugestoes(true);
  };

  const handleFornecedorFocus = async () => {
    if (isViewMode) return;

    if (fornecedores.length > 0) {
      setMostrarSugestoes(true);
      return;
    }

    const data = await fetchFornecedores();
    setFornecedores(data.slice(0, 5));
    setMostrarSugestoes(true);
  };

  const handleFornecedorChange = async (e) => {
    const valor = e.target.value;

    setFormData({
      ...formData,
      fornecedor: valor
    });

    if (!valor.trim()) {
      setMostrarSugestoes(true);
      const data = await fetchFornecedores();
      setFornecedores(data.slice(0, 5));
      return;
    }

    const data = await fetchFornecedores(valor);
    setFornecedores(data);
    setMostrarSugestoes(data.length > 0);
  };

  const handleSelecionarFornecedor = (fornecedor) => {
    setFornecedorSelecionado(fornecedor);

    setFormData((prev) => ({
      ...prev,
      fornecedor: fornecedor.nome_fornecedor
    }));

    setMostrarSugestoes(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isViewMode) return;

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("Usuário não autenticado.");
      return;
    }

    if (!formData.nome_produto.trim()) {
      showAlert("Informe o nome do produto.");
      return;
    }

    if (!formData.categoria.trim()) {
      showAlert("Informe a categoria.");
      return;
    }

    if (!estoqueAtual?.id_estoque && isCreateMode) {
      showAlert("Nenhum estoque encontrado.");
      return;
    }

    const payload = {
      nome_produto: formData.nome_produto.trim(),
      categoria: formData.categoria.trim(),
      quantidade_inicial:
        formData.quantidade_inicial === "" ? 0 : Number(formData.quantidade_inicial),
      preco_compra: converterMoeda(formData.preco_compra),
      preco_venda: converterMoeda(formData.preco_venda),
      descricao: formData.descricao.trim() || null,
      peso: formData.peso === "" ? null : Number(formData.peso),
      volume: formData.volume === "" ? null : Number(formData.volume),
      lote: formData.lote === "" ? null : Number(formData.lote),
      id_fornecedor: fornecedorSelecionado ? fornecedorSelecionado.id_fornecedor : null
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
        showAlert(
          data.message ||
          (isEditMode ? "Erro ao atualizar produto." : "Erro ao cadastrar produto.")
        );
        return;
      }

      showAlert(isEditMode ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      showAlert(`Erro ao salvar item: ${error.message}`);
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
                  placeholder="Ex.: Martelo"
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
                  placeholder="Ex.: 10"
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
                  placeholder="Ex.: 123"
                />
              </div>

              <div className="form-group">
                <label>Peso (Kg)</label>
                <input
                  type="number"
                  step="0.01"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  disabled={isViewMode}
                  placeholder="Ex.: 1.5"
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
                  placeholder="Ex.: 1.5 (m³)"
                />
              </div>

              <div className="form-group">
                <label>Preço de Compra (R$)</label>

                <IMaskInput
                  mask="R$ num"
                  blocks={{
                    num: {
                      mask: Number,
                      scale: 2,
                      thousandsSeparator: ".",
                      radix: ",",
                      mapToRadix: ["."],
                      normalizeZeros: true,
                      padFractionalZeros: true,
                    },
                  }}
                  value={formData.preco_compra}
                  placeholder="R$ 0,00"
                  disabled={isViewMode}
                  onAccept={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preco_compra: value,
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Preço de Venda (R$)</label>

                <IMaskInput
                  mask="R$ num"
                  blocks={{
                    num: {
                      mask: Number,
                      scale: 2,
                      thousandsSeparator: ".",
                      radix: ",",
                      mapToRadix: ["."],
                      normalizeZeros: true,
                      padFractionalZeros: true,
                    },
                  }}
                  value={formData.preco_venda}
                  placeholder="R$ 0,00"
                  disabled={isViewMode}
                  onAccept={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      preco_venda: value,
                    }))
                  }
                />
              </div>

              <div className="form-group fornecedor-group full-width">
                <label>Fornecedor</label>
                <div className="fornecedor-autocomplete">
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleFornecedorChange}
                    onFocus={handleFornecedorFocus}
                    onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
                    placeholder="Digite o nome do fornecedor"
                    autoComplete="off"
                    disabled={isViewMode}
                  />

                  {!isViewMode && mostrarSugestoes && fornecedores.length > 0 && (
                    <div className="fornecedor-dropdown">
                      {fornecedores.map((fornecedor) => (
                        <button
                          type="button"
                          key={fornecedor.id_fornecedor}
                          className="fornecedor-option"
                          onClick={() => handleSelecionarFornecedor(fornecedor)}
                        >
                          {fornecedor.nome_fornecedor}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {!isViewMode && (
                  <button
                    type="button"
                    className="btn-secondary cadastrar-fornecedor-btn"
                    onClick={() => setOpenSupplierModal(true)}
                  >
                    + Cadastrar Fornecedor
                  </button>
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
                  placeholder="Ex.: Martelo com cabo de madeira, perfeito para uso em obras..."
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

            setFornecedorSelecionado(novoFornecedor);

            setFormData((prev) => ({
              ...prev,
              fornecedor: novoFornecedor.nome_fornecedor
            }));

            setFornecedores((prev) => {
              const jaExiste = prev.some(
                (f) => f.id_fornecedor === novoFornecedor.id_fornecedor
              );

              if (jaExiste) return prev;
              return [novoFornecedor, ...prev];
            });

            setMostrarSugestoes(true);
            setOpenSupplierModal(false);
          }}
        />
      )}
    </>
  );
}