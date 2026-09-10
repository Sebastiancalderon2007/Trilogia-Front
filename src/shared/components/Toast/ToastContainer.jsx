import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { quitarNotificacion } from '../../slices/uiSlice.js';
import './Toast.css';

function ToastItem({ id, mensaje, tipo }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const t = setTimeout(() => dispatch(quitarNotificacion(id)), 4500);
    return () => clearTimeout(t);
  }, [id, dispatch]);

  return (
    <div className={`toast toast-${tipo}`}>
      <span>{mensaje}</span>
      <button onClick={() => dispatch(quitarNotificacion(id))} aria-label="Cerrar">
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const notificaciones = useSelector((state) => state.ui.notificaciones);
  if (notificaciones.length === 0) return null;

  return (
    <div className="toast-container">
      {notificaciones.map((n) => (
        <ToastItem key={n.id} {...n} />
      ))}
    </div>
  );
}
