import { useSelector } from 'react-redux';
import './ConectandoBanner.css';

export default function ConectandoBanner() {
  const conectando = useSelector((state) => state.ui.conectando);
  if (!conectando) return null;

  return (
    <div className="conectando-banner">
      <span className="conectando-spinner" />
      Conectando con el servidor… puede tardar hasta un minuto si nadie lo ha usado en un rato.
    </div>
  );
}
