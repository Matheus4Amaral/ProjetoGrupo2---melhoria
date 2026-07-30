import "./Register.css";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";

export default function Cadastro() {
  const navigate = useNavigate();

  // function handleRegister() {
  //   navigate("/dashboard");
  // }

  const [loadingCep, setLoadingCep] = useState(false);

  const numeroInputRef = useRef(null);

  const buscarEnderecoPorCep = async (cepLimpo) => {
    if (cepLimpo.length !== 8) return;

    try {
      setLoadingCep(true);
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`,
      );
      const data = await response.json();

      if (data.erro) {
        alert("CEP não encontrado.");
        return;
      }

      // Preenche automaticamente os campos de endereço
      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
        pais: "Brasil",
      }));

      // Move o foco para o campo "Número"
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

  const [formData, setFormData] = useState({
    nome_usuario: "",
    nome_empresa: "",
    email: "",
    cpf_cnpj: "",
    rua: "",
    estado: "",
    cidade: "",
    pais: "",
    telefone: "",
    numero: "",
    cep: "",
    bairro: "",
    senha: "",
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCpfCnpjChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 14) valor = valor.slice(0, 14);

    if (valor.length > 11) {
      valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
      valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
      valor = valor.replace(/(\d{4})(\d{2})$/, "$1-$2");
    } else {
      valor = valor.replace(/^(\d{3})(\d)/, "$1.$2");
      valor = valor.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
      valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }

    setFormData((prev) => ({ ...prev, cpf_cnpj: valor }));
  };

  const handleCepChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 8) valor = valor.slice(0, 8);

    setFormData((prev) => ({ ...prev, cep: valor }));

    if (valor.length === 8) {
      buscarEnderecoPorCep(valor);
    }

    if (valor.length >= 5) {
      valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
    }

    e.target.value = valor;
  };

  const handleTelefoneChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 11) valor = valor.slice(0, 11);

    // (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (valor.length > 9) {
      valor = valor.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    }

    setFormData((prev) => ({ ...prev, telefone: valor }));
  };

  const validarDocumento = (doc) => {
    const numeros = doc.replace(/\D/g, "");
    if (numeros.length !== 11 && numeros.length !== 14) return false;
    if (/^(\d)\1+$/.test(numeros)) return false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!validarDocumento(formData.cpfCnpj)) {
    //   alert("Por favor, insira um CPF ou CNPJ válido.");
    //   return;
    // }

    try {
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`${data.message}`);
        return;
      }

      alert("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(`Erro ao conectar com o servidor: ${error.message}`);
    }
  };

  return (
    <>
      <div className="register-container">
        <section className="left-panel-register">
          <div className="description-register">
            <h1>
              Controle total <br />
              do seu
              <span> estoque.</span>
            </h1>
            <p>
              Monitore entradas, saídas e reposições em tempo real. Tome
              decisões com dados precisos e evite rupturas de estoque.
            </p>
          </div>
        </section>

        <section className="right-panel-register">
          <img src={Logo} alt="Logo" className="logo" />

          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Cadastro</h2>
            <h3>Preencha os campos abaixo para criar sua conta</h3>

            <label htmlFor="nome_usuario">Nome Completo</label>
            <input
              className="input"
              type="text"
              id="nome_usuario"
              placeholder="Seu nome completo"
              onChange={handleChange}
              required
            />

            <label htmlFor="nome_empresa">Nome Empresa</label>
            <input
              className="input"
              type="text"
              id="nome_empresa"
              placeholder="Nome da sua empresa"
              onChange={handleChange}
              required
            />

            <label htmlFor="email">E-mail</label>
            <input
              className="input"
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              onChange={handleChange}
              required
            />

            <label htmlFor="cpf_cnpj">CPF/CNPJ</label>
            <input
              className="input"
              type="text"
              id="cpf_cnpj"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={formData.cpf_cnpj}
              maxLength={18}
              onChange={handleCpfCnpjChange}
              required
            />

            <div className="rua-numero-linha">
              <div className="rua-campo">
                <label htmlFor="rua">Rua</label>
                <input
                  className="input"
                  type="text"
                  id="rua"
                  placeholder="Nome da rua"
                  value={formData.rua}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="campo-numero">
                <label htmlFor="numero">Número</label>
                <input
                  className="input"
                  type="text"
                  id="numero"
                  value={formData.numero}
                  ref={numeroInputRef}
                  placeholder="Número"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="bairro-cep-linha">
              <div className="bairro-campo">
                <label htmlFor="bairro">Bairro</label>
                <input
                  className="input"
                  type="text"
                  id="bairro"
                  placeholder="Nome do bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cep-campo">
                <label htmlFor="cep">Cep</label>
                <input
                  className="input"
                  type="text"
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleCepChange}
                  maxLength={9}
                  required
                />
              </div>
            </div>

            <div className="estado-pais-linha">
              <div className="estado">
                <label htmlFor="estado">Estado</label>
                <input
                  className="input"
                  type="text"
                  id="estado"
                  placeholder="Ex: SP"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="pais-campo">
                <label htmlFor="pais">País</label>
                <input
                  className="input"
                  type="text"
                  id="pais"
                  placeholder="Ex: Brasil"
                  value={formData.pais}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <label htmlFor="cidade">Cidade</label>
            <input
              className="input"
              type="text"
              id="cidade"
              placeholder="Nome da Cidade"
              value={formData.cidade}
              onChange={handleChange}
              required
            />

            <label htmlFor="telefone">Telefone</label>
            <input
              className="input"
              type="text"
              id="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              maxLength={15}
              required
            />

            <label htmlFor="senha">Senha</label>
            <input
              className="input"
              type="password"
              id="senha"
              placeholder="********"
              value={formData.senha}
              onChange={handleChange}
            />

            <button type="submit" className="register-button">
              <span>Cadastrar</span>
              <span className="arrow">→</span>
            </button>

            <p className="register-text">
              Já é cadastrado? <a href="/">Faça login</a>
            </p>
          </form>
        </section>
      </div>
    </>
  );
}
