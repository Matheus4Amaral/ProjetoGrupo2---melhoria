import './CardResumo.css';

export default function CardResumo({
    title,
    value,
    icon,
    supportingText,
    tone = "neutral",
}) {
    return(
        <article className={`card-resumo card-resumo--${tone}`}>
            {icon && <div className="card-resumo-icon">{icon}</div>}
            <h3 className="card-titulo">{title}</h3>
            <p className="card-valor">{value ?? 0}</p>
            {supportingText && (
                <p className="card-supporting-text">{supportingText}</p>
            )}
        </article>
    );
}
