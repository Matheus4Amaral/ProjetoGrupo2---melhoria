import { useEffect, useState } from "react";
import "./RegisterStock.css";

// Componente de modal para cadastrar um novo Estoque (depósito).
export default function RegisterStock({ isOpen, onClose, onSave }) {
  // Estado que guarda o valor digitado no campo "Descrição do Estoque"
  const [descricao, setDescricao] = useState("");

  // Estado que indica se a requisição de salvar está em andamento
  // (usado para desabilitar os botões e trocar o texto do botão de salvar)
  const [saving, setSaving] = useState(false);

  // Sempre que o modal for fechado (isOpen vira false),
  useEffect(() => {
    if (!isOpen) {
      setDescricao("");
      setSaving(false);
    }
  }, [isOpen]);

  // Função executada quando o formulário é enviado (botão "Salvar Estoque")
  const handleSubmit = async (e) => {
    e.preventDefault(); 

    // Busca o token salvo no login. Sem ele, a API vai recusar a requisição.
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Usuário não autenticado.");
      return;
    }

    // Validação simples: não deixa enviar descrição vazia
    if (!descricao.trim()) {
      alert("Informe uma descrição para o estoque.");
      return;
    }

    try {
      setSaving(true); 

      // Chamada para o backend criar o estoque.
      // Rota: POST /api/stock (StockController -> createStock)
      const response = await fetch("http://localhost:3001/api/stock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // token necessário para o backend saber de qual usuário é o estoque
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ descricao: descricao.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao cadastrar estoque.");
        return;
      }

      alert("Estoque cadastrado com sucesso.");


      if (onSave) {
        await onSave();
      }

      onClose(); // fecha o modal após salvar com sucesso
    } catch (error) {
      // Erro de rede, servidor fora do ar, etc.
      alert(`Erro ao cadastrar estoque: ${error.message}`);
    } finally {
      setSaving(false); // libera os botões independente de sucesso ou erro
    }
  };

  if (!isOpen) return null;

  return (
    // Fundo escurecido atrás do modal. Clicar fora do card fecha o modal.
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation impede que o clique DENTRO do card feche o modal */}
      <div className="stock-modal-content" onClick={(e) => e.stopPropagation()}>

        {/* Cabeçalho do modal: título + botão de fechar (X) */}
        <div className="stock-modal-header">
          <h2>Cadastrar Estoque</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Corpo do formulário */}
        <form className="stock-modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Descrição do Estoque</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Depósito Principal"
            />
          </div>

          {/* Rodapé com os botões de ação */}
          <div className="stock-modal-footer">
            <button type="button" className="btn-cancelar" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirmar" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Estoque"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}