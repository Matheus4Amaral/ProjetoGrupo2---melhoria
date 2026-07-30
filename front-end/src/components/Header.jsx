import { LuMenu, LuX } from "react-icons/lu";
import "./Header.css"

function Header({
    title,
    buttonText,
    onButtonClick,
    isMenuOpen = false,
    onMenuToggle,
}){
    return(
            <header className={`page-header ${buttonText ? "has-action" : ""}`}>
                <div className="page-header-title-group">
                    {onMenuToggle && (
                        <button
                            type="button"
                            className="mobile-menu-button"
                            onClick={onMenuToggle}
                            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                            aria-expanded={isMenuOpen}
                            aria-controls="main-sidebar"
                        >
                            {isMenuOpen ? <LuX aria-hidden="true" /> : <LuMenu aria-hidden="true" />}
                        </button>
                    )}
                <h1 className="page-title">{title}</h1>
                </div>
                {buttonText && (
                    <button type="button" className="header-button" onClick={onButtonClick}>
                        <span className="button-icon">+</span>
                        {buttonText}
                    </button>
                )}
            </header>
    );
}

export default Header
