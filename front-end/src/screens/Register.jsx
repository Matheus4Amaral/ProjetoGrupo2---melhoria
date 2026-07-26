import "./Register.css";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

export default function Cadastro() {
  const navigate = useNavigate();

  // function handleRegister() {
  //   navigate("/dashboard");
  // }

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

    valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

    setFormData((prev) => ({ ...prev, cep: valor }));
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

    try{
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json()

      if(!response.ok) {
        alert(`${data.message}`)
        return;
      }

      alert("Cadastro realizado com sucesso!")
      navigate("/")
    } catch (error){
      console.error(error)
      alert(`Erro ao conectar com o servidor: ${error.message}` )
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
            />

            <label htmlFor="nome_empresa">Nome Empresa</label>
            <input
              className="input"
              type="text"
              id="nome_empresa"
              placeholder="Nome da sua empresa"
              onChange={handleChange}
            />

            <label htmlFor="email">E-mail</label>
            <input
              className="input"
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              onChange={handleChange}
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
            />

            <div className="rua-numero-linha">
              <div className="rua-campo">
                <label htmlFor="rua">Rua</label>
                <input
                  className="input"
                  type="text"
                  id="rua"
                  placeholder="Nome da rua"
                  onChange={handleChange}
                />
              </div>

              <div className="campo-numero">
                <label htmlFor="numero">Número</label>
                <input
                  className="input"
                  type="text"
                  id="numero"
                  placeholder="Número"
                  onChange={handleChange}
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
                  onChange={handleChange} 
                />
              </div>

              <div className="cep-campo">
                <label htmlFor="cep">Cep</label>
                <input
                  className="input"
                  type="text"
                  id="cep"
                  placeholder="00000-000"
                  onChange={handleChange}
                  maxLength={9}
                />
              </div>
            </div>

            <div className="estado-pais-linha">
            <div className="estado">
            <label htmlFor="estado">Estado</label>
            <select className="input" id="estado" onChange={handleChange}>
              <option value="">Selecione o estado</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
            </div>

            <div className="pais-campo">
            <label htmlFor="pais">País</label>
            <select className="input" id="pais" onChange={handleChange}>
              <option value="">Selecione o país</option>
              <option value="AR">Argentina</option>
              <option value="BO">Bolívia</option>
              <option value="BR">Brasil</option>
              <option value="CA">Canadá</option>
              <option value="CL">Chile</option>
              <option value="CO">Colômbia</option>
              <option value="CR">Costa Rica</option>
              <option value="CU">Cuba</option>
              <option value="DO">República Dominicana</option>
              <option value="EC">Equador</option>
              <option value="SV">El Salvador</option>
              <option value="GT">Guatemala</option>
              <option value="HN">Honduras</option>
              <option value="JM">Jamaica</option>
              <option value="MX">México</option>
              <option value="NI">Nicarágua</option>
              <option value="PA">Panamá</option>
              <option value="PY">Paraguai</option>
              <option value="PE">Peru</option>
              <option value="PR">Porto Rico</option>
              <option value="UY">Uruguai</option>
              <option value="US">Estados Unidos</option>
              <option value="VE">Venezuela</option>
            </select>
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

            <button
              type="submit"
              className="register-button"
            >
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
