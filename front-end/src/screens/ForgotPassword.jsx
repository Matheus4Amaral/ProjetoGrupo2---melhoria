import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from '../assets/sidebarLogo.png';
import { FaLock, FaCheckCircle } from "react-icons/fa";
import "./ForgotPassword.css";

export default function ForgotPassword() {
  const [screen, setScreen] = useState("form");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (screen === "loading") {
      const timer = setTimeout(() => {
        setScreen("success");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [screen]);

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(true);
      setErrorMessage("Digite um endereço de e-mail válido.");
      return;
    }

    setError(false);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setScreen("loading");
      } else {
        setError(true);
        setErrorMessage(data.message || "Erro ao solicitar recuperação.");
      }
    } catch (err) {
      setError(true);
      setErrorMessage("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="forgot-page">
      <header className="forgot-header">
        <div className="forgot-logo">
          <img src={Logo} alt="Logo StockControl" className="sidebar-logo" />
        </div>
      </header>

      <main className="forgot-container">
        {screen === "form" && (
          <div className="forgot-card">
            <div className="forgot-icon">
              <FaLock />
            </div>

            <h2 className="forgot-title">Esqueceu sua Senha?</h2>

            <p className="forgot-description">
              Digite o e-mail associado à sua conta e enviaremos
              <br />
              as instruções para redefinição.
            </p>

            <div className="forgot-form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                placeholder="seuemail@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? "forgot-input-error" : ""}
              />
              {error && (
                <p className="forgot-error-message">
                  {errorMessage}
                </p>
              )}
            </div>

            <button className="forgot-button" onClick={handleSubmit}>
              Enviar link de recuperação
            </button>

            <p className="forgot-info">O link expira em 30 minutos.</p>

            <Link to="/" className="forgot-back-link">
              ← Voltar para o login
            </Link>
          </div>
        )}

        {screen === "loading" && (
          <div className="forgot-card">
            <div className="forgot-icon">
              <FaLock />
            </div>

            <h2 className="forgot-title">Enviando seu link...</h2>

            <p className="forgot-description">
              Estamos preparando seu link para recuperação.
              <br />
              Aguarde alguns segundos.
            </p>

            <div className="forgot-loading">
              <div className="forgot-spinner"></div>
              <p>Enviando solicitação...</p>
            </div>
          </div>
        )}

        {screen === "success" && (
          <div className="forgot-card">
            <div className="forgot-success-icon">
              <FaCheckCircle />
            </div>

            <h2 className="forgot-title">Link enviado com sucesso!</h2>

            <p className="forgot-description">
              Enviamos um link de recuperação para:
            </p>

            <p className="forgot-success-email">{email}</p>

            <p className="forgot-info">
              Verifique sua caixa de entrada e também a pasta de spam.
              <br />
              O link permanecerá válido por 30 minutos.
            </p>

            <button
              className="forgot-button forgot-success-button"
              onClick={() => {
                setScreen("form");
                setEmail("");
                setError(false);
                setErrorMessage("");
              }}
            >
              Enviar outro link
            </button>
          </div>
        )}
      </main>
    </div>
  );
}