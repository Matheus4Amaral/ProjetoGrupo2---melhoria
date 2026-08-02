import "./Login.css";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useToast } from "../context/ToastProvider";

export default function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const API_URL = import.meta.env.VITE_API_URL;

  // function handleLogin(){
  //   navigate('/dashboard')
  // }

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast("error", data.message || "Erro ao fazer login.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      showToast("error", `Erro ao conectar com o servidor: ${error.message}`);
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

            <label htmlFor="email">Email</label>
            <input
              className="input"
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              onChange={handleChange}
              required
            />
            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <input
                className="input"
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="********"
                onChange={handleChange}
                required
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
            <div className="form-options">
              <a href="/forgot-password" className="missing-password">
                Esqueci minha senha
              </a>
            </div>

            <button
              type="submit"
              onClick={handleLogin}
              className="login-button"
            >
              <span>Entrar</span>
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
