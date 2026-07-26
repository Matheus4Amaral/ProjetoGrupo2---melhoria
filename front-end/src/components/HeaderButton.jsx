import "./HeaderButton.css"

function HeaderButton({ title, button }){
    return(
        <>
            <header className="page-header-button">
                <h1 className="page-title">{title}</h1>
                <div className="button">
                <button className="button-title" type="button">{button}</button>
                </div>
            </header>
        </>
    );
}

export default HeaderButton 