import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductos, crearProducto, actualizarProducto, eliminarProducto } from '../slices/productosSlice.js';
import { fetchIngredientes } from '../../inventario/slices/ingredientesSlice.js';
import { productoService } from '../services/productoService.js';
import Table from '../../../shared/components/Table/Table.jsx';
import Modal from '../../../shared/components/Modal/Modal.jsx';
import Buscador from '../../../shared/components/Buscador/Buscador.jsx';
import { coincide } from '../../../shared/utils/texto.js';
import RecetaItemsEditor from '../components/RecetaItemsEditor.jsx';
import '../components/RecetaItemsEditor.css';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const VACIO = {
  nombre: '',
  tipo: 'PLATO',
  porciones: 1,
  margenErrorPct: 10,
  margenGananciaPct: 45,
  impuestoPct: 8,
  precioVenta: '',
};

export default function ProductosPage() {
  const dispatch = useDispatch();
  const { lista } = useSelector((state) => state.productos);
  const { lista: ingredientes } = useSelector((state) => state.ingredientes);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [items, setItems] = useState([]);
  const [costeo, setCosteo] = useState(null);

  useEffect(() => {
    dispatch(fetchProductos());
    dispatch(fetchIngredientes());
  }, [dispatch]);

  const subpreparaciones = useMemo(() => lista.filter((p) => p.tipo === 'SUBPREPARACION'), [lista]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(VACIO);
    setItems([]);
    setCosteo(null);
    setModalAbierto(true);
  };

  const abrirEditar = async (producto) => {
    setEditando(producto);
    setForm({
      nombre: producto.nombre,
      tipo: producto.tipo,
      porciones: producto.porciones ?? 1,
      margenErrorPct: producto.margenErrorPct,
      margenGananciaPct: producto.margenGananciaPct,
      impuestoPct: producto.impuestoPct,
      precioVenta: producto.precioVenta ?? '',
    });
    setItems(
      producto.recetaItems.map((it) => ({
        origen: it.ingredienteId ? 'ingrediente' : 'subpreparacion',
        ingredienteId: it.ingredienteId || '',
        subpreparacionId: it.subpreparacionId || '',
        cantidad: it.cantidad,
        unidad: it.unidad,
      }))
    );
    setModalAbierto(true);
    try {
      setCosteo(await productoService.costeo(producto.id));
    } catch {
      setCosteo(null);
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    const recetaItems = items.map((it) => ({
      ingredienteId: it.origen === 'ingrediente' ? Number(it.ingredienteId) : null,
      subpreparacionId: it.origen === 'subpreparacion' ? Number(it.subpreparacionId) : null,
      cantidad: Number(it.cantidad),
      unidad: it.unidad,
    }));
    const payload = {
      ...form,
      porciones: Number(form.porciones),
      margenErrorPct: Number(form.margenErrorPct),
      margenGananciaPct: Number(form.margenGananciaPct),
      impuestoPct: Number(form.impuestoPct),
      precioVenta: form.precioVenta === '' ? null : Number(form.precioVenta),
      recetaItems,
    };
    if (editando) {
      await dispatch(actualizarProducto({ id: editando.id, payload }));
    } else {
      await dispatch(crearProducto(payload));
    }
    setModalAbierto(false);
  };

  const eliminar = (producto) => {
    if (confirm(`¿Desactivar "${producto.nombre}"?`)) dispatch(eliminarProducto(producto.id));
  };

  const filas = filtroTipo ? lista.filter((p) => p.tipo === filtroTipo) : lista;

  const columnas = [
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'tipo',
      header: 'Tipo',
      render: (f) => (
        <span className={`badge ${f.tipo === 'SUBPREPARACION' ? 'badge-amarillo' : 'badge-gris'}`}>
          {f.tipo === 'PLATO' ? 'Plato' : f.tipo === 'BEBIDA' ? 'Bebida' : 'Sub-preparación'}
        </span>
      ),
    },
    { key: 'ingredientes', header: 'Ingredientes', render: (f) => f.recetaItems.length },
    { key: 'precioVenta', header: 'Precio de venta', render: (f) => (f.precioVenta ? money(f.precioVenta) : '— sin definir') },
    {
      key: 'acciones',
      header: '',
      render: (f) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-secundario btn-sm" onClick={() => abrirEditar(f)}>
            Editar / Costeo
          </button>
          <button className="btn btn-peligro btn-sm" onClick={() => eliminar(f)}>
            Desactivar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Recetas y productos</h1>
        <button className="btn btn-primario" onClick={abrirNuevo}>
          + Nuevo producto
        </button>
      </div>

      <div className="panel" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['', 'PLATO', 'BEBIDA', 'SUBPREPARACION'].map((t) => (
          <button
            key={t || 'todos'}
            className={`btn btn-sm ${filtroTipo === t ? 'btn-primario' : 'btn-secundario'}`}
            onClick={() => setFiltroTipo(t)}
          >
            {t === '' ? 'Todos' : t === 'PLATO' ? 'Platos' : t === 'BEBIDA' ? 'Bebidas' : 'Sub-preparaciones'}
          </button>
        ))}
      </div>

      <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar producto…" />

      <div className="panel">
        <Table
          columnas={columnas}
          filas={filas.filter((p) => p.activo && coincide(p.nombre, busqueda))}
          vacio="No hay productos registrados"
        />
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? 'Editar producto' : 'Nuevo producto'} onCerrar={() => setModalAbierto(false)} ancho="720px">
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="campo">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Tipo</label>
                <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
                  <option value="PLATO">Plato</option>
                  <option value="BEBIDA">Bebida</option>
                  <option value="SUBPREPARACION">Sub-preparación</option>
                </select>
              </div>
              <div className="campo">
                <label>Rendimiento (porciones o gramos que produce)</label>
                <input type="number" step="0.01" value={form.porciones} onChange={(e) => setForm({ ...form, porciones: e.target.value })} />
              </div>
              <div className="campo">
                <label>Precio de venta real ($)</label>
                <input type="number" step="1" value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: e.target.value })} placeholder="Ej: 19500" />
              </div>
              <div className="campo">
                <label>Margen de error (%)</label>
                <input type="number" step="0.1" value={form.margenErrorPct} onChange={(e) => setForm({ ...form, margenErrorPct: e.target.value })} />
              </div>
              <div className="campo">
                <label>% Costo materia prima objetivo</label>
                <input type="number" step="0.1" value={form.margenGananciaPct} onChange={(e) => setForm({ ...form, margenGananciaPct: e.target.value })} />
              </div>
              <div className="campo">
                <label>Impuesto al consumo (%)</label>
                <input type="number" step="0.1" value={form.impuestoPct} onChange={(e) => setForm({ ...form, impuestoPct: e.target.value })} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', marginBottom: 0 }}>Receta</h3>
            <RecetaItemsEditor
              items={items}
              onChange={setItems}
              ingredientes={ingredientes.filter((i) => i.activo)}
              subpreparaciones={subpreparaciones}
              productoIdActual={editando?.id}
            />

            {costeo && (
              <div className="panel" style={{ background: 'var(--bg-app)', boxShadow: 'none', border: '1px solid var(--border-color)' }}>
                <strong>Costeo calculado</strong>
                <p style={{ margin: '0.4rem 0', fontSize: '0.85rem', color: 'var(--text-secundario)' }}>
                  Costo ingredientes: {money(costeo.costoIngredientes)} · Costo preparación: {money(costeo.costoTotalPreparacion)} · Costo por
                  porción: {money(costeo.costoPorPorcion)} · Precio sugerido: <strong>{money(costeo.precioSugerido)}</strong>
                </p>
              </div>
            )}

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
