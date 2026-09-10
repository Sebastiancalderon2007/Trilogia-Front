import Modal from '../Modal/Modal.jsx';

// Reemplazo de window.confirm(): en algunos navegadores/webviews el diálogo
// nativo se comporta de forma inconsistente (o queda suprimido), además de
// verse poco cuidado. `pendiente` es { mensaje, onConfirmar } o null.
export default function ConfirmDialog({ pendiente, onCancelar, textoConfirmar = 'Confirmar' }) {
  if (!pendiente) return null;

  return (
    <Modal titulo="Confirmar" onCerrar={onCancelar} ancho="380px">
      <p style={{ marginTop: 0 }}>{pendiente.mensaje}</p>
      <div className="acciones-form">
        <button className="btn btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button
          className="btn btn-peligro"
          onClick={() => {
            pendiente.onConfirmar();
            onCancelar();
          }}
        >
          {textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}
