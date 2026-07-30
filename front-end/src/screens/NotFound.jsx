import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <div className="notfound-code">404</div>

        <h1 className="notfound-titulo">Página não encontrada</h1>
        <p className="notfound-texto">
          A página que você tentou acessar não existe ou foi movida.
        </p>

        <Link to="/dashboard" className="notfound-botao">
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
