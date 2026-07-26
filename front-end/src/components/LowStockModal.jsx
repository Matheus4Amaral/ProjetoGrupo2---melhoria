import './LowStockModal.css'

function LowStockModal({ openModal, setOpenModal, lowStockProducts, onReplacement, handleOpenReplacementModal}){
    return(
        <div className='stock-modal-overlay'> 
            <div className='stock-modal'> 
                <div className='stock-modal-header'> 
                    <div> 
                        <h3>Estoque Baixo</h3>
                        <p>Todos os itens que requerem atenção</p>
                    </div>

                    <img
                        src="https://img.icons8.com/?size=100&id=45&format=png&color=104F3A"
                        alt="Ícone Fechar Modal"
                        className="close-modal-icon"
                        onClick={()=> setOpenModal(false)}
                    />
                    
                </div>

                <div className='stock-modal-list'>
                    <div className='list-modal-header'>
                        <span>Produto</span>
                        <span>Estoque</span>
                        <span>Status</span>
                        <span>Ação</span>
                    </div>
                     
                    {lowStockProducts.map((item) => {
                        const percent = (item.atual / item.total) * 100;
                    
                        return(
                            <div className='list-modal-row' key={item.codigo}>
                                <div className='product-info'> 
                                    <h2>{item.nome}</h2>
                                    <h3>{item.codigo}</h3>
                                </div>

                                <div className='product-stock'> 
                                    <div className='stock-bar'>
                                        <div className='stock-fill' style={{ width: `${percent}%`, backgroundColor: item.status === "Crítico" ? "#D4183D" : "#F59E0B" }}> </div>
                                    </div>
                                    <span>{item.atual}/{item.total}</span>
                                </div>

                                <h2 className='product-status' style={{color: item.status === "Crítico" ? "#B91C3D" : "#92400E", backgroundColor: item.status === "Crítico" ? "#FDE8EC" : "#FEF3C7"}}> 
                                    {item.status}
                                </h2>

                                <button onClick={() => handleOpenReplacementModal(item)} className="replace-btn">
                                    Repor
                                </button>
                            </div>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

export default LowStockModal