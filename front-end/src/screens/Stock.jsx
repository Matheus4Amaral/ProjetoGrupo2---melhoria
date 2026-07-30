import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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

  //Usado quando o usuário ainda não tem nenhum estoque cadastrado
  const [descricaoNovoEstoque, setDescricaoNovoEstoque] = useState("Estoque Principal");
  const [criandoEstoque, setCriandoEstoque] = useState(false);

  const handleNovoItem = () => {
    //Sem estoque não há onde guardar o produto: orienta em vez de abrir um modal que vai falhar
    if (!estoqueAtual?.id_estoque) {
      toast.error("Crie um estoque antes de cadastrar produtos.");
      return;
    }

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

  async function fetchProdutosEstoque() {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Usuário não autenticado.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const responseEstoques = await fetch("http://localhost:3001/api/stock", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const dataEstoques = await responseEstoques.json();

      if (!responseEstoques.ok) {
        toast.error(dataEstoques.message || "Erro ao carregar estoques.");
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

      const responseProdutos = await fetch(
        `http://localhost:3001/api/stock/${estoque.id_estoque}/produtos`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const dataProdutos = await responseProdutos.json();

      if (!responseProdutos.ok) {
        toast.error(dataProdutos.message || "Erro ao carregar produtos.");
        return;
      }

      setProdutos(Array.isArray(dataProdutos.produtos) ? dataProdutos.produtos : []);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Não foi possível carregar o estoque. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCriarEstoque(e) {
    e.preventDefault();

    if (criandoEstoque) return;

    const descricao = descricaoNovoEstoque.trim();

    if (!descricao) {
      toast.error("Dê um nome para o seu estoque.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      setCriandoEstoque(true);

      const response = await fetch("http://localhost:3001/api/stock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ descricao })
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Erro ao criar estoque.");
        return;
      }

      toast.success("Estoque criado! Agora você já pode cadastrar produtos.");

      await fetchProdutosEstoque();
    } catch (error) {
      console.error("Erro ao criar estoque:", error);
      toast.error("Não foi possível criar o estoque. Verifique sua conexão.");
    } finally {
      setCriandoEstoque(false);
    }
  }

  useEffect(() => {
    fetchProdutosEstoque();
  }, []);

  const totalProdutos = produtos.length;
  const produtosAlerta = produtos.filter((item) => item.status === "Alerta").length;
  const produtosCritico = produtos.filter((item) => item.status === "Crítico").length;

  const semEstoque = !loading && !estoqueAtual;

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

            {semEstoque ? (
              <div className="estoque-vazio">
                <h3>Você ainda não tem um estoque</h3>
                <p>
                  Os produtos precisam ficar guardados em um estoque.
                  Crie o seu para começar a cadastrar itens.
                </p>

                <form className="estoque-vazio-form" onSubmit={handleCriarEstoque}>
                  <input
                    type="text"
                    className="estoque-vazio-input"
                    value={descricaoNovoEstoque}
                    onChange={(e) => setDescricaoNovoEstoque(e.target.value)}
                    placeholder="Ex.: Estoque Principal"
                    aria-label="Nome do estoque"
                  />

                  <button
                    type="submit"
                    className="estoque-vazio-btn"
                    disabled={criandoEstoque}
                  >
                    {criandoEstoque ? "Criando..." : "Criar estoque"}
                  </button>
                </form>
              </div>
            ) : (
              <TabelaEstoque
                produtos={produtos}
                loading={loading}
                estoqueAtual={estoqueAtual}
                onReload={fetchProdutosEstoque}
                onViewItem={handleVisualizarItem}
                onEditItem={handleEditarItem}
              />
            )}
          </main>
        </div>
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estoqueAtual={estoqueAtual}
        onSuccess={fetchProdutosEstoque}
        mode={modalMode}
        itemSelecionado={selectedItem}
      />
    </>
  );
}
