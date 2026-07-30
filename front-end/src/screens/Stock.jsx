import { useState, useEffect } from "react";
import "./Stock.css";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import CardResumo from "../components/cardResumo";
import TabelaEstoque from "../components/TabelaEstoque";
import ItemModal from "../components/ItemModal";

export default function Stock() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);

  const [produtos, setProdutos] = useState([]);
  const [estoqueAtual, setEstoqueAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleNovoItem = () => {
    setModalMode("create");
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleVisualizarItem = (item) => {
    setModalMode("view");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleEditarItem = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setModalMode("create");
  };

  async function fetchProdutosEstoque(signal) {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);

      // 1. Busca Estoque (passando o signal para poder cancelar se o usuário mudar de página)
      const responseEstoques = await fetch("http://localhost:3001/api/stock", {
        method: "GET",
        signal, // AbortSignal
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const dataEstoques = await responseEstoques.json();

      if (!responseEstoques.ok) {
        setErrorMessage(dataEstoques.message || "Erro ao carregar estoques.");
        return;
      }

      const listaEstoques = Array.isArray(dataEstoques.estoques)
        ? dataEstoques.estoques
        : [];

      if (listaEstoques.length === 0) {
        setProdutos([]);
        setEstoqueAtual(null);
        return;
      }

      const estoque = listaEstoques[0];
      setEstoqueAtual(estoque);

      // 2. Busca Produtos do Estoque
      const responseProdutos = await fetch(
        `http://localhost:3001/api/stock/${estoque.id_estoque}/produtos`,
        {
          method: "GET",
          signal, // AbortSignal
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const dataProdutos = await responseProdutos.json();

      if (!responseProdutos.ok) {
        setErrorMessage(dataProdutos.message || "Erro ao carregar produtos.");
        return;
      }

      setProdutos(
        Array.isArray(dataProdutos.produtos) ? dataProdutos.produtos : [],
      );
    } catch (error) {
      // Ignora erro se for apenas o cancelamento intencional da requisição ao mudar de rota
      if (error.name !== "AbortError") {
        console.error("Erro no fetch:", error);
        setErrorMessage(`Erro ao carregar estoque: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Controller para cancelar a requisição se o usuário sair da página antes de carregar
    const controller = new AbortController();

    fetchProdutosEstoque(controller.signal);

    // Função de limpeza executada quando o componente é desmontado
    return () => {
      controller.abort();
    };
  }, []);

  const totalProdutos = produtos.length;
  const produtosAlerta = produtos.filter(
    (item) => item.status === "Alerta",
  ).length;
  const produtosCritico = produtos.filter(
    (item) => item.status === "Crítico",
  ).length;

  return (
    <>
      <div className="stock-container">
        <SideBar />
        <div className="stock-panel">
          <Header
            title="Estoque"
            buttonText="Novo Item"
            onButtonClick={handleNovoItem}
          />

          <main className="stock-main">
            {errorMessage && (
              <div
                style={{
                  color: "red",
                  padding: "10px",
                  marginBottom: "15px",
                  backgroundColor: "#ffe6e6",
                  borderRadius: "5px",
                }}
              >
                {errorMessage}
              </div>
            )}

            <div className="stock-cards">
              <CardResumo
                title="Produtos Cadastrados"
                value={loading ? "..." : totalProdutos}
              />
              <CardResumo
                title="Produtos em Alerta"
                value={loading ? "..." : produtosAlerta}
              />
              <CardResumo
                title="Produtos em Crítico"
                value={loading ? "..." : produtosCritico}
              />
            </div>

            <TabelaEstoque
              produtos={produtos}
              loading={loading}
              estoqueAtual={estoqueAtual}
              onReload={() => fetchProdutosEstoque()}
              onViewItem={handleVisualizarItem}
              onEditItem={handleEditarItem}
            />
          </main>
        </div>
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estoqueAtual={estoqueAtual}
        onSuccess={() => fetchProdutosEstoque()}
        mode={modalMode}
        itemSelecionado={selectedItem}
      />
    </>
  );
}
