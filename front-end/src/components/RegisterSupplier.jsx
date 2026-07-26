import { useEffect, useState } from "react";
import "./RegisterSupplier.css";

export default function RegisterSupplier({ isOpen, onClose, onSave }) {
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

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setSaving(false);
    }
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

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Usuário não autenticado.");
      return;
    }

    if (!formData.nome_fornecedor.trim()) {
      alert("Informe o nome do fornecedor.");
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

      const response = await fetch("http://localhost:3001/api/supplier", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao cadastrar fornecedor.");
        return;
      }

      alert("Fornecedor cadastrado com sucesso.");

      if (onSave) {
        onSave(data.fornecedor || data.data || data);
      }

      onClose();
    } catch (error) {
      alert(`Erro ao cadastrar fornecedor: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="supplier-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="supplier-modal-header">
          <h2>Cadastrar Fornecedor</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="supplier-modal-body" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nome do Fornecedor</label>
              <input
                type="text"
                name="nome_fornecedor"
                value={formData.nome_fornecedor}
                onChange={handleChange}
              />
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
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Rua</label>
              <input
                type="text"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>País</label>
              <input
                type="text"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
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
              {saving ? "Salvando..." : "Salvar Fornecedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}