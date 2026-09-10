import './Table.css';

// Tabla genérica: columnas = [{ key, header, render? }]. `render(fila)` es
// opcional; por defecto muestra fila[key].
export default function Table({ columnas, filas, claveFila = 'id', vacio = 'Sin registros' }) {
  if (!filas || filas.length === 0) {
    return <div className="estado-vacio">{vacio}</div>;
  }

  return (
    <div className="tabla-wrap">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila[claveFila]}>
              {columnas.map((col) => (
                <td key={col.key} data-label={col.header}>
                  {col.render ? col.render(fila) : fila[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
