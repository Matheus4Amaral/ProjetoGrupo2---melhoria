import { useEffect, useState, useRef } from "react";
import "./RegisterSupplier.css";
import { useToast } from "../context/ToastProvider";

export default function RegisterSupplier({ isOpen, onClose, onSave }) {
  const { showToast } = useToast();
  const initialFormData = {
    nome_fornecedor: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    cep: "",
    email: "",
    telefone: "",
    documento: "",
    tipo_pessoa: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const numeroInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setSaving(false);
    }
  }, [isOpen]);

  const formatarDocumento = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      return apenasNumeros
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
  };

  const formatarTelefone = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    if (apenasNumeros.length <= 10) {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
  };

  const buscarEnderecoPorCep = async (cepLimpo) => {
    if (cepLimpo.length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        showToast("error", "CEP não encontrado.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
        pais: "Brasil",
      }));

      setTimeout(() => {
        if (numeroInputRef.current) {
          numeroInputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      showToast("error", "Erro ao buscar CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "documento") {
      const apenasNumeros = value.replace(/\D/g, "");
      if (apenasNumeros.length > 14) return;

      const tipoPessoa =
        apenasNumeros.length > 11 ? "PJ" : apenasNumeros.length > 0 ? "PF" : "";

      setFormData((prev) => ({
        ...prev,
        documento: apenasNumeros,
        tipo_pessoa: tipoPessoa || prev.tipo_pessoa,
      }));
      return;
    }

    if (name === "cep") {
      const apenasNumeros = value.replace(/\D/g, "");
      if (apenasNumeros.length > 8) return;

      setFormData((prev) => ({ ...prev, [name]: apenasNumeros }));

      if (apenasNumeros.length === 8) {
        buscarEnderecoPorCep(apenasNumeros);
      }
      return;
    }

    if (name === "telefone") {
      const apenasNumeros = value.replace(/\D/g, "");
      if (apenasNumeros.length > 11) return;
      setFormData((prev) => ({ ...prev, [name]: apenasNumeros }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      showToast("error", "Usuário não autenticado.");
      return;
    }

    if (!formData.nome_fornecedor.trim()) {
      showToast("warning", "Informe o nome do fornecedor.");
      return;
    }

    const docNumeros = formData.documento.replace(/\D/g, "");

    if (
      docNumeros.length !== 0 &&
      docNumeros.length !== 11 &&
      docNumeros.length !== 14
    ) {
      showToast(
        "warning",
        `O documento possui ${docNumeros.length} dígitos. Informe exatamente 11 dígitos para CPF ou 14 dígitos para CNPJ.`,
      );
      return;
    }

    const payload = {
      nome_fornecedor: formData.nome_fornecedor.trim(),
      rua: formData.rua.trim()
        ? formData.numero
          ? `${formData.rua.trim()}, ${formData.numero.trim()}`
          : formData.rua.trim()
        : null,
      bairro: formData.bairro.trim() || null,
      cidade: formData.cidade.trim() || null,
      estado: formData.estado.trim() || null,
      pais: formData.pais.trim() || null,
      cep: formData.cep.trim() || null,
      email: formData.email.trim() || null,
      telefone: formData.telefone.trim() || null,
      documento: docNumeros || null,
      tipo_pessoa: formData.tipo_pessoa.trim() || null,
    };

    try {
      setSaving(true);

      const response = await fetch("http://localhost:3001/api/supplier", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("error", data.message || "Erro ao cadastrar fornecedor.");
        return;
      }

      showToast("success", "Fornecedor cadastrado com sucesso.");
      if (onSave) {
        onSave(data.fornecedor || data.data || data);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error);
      showToast("error", `Erro ao cadastrar fornecedor: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="supplier-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
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
                placeholder="Ex: João Roberto"
                required
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
                value={formatarDocumento(formData.documento)}
                onChange={handleChange}
                placeholder="CPF ou CNPJ"
                maxLength={18}
              />
            </div>

            <div className="form-group">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ex: email@gmail.com"
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={formatarTelefone(formData.telefone)}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div className="form-group">
              <label>
                CEP{" "}
                {loadingCep && (
                  <span style={{ fontSize: "12px", color: "#104f3a" }}>
                    (Buscando...)
                  </span>
                )}
              </label>
              <input
                type="text"
                name="cep"
                value={formData.cep.replace(/^(\d{5})(\d)/, "$1-$2")}
                onChange={handleChange}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div className="form-group">
              <label>Número</label>
              <input
                ref={numeroInputRef}
                type="text"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                placeholder="Ex: 123"
              />
            </div>

            <div className="form-group">
              <label>Rua</label>
              <input
                type="text"
                name="rua"
                value={formData.rua}
                onChange={handleChange}
                placeholder="Ex: Rua das Laranjeiras"
              />
            </div>

            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={formData.bairro}
                onChange={handleChange}
                placeholder="Ex: Centro"
              />
            </div>

            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                placeholder="Ex: Xique-Xique"
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <input
                type="text"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                placeholder="Ex: MG"
                maxLength={2}
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
