import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEmpleados,
  crearEmpleado,
  actualizarEmpleado,
  eliminarEmpleado,
  fetchTurnos,
  crearTurno,
  eliminarTurno,
} from '../slices/empleadosSlice.js';
import Table from '../../../shared/components/Table/Table.jsx';
import Modal from '../../../shared/components/Modal/Modal.jsx';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const EMPLEADO_VACIO = { nombre: '', telefono: '', valorHora: '' };
const TURNO_VACIO = { empleadoId: '', fecha: '', horaIngreso: '', horaSalida: '', propina: 0, deducciones: 0, notaDeduccion: '' };

export default function EmpleadosPage() {
  const dispatch = useDispatch();
  const { lista: empleados, turnos } = useSelector((state) => state.empleados);
  const [tab, setTab] = useState('empleados');

  const [modalEmpleado, setModalEmpleado] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formEmpleado, setFormEmpleado] = useState(EMPLEADO_VACIO);

  const [modalTurno, setModalTurno] = useState(false);
  const [formTurno, setFormTurno] = useState(TURNO_VACIO);
  const [errorTurno, setErrorTurno] = useState(null);

  useEffect(() => {
    dispatch(fetchEmpleados());
    dispatch(fetchTurnos());
  }, [dispatch]);

  const abrirNuevoEmpleado = () => {
    setEditando(null);
    setFormEmpleado(EMPLEADO_VACIO);
    setModalEmpleado(true);
  };

  const abrirEditarEmpleado = (empleado) => {
    setEditando(empleado);
    setFormEmpleado({ nombre: empleado.nombre, telefono: empleado.telefono || '', valorHora: empleado.valorHora });
    setModalEmpleado(true);
  };

  const guardarEmpleado = async (e) => {
    e.preventDefault();
    const payload = { ...formEmpleado, valorHora: Number(formEmpleado.valorHora) };
    if (editando) await dispatch(actualizarEmpleado({ id: editando.id, payload }));
    else await dispatch(crearEmpleado(payload));
    setModalEmpleado(false);
  };

  const desactivarEmpleado = (empleado) => {
    if (confirm(`¿Desactivar a ${empleado.nombre}?`)) dispatch(eliminarEmpleado(empleado.id));
  };

  const guardarTurno = async (e) => {
    e.preventDefault();
    setErrorTurno(null);
    const resultado = await dispatch(crearTurno({ ...formTurno, empleadoId: Number(formTurno.empleadoId) }));
    if (crearTurno.rejected.match(resultado)) {
      setErrorTurno(resultado.payload);
      return;
    }
    setModalTurno(false);
    setFormTurno(TURNO_VACIO);
  };

  const columnasEmpleados = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'telefono', header: 'Teléfono', render: (f) => f.telefono || '—' },
    { key: 'valorHora', header: 'Valor hora', render: (f) => money(f.valorHora) },
    {
      key: 'acciones',
      header: '',
      render: (f) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-secundario btn-sm" onClick={() => abrirEditarEmpleado(f)}>
            Editar
          </button>
          <button className="btn btn-peligro btn-sm" onClick={() => desactivarEmpleado(f)}>
            Desactivar
          </button>
        </div>
      ),
    },
  ];

  const columnasTurnos = [
    { key: 'empleado', header: 'Empleado', render: (f) => f.empleado.nombre },
    { key: 'fecha', header: 'Fecha', render: (f) => new Date(f.fecha).toLocaleDateString('es-CO') },
    { key: 'horario', header: 'Horario', render: (f) => `${f.horaIngreso} – ${f.horaSalida}` },
    { key: 'horasTrabajadas', header: 'Horas', render: (f) => Number(f.horasTrabajadas) },
    { key: 'propina', header: 'Propina', render: (f) => money(f.propina) },
    { key: 'deducciones', header: 'Deducciones', render: (f) => money(f.deducciones) },
    { key: 'totalPagar', header: 'Total a pagar', render: (f) => <strong>{money(f.totalPagar)}</strong> },
    {
      key: 'acciones',
      header: '',
      render: (f) => (
        <button className="btn btn-peligro btn-sm" onClick={() => confirm('¿Eliminar turno?') && dispatch(eliminarTurno(f.id))}>
          Eliminar
        </button>
      ),
    },
  ];

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Empleados y nómina</h1>
        {tab === 'empleados' ? (
          <button className="btn btn-primario" onClick={abrirNuevoEmpleado}>
            + Nuevo empleado
          </button>
        ) : (
          <button className="btn btn-primario" onClick={() => setModalTurno(true)}>
            + Registrar turno
          </button>
        )}
      </div>

      <div className="panel" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className={`btn btn-sm ${tab === 'empleados' ? 'btn-primario' : 'btn-secundario'}`} onClick={() => setTab('empleados')}>
          Empleados
        </button>
        <button className={`btn btn-sm ${tab === 'turnos' ? 'btn-primario' : 'btn-secundario'}`} onClick={() => setTab('turnos')}>
          Turnos / Pagos
        </button>
      </div>

      <div className="panel">
        {tab === 'empleados' ? (
          <Table columnas={columnasEmpleados} filas={empleados.filter((e) => e.activo)} vacio="No hay empleados registrados" />
        ) : (
          <Table columnas={columnasTurnos} filas={turnos} vacio="No hay turnos registrados" />
        )}
      </div>

      {modalEmpleado && (
        <Modal titulo={editando ? 'Editar empleado' : 'Nuevo empleado'} onCerrar={() => setModalEmpleado(false)}>
          <form onSubmit={guardarEmpleado}>
            <div className="campo">
              <label>Nombre</label>
              <input value={formEmpleado.nombre} onChange={(e) => setFormEmpleado({ ...formEmpleado, nombre: e.target.value })} required />
            </div>
            <div className="campo">
              <label>Teléfono (opcional)</label>
              <input value={formEmpleado.telefono} onChange={(e) => setFormEmpleado({ ...formEmpleado, telefono: e.target.value })} />
            </div>
            <div className="campo">
              <label>Valor por hora ($)</label>
              <input type="number" step="0.01" value={formEmpleado.valorHora} onChange={(e) => setFormEmpleado({ ...formEmpleado, valorHora: e.target.value })} required />
            </div>
            <div className="acciones-form">
              <button type="button" className="btn btn-secundario" onClick={() => setModalEmpleado(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primario">
                Guardar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalTurno && (
        <Modal titulo="Registrar turno" onCerrar={() => setModalTurno(false)}>
          <form onSubmit={guardarTurno}>
            <div className="form-grid">
              <div className="campo">
                <label>Empleado</label>
                <select value={formTurno.empleadoId} onChange={(e) => setFormTurno({ ...formTurno, empleadoId: e.target.value })} required>
                  <option value="">Elegir…</option>
                  {empleados.filter((e) => e.activo).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label>Fecha</label>
                <input type="date" value={formTurno.fecha} onChange={(e) => setFormTurno({ ...formTurno, fecha: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Hora de ingreso</label>
                <input type="time" value={formTurno.horaIngreso} onChange={(e) => setFormTurno({ ...formTurno, horaIngreso: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Hora de salida</label>
                <input type="time" value={formTurno.horaSalida} onChange={(e) => setFormTurno({ ...formTurno, horaSalida: e.target.value })} required />
              </div>
              <div className="campo">
                <label>Propina</label>
                <input type="number" step="0.01" value={formTurno.propina} onChange={(e) => setFormTurno({ ...formTurno, propina: e.target.value })} />
              </div>
              <div className="campo">
                <label>Deducciones</label>
                <input type="number" step="0.01" value={formTurno.deducciones} onChange={(e) => setFormTurno({ ...formTurno, deducciones: e.target.value })} />
              </div>
            </div>
            <div className="campo">
              <label>Nota de deducción (opcional)</label>
              <input value={formTurno.notaDeduccion} onChange={(e) => setFormTurno({ ...formTurno, notaDeduccion: e.target.value })} placeholder="Ej: -12000 patacón" />
            </div>
            {errorTurno && <div className="alerta-stock">{errorTurno}</div>}
            <div className="acciones-form">
              <button type="button" className="btn btn-secundario" onClick={() => setModalTurno(false)}>
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
