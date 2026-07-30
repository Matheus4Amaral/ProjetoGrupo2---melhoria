import "./Register.css";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { formatCPFCNPJ, validateCPFCNPJ, removeNonNumeric } from "../utils/validators";

const SENHA_MINIMA = 8;

export default function Cadastro() {
  const navigate = useNavigate();

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

  // Fica fora do formData porque não deve ser enviado para a API
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [resultadosCep, setResultadosCep] = useState([]);
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Limpa o erro do campo assim que o usuário começa a corrigir
  const limparErro = (campo) => {
    setErros((prev) => ({ ...prev, [campo]: "" }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    limparErro(id);
  };

  const handlePaisChange = (e) => {
  const { value } = e.target;
  setFormData((prev) => ({ ...prev, pais: value, estado: "" }));
  };

  const handleCpfCnpjChange = (e) => {
    setFormData((prev) => ({ ...prev, cpf_cnpj: formatCPFCNPJ(e.target.value) }));
    limparErro("cpf_cnpj");
  };

  const handleCepChange = (e) => {
    let valor = removeNonNumeric(e.target.value);
    if (valor.length > 8) valor = valor.slice(0, 8);

    valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");

    setFormData((prev) => ({ ...prev, cep: valor }));
    limparErro("cep");
  };

  // Função para buscar o endereço com base no CEP
  const buscarCep = async () => {
  const cepNumerico = removeNonNumeric(formData.cep);

  if (!cepNumerico) {
    return;
  }

  if (cepNumerico.length !== 8) {
    setErros((prev) => ({
      ...prev,
      cep: "O CEP deve ter 8 dígitos.",
    }));
    return;
  }

  try {
    const response = await fetch(
      `https://viacep.com.br/ws/${cepNumerico}/json/`
    );

    if (!response.ok) {
      throw new Error("Erro ao consultar o CEP.");
    }

    const data = await response.json();

    if (data.erro) {
      setErros((prev) => ({
        ...prev,
        cep: "CEP não encontrado.",
      }));

      toast.error("CEP não encontrado.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      rua: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
      pais: "BR",
    }));

    limparErro("cep");
  } catch (error) {
    console.error("Erro ao consultar CEP:", error);
    toast.error("Não foi possível consultar o CEP.");
  }
};

// Função para buscar o CEP com base no endereço
const buscarCepPorEndereco = async () => {
  const { estado, cidade, rua } = formData;

  if (!estado) {
    toast.error("Selecione o estado.");
    return;
  }

  if (cidade.trim().length < 3) {
    toast.error("Digite pelo menos 3 caracteres da cidade.");
    return;
  }

  if (rua.trim().length < 3) {
    toast.error("Digite pelo menos 3 caracteres da rua.");
    return;
  }

  try {
    setBuscandoCep(true);
    setResultadosCep([]);

    const uf = encodeURIComponent(estado);
    const cidadeFormatada = encodeURIComponent(cidade.trim());
    const ruaFormatada = encodeURIComponent(rua.trim());

    const response = await fetch(
      `https://viacep.com.br/ws/${uf}/${cidadeFormatada}/${ruaFormatada}/json/`
    );

    if (!response.ok) {
      throw new Error("Erro ao consultar o endereço.");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      toast.error("Nenhum CEP encontrado para esse endereço.");
      return;
    }

    setResultadosCep(data);
  } catch (error) {
    console.error("Erro ao buscar CEP pelo endereço:", error);
    toast.error("Não foi possível buscar o CEP.");
  } finally {
    setBuscandoCep(false);
  }
};

// Função para selecionar um endereço da lista de resultados
const selecionarEndereco = (endereco) => {
  setFormData((prev) => ({
    ...prev,
    cep: endereco.cep || "",
    rua: endereco.logradouro || prev.rua,
    bairro: endereco.bairro || "",
    cidade: endereco.localidade || prev.cidade,
    estado: endereco.uf || prev.estado,
    pais: "BR",
  }));

  setResultadosCep([]);
  limparErro("cep");

  toast.success("CEP selecionado!");
};

  const handleTelefoneChange = (e) => {
    let valor = removeNonNumeric(e.target.value);
    if (valor.length > 11) valor = valor.slice(0, 11);

    // (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    if (valor.length > 9) {
      valor = valor.replace(/(\d{4,5})(\d{4})$/, "$1-$2");
    }

    setFormData((prev) => ({ ...prev, telefone: valor }));
    limparErro("telefone");
  };

  const validarFormulario = () => {
    const novosErros = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.nome_usuario.trim()) {
      novosErros.nome_usuario = "Informe seu nome completo.";
    }

    if (!formData.nome_empresa.trim()) {
      novosErros.nome_empresa = "Informe o nome da empresa.";
    }

    if (!formData.email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!emailRegex.test(formData.email)) {
      novosErros.email = "Digite um endereço de e-mail válido.";
    }

    if (!formData.cpf_cnpj.trim()) {
      novosErros.cpf_cnpj = "Informe seu CPF ou CNPJ.";
    } else if (!validateCPFCNPJ(formData.cpf_cnpj)) {
      novosErros.cpf_cnpj = "CPF ou CNPJ inválido. Confira os números digitados.";
    }

    // Campos de endereço são opcionais, mas se preenchidos precisam estar completos
    if (formData.cep && removeNonNumeric(formData.cep).length !== 8) {
      novosErros.cep = "O CEP deve ter 8 dígitos.";
    }

    if (formData.telefone && removeNonNumeric(formData.telefone).length < 10) {
      novosErros.telefone = "Telefone incompleto. Inclua o DDD.";
    }

    if (!formData.senha) {
      novosErros.senha = "Crie uma senha.";
    } else if (formData.senha.length < SENHA_MINIMA) {
      novosErros.senha = `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`;
    }

    if (!confirmarSenha) {
      novosErros.confirmarSenha = "Repita a senha para confirmar.";
    } else if (confirmarSenha !== formData.senha) {
      novosErros.confirmarSenha = "As senhas não são iguais.";
    }

    setErros(novosErros);

    // Leva o usuário até o primeiro campo com problema
    const primeiroErro = Object.keys(novosErros)[0];
    if (primeiroErro) {
      document.getElementById(primeiroErro)?.focus();
    }

    return primeiroErro === undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Impede envios duplicados enquanto a requisição está em andamento
    if (loading) return;

    if (!validarFormulario()) return;

    try{
      setLoading(true);

      const response = await fetch("http://localhost:3001/api/auth/register", {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },

        // A coluna cep é numérica no banco: envia só os dígitos, ou null quando vazio
        body: JSON.stringify({
          ...formData,
          cep: formData.cep ? removeNonNumeric(formData.cep) : null,
        }),
      });

      const data = await response.json()

      if(!response.ok) {
        toast.error(data.message || "Erro ao realizar o cadastro.")
        return;
      }

      // Faz login automaticamente
    const loginResponse = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.senha,
      }),
    });

    const loginData = await loginResponse.json();

    if (!loginResponse.ok) {
      toast.success("Cadastro realizado com sucesso!");
      navigate("/");
      return;
    }

    localStorage.setItem("token", loginData.token);
    localStorage.setItem(
      "usuario",
      JSON.stringify(loginData.usuario)
    );

    toast.success("Cadastro realizado! Bem-vindo(a)!");

    navigate("/dashboard");

    } catch (error){
      console.error("Erro ao realizar cadastro:", error)
      toast.error("Não foi possível conectar ao servidor. Verifique se o back-end está funcionando.")
    } finally {
      setLoading(false);
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

          {/* noValidate desativa os balões do navegador para usarmos as mensagens abaixo de cada campo */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h2>Cadastro</h2>
            <h3>Preencha os campos abaixo para criar sua conta</h3>

            <label htmlFor="nome_usuario">Nome Completo</label>
            <input
              className={`input ${erros.nome_usuario ? "input-error" : ""}`}
              type="text"
              id="nome_usuario"
              placeholder="Seu nome completo"
              value={formData.nome_usuario}
              onChange={handleChange}
              aria-invalid={erros.nome_usuario ? "true" : "false"}
            />
            {erros.nome_usuario && <span className="field-error">{erros.nome_usuario}</span>}

            <label htmlFor="nome_empresa">Nome Empresa</label>
            <input
              className={`input ${erros.nome_empresa ? "input-error" : ""}`}
              type="text"
              id="nome_empresa"
              placeholder="Nome da sua empresa"
              value={formData.nome_empresa}
              onChange={handleChange}
              aria-invalid={erros.nome_empresa ? "true" : "false"}
            />
            {erros.nome_empresa && <span className="field-error">{erros.nome_empresa}</span>}

            <label htmlFor="email">E-mail</label>
            <input
              className={`input ${erros.email ? "input-error" : ""}`}
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={erros.email ? "true" : "false"}
            />
            {erros.email && <span className="field-error">{erros.email}</span>}

            <label htmlFor="cpf_cnpj">CPF/CNPJ</label>
            <input
              className={`input ${erros.cpf_cnpj ? "input-error" : ""}`}
              type="text"
              id="cpf_cnpj"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
              value={formData.cpf_cnpj}
              maxLength={18}
              onChange={handleCpfCnpjChange}
              aria-invalid={erros.cpf_cnpj ? "true" : "false"}
            />
            {erros.cpf_cnpj && <span className="field-error">{erros.cpf_cnpj}</span>}

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
                />
              </div>

              <div className="campo-numero">
                <label htmlFor="numero">Número</label>
                <input
                  className="input"
                  type="text"
                  id="numero"
                  placeholder="Número"
                  value={formData.numero}
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
                  value={formData.bairro}
                  onChange={handleChange} 
                />
              </div>

              <div className="cep-campo">
                <label htmlFor="cep">Cep</label>
                <input
                  className={`input ${erros.cep ? "input-error" : ""}`}
                  type="text"
                  id="cep"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={handleCepChange}
                  onBlur={buscarCep}
                  maxLength={9}
                  aria-invalid={erros.cep ? "true" : "false"}
                />
                {erros.cep && <span className="field-error">{erros.cep}</span>}

              {/* Botão para buscar o CEP pelo endereço */}
                  <button
                    type="button"
                    className="buscar-cep-link"
                    onClick={buscarCepPorEndereco}
                    disabled={buscandoCep}
                  >
                    {buscandoCep
                      ? "Buscando..."
                      : "🔍 Não sabe o CEP? Buscar pelo endereço"}
                  </button>

                  {resultadosCep.length > 0 && (
                    <div className="resultados-cep">
                      <p>Selecione o endereço:</p>
                      
                      {resultadosCep.map((endereco, index) => (
                        <button
                          type="button"
                          key={`${endereco.cep}-${index}`}
                          className="resultado-cep-item"
                          onClick={() => selecionarEndereco(endereco)}
                        >
                          <strong>{endereco.cep}</strong>
                          <br />
                          {endereco.logradouro}
                          {endereco.bairro ? ` - ${endereco.bairro}` : ""}
                        </button>
                      ))}
                    </div>
                  )}

              </div>
            </div>

            <div className="estado-pais-linha">
            <div className="estado">
            <label htmlFor="estado">Estado</label>
            {formData.pais==="" || formData.pais ==="BR"?(
            <select
              className="input"
              id="estado"
              value={formData.estado}
              onChange={handleChange}
            >
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
            ) : (
            <input className="input" type="text" id="estado"
            placeholder="Estado / Província / Região"
            value={formData.estado}
            onChange={handleChange} />)}
            </div>

            <div className="pais-campo">
            <label htmlFor="pais">País</label>
            <select className="input" id="pais" value={formData.pais} onChange={handlePaisChange}>
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
              className={`input ${erros.telefone ? "input-error" : ""}`}
              type="text"
              id="telefone"
              placeholder="(XX) XXXXX-XXXX"
              value={formData.telefone}
              onChange={handleTelefoneChange}
              maxLength={15}
              aria-invalid={erros.telefone ? "true" : "false"}
            />
            {erros.telefone && <span className="field-error">{erros.telefone}</span>}

            <label htmlFor="senha">Senha</label>
            <div className="password-field">
              <input
                className={`input ${erros.senha ? "input-error" : ""}`}
                type={showSenha ? "text" : "password"}
                id="senha"
                placeholder="********"
                value={formData.senha}
                onChange={handleChange}
                aria-invalid={erros.senha ? "true" : "false"}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowSenha(!showSenha)}
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {showSenha ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {erros.senha ? (
              <span className="field-error">{erros.senha}</span>
            ) : (
              <span className="field-hint">Use no mínimo {SENHA_MINIMA} caracteres.</span>
            )}

            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <div className="password-field">
              <input
                className={`input ${erros.confirmarSenha ? "input-error" : ""}`}
                type={showConfirmarSenha ? "text" : "password"}
                id="confirmarSenha"
                placeholder="********"
                value={confirmarSenha}
                onChange={(e) => {
                  setConfirmarSenha(e.target.value);
                  limparErro("confirmarSenha");
                }}
                aria-invalid={erros.confirmarSenha ? "true" : "false"}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                aria-label={showConfirmarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirmarSenha ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {erros.confirmarSenha && <span className="field-error">{erros.confirmarSenha}</span>}

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              <span>{loading ? "Cadastrando..." : "Cadastrar"}</span>
              {!loading && <span className="arrow">→</span>}
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
