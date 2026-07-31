import { useState, useEffect } from 'react';
import "./Header.css"

function Header({ title, buttonText, onButtonClick }){
    const [greeting, setGreeting] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');

        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (usuario && (usuario.nome_usuario || usuario.nome)) {
                const nomeParaExibir = usuario.nome_usuario || usuario.nome;
                setUserName(nomeParaExibir.split(' ')[0]);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    return(
        <>
            <header className="page-header">
                <div className="header-title-container">
                    <h1 className="page-title">{title}</h1>
                    {userName && (
                        <span className="header-greeting">{greeting}, {userName}!</span>
                    )}
                </div>
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