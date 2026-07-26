import './Dashboard.css';

import Chart from "react-apexcharts";  
import { useState, useEffect } from 'react';

import SideBar from '../components/SideBar'
import Header from '../components/Header';

import ProductLogo from '../assets/products-icon-dashboard.png'
import SalesLogo from  '../assets/sales-icon-dashboard.png'
import SupplierLogo from '../assets/supplier-icon-dashboard.png'
import LowStockModal from '../components/LowStockModal';
import ReplacementModal from '../components/ReplacementModal';


export default function Dashboard(){

    const [openLowStockModal, setOpenLowStockModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [openReplacementModal, setOpenReplacementModal] = useState(false);
    const [loadingReplacement, setLoadingReplacement] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        totalProductsStock: 0,
        totalSales: 0,
        totalSuppliers: 0,
        lowStock: [],
        salesEvolution: [],
        recentProducts: 0,
        recentSales: 0,
        recentSuppliers: 0
    });
    const [loadingDashboard, setLoadingDashboard] = useState(true);

     const token = localStorage.getItem("token");
  
    async function handleReplacement({ id_produto, id_estoque, quantidade_reposicao }){
        try{
            setLoadingReplacement(true)

            const response = await fetch("http://localhost:3001/api/dashboard/replacement", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    id_produto,
                    id_estoque,
                    quantidade_reposicao
                }),
            })

            const data = await response.json()

            if(!response.ok) {
                alert(`${data.message}`)
                return;
            }

            alert("Reposição realizada com sucesso")

            setOpenReplacementModal(false)
        } catch(error){
            alert(`Erro ao conectar com o servidor ${error.message}`)
        } finally{
            setLoadingReplacement(false)
        }
        await fetchDashboardData();
    }

    function handleOpenLowStockModal() {
        setOpenLowStockModal(true);
    }

    function handleOpenReplacementModal(item){
        setSelectedProduct(item)
        setOpenReplacementModal(true)
    }

    async function fetchDashboardData() {
        try {
            setLoadingDashboard(true)
            
            const response = await fetch("http://localhost:3001/api/dashboard/getDashboardData", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
        
            const data = await response.json()

            if(!response.ok){
                alert(`${data.message}`)
            }
            setDashboardData({
                totalProductsStock: data.totalProductsStock ?? 0,
                totalSales: data.totalSales ?? 0,
                totalSuppliers: data.totalSuppliers ?? 0,
                lowStock: Array.isArray(data.lowStock) ? data.lowStock : [],
                salesEvolution: Array.isArray(data.salesEvolution) ? data.salesEvolution : [], 
                recentProducts: data.recentProducts ?? 0,
                recentSales: data.recentSales ?? 0,
                recentSuppliers: data.recentSuppliers ?? 0
            });
        } catch(error){
            alert(`Erro ao carregar dashboard ${error.message}`)
        } finally{
            setLoadingDashboard(false)
        }
    }

    useEffect(()=>{
        fetchDashboardData()
    }, [])

    const lowStockProducts = (dashboardData?.lowStock ?? []).map((item) => ({
        id_produto: item.id_produto,
        id_estoque: item.id_estoque,
        nome: item.nome_produto,
        atual: item.quantidade_estoque_atual,
        total: item.quantidade_estoque_total,
        status: item.status
    }))

    const chartCategories = (dashboardData.salesEvolution ?? []).map((item) => {
        const data = new Date(item.dia)
        return data.toLocaleDateString("pt-BR", { weekday: "short" });
    })

    const chartSeries = [
        {
            name: "Vendas",
            data: (dashboardData.salesEvolution ?? []).map((item) => Number(item.total_vendas))
        }
    ]

    const options = {
        chart: {
        type: 'line',
        toolbar: { show: false }, 
        zoom: { enabled: false }
        },
        stroke: {
        curve: 'smooth',          
        width: 3,                 
        colors: ['#00875A']      
        },
        colors: ['#00875A'],        
        markers: {
        size: 5,                  
        colors: ['#00875A'],      
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: { size: 7 }
        },
        grid: {
        show: true,
        borderColor: '#f1f1f1',
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
        },
        xaxis: {
        categories: chartCategories,
        labels: {
            style: { colors: '#777', fontSize: '12px' }
        },
        axisBorder: { show: false },       
        axisTicks: { show: false }      
        },
        yaxis: {
        min: 0,
        max: Number(dashboardData.totalSales),           
        tickAmount: 4,                    
        labels: {
            formatter: function (value) {
                return value.toFixed(0);
            },
            style: { colors: '#777', fontSize: '12px' }
        }
        },
        tooltip: { 
            enabled: true,
            y: {
            formatter: function (value) {
                return value.toFixed(0);
            }
        }
        },
        legend: { show: false }
    };

    return(
        <>
        <div className="dashboard-container">
            <SideBar/>
            <div className="dashboard-panel">
                <Header title="Dashboard"/>
                <div className="dashboard-informations">
                    <div className="dashboard-cards">
                        <div className="total-products">
                            <img src={ProductLogo} alt='Logo de Produtos Dashboard' className='product-icon'></img>
                            <h1>{dashboardData.totalProductsStock}</h1>
                            <h2>Total de Itens</h2>
                            <hr></hr>
                            <span>+{dashboardData.recentProducts} itens adicionados nos últimos dias</span>
                        </div>
                        <div className="total-sales">
                            <img src={SalesLogo} alt='Logo de Vendas Dashboard' className='sales-icon'></img>
                            <h1>{dashboardData.totalSales}</h1>
                            <h2>Total de Vendas</h2>
                            <hr></hr>
                            <span>+{dashboardData.recentSales} vendas realizadas nos últimos dias</span>
                        </div>
                    </div>

                    <div className="dashboard-chart">
                        <div className="chart-header">
                            <div className="chart-title-group">
                                <h3>Evolução de Vendas</h3>
                                <p>Últimos 7 dias</p>
                            </div>
                            <div className="chart-legend">
                                <span className="legend-dot"></span> Vendas
                            </div>
                        </div>
                            
                        <Chart
                            options={options}
                            series={chartSeries}
                            type="line"
                            height={160}
                        />
                
                    </div>

                    <div className="dashboard-cards">

                        <div className='stock-card'>
                            <div className="stock-header">
                                <div className="stock-title-group">
                                    <h3>Estoque Baixo</h3>
                                    <p>6 itens requerem atenção</p>
                                </div>
                            </div>

                            <div className='stock-list'>
                                <div className='list-header'>
                                    <span>Produto</span>
                                    <span>Estoque</span>
                                    <span>Status</span>
                                    <span>Ação</span>
                                </div>

                                {lowStockProducts.slice(0,2).map((item)=>{
                                    const percent = item.total > 0 ? (item.atual / item.total) * 100 : 0;
                                    
                                    return(
                                        <>
                                            <div className='list-row' key={`${item.id_produto}-${item.id_estoque}`}>
                                                <div className='product-info'>
                                                    <h2>{item.nome}</h2>
                                                    <h3>Código: {item.id_produto}</h3>
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
                                        </>
                                        
                                    );
                                })}

                            </div>

                            <button className='see-more-btn' onClick={handleOpenLowStockModal}>
                                Ver Mais
                            </button>

                            {openLowStockModal &&(
                                <LowStockModal
                                    openModal={openLowStockModal}
                                    setOpenModal={setOpenLowStockModal}
                                    lowStockProducts={lowStockProducts}
                                    handleOpenReplacementModal = {handleOpenReplacementModal}
                                />
                            )}

                            {openReplacementModal && selectedProduct && (
                                <ReplacementModal
                                    openModal={openReplacementModal}
                                    setOpenModal={setOpenReplacementModal}
                                    product={selectedProduct}
                                    onReplacement={handleReplacement}
                                    loadingReplacement={loadingReplacement}
                                />
                            )}
                        </div>

                        <div className='supplier-card'>
                            <img src={SupplierLogo} alt='Logo de Fornecedores Dashboard' className='supplier-icon'></img>
                            <h1>{dashboardData.totalSuppliers}</h1>
                            <h2>Total de Fornecedores</h2>
                            <hr></hr>
                            <span>+{dashboardData.totalSuppliers} fornecedores cadastrados nos últimos dias</span>
                        </div>

                    </div>
                </div>

            </div>
        </div>
        </>
    );
}