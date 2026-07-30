import "./SideBar.css";
import Logo from "../assets/sidebarLogo.png";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
// import { FiLogOut } from "react-icons/fi";

function SideBar() {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [userData, setUserData] = useState({
        nome_usuario: "",
        nome_empresa: ""
    });

    useEffect(() => {
        async function fetchUserData() {
            const token = localStorage.getItem("token");

            if (!token) return;

            try {
                const response = await fetch("http://localhost:3001/api/perfil/get-user", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) return;

                const data = await response.json();

                setUserData({
                    nome_usuario: data.nome_usuario || "",
                    nome_empresa: data.nome_empresa || ""
                });
            } catch (error) {
                console.error("Erro ao carregar usuário da sidebar:", error.message);
            }
        }

        fetchUserData();
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    }

    function getIniciais(nome) {
        if (!nome) return "US";
        const partes = nome.trim().split(" ");
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    return (
        <>
            <section className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand">
                        <img src={Logo} alt="Logo StockControl" className="sidebar-logo" />
                    </div>

                    <hr />

                    <nav className="sidebar-nav">
                        <p className="sidebar-title">MENU</p>

                        <NavLink
                            to="/dashboard"
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <img
                                src="https://img.icons8.com/?size=20&id=sUJRwjfnGwbJ&format=png&color=ffffff"
                                alt="Ícone do Dashboard"
                                className="nav-icon"
                            />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/stock"
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <img
                                src="https://img.icons8.com/?size=20&id=106914&format=png&color=ffffff"
                                alt="Ícone do Estoque"
                                className="nav-icon"
                            />
                            <span>Estoque</span>
                        </NavLink>

                        <NavLink
                            to="/sale"
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <img
                                src="https://img.icons8.com/?size=20&id=cIzsD9VTMVOe&format=png&color=ffffff"
                                alt="Ícone de Vendas"
                                className="nav-icon"
                            />
                            <span>Vendas</span>
                        </NavLink>

                        <NavLink
                            to="/supplier"
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <img
                                src="https://img.icons8.com/?size=20&id=15767&format=png&color=ffffff"
                                alt="Ícone de Fornecedores"
                                className="nav-icon"
                            />
                            <span>Fornecedores</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <hr />

                    <button className="user-box" onClick={() => navigate("/profile")}>
                        <div className="user-avatar">{getIniciais(userData.nome_usuario)}</div>
                        <div className="user-info">
                            <strong>{userData.nome_usuario || "Usuário"}</strong>
                            <span>{userData.nome_empresa || "Empresa"}</span>
                        </div>
                    </button>

                    <div className="logout-wrapper">
                        <img
                            src="https://img.icons8.com/?size=20&id=22112&format=png&color=ffffff"
                            alt="Ícone de sair"
                            className="logout-icon"
                        />
                        <button
                            className="logout-button"
                            onClick={() => setShowLogoutModal(true)}
                        >
                            Sair
                        </button>
                    </div>

                </div>
            </section>

            {showLogoutModal && (
                <div
                    className="logout-modal"
                    onClick={() => setShowLogoutModal(false)}
                >
                    <div
                        className="logout-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* <div className="logout-modal-icon">
                            <FiLogOut />
                        </div> */}

                        <h2>Deseja sair?</h2>

                        <p>
                            Você será desconectado da sua conta e precisará fazer login
                            novamente para acessar o sistema.
                        </p>

                        <div className="logout-modal-buttons">
                            <button
                                className="btn-cancelar"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                className="btn-sair"
                                onClick={() => {
                                    setShowLogoutModal(false);
                                    handleLogout();
                                }}
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );


}


export default SideBar;