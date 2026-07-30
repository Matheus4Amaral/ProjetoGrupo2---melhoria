import './Login.css'
import Logo from '../assets/logo.png'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useAlert } from "../contexts/AlertContext";

export default function Login() {

  const navigate = useNavigate();

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // function handleLogin(){
  //   navigate('/dashboard')
  // }

  const showAlert = useAlert();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id === "password" ? "password" : id]: "" }));
  };

  // const handleLogin = async () => {
  //   try{
  //     const response = await fetch("http://localhost:3001/api/auth/login", {
  //       method : "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json()

  //     if(!response.ok) {
  //       // showAlert(`${data.message}`)
  //       return;
  //     }

  //     localStorage.setItem("token", data.token);
  //     localStorage.setItem("usuario", JSON.stringify(data.usuario));

  //     navigate("/dashboard")

  //   } catch (error){
  //     console.error(error)
  //   }
  // };

  const handleLogin = async () => {
    const novosErros = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      novosErros.email = "Informe seu e-mail.";
    }

    if (!formData.password.trim()) {
      novosErros.password = "Informe sua senha.";
    }

    setErrors(novosErros);

    if (novosErros.email || novosErros.password) {
      return;
    }

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
        if (response.status === 404) {
          setErrors({ email: data.message || "Usuário não encontrado", password: "" });
        } else if (response.status === 401) {
          setErrors({ email: "", password: data.message || "Senha incorreta" });
        } else {
          showAlert(data.message || "Erro ao fazer login.");
        }
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      showAlert("Erro ao conectar com o servidor.");
    }
  };




  return (
    <>
      <div className="login-container">

        <section className="left-panel">
          <div className="description">
            <h1>Controle total <br />
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

          <div className="login-form">
            <h2>Login</h2>
            <h3>Entre com suas credenciais para acessar o sistema</h3>

            <label htmlFor="email">Email</label>
            <input
              className={`input ${errors.email ? 'input-error' : ''}`}
              type="email"
              id="email"
              placeholder="seuemail@empresa.com"
              onChange={handleChange}
              required
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}

            <label htmlFor="password">Senha</label>
            <div className="password-field">
              <input
                className={`input ${errors.password ? 'input-error' : ''}`}
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
            {errors.password && (
              <span className="error-message">{errors.password}</span>
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

            <button type="submit" onClick={handleLogin} className="login-button">
              <span>Entrar</span>
              <span className='arrow'>→</span>
            </button>

            <p className='register-text'>
              Não tem acesso? <a href='/register'>Cadastre-se</a>
            </p>

          </div>
        </section>

      </div>
    </>
  )
}
