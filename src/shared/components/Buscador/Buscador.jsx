import './Buscador.css';

export default function Buscador({ valor, onChange, placeholder = 'Buscar…' }) {
  return (
    <input
      className="buscador"
      type="search"
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}
