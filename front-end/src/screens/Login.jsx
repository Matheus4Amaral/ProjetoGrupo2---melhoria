import "./Login.css";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [erros, setErros] = useState({ email: "", password: "", geral: "" });
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErros((prev) => ({ ...prev, [id]: "", geral: "" }));
  };

  const handleLogin = async () => {
    const novosErros = { email: "", password: "", geral: "" };

    if (!formData.email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    }

    if (!formData.password.trim()) {
      novosErros.password = "Informe sua senha.";
    }

    if (novosErros.email || novosErros.password) {
      setErros(novosErros);
      return;
    }

    setEnviando(true);

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErros({
          email: "",
          password: "",
          geral: data.message || "Não foi possível entrar.",
        });
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setErros({
        email: "",
        password: "",
        geral: "Erro ao conectar com o servidor.",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="login-container">
        <section className="left-panel">
          <div className="description">
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

        <section className="right-panel">
          <img src={Logo} alt="Logo" className="logo" />

          <div className="login-form">
            <h2>Login</h2>
            <h3>Entre com suas credenciais para acessar o sistema</h3>

            {erros.geral && <div className="erro-geral">{erros.geral}</div>}

            <label htmlFor="email">Email</label>
            <input
              className={`input${erros.email ? " input-erro" : ""}`}
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              value={formData.email}
              onChange={handleChange}
            />
            {erros.email && <span className="campo-erro">{erros.email}</span>}

            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <input
                className={`input${erros.password ? " input-erro" : ""}`}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
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
              <span className="campo-erro">{erros.password}</span>
            )}

            <div className="form-options">
              <label htmlFor="remember" className="remember-me">
                <input type="checkbox" id="remember" />
                <span className="remenber-span">Manter conectado</span>
              </label>

              <a href="/forgot-password" className="missing-password">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              onClick={handleLogin}
              className="login-button"
              disabled={enviando}
            >
              <span>{enviando ? "Entrando..." : "Entrar"}</span>
              <span className="arrow">→</span>
            </button>

            <p className="register-text">
              Não tem acesso? <a href="/register">Cadastre-se</a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
