import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPedidos, actualizarEstadoPedido, actualizarPedido } from '../slices/pedidosSlice.js';
import { fetchProductos } from '../../productos/slices/productosSlice.js';
import Table from '../../../shared/components/Table/Table.jsx';
import Modal from '../../../shared/components/Modal/Modal.jsx';
import Buscador from '../../../shared/components/Buscador/Buscador.jsx';
import { coincide } from '../../../shared/utils/texto.js';
import { generarReciboPedido } from '../../../shared/utils/generarRecibo.js';
import { linkConfirmacionWhatsApp } from '../../../shared/utils/whatsapp.js';
import { notificar } from '../../../shared/slices/uiSlice.js';
import PedidoForm from '../components/PedidoForm.jsx';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const ESTADO_BADGE = {
  PENDIENTE: 'badge-amarillo',
  EN_PREPARACION: 'badge-amarillo',
  ENTREGADO: 'badge-verde',
  CANCELADO: 'badge-rojo',
};

const ENTREGA_LABEL = {
  DOMICILIO: 'Domicilio',
  RECOGE_TIENDA: 'Recoge en tienda',
  EN_LOCAL: 'En el local',
};

const FORMA_PAGO_LABEL = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  OTRO: 'Otro',
};

const ESTADOS_EDITABLES = ['PENDIENTE', 'EN_PREPARACION'];

export default function PedidosPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lista } = useSelector((state) => state.pedidos);
  const { lista: productos } = useSelector((state) => state.productos);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    dispatch(fetchPedidos());
    dispatch(fetchProductos());
  }, [dispatch]);

  const guardarEdicion = async (datos) => {
    const resultado = await dispatch(actualizarPedido({ id: editando.id, payload: datos }));
    if (actualizarPedido.rejected.match(resultado)) {
      throw new Error(resultado.payload || 'No se pudo actualizar el pedido');
    }
    const alertas = resultado.payload.alertasStock;
    if (alertas?.length) {
      dispatch(notificar('Pedido actualizado. Quedaron bajos de stock: ' + alertas.map((a) => a.nombre).join(', '), 'advertencia'));
    } else {
      dispatch(notificar('Pedido actualizado', 'exito'));
    }
    setEditando(null);
  };

  const columnas = [
    { key: 'id', header: '#' },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (f) => new Date(f.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }),
    },
    { key: 'clienteNombre', header: 'Cliente', render: (f) => f.clienteNombre || '—' },
    { key: 'tipoEntrega', header: 'Entrega', render: (f) => ENTREGA_LABEL[f.tipoEntrega] },
    { key: 'direccion', header: 'Dirección', render: (f) => f.direccion || '—' },
    { key: 'items', header: 'Productos', render: (f) => f.items.map((i) => `${Number(i.cantidad)}x ${i.producto.nombre}`).join(', ') },
    { key: 'formaPago', header: 'Pago', render: (f) => FORMA_PAGO_LABEL[f.formaPago] || f.formaPago },
    { key: 'total', header: 'Total', render: (f) => money(f.total) },
    {
      key: 'estado',
      header: 'Estado',
      render: (f) =>
        f.estado === 'CANCELADO' || f.estado === 'ENTREGADO' ? (
          <span className={`badge ${ESTADO_BADGE[f.estado]}`}>{f.estado}</span>
        ) : (
          <select
            className={`badge ${ESTADO_BADGE[f.estado]}`}
            style={{ border: 'none', fontWeight: 700 }}
            value={f.estado}
            onChange={(e) => dispatch(actualizarEstadoPedido({ id: f.id, estado: e.target.value }))}
          >
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="EN_PREPARACION">EN_PREPARACION</option>
            <option value="ENTREGADO">ENTREGADO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        ),
    },
    {
      key: 'acciones',
      header: '',
      render: (f) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-secundario btn-sm" onClick={() => generarReciboPedido(f)}>
            Recibo
          </button>
          {f.telefono && (
            <button
              className="btn btn-secundario btn-sm"
              onClick={() => window.open(linkConfirmacionWhatsApp(f), '_blank')}
            >
              WhatsApp
            </button>
          )}
          {ESTADOS_EDITABLES.includes(f.estado) && (
            <button className="btn btn-secundario btn-sm" onClick={() => setEditando(f)}>
              Editar
            </button>
          )}
        </div>
      ),
    },
  ];

  const filas = lista.filter((f) => coincide(f.clienteNombre, busqueda) || f.items.some((i) => coincide(i.producto.nombre, busqueda)));

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Pedidos</h1>
        <button className="btn btn-primario" onClick={() => navigate('/pedidos/nuevo')}>
          + Nuevo pedido
        </button>
      </div>

      <Buscador valor={busqueda} onChange={setBusqueda} placeholder="Buscar por cliente o producto…" />

      <div className="panel">
        <Table columnas={columnas} filas={filas} vacio="Todavía no hay pedidos registrados" />
      </div>

      {editando && (
        <Modal titulo={`Editar pedido #${editando.id}`} onCerrar={() => setEditando(null)} ancho="720px">
          <PedidoForm
            productos={productos}
            valoresIniciales={{
              clienteNombre: editando.clienteNombre,
              telefono: editando.telefono,
              tipoEntrega: editando.tipoEntrega,
              direccion: editando.direccion,
              formaPago: editando.formaPago,
              fecha: editando.fecha,
              notas: editando.notas,
              items: editando.items.map((i) => ({
                productoId: i.productoId,
                cantidad: Number(i.cantidad),
                precioUnitario: Number(i.precioUnitario),
                adiciones: i.adiciones || [],
              })),
            }}
            onSubmit={guardarEdicion}
            onCancelar={() => setEditando(null)}
            textoBoton="Guardar cambios"
          />
        </Modal>
      )}
    </div>
  );
}
