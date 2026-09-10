import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService.js';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

function BloquePeriodo({ titulo, datos }) {
  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>{titulo}</h3>
      <div className="grid-cards" style={{ marginBottom: 0 }}>
        <div className="card-stat">
          <div className="label">Ventas</div>
          <div className="valor">{money(datos.totalVentas)}</div>
        </div>
        <div className="card-stat amarillo">
          <div className="label">Pedidos</div>
          <div className="valor">{datos.totalPedidos}</div>
        </div>
        <div className="card-stat negro">
          <div className="label">Nómina</div>
          <div className="valor">{money(datos.totalNomina)}</div>
        </div>
        <div className="card-stat negro">
          <div className="label">Gastos</div>
          <div className="valor">{money(datos.totalGastos)}</div>
        </div>
        <div className="card-stat" style={{ borderLeftColor: datos.utilidadEstimada >= 0 ? '#2e7d32' : 'var(--color-rojo)' }}>
          <div className="label">Utilidad estimada</div>
          <div className="valor">{money(datos.utilidadEstimada)}</div>
        </div>
      </div>
      {datos.productoMasVendido && (
        <p style={{ marginTop: '0.9rem', fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
          Producto más vendido: <strong>{datos.productoMasVendido.nombre}</strong> ({datos.productoMasVendido.cantidad} unidades)
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService
      .resumen()
      .then(setResumen)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="pagina">Cargando…</div>;
  if (!resumen) return <div className="pagina">No se pudo cargar el resumen.</div>;

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Resumen del negocio</h1>
      </div>

      {resumen.alertasStock.length > 0 && (
        <details className="alerta-stock alerta-stock-detalle">
          <summary>
            ⚠ {resumen.alertasStock.length} insumo(s) por debajo del stock mínimo — ver detalle
          </summary>
          <ul>
            {resumen.alertasStock.map((a) => (
              <li key={a.id}>
                {a.nombre}: quedan {a.stockActual} (mínimo {a.stockMinimo})
              </li>
            ))}
          </ul>
          <Link to="/inventario">Ir a Inventario →</Link>
        </details>
      )}

      <BloquePeriodo titulo="Hoy" datos={resumen.hoy} />
      <BloquePeriodo titulo="Esta semana" datos={resumen.semana} />
      <BloquePeriodo titulo="Este mes" datos={resumen.mes} />
    </div>
  );
}
