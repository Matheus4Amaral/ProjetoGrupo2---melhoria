import "./SideBar.css";
import Logo from "../assets/sidebarLogo.png";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    LuBoxes,
    LuBuilding2,
    LuChevronRight,
    LuLayoutDashboard,
    LuLogOut,
    LuShoppingCart,
    LuTruck,
} from "react-icons/lu";

const EMPTY_USER = {
    nome_usuario: "",
    nome_empresa: ""
};

function getCachedUser() {
    try {
        const cachedUser = JSON.parse(localStorage.getItem("usuario") || "{}");

        return {
            nome_usuario: cachedUser.nome_usuario || "",
            nome_empresa: cachedUser.nome_empresa || ""
        };
    } catch {
        return EMPTY_USER;
    }
}

function SideBar({ isOpen = false, onClose = () => {} }) {
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [userData, setUserData] = useState(getCachedUser);

    useEffect(() => {
        const controller = new AbortController();

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
                    signal: controller.signal,
                });

                if (!response.ok) return;

                const data = await response.json();
                const updatedUser = {
                    nome_usuario: data.nome_usuario || "",
                    nome_empresa: data.nome_empresa || ""
                };

                setUserData(updatedUser);
                localStorage.setItem("usuario", JSON.stringify(data));
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Erro ao carregar usuário da sidebar:", error.message);
                }
            }
        }

        const syncCachedUser = () => setUserData(getCachedUser());

        fetchUserData();
        window.addEventListener("profile-updated", syncCachedUser);

        return () => {
            controller.abort();
            window.removeEventListener("profile-updated", syncCachedUser);
        };
    }, []);

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/");
    }

    function getIniciais(nome) {
        if (!nome) return "US";
        const partes = nome.trim().split(/\s+/);
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    return (
        <>
            <aside
                id="main-sidebar"
                className={`sidebar ${isOpen ? "is-open" : ""}`}
                aria-label="Menu principal"
            >
                <div className="sidebar-top">
                    <div className="sidebar-brand">
                        <img src={Logo} alt="StockControl" className="sidebar-logo" />
                    </div>

                    <nav className="sidebar-nav" aria-label="Navegação principal">
                        <p className="sidebar-title">NAVEGAÇÃO</p>

                        <NavLink
                            to="/dashboard"
                            onClick={onClose}
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <LuLayoutDashboard className="nav-icon" aria-hidden="true" />
                            <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                            to="/stock"
                            onClick={onClose}
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <LuBoxes className="nav-icon" aria-hidden="true" />
                            <span>Estoque</span>
                        </NavLink>

                        <NavLink
                            to="/sale"
                            onClick={onClose}
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <LuShoppingCart className="nav-icon" aria-hidden="true" />
                            <span>Vendas</span>
                        </NavLink>

                        <NavLink
                            to="/supplier"
                            onClick={onClose}
                            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                        >
                            <LuTruck className="nav-icon" aria-hidden="true" />
                            <span>Fornecedores</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <button
                        type="button"
                        className="user-box"
                        onClick={() => {
                            onClose();
                            navigate("/profile");
                        }}
                        aria-label="Abrir meu perfil"
                    >
                        <div className="user-avatar">{getIniciais(userData.nome_usuario)}</div>
                        <div className="user-info">
                            <strong>{userData.nome_usuario || "Usuário"}</strong>
                            <span>
                                <LuBuilding2 aria-hidden="true" />
                                {userData.nome_empresa || "Minha empresa"}
                            </span>
                        </div>
                        <LuChevronRight className="user-chevron" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        className="logout-button"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <LuLogOut className="logout-icon" aria-hidden="true" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {showLogoutModal && (
                <div
                    className="logout-modal"
                    onClick={() => setShowLogoutModal(false)}
                >
                    <div
                        className="logout-modal-content"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="logout-title"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="logout-modal-icon">
                            <LuLogOut aria-hidden="true" />
                        </div>

                        <h2 id="logout-title">Deseja sair?</h2>

                        <p>
                            Você será desconectado da sua conta e precisará fazer login
                            novamente para acessar o sistema.
                        </p>

                        <div className="logout-modal-buttons">
                            <button
                                type="button"
                                className="btn-cancelar"
                                onClick={() => setShowLogoutModal(false)}
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
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
