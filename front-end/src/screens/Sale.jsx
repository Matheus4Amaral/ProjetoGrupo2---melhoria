import { useState, useEffect } from "react";
import "./Sale.css";
import SideBar from "../components/SideBar";
import TabelaVendas from "../components/TabelaVendas";
import Header from "../components/Header";
import CardResumo from "../components/cardResumo";
import OrderModal from "../components/OrderModal";
import { saleService } from "../services/saleService";

export default function Sale() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendas, setVendas] = useState([]);
  const [stats, setStats] = useState({
    totalVendas: 0,
    pedidosHoje: 0,
    ticketMedio: 0
  });

  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      const data = await saleService.getAll();
      setVendas(data);
      calcularEstatisticas(data);
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
    }
  };

  const calcularEstatisticas = (vendasData) => {
    if (!vendasData || vendasData.length === 0) {
      setStats({
        totalVendas: 0,
        pedidosHoje: 0,
        ticketMedio: 0
      });
      return;
    }

    // Calcular total de vendas
    const total = vendasData.reduce((acc, venda) => acc + parseFloat(venda.valor_venda || 0), 0);
    // Calcular ticket médio
    const media = total / vendasData.length;

    // Contar pedidos de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const pedidosHoje = vendasData.filter(venda => {
      const dataVenda = new Date(venda.data_venda);
      dataVenda.setHours(0, 0, 0, 0);
      return dataVenda.getTime() === hoje.getTime();
    }).length;

    setStats({
      totalVendas: total,
      pedidosHoje: pedidosHoje,
      ticketMedio: media
    });
  };

  const formatarMoeda = (valor) => {
    return valor.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const handleNovoPedido = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Recarrega as vendas após fechar o modal (caso tenha criado um pedido)
    loadVendas();
  };

  const handleVendaDeleted = () => {
    // Recarrega as vendas e recalcula as estatísticas
    loadVendas();
  };

  return (
    <>
      <div className="sale-container">
        <SideBar />
        <div className="sale-panel">
          <Header 
            title="Painel de Vendas" 
            buttonText="Novo Pedido"
            onButtonClick={handleNovoPedido}
          />
          <main className="sale-main">
            <div className="sale-cards">
              <CardResumo title="Total de Vendas" value={formatarMoeda(stats.totalVendas)}/>
              <CardResumo title="Pedidos Hoje" value={stats.pedidosHoje}/>
              <CardResumo title="Ticket Médio" value={formatarMoeda(stats.ticketMedio)}/>
            </div>
            <TabelaVendas onVendaDeleted={handleVendaDeleted} />
          </main>
        </div>
      </div>
      <OrderModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
