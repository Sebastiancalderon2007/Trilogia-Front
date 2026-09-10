import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchIngredientes,
  crearIngrediente,
  actualizarIngrediente,
  eliminarIngrediente,
  reactivarIngrediente,
  registrarMovimiento,
} from '../slices/ingredientesSlice.js';
import Table from '../../../shared/components/Table/Table.jsx';
import Modal from '../../../shared/components/Modal/Modal.jsx';
import Buscador from '../../../shared/components/Buscador/Buscador.jsx';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog.jsx';
import { coincide } from '../../../shared/utils/texto.js';
import { bajoStock } from '../../../shared/utils/inventario.js';
import { notificar } from '../../../shared/slices/uiSlice.js';

const UNIDADES = [
  { value: 'g', label: 'Gramos (g)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'und', label: 'Unidad' },
];

const VACIO = { codigo: '', nombre: '', categoria: '', unidadMedida: 'g', stockActual: 0, stockMinimo: 0, costoUnitario: 0 };

export default function InventarioPage() {
  const dispatch = useDispatch();
  const { lista } = useSelector((state) => state.ingredientes);
  const esAdmin = useSelector((state) => state.auth.usuario?.rol === 'ADMIN');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);
  const [ingredienteMovimiento, setIngredienteMovimiento] = useState(null);
  const [movimiento, setMovimiento] = useState({ tipo: 'ENTRADA', motivo: 'COMPRA', cantidad: '', nota: '' });
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('activos');
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => {
    dispatch(fetchIngredientes());
  }, [dispatch]);

  const abrirNuevo = () => {
    setEditando(null);
    setForm(VACIO);
    setModalAbierto(true);
  };

  const abrirEditar = (ingrediente) => {
    setEditando(ingrediente);
    setForm({
      codigo: ingrediente.codigo || '',
      nombre: ingrediente.nombre,
      categoria: ingrediente.categoria || '',
      unidadMedida: ingrediente.unidadMedida,
      stockActual: ingrediente.stockActual,
      stockMinimo: ingrediente.stockMinimo,
      costoUnitario: ingrediente.costoUnitario,
    });
    setModalAbierto(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      codigo: form.codigo || null,
      categoria: form.categoria || null,
      stockActual: Number(form.stockActual),
      stockMinimo: Number(form.stockMinimo),
      costoUnitario: Number(form.costoUnitario),
    };
    if (editando) {
      await dispatch(actualizarIngrediente({ id: editando.id, payload }));
    } else {
      await dispatch(crearIngrediente(payload));
    }
    setModalAbierto(false);
  };

  const eliminar = (ingrediente) => {
    setConfirmando({
      mensaje: `¿Desactivar "${ingrediente.nombre}"?`,
      onConfirmar: () => {
        dispatch(eliminarIngrediente(ingrediente.id));
        dispatch(notificar(`${ingrediente.nombre} desactivado`, 'exito'));
      },
    });
  };

  const reactivar = (ingrediente) => {
    setConfirmando({
      mensaje: `¿Reactivar "${ingrediente.nombre}"?`,
      onConfirmar: () => {
        dispatch(reactivarIngrediente(ingrediente.id));
        dispatch(notificar(`${ingrediente.nombre} reactivado`, 'exito'));
      },
    });
  };

  const guardarMovimiento = async (e) => {
    e.preventDefault();
    await dispatch(
      registrarMovimiento({
        id: ingredienteMovimiento.id,
        payload: { ...movimiento, cantidad: Number(movimiento.cantidad) },
      })
    );
    setIngredienteMovimiento(null);
    setMovimiento({ tipo: 'ENTRADA', motivo: 'COMPRA', cantidad: '', nota: '' });
  };

  const columnas = [
    { key: 'codigo', header: 'Código', render: (f) => f.codigo || '—' },
    { key: 'nombre', header: 'Insumo' },
    { key: 'categoria', header: 'Categoría', render: (f) => f.categoria || '—' },
    {
      key: 'stockActual',
      header: 'Stock',
      render: (f) => {
        const bajo = bajoStock(f);
        return (
          <span className={bajo ? 'badge badge-rojo' : ''}>
            {Number(f.stockActual)} {f.unidadMedida}
          </span>
        );
      },
    },
    { key: 'stockMinimo', header: 'Mínimo', render: (f) => `${Number(f.stockMinimo)} ${f.unidadMedida}` },
    { key: 'costoUnitario', header: `Costo/unidad`, render: (f) => `$${Number(f.costoUnitario).toLocaleString('es-CO')}` },
    {
      key: 'estado',
      header: 'Estado',
      render: (f) => <span className={`badge ${f.activo ? 'badge-verde' : 'badge-gris'}`}>{f.activo ? 'Activo' : 'Inactivo'}</span>,
    },
    {
      key: 'acciones',
      header: '',
      render: (f) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-secundario btn-sm" onClick={() => setIngredienteMovimiento(f)}>
            Mover stock
          </button>
          {esAdmin && (
            <>
              <button className="btn btn-secundario btn-sm" onClick={() => abrirEditar(f)}>
                Editar
              </button>
              {f.activo ? (
                <button className="btn btn-peligro btn-sm" onClick={() => eliminar(f)}>
                  Desactivar
                </button>
              ) : (
                <button className="btn btn-secundario btn-sm" onClick={() => reactivar(f)}>
                  Reactivar
                </button>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const insumosBajoStock = lista.filter((i) => i.activo && bajoStock(i));
  const listaFiltradaEstado = lista.filter((i) =>
    filtroEstado === 'todos' ? true : filtroEstado === 'activos' ? i.activo : !i.activo
  );

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Inventario</h1>
        {esAdmin && (
          <button className="btn btn-primario" onClick={abrirNuevo}>
            + Nuevo insumo
          </button>
        )}
      </div>

      {insumosBajoStock.length > 0 && (
        <div className="alerta-stock">
          ⚠ {insumosBajoStock.length} insumo(s) por debajo del stock mínimo:{' '}
          {insumosBajoStock.slice(0, 6).map((i) => i.nombre).join(', ')}
          {insumosBajoStock.length > 6 && ` y ${insumosBajoStock.length - 6} más`}
        </div>
      )}

      <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar insumo o categoría…" />

      <div className="panel" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {[
          { key: 'activos', label: 'Activos' },
          { key: 'inactivos', label: 'Inactivos' },
          { key: 'todos', label: 'Todos' },
        ].map((e) => (
          <button
            key={e.key}
            className={`btn btn-sm ${filtroEstado === e.key ? 'btn-amarillo' : 'btn-secundario'}`}
            onClick={() => setFiltroEstado(e.key)}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <Table
          columnas={columnas}
          filas={listaFiltradaEstado.filter((i) => coincide(i.nombre, busqueda) || coincide(i.categoria, busqueda))}
          vacio="No hay insumos registrados"
        />
      </div>

      {modalAbierto && (
        <Modal titulo={editando ? 'Editar insumo' : 'Nuevo insumo'} onCerrar={() => setModalAbierto(false)}>
          <form onSubmit={guardar}>
            <div className="form-grid">
              <div className="campo">
                <label>Código (opcional)</label>
                <input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} />
              </div>
              <div className="campo">
                <label>Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Categoría (opcional)</label>
                <input value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
              </div>
              <div className="campo">
                <label>Unidad de medida</label>
                <select value={form.unidadMedida} onChange={(e) => setForm({ ...form, unidadMedida: e.target.value })}>
                  {UNIDADES.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label>Stock actual</label>
                <input type="number" step="0.01" value={form.stockActual} onChange={(e) => setForm({ ...form, stockActual: e.target.value })} />
              </div>
              <div className="campo">
                <label>Stock mínimo (alerta)</label>
                <input type="number" step="0.01" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
              </div>
              <div className="campo">
                <label>Costo por unidad ($)</label>
                <input type="number" step="0.01" value={form.costoUnitario} onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })} />
              </div>
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

      {ingredienteMovimiento && (
        <Modal titulo={`Movimiento de stock: ${ingredienteMovimiento.nombre}`} onCerrar={() => setIngredienteMovimiento(null)}>
          <form onSubmit={guardarMovimiento}>
            <div className="form-grid">
              <div className="campo">
                <label>Tipo</label>
                <select value={movimiento.tipo} onChange={(e) => setMovimiento({ ...movimiento, tipo: e.target.value })}>
                  <option value="ENTRADA">Entrada (compra/reposición)</option>
                  <option value="SALIDA">Salida (merma/uso manual)</option>
                  <option value="AJUSTE">Ajuste de conteo</option>
                </select>
              </div>
              <div className="campo">
                <label>Motivo</label>
                <select value={movimiento.motivo} onChange={(e) => setMovimiento({ ...movimiento, motivo: e.target.value })}>
                  <option value="COMPRA">Compra</option>
                  <option value="MERMA">Merma</option>
                  <option value="AJUSTE_MANUAL">Ajuste manual</option>
                </select>
              </div>
              <div className="campo">
                <label>Cantidad ({ingredienteMovimiento.unidadMedida})</label>
                <input type="number" step="0.01" value={movimiento.cantidad} onChange={(e) => setMovimiento({ ...movimiento, cantidad: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Nota (opcional)</label>
                <input value={movimiento.nota} onChange={(e) => setMovimiento({ ...movimiento, nota: e.target.value })} />
              </div>
            </div>
            <div className="acciones-form">
              <button type="button" className="btn btn-secundario" onClick={() => setIngredienteMovimiento(null)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario">
                Registrar
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog pendiente={confirmando} onCancelar={() => setConfirmando(null)} />
    </div>
  );
}
