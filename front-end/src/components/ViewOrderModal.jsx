import { useState, useEffect } from "react";
import "./OrderModal.css";

export default function ViewOrderModal({ isOpen, onClose, venda }) {
    const [nomeCliente, setNomeCliente] = useState("");
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (venda && isOpen) {
            setNomeCliente(venda.descricao || "");
            setItems(venda.itens || []);
        }
    }, [venda, isOpen]);

    const calcularSubtotal = () => {
        return items.reduce((total, item) => total + (item.preco * item.quantidade), 0);
    };

    const formatarMoeda = (valor) => {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-title">
                        <h2>Visualizar Pedido</h2>
                        <span className="badge-rascunho" style={{backgroundColor: '#dcfce7', color: '#16a34a'}}>Concluído</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body">
                    <div className="customer-field">
                        <label>Cliente</label>
                        <input 
                            type="text" 
                            className="input-simples"
                            value={nomeCliente || 'Cliente não informado'}
                            readOnly
                            disabled
                            style={{backgroundColor: '#f9fafb', cursor: 'not-allowed'}}
                        />
                    </div>

                    <div className="items-section">
                        <h3 className="items-title">ITENS DO PEDIDO ({items.length})</h3>
                        
                        {items.length === 0 ? (
                            <p style={{textAlign: 'center', color: '#9ca3af', padding: '20px'}}>
                                Nenhum item neste pedido
                            </p>
                        ) : (
                            items.map(item => (
                                <div key={item.id} className="item-card">
                                    <div className="item-info">
                                        <h4 className="item-nome">{item.nome}</h4>
                                        <p className="item-preco">{formatarMoeda(item.preco)} / un</p>
                                    </div>
                                    <div className="item-actions">
                                        <span className="qty-value" style={{marginRight: '12px'}}>
                                            Qtd: {item.quantidade}
                                        </span>
                                        <span className="item-total">{formatarMoeda(item.preco * item.quantidade)}</span>
                                    </div>
                                </div>
                            ))
                        )}
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
                    <button type="button" onClick={onClose} className="btn-confirmar" style={{width: '100%'}}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
