import './Modal.css';

export default function Modal({ titulo, onCerrar, children, ancho }) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-caja" style={ancho ? { maxWidth: ancho } : undefined} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titulo}</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
