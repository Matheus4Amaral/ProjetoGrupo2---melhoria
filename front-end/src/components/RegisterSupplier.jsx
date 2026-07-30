import { useEffect, useState } from "react";
import "./RegisterSupplier.css";
import { useAlert } from "../contexts/AlertContext";
import { IMaskInput } from "react-imask";

export default function RegisterSupplier({ isOpen, onClose, onSave, fornecedorParaEditar = null }) {
  const isEditMode = !!fornecedorParaEditar;
  const initialFormData = {
    nome_fornecedor: "",
    rua: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "",
    cep: "",
    email: "",
    telefone: "",
    documento: "",
    tipo_pessoa: ""
  };

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({ nome_fornecedor: "", documento: "", email: "" });
  const showAlert = useAlert();

  useEffect(() => {
    if (isOpen && isEditMode) {
      // Pré-preenche os campos com os dados do fornecedor a editar
      setFormData({
        nome_fornecedor: fornecedorParaEditar.nome_fornecedor || "",
        rua: fornecedorParaEditar.rua || "",
        bairro: fornecedorParaEditar.bairro || "",
        cidade: fornecedorParaEditar.cidade || "",
        estado: fornecedorParaEditar.estado || "",
        pais: fornecedorParaEditar.pais || "",
        cep: fornecedorParaEditar.cep ? String(fornecedorParaEditar.cep) : "",
        email: fornecedorParaEditar.email || "",
        telefone: fornecedorParaEditar.telefone || "",
        documento: fornecedorParaEditar.documento || "",
        tipo_pessoa: fornecedorParaEditar.tipo_pessoa || "",
      });
      setErrors({ nome_fornecedor: "", documento: "", email: "" });
    } else if (!isOpen) {
      setFormData(initialFormData);
      setSaving(false);
      setErrors({ nome_fornecedor: "", documento: "", email: "" });
    }
  }, [isOpen, fornecedorParaEditar]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      showAlert("Usuário não autenticado.");
      return;
    }

    const novosErros = { nome_fornecedor: "", documento: "", email: "" };

    if (!formData.nome_fornecedor.trim()) {
      novosErros.nome_fornecedor = "Informe o nome do fornecedor.";
    }

    if (!formData.documento.trim()) {
      novosErros.documento = "Informe o documento do fornecedor.";
    }

    if (!formData.email.trim()) {
      novosErros.email = "Informe o e-mail do fornecedor.";
    }

    setErrors(novosErros);

    if (novosErros.nome_fornecedor || novosErros.documento || novosErros.email) {
      return;
    }

    const payload = {
      nome_fornecedor: formData.nome_fornecedor.trim(),
      rua: formData.rua.trim() || null,
      bairro: formData.bairro.trim() || null,
      cidade: formData.cidade.trim() || null,
      estado: formData.estado.trim() || null,
      pais: formData.pais.trim() || null,
      cep: formData.cep.trim() || null,
      email: formData.email.trim() || null,
      telefone: formData.telefone.trim() || null,
      documento: formData.documento.trim() || null,
      tipo_pessoa: formData.tipo_pessoa.trim() || null
    };

    try {
      setSaving(true);

      const url = isEditMode
        ? `http://localhost:3001/api/supplier/${fornecedorParaEditar.id_fornecedor}`
        : "http://localhost:3001/api/supplier";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(
          data.message ||
            (isEditMode
              ? "Erro ao atualizar fornecedor."
              : "Erro ao cadastrar fornecedor.")
        );
        return;
      }

      showAlert(
        isEditMode
          ? "Fornecedor atualizado com sucesso."
          : "Fornecedor cadastrado com sucesso."
      );

      if (onSave) {
        onSave(data.fornecedor || data.data || data);
      }

      onClose();
    } catch (error) {
      showAlert(
        `Erro ao ${
          isEditMode ? "atualizar" : "cadastrar"
        } fornecedor: ${error.message}`
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="supplier-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="supplier-modal-header">
          <h2>{isEditMode ? "Editar Fornecedor" : "Cadastrar Fornecedor"}</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="supplier-modal-body" onSubmit={handleSubmit}>
          <div className="supplier-form-grid">
          <div className="form-group full-width">
            <label>Nome do Fornecedor</label>
            <input
              type="text"
              name="nome_fornecedor"
              value={formData.nome_fornecedor}
              onChange={handleChange}
              placeholder="Ex.: Mercado Silva"
              className={errors.nome_fornecedor ? "input-error" : ""}
            />
            {errors.nome_fornecedor && (
              <span className="error-message">{errors.nome_fornecedor}</span>
            )}
          </div>

          <div className="form-group">
            <label>Tipo de Pessoa</label>
            <select
              name="tipo_pessoa"
              value={formData.tipo_pessoa}
              onChange={handleChange}
            >
              <option value="">Selecione</option>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>

          <div className="form-group">
            <label>Documento</label>

            <IMaskInput
              mask={
                formData.tipo_pessoa === "PF"
                  ? "000.000.000-00"
                  : "00.000.000/0000-00"
              }
              name="documento"
              value={formData.documento}
              placeholder={
                formData.tipo_pessoa === "PF"
                  ? "123.456.789-00"
                  : "12.345.678/0001-90"
              }
              className={errors.documento ? "input-error" : ""}
              onAccept={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  documento: value,
                }));
                setErrors((prev) => ({ ...prev, documento: "" }));
              }}
            />
            {errors.documento && (
              <span className="error-message">{errors.documento}</span>
            )}
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex:contato@empresa.com"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <IMaskInput
              mask="(00) 00000-0000"
              name="telefone"
              value={formData.telefone}
              placeholder="(32) 99999-9999"
              onAccept={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  telefone: value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>CEP</label>
            <IMaskInput
              mask="00000-000"
              name="cep"
              value={formData.cep}
              placeholder="36770-000"
              onAccept={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  cep: value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>Rua</label>
            <input
              type="text"
              name="rua"
              value={formData.rua}
              onChange={handleChange}
              placeholder="Ex.: Rua das Flores"
            />
          </div>

          <div className="form-group">
            <label>Bairro</label>
            <input
              type="text"
              name="bairro"
              value={formData.bairro}
              onChange={handleChange}
              placeholder="Ex.: Centro"
            />
          </div>

          <div className="form-group">
            <label>Cidade</label>
            <input
              type="text"
              name="cidade"
              value={formData.cidade}
              onChange={handleChange}
              placeholder="Ex.: Cataguases"
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <input
              type="text"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              placeholder="Ex.: MG"
            />
          </div>

          <div className="form-group">
            <label>País</label>
            <input
              type="text"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              placeholder="Ex.: Brasil"
            />
          </div>
          </div>

      <div className="supplier-modal-footer">
        <button
          type="button"
          className="btn-cancelar"
          onClick={onClose}
          disabled={saving}
        >
          Cancelar
        </button>

        <button type="submit" className="btn-confirmar" disabled={saving}>
          {saving
            ? "Salvando..."
            : isEditMode
            ? "Atualizar Fornecedor"
            : "Salvar Fornecedor"}
        </button>
      </div>
    </form>
      </div >
    </div >     
  );
}