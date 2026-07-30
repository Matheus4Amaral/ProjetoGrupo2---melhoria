import './Login.css'
import Logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import toast from 'react-hot-toast';

export default function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [erros, setErros] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    //Limpa o erro do campo assim que o usuário começa a corrigir
    setErros((prev) => ({ ...prev, [id]: "" }));
  };

  const validarFormulario = () => {
    const novosErros = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    } else if (!emailRegex.test(formData.email)) {
      novosErros.email = "Digite um endereço de e-mail válido.";
    }

    if (!formData.password) {
      novosErros.password = "Informe sua senha.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    //Impede envios duplicados enquanto a requisição está em andamento
    if (loading) return;

    if (!validarFormulario()) return;

    try{
      setLoading(true);

      const response = await fetch("http://localhost:3001/api/auth/login", {
        method : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json()

      //Checando se a resposta da requisição foi bem-sucedida
      if (!response.ok) {
        toast.error(data.message || "Usuário ou senha incorretos.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/dashboard")
    } catch (error) {
      console.error("Erro ao realizar login:", error);

      toast.error(
        "Não foi possível conectar ao servidor. Verifique se o back-end está funcionando."
      )
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-container">

        <section className="left-panel">
          <div className="description">
            <h1>Controle total <br/>
              do seu
              <span> estoque.</span>
            </h1>
            <p>
              Monitore entradas, saídas e reposições em tempo real.
              Tome decisões com dados precisos e evite rupturas de estoque.
            </p>
          </div>
        </section>

        <section className="right-panel">
          <img src={Logo} alt="Logo" className="logo" />

          {/* noValidate desativa os balões do navegador para usarmos as mensagens abaixo de cada campo */}
          <form className="login-form" onSubmit={handleLogin} noValidate>
            <h2>Login</h2>
            <h3>Entre com suas credenciais para acessar o sistema</h3>

            <label htmlFor="email">Email</label>
            <input
              className={`input ${erros.email ? "input-error" : ""}`}
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={erros.email ? "true" : "false"}
              aria-describedby={erros.email ? "email-erro" : undefined}
            />
            {erros.email && (
              <span className="field-error" id="email-erro">{erros.email}</span>
            )}

            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <input
                className={`input ${erros.password ? "input-error" : ""}`}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                aria-invalid={erros.password ? "true" : "false"}
                aria-describedby={erros.password ? "password-erro" : undefined}
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
            {erros.password && (
              <span className="field-error" id="password-erro">{erros.password}</span>
            )}

            <div className="form-options">
              <label htmlFor="remember" className="remember-me">
                <input type="checkbox" id="remember" />
                <span>Manter conectado</span>
              </label>

              <a href='/forgot-password' className="missing-password">
                Esqueci minha senha
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              <span>{loading ? "Entrando..." : "Entrar"}</span>
              {!loading && <span className='arrow'>→</span>}
            </button>

            <p className='register-text'>
              Não tem acesso? <a href='/register'>Cadastre-se</a>
            </p>

          </form>
        </section>

      </div>
    </>
  )
}
