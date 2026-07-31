import "./SideBar.css";
import Logo from "../assets/sidebarLogo.png";
import LogoutModal from "./LogoutModal";

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function SideBar() {
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        nome_usuario: "",
        nome_empresa: ""
    });

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    
    const [isCompressed, setIsCompressed] = useState(() => {
        const saved = localStorage.getItem("sidebar-compressed");
        return saved === "true";
    });

    useEffect(() => {
        localStorage.setItem("sidebar-compressed", isCompressed);
        if (isCompressed) {
            document.body.classList.add("sidebar-collapsed");
        } else {
            document.body.classList.remove("sidebar-collapsed");
        }
    }, [isCompressed]);

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
        setShowLogoutModal(false);

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        toast.success("Você saiu da sua conta.");
        navigate("/");
    }

    function getIniciais(nome) {
        if (!nome) return "US";
        const partes = nome.trim().split(" ");
        if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
        return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
    }

    function getNomeFormatado(nome) {
        if (!nome) return ["Usuário"];
        const partes = nome.trim().split(" ");
        if (partes.length === 1) return [partes[0]];
        return [partes[0], partes[partes.length - 1]];
    }

    return (
        <>
            <section className={`sidebar ${isCompressed ? "collapsed" : ""}`}>
                <div className="sidebar-top">
                    <div className="sidebar-brand">
                        {!isCompressed && (
                            <img src={Logo} alt="Logo StockControl" className="sidebar-logo" />
                        )}
                        <button 
                            className="sidebar-toggle-btn" 
                            onClick={() => setIsCompressed(!isCompressed)}
                            title={isCompressed ? "Expandir" : "Recolher"}
                        >
                            <img 
                                src="https://img.icons8.com/?size=20&id=59832&format=png&color=ffffff" 
                                alt="Toggle Menu" 
                            />
                        </button>
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
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <hr />

                    <button 
                        className="logout-wrapper"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <img
                            src="https://img.icons8.com/?size=20&id=22112&format=png&color=ffffff"
                            alt="Ícone de sair"
                            className="logout-icon"
                        />
                        <span className="logout-button">
                            Sair
                        </span>
                    </button>

                    <button className="user-box" onClick={() => navigate("/profile")}>
                        <div className="user-avatar">{getIniciais(userData.nome_usuario)}</div>
                        <div className="user-info">
                            <div className="user-name-lines">
                                {getNomeFormatado(userData.nome_usuario).map((linha, index) => (
                                    <strong key={index}>{linha}</strong>
                                ))}
                            </div>
                            <span>{userData.nome_empresa || "Empresa"}</span>
                        </div>
                    </button>
                </div>
            </section>

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </>
    );
}

export default SideBar;