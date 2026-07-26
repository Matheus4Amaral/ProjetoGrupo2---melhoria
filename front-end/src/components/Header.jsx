import "./Header.css"

function Header({ title, buttonText, onButtonClick }){
    return(
        <>
            <header className="page-header">
                <h1 className="page-title">{title}</h1>
                {buttonText && (
                    <button className="header-button" onClick={onButtonClick}>
                        <span className="button-icon">+</span>
                        {buttonText}
                    </button>
                )}
            </header>
        </>
    );
}

export default Header