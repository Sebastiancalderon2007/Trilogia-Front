import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGastos, crearGasto, eliminarGasto } from '../slices/gastosSlice.js';
import Table from '../../../shared/components/Table/Table.jsx';
import Modal from '../../../shared/components/Modal/Modal.jsx';
import Buscador from '../../../shared/components/Buscador/Buscador.jsx';
import { coincide } from '../../../shared/utils/texto.js';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
const VACIO = { categoria: '', descripcion: '', valor: '', fecha: new Date().toISOString().slice(0, 10) };

export default function GastosPage() {
  const dispatch = useDispatch();
  const { lista } = useSelector((state) => state.gastos);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState(VACIO);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    dispatch(fetchGastos());
  }, [dispatch]);

  const guardar = async (e) => {
    e.preventDefault();
    await dispatch(crearGasto({ ...form, categoria: form.categoria || null, valor: Number(form.valor) }));
    setForm(VACIO);
    setModalAbierto(false);
  };

  const totalPeriodo = lista.reduce((acc, g) => acc + Number(g.valor), 0);

  const columnas = [
    { key: 'fecha', header: 'Fecha', render: (f) => new Date(f.fecha).toLocaleDateString('es-CO') },
    { key: 'categoria', header: 'Categoría', render: (f) => f.categoria || '—' },
    { key: 'descripcion', header: 'Descripción' },
    { key: 'valor', header: 'Valor', render: (f) => money(f.valor) },
    {
      key: 'acciones',
      header: '',
      render: (f) => (
        <button className="btn btn-peligro btn-sm" onClick={() => confirm('¿Eliminar gasto?') && dispatch(eliminarGasto(f.id))}>
          Eliminar
        </button>
      ),
    },
  ];

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Gastos</h1>
        <button className="btn btn-primario" onClick={() => setModalAbierto(true)}>
          + Nuevo gasto
        </button>
      </div>

      <div className="card-stat negro" style={{ marginBottom: '1.25rem', maxWidth: 240 }}>
        <div className="label">Total registrado</div>
        <div className="valor">{money(totalPeriodo)}</div>
      </div>

      <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por descripción o categoría…" />

      <div className="panel">
        <Table
          columnas={columnas}
          filas={lista.filter((g) => coincide(g.descripcion, busqueda) || coincide(g.categoria, busqueda))}
          vacio="No hay gastos registrados"
        />
      </div>

      {modalAbierto && (
        <Modal titulo="Nuevo gasto" onCerrar={() => setModalAbierto(false)}>
          <form onSubmit={guardar}>
            <div className="campo">
              <label>Categoría (opcional)</label>
              <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} placeholder="Ej: equipos, insumos, servicios" />
            </div>
            <div className="campo">
              <label>Descripción</label>
              <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
            </div>
            <div className="campo">
              <label>Valor ($)</label>
              <input type="number" step="1" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
            </div>
            <div className="campo">
              <label>Fecha</label>
              <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
            </div>
            <div className="acciones-form">
              <button type="button" className="btn btn-secundario" onClick={() => setModalAbierto(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
