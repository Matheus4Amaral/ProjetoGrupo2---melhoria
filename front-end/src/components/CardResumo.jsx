import React from 'react';
import './CardResumo.css';

export default function CardResumo({ title, value }) {
    return(
        <div className="card-resumo">
            <h3 className="card-titulo">{title}</h3>
            <p className="card-valor">{value ?? 0}</p>
        </div>
    );
}
