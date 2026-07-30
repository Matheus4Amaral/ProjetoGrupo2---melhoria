import { useEffect, useState, useRef } from "react";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import "./Fornecedor.css";
import { useToast } from "../context/ToastProvider";

export default function Fornecedor() {
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
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Referência para mover o foco para o campo de número
  const numeroInputRef = useRef(null);

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fetchFornecedores = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

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

      if (response.ok) {
        const lista = Array.isArray(data) ? data : data.fornecedores || [];
        setFornecedores(lista);
      }
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarDocumento = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, "");

    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    } else {
      // CNPJ: 12.345.678/9000-00
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

  // Função para buscar o endereço via API do ViaCEP
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

      // Preenche automaticamente Logradouro, Bairro, Cidade e Estado
      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
        pais: "Brasil",
      }));

      // Move o foco do cursor para o campo "Número"
      setTimeout(() => {
        if (numeroInputRef.current) {
          numeroInputRef.current.focus();
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
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
        tipo_pessoa: tipoPessoa || prev.tipo_pessoa, // Atualiza automaticamente
      }));
      return;
    }

    // Tratamento e busca do CEP
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

      setFormData(initialFormData);
      fetchFornecedores();
    } catch (error) {
      console.error("Erro ao cadastrar fornecedor:", error);
      showToast("error", `Erro ao cadastrar fornecedor: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fornecedor-container">
      <SideBar />

      <div className="fornecedor-main-content">
        <Header title="Fornecedores" />

        <div className="fornecedor-body">
          <div className="fornecedor-card">
            <h3>Cadastrar Novo Fornecedor</h3>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nome do Fornecedor *</label>
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
                  <label>Documento (Apenas Números)</label>
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

                {/* CAMPO CEP COM BUSCA AUTOMÁTICA */}
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

                {/* CAMPO NÚMERO (RECEBE O FOCO AUTOMATICAMENTE) */}
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
                  <label>Rua / Logradouro</label>
                  <input
                    type="text"
                    name="rua"
                    value={formData.rua}
                    placeholder="Ex: Rua das Laranjeiras"
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
                    placeholder="Ex: Xique-Xique Bahia"
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

              <button
                type="submit"
                className="btn-salvar-fornecedor"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar Fornecedor"}
              </button>
            </form>
          </div>

          <div className="fornecedor-card">
            <h3>Fornecedores Cadastrados</h3>

            {loading ? (
              <p>Carregando fornecedores...</p>
            ) : fornecedores.length === 0 ? (
              <p>Nenhum fornecedor encontrado.</p>
            ) : (
              <div className="table-responsive">
                <table className="fornecedores-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Documento</th>
                      <th>Telefone</th>
                      <th>E-mail</th>
                      <th>Cidade/UF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fornecedores.map((f) => (
                      <tr key={f.id_fornecedor}>
                        <td>{f.nome_fornecedor}</td>
                        <td>{f.tipo_pessoa || "-"}</td>
                        <td>{f.documento || "-"}</td>
                        <td>{f.telefone || "-"}</td>
                        <td>{f.email || "-"}</td>
                        <td>
                          {f.cidade && f.estado
                            ? `${f.cidade}/${f.estado}`
                            : f.cidade || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
