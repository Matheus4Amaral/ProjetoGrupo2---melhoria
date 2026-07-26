import React, { useMemo, useState } from "react";
import "./TabelaEstoque.css";

export default function TabelaEstoque({
  produtos = [],
  loading = false,
  estoqueAtual = null,
  onReload = () => {},
  onViewItem = () => {},
  onEditItem = () => {}
}) {
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(Number(valor) || 0);
  };

  const formatarQuantidade = (quantidade) => {
    const numero = Number(quantidade) || 0;
    return `${numero} ${numero === 1 ? "item" : "itens"}`;
  };

  const categorias = useMemo(() => {
    const lista = produtos
      .map((item) => item.categoria)
      .filter((categoria) => categoria && categoria.trim() !== "");

    return [...new Set(lista)].sort((a, b) => a.localeCompare(b));
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    return produtos.filter((item) => {
      const termo = busca.trim().toLowerCase();

      const correspondeBusca =
        termo === "" ||
        String(item.id_produto).toLowerCase().includes(termo) ||
        (item.nome_produto || "").toLowerCase().includes(termo);

      const correspondeCategoria =
        categoriaSelecionada === "" || item.categoria === categoriaSelecionada;

      const correspondeStatus =
        statusSelecionado === "" || item.status === statusSelecionado;

      return correspondeBusca && correspondeCategoria && correspondeStatus;
    });
  }, [produtos, busca, categoriaSelecionada, statusSelecionado]);

  const getStatusClass = (status) => {
    if (status === "Crítico") return "status-critico";
    if (status === "Alerta") return "status-alerta";
    return "status-normal";
  };

  async function handleDelete(item) {
    if (!estoqueAtual?.id_estoque) {
      alert("Estoque não identificado para exclusão.");
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente remover o produto "${item.nome_produto}" do estoque?`
    );

    if (!confirmar) return;

    const token = localStorage.getItem("token");

    try {
      setDeletingId(item.id_produto);

      const response = await fetch(
        `http://localhost:3001/api/stock/${estoqueAtual.id_estoque}/produtos/${item.id_produto}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao excluir produto do estoque.");
        return;
      }

      alert("Produto removido do estoque com sucesso.");
      await onReload();
    } catch (error) {
      alert(`Erro ao excluir produto: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  function handleView(item) {
    onViewItem(item);
  }

  function handleEdit(item) {
    onEditItem(item);
  }

  return (
    <div className="tabela-vendas">
      <h3 className="tabela-titulo">Lista de Produtos</h3>

      <div className="filtros-container">
        <div className="filtro-busca">
          <svg
            className="filtro-icon"
            xmlns="http://www.w3.org/2000/svg"
            height="20px"
            viewBox="0 -960 960 960"
            width="20px"
            fill="#9ca3af"
          >
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>

          <input
            type="text"
            placeholder="Buscar por ID, Produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="filtro-select">
          <select
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(e.target.value)}
          >
            <option value="">Categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className="filtro-select">
          <select
            value={statusSelecionado}
            onChange={(e) => setStatusSelecionado(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Normal">Normal</option>
            <option value="Alerta">Alerta</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>
      </div>

      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Nome</th>
              <th>Estoque</th>
              <th>Valor Compra</th>
              <th>Valor Venda</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Carregando produtos...</td>
              </tr>
            ) : produtosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="7">Nenhum produto encontrado.</td>
              </tr>
            ) : (
              produtosFiltrados.map((item) => (
                <tr key={item.id_produto}>
                  <td>#{item.id_produto}</td>

                  <td>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>

                  <td>{item.nome_produto}</td>
                  <td>{formatarQuantidade(item.quantidade_estoque_atual)}</td>
                  <td>{formatarMoeda(item.preco_compra)}</td>
                  <td>{formatarMoeda(item.preco_venda)}</td>

                  <td>
                    <div className="acoes-container">
                      <button
                        className="btn-acao"
                        type="button"
                        title="Visualizar"
                        onClick={() => handleView(item)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4B5563">
                          <path d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z" />
                        </svg>
                      </button>

                      <button
                        className="btn-acao"
                        type="button"
                        title="Editar"
                        onClick={() => handleEdit(item)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4B5563">
                          <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z" />
                        </svg>
                      </button>

                      <button
                        className="btn-acao"
                        type="button"
                        title="Excluir"
                        disabled={deletingId === item.id_produto}
                        onClick={() => handleDelete(item)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4B5563">
                          <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120Z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}