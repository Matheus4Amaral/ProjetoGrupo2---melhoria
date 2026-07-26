import { useState, useEffect } from "react";
import "./Profile.css";

import SideBar from "../components/SideBar";
import Header from "../components/Header";

export default function Profile() {
  const [formData, setFormData] = useState({
    nome_usuario: "",
    nome_empresa: "",
    email: "",
    cpf_cnpj: "",
    telefone: "",
    rua: "",
    numero: "",
    cep: "",
    cidade: "",
    bairro: "",
    pais: "",
    estado: "",
  });

  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("token");

      if (!token) {
        setMensagem({ tipo: "erro", texto: "Sessão expirada. Faça login novamente." });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/api/perfil/get-user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar dados do perfil");
        }

        const data = await response.json();

        setFormData({
          nome_usuario: data.nome_usuario || "",
          nome_empresa: data.nome_empresa || "",
          email: data.email || "",
          cpf_cnpj: data.cpf_cnpj || "",
          telefone: data.telefone || "",
          rua: data.rua || "",
          numero: data.numero || "",
          cep: data.cep || "",
          cidade: data.cidade || "",
          bairro: data.bairro || "",
          pais: data.pais || "",
          estado: data.estado || "",
        });
      } catch (err) {
        setMensagem({ tipo: "erro", texto: err.message });
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: "", texto: "" });

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:3001/api/perfil/update-user", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem({ tipo: "sucesso", texto: "Perfil atualizado com sucesso!" });
      } else {
        setMensagem({ tipo: "erro", texto: data.message || "Erro ao atualizar perfil." });
      }
    } catch (err) {
      setMensagem({ tipo: "erro", texto: "Erro ao conectar com o servidor." });
    }
  };

  const getIniciais = (nome) => {
    if (!nome) return "US";
    const partes = nome.trim().split(" ");
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-container">
        <SideBar />
        <div className="profile-panel">
          <Header title="Meu Perfil" />
          <p style={{ padding: "20px" }}>Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <SideBar />

      <div className="profile-panel">
        <Header title="Meu Perfil" />

        <main className="profile-main">
          {mensagem.texto && (
            <div className={`alert ${mensagem.tipo}`} style={{
              padding: "10px",
              marginBottom: "15px",
              borderRadius: "5px",
              backgroundColor: mensagem.tipo === "sucesso" ? "#d4edda" : "#f8d7da",
              color: mensagem.tipo === "sucesso" ? "#155724" : "#721c24"
            }}>
              {mensagem.texto}
            </div>
          )}

          <form onSubmit={handleSave} className="card">
            <div className="left">
              <div className="avatar">{getIniciais(formData.nome_usuario)}</div>
              <h2>{formData.nome_usuario || "Usuário"}</h2>
            </div>

            <div className="right">
              <h3>Informações Pessoais</h3>

              <div className="grid">
                <div>
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    name="nome_usuario"
                    value={formData.nome_usuario}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Nome da Empresa</label>
                  <input
                    type="text"
                    name="nome_empresa"
                    value={formData.nome_empresa}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                  />
                </div>

                <div>
                  <label>CPF/CNPJ</label>
                  <input
                    type="text"
                    name="cpf_cnpj"
                    value={formData.cpf_cnpj}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Telefone</label>
                  <input
                    type="text"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="address">
                <div className="street">
                  <label>Rua</label>
                  <input
                    type="text"
                    name="rua"
                    value={formData.rua}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Número</label>
                  <input
                    type="text"
                    name="numero"
                    value={formData.numero}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>CEP</label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid">
                <div>
                  <label>Cidade</label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Bairro</label>
                  <input
                    type="text"
                    name="bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>País</label>
                  <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Estado</label>
                  <input
                    type="text"
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="buttons">

                <button type="submit" className="save">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}