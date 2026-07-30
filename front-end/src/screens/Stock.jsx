import { useState, useEffect } from "react";
import "./Stock.css";
import SideBar from "../components/SideBar";
import Header from "../components/Header";
import CardResumo from "../components/cardResumo";
import TabelaEstoque from "../components/TabelaEstoque";
import ItemModal from "../components/ItemModal";
import { useToast } from "../context/ToastProvider.jsx";

export default function Stock() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  const { showToast } = useToast();

  const [estoques, setEstoques] = useState([]);
  const [produtosPorEstoque, setProdutosPorEstoque] = useState({});
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

      const responseEstoques = await fetch("http://localhost:3001/api/stock", {
        method: "GET",
        signal,
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

      setEstoques(listaEstoques);

      if (listaEstoques.length === 0) {
        setProdutosPorEstoque({});
        return;
      }

      const produtosMap = {};

      for (const estoque of listaEstoques) {
        const responseProdutos = await fetch(
          `http://localhost:3001/api/stock/${estoque.id_estoque}/produtos`,
          {
            method: "GET",
            signal,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const dataProdutos = await responseProdutos.json();

        if (!responseProdutos.ok) {
          console.error(
            `Erro ao carregar produtos do estoque ${estoque.id_estoque}:`,
            dataProdutos.message,
          );
          produtosMap[estoque.id_estoque] = [];
          continue;
        }

        produtosMap[estoque.id_estoque] = Array.isArray(dataProdutos.produtos)
          ? dataProdutos.produtos
          : [];
      }

      setProdutosPorEstoque(produtosMap);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Erro no fetch:", error);
        setErrorMessage(`Erro ao carregar estoque: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    fetchProdutosEstoque(controller.signal);
    return () => {
      controller.abort();
    };
  }, []);

  const todosProdutos = Object.entries(produtosPorEstoque).flatMap(
    ([id_estoque, produtos]) =>
      produtos.map((p) => ({
        ...p,
        id_estoque: Number(id_estoque),
      })),
  );

  const totalProdutos = todosProdutos.length;
  const produtosAlerta = todosProdutos.filter(
    (item) => item.status === "Alerta",
  ).length;
  const produtosCritico = todosProdutos.filter(
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
              produtos={todosProdutos}
              loading={loading}
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
        onSuccess={() => fetchProdutosEstoque()}
        mode={modalMode}
        itemSelecionado={selectedItem}
      />
    </>
  );
}
