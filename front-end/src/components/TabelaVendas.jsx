import { useState, useEffect } from "react";
import "./TabelaVendas.css";
import { saleService } from "../services/saleService";
import EditOrderModal from "./EditOrderModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ViewOrderModal from "./ViewOrderModal";

export default function ListaVendas({ onVendaDeleted }) {
  // Estado para armazenar as vendas vindas do backend
  const [vendas, setVendas] = useState([]);
  
  // Estado para controlar se está carregando 
  const [loading, setLoading] = useState(true);
  
  // Estado para armazenar erros (se der problema na requisição)
  const [error, setError] = useState(null);

  // Estado para controlar o termo de busca
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para controlar o filtro de data
  const [filtroData, setFiltroData] = useState("Últimos 30 dias");

  // Estado para controlar o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  // Estado para controlar o modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendaParaExcluir, setVendaParaExcluir] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Estado para controlar o modal de visualização
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [vendaParaVisualizar, setVendaParaVisualizar] = useState(null);

  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina] = useState(5);

  // useEffect executa quando o componente é montado (carregado na tela)
  useEffect(() => {
    loadVendas();
  }, []);

  const loadVendas = async () => {
    try {
      setLoading(true); 
      
      const data = await saleService.getAll();
      
      setVendas(data);
      
      setError(null);
      
    } catch (err) {
      console.error('Erro ao carregar vendas:', err);
      setError('Erro ao carregar vendas');
      
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return 'R$ 0,00';
    const valorNumerico = typeof valor === 'string' ? parseFloat(valor) : valor;
    return valorNumerico.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Função para filtrar vendas por data
  const filtrarPorData = (venda) => {
    const dataVenda = new Date(venda.data_venda);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    switch(filtroData) {
      case "Hoje":
        const dataVendaDia = new Date(venda.data_venda);
        dataVendaDia.setHours(0, 0, 0, 0);
        return dataVendaDia.getTime() === hoje.getTime();
      
      case "Últimos 7 dias":
        const seteDiasAtras = new Date(hoje);
        seteDiasAtras.setDate(hoje.getDate() - 7);
        return dataVenda >= seteDiasAtras;
      
      case "Últimos 30 dias":
        const trintaDiasAtras = new Date(hoje);
        trintaDiasAtras.setDate(hoje.getDate() - 30);
        return dataVenda >= trintaDiasAtras;
      
      case "Este mês":
        return dataVenda.getMonth() === hoje.getMonth() && 
               dataVenda.getFullYear() === hoje.getFullYear();
      
      default:
        return true;
    }
  };

  // Filtrar vendas com base no termo de busca e data
  const vendasFiltradas = vendas.filter((venda) => {
    const termoBusca = searchTerm.toLowerCase();
    const id = venda.id_venda?.toString().toLowerCase() || '';
    const cliente = venda.descricao?.toLowerCase() || '';
    
    const matchBusca = id.includes(termoBusca) || cliente.includes(termoBusca);
    const matchData = filtrarPorData(venda);
    
    return matchBusca && matchData;
  });

  // Calcular paginação
  const totalPaginas = Math.ceil(vendasFiltradas.length / itensPorPagina);
  const indexUltimoItem = paginaAtual * itensPorPagina;
  const indexPrimeiroItem = indexUltimoItem - itensPorPagina;
  const vendasPaginadas = vendasFiltradas.slice(indexPrimeiroItem, indexUltimoItem);

  // Resetar para primeira página quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1);
  }, [searchTerm, filtroData]);

  const handlePaginaAnterior = () => {
    setPaginaAtual(prev => Math.max(prev - 1, 1));
  };

  const handleProximaPagina = () => {
    setPaginaAtual(prev => Math.min(prev + 1, totalPaginas));
  };

  const handleIrParaPagina = (numeroPagina) => {
    setPaginaAtual(numeroPagina);
  };

  const handleEditarVenda = async (venda) => {
    try {
      const vendaCompleta = await saleService.getById(venda.id_venda);
      setVendaSelecionada(vendaCompleta);
      setIsEditModalOpen(true);
    } catch (err) {
      console.error('Erro ao buscar detalhes da venda:', err);
      setError('Erro ao carregar detalhes da venda');
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setVendaSelecionada(null);
  };

  const handleVisualizarVenda = async (venda) => {
    try {
      const vendaCompleta = await saleService.getById(venda.id_venda);
      setVendaParaVisualizar(vendaCompleta);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Erro ao buscar detalhes da venda:', err);
      setError('Erro ao carregar detalhes da venda');
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setVendaParaVisualizar(null);
  };

  const handleExcluirVenda = (venda) => {
    setVendaParaExcluir(venda);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setVendaParaExcluir(null);
  };

  const handleConfirmDelete = async () => {
    if (!vendaParaExcluir) return;

    try {
      setLoadingDelete(true);
      await saleService.delete(vendaParaExcluir.id_venda);
      
      setIsDeleteModalOpen(false);
      setVendaParaExcluir(null);
      
      await loadVendas();
      
      // Notifica o componente pai que uma venda foi excluída
      if (onVendaDeleted) {
        onVendaDeleted();
      }
    } catch (err) {
      console.error('Erro ao excluir venda:', err);
      setError('Erro ao excluir venda. Tente novamente.');
    } finally {
      setLoadingDelete(false);
    }
  };

  if (loading) {
    return <div className="tabela-vendas"><p>Carregando vendas...</p></div>;
  }

  if (error) {
    return <div className="tabela-vendas"><p>{error}</p></div>;
  }

  return (
    <div className="tabela-vendas">
      <h3 className="tabela-titulo">Lista de Pedidos Recentes</h3>
      
      <div className="filtros-container">
        <div className="filtro-busca">
          <svg className="filtro-icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#9ca3af">
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por ID, Cliente..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filtro-select">
          <svg className="filtro-icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#9ca3af">
            <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/>
          </svg>
          <select value={filtroData} onChange={(e) => setFiltroData(e.target.value)}>
            <option>Últimos 30 dias</option>
            <option>Últimos 7 dias</option>
            <option>Hoje</option>
            <option>Este mês</option>
          </select>
        </div>
      </div>
      
      <div className="tabela-container">
        <table>
          <thead>
            <tr>
              <th>ID</th> 
              <th>Data</th>
              <th>Cliente</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                  {searchTerm ? 'Nenhuma venda encontrada para a busca' : 'Nenhuma venda encontrada'}
                </td>
              </tr>
            ) : (
              vendasPaginadas.map((venda) => (
                <tr key={venda.id_venda}> 
                  <td>#{venda.id_venda}</td> 
                  <td>{formatarData(venda.data_venda)}</td>
                  <td>{venda.descricao || '-'}</td>
                  <td>{venda.total_itens || 0}</td>
                  <td>{formatarMoeda(venda.valor_venda)}</td>
                  <td>Concluído</td>
                  <td> 
                    <div className="acoes-container">
                      <button className="btn-acao" title="Visualizar" onClick={() => handleVisualizarVenda(venda)}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4B5563"><path d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z"/></svg>
                      </button>
                      <button className="btn-acao" title="Editar" onClick={() => handleEditarVenda(venda)}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4B5563"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                      </button>
                      <button className="btn-acao" title="Excluir" onClick={() => handleExcluirVenda(venda)}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#4B5563"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120Z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginação */}
      {vendasFiltradas.length > 0 && totalPaginas > 1 && (
        <div className="paginacao-container">
          <button 
            className="btn-paginacao" 
            onClick={handlePaginaAnterior}
            disabled={paginaAtual === 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>

          <div className="paginas-numeros">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((numero) => {
              // Mostrar apenas algumas páginas para não poluir a UI
              if (
                numero === 1 ||
                numero === totalPaginas ||
                (numero >= paginaAtual - 1 && numero <= paginaAtual + 1)
              ) {
                return (
                  <button
                    key={numero}
                    className={`btn-numero-pagina ${paginaAtual === numero ? 'ativo' : ''}`}
                    onClick={() => handleIrParaPagina(numero)}
                  >
                    {numero}
                  </button>
                );
              } else if (
                numero === paginaAtual - 2 ||
                numero === paginaAtual + 2
              ) {
                return <span key={numero} className="paginacao-reticencias">...</span>;
              }
              return null;
            })}
          </div>

          <button 
            className="btn-paginacao" 
            onClick={handleProximaPagina}
            disabled={paginaAtual === totalPaginas}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>

          <span className="paginacao-info">
            Página {paginaAtual} de {totalPaginas}
          </span>
        </div>
      )}

      <EditOrderModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        venda={vendaSelecionada}
      />
      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        loading={loadingDelete}
      />
      <ViewOrderModal 
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        venda={vendaParaVisualizar}
      />
    </div>
  );
}
