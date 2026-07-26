import { useState, useEffect } from "react";
import "./OrderModal.css";
import { saleService } from "../services/saleService";
import { productService } from "../services/productService";

export default function OrderModal({ isOpen, onClose }) {
    const [nomeCliente, setNomeCliente] = useState("");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const searchProducts = async () => {
            if (searchTerm.trim().length >= 2) {
                try {
                    const results = await productService.searchByName(searchTerm);
                    setSearchResults(results);
                    setShowResults(true);
                } catch (err) {
                    console.error('Erro ao buscar produtos:', err);
                    setSearchResults([]);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        };

        const timeoutId = setTimeout(searchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleAddProduct = (produto) => {
        const existingItem = items.find(item => item.id === produto.id_produto);
        
        if (existingItem) {
            setItems(items.map(item =>
                item.id === produto.id_produto
                    ? { ...item, quantidade: item.quantidade + 1 }
                    : item
            ));
        } else {
            setItems([...items, {
                id: produto.id_produto,
                nome: produto.nome_produto,
                preco: produto.preco_venda,
                quantidade: 1
            }]);
        }
        
        setSearchTerm("");
        setShowResults(false);
    };

    const handleIncrement = (itemId) => {
        setItems(items.map(item => // mapeia cada item e incrementa a quantidade do item com o id correspondente
            item.id === itemId ? { ...item, quantidade: item.quantidade + 1 } : item
        ));
    };

    const handleDecrement = (itemId) => { 
        setItems(prevItems => { 
            return prevItems.map(item => item.id === itemId ? { ...item, quantidade: item.quantidade - 1 } : item).filter(item => item.quantidade > 0);
        });
    };

    const calcularSubtotal = () => {
        return items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleConfirmarPedido = async () => {
        if (items.length === 0) {
            setError('Adicione pelo menos um item ao pedido');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const pedidoData = {
                descricao: nomeCliente || 'Cliente não informado',
                valor_venda: calcularSubtotal(),
                produtos: items.map(item => ({
                    id_produto: item.id,
                    quantidade_venda: item.quantidade
                }))
            };

            await saleService.create(pedidoData);
            
            setNomeCliente('');
            setItems([]);
            onClose();
            
            window.location.reload();
        } catch (err) {
            console.error('Erro ao criar pedido:', err);
            setError('Erro ao criar pedido. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <h2>Novo Pedido</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="customer-field">
                        <label>Cliente</label>
                        <input 
                            type="text" 
                            className="input-simples"
                            placeholder="Digite o nome do cliente" 
                            value={nomeCliente}
                            onChange={(e) => setNomeCliente(e.target.value)}
                        />
                    </div>

                    <div className="product-field">
                        <label>Buscar Produtos</label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <svg className="input-icon" xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#9ca3af">
                                <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" />
                            </svg>
                            <input 
                                type="text" 
                                placeholder="Digite o nome do produto" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {showResults && searchResults.length > 0 && (
                                <div className="search-results">
                                    {searchResults.map(produto => (
                                        <div 
                                            key={produto.id_produto} 
                                            className="search-result-item"
                                            onClick={() => handleAddProduct(produto)}
                                        >
                                            <div>
                                                <div className="result-name">{produto.nome_produto}</div>
                                                <div className="result-category">{produto.categoria}</div>
                                            </div>
                                            <div className="result-price">
                                                {formatarMoeda(produto.preco_venda)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showResults && searchResults.length === 0 && searchTerm.length >= 2 && (
                                <div className="search-results">
                                    <div className="search-no-results">Nenhum produto encontrado</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="items-section">
                        <h3 className="items-title">ITENS ADICIONADOS ({items.length})</h3>
                        
                        {items.map(item => (
                            <div key={item.id} className="item-card">
                                <div className="item-info">
                                    <h4 className="item-nome">{item.nome}</h4>
                                    <p className="item-preco">{formatarMoeda(item.preco)} / un</p>
                                </div>
                                <div className="item-actions">
                                    <button className="qty-btn" onClick={() => handleDecrement(item.id)}>-</button>
                                    <span className="qty-value">{item.quantidade}</span>
                                    <button className="qty-btn" onClick={() => handleIncrement(item.id)}>+</button>
                                    <span className="item-total">{formatarMoeda(item.preco * item.quantidade)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="resumo-section">
                        <div className="resumo-line">
                            <span>Subtotal</span>
                            <span>{formatarMoeda(calcularSubtotal())}</span>
                        </div>
                        <div className="resumo-line">
                            <span>Descontos</span>
                            <span className="desconto">- R$ 0,00</span>
                        </div>
                        <div className="resumo-total">
                            <span>Total do Pedido</span>
                            <span>{formatarMoeda(calcularSubtotal())}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {error && <p className="error-message" style={{color: 'red', marginRight: 'auto'}}>{error}</p>}
                    <button type="button" onClick={onClose} className="btn-cancelar" disabled={loading}>
                        Cancelar
                    </button>
                    <button type="button" onClick={handleConfirmarPedido} className="btn-confirmar" disabled={loading}>
                        {loading ? 'Salvando...' : 'Confirmar Pedido'}
                    </button>
                </div>
            </div>
        </div>
    );
}