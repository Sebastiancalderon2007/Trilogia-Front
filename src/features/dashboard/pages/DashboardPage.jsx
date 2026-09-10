import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import { FiDollarSign, FiShoppingBag, FiUsers, FiCreditCard, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { dashboardService } from '../services/dashboardService.js';
import './DashboardPage.css';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
const moneyCorto = (n) => {
  const v = Number(n || 0);
  if (Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
  if (Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}k`;
  return `$${v}`;
};

const PERIODOS = [
  { key: 'hoy', label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes', label: 'Este mes' },
];

function TarjetaStat({ icono: Icono, color, label, valor }) {
  return (
    <div className="stat-card">
      <div className="stat-icono" style={{ background: `${color}22`, color }}>
        <Icono size={20} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-valor">{valor}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [periodo, setPeriodo] = useState('hoy');
  const [datosSerie, setDatosSerie] = useState(null);

  useEffect(() => {
    dashboardService
      .resumen()
      .then(setResumen)
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    setDatosSerie(null);
    dashboardService.serie(periodo).then(setDatosSerie);
  }, [periodo]);

  if (cargando) return <div className="pagina">Cargando…</div>;
  if (!resumen) return <div className="pagina">No se pudo cargar el resumen.</div>;

  const datos = resumen[periodo];
  const serieGrafico = (datosSerie?.serieVentas || []).map((d) => ({
    ...d,
    etiqueta: new Date(d.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }),
  }));
  const topProductos = datosSerie?.topProductos || [];

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Resumen del negocio</h1>
      </div>

      {resumen.alertasStock.length > 0 && (
        <details className="alerta-stock alerta-stock-detalle">
          <summary>⚠ {resumen.alertasStock.length} insumo(s) por debajo del stock mínimo — ver detalle</summary>
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

      <div className="periodo-tabs">
        {PERIODOS.map((p) => (
          <button
            key={p.key}
            className={`periodo-tab ${periodo === p.key ? 'activo' : ''}`}
            onClick={() => setPeriodo(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <TarjetaStat icono={FiDollarSign} color="#d32f2f" label="Ventas" valor={money(datos.totalVentas)} />
        <TarjetaStat icono={FiShoppingBag} color="#e0a800" label="Pedidos" valor={datos.totalPedidos} />
        <TarjetaStat icono={FiUsers} color="#111111" label="Nómina" valor={money(datos.totalNomina)} />
        <TarjetaStat icono={FiCreditCard} color="#111111" label="Gastos" valor={money(datos.totalGastos)} />
        <TarjetaStat
          icono={datos.utilidadEstimada >= 0 ? FiTrendingUp : FiAlertTriangle}
          color={datos.utilidadEstimada >= 0 ? '#2e7d32' : '#d32f2f'}
          label="Utilidad estimada"
          valor={money(datos.utilidadEstimada)}
        />
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Ventas por día ({PERIODOS.find((p) => p.key === periodo).label.toLowerCase()})</h3>
        {serieGrafico.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={serieGrafico} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={moneyCorto} tick={{ fontSize: 12 }} width={55} />
              <Tooltip formatter={(v) => money(v)} labelFormatter={(l) => `Día ${l}`} />
              <Line type="monotone" dataKey="total" stroke="#d32f2f" strokeWidth={2.5} dot={{ r: 3 }} name="Ventas" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: 'var(--text-secundario)' }}>Cargando gráfico…</p>
        )}
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Productos más vendidos</h3>
        {topProductos.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(180, topProductos.length * 45)}>
            <BarChart data={topProductos} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="nombre" width={150} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v} unidades`} />
              <Bar dataKey="cantidad" fill="#ffc72c" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ color: 'var(--text-secundario)' }}>No hay ventas en este período todavía.</p>
        )}
      </div>
    </div>
  );
}
