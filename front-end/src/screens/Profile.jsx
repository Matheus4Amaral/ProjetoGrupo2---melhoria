import { useState, useEffect } from "react";
import "./Profile.css";

import SideBar from "../components/SideBar";
import Header from "../components/Header";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../components/ToastContext";

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserData() {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
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
        toast.error(err.message);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  const confirmSave = async () => {
    const token = localStorage.getItem("token");
    setSaving(true);

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
        toast.success("Perfil atualizado com sucesso!");
        setIsConfirmOpen(false);
      } else {
        toast.error(data.message || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setSaving(false);
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
          <form onSubmit={handleSubmit} className="card">
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

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmSave}
        loading={saving}
        title="Confirmar Alterações"
        message="Deseja salvar as alterações do seu perfil?"
        confirmLabel="Salvar"
        confirmingLabel="Salvando..."
      />
    </div>
  );
}