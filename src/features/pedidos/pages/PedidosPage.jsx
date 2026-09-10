import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPedidos, actualizarEstadoPedido } from '../slices/pedidosSlice.js';
import Table from '../../../shared/components/Table/Table.jsx';

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

export default function PedidosPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lista } = useSelector((state) => state.pedidos);

  useEffect(() => {
    dispatch(fetchPedidos());
  }, [dispatch]);

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
  ];

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Pedidos</h1>
        <button className="btn btn-primario" onClick={() => navigate('/pedidos/nuevo')}>
          + Nuevo pedido
        </button>
      </div>

      <div className="panel">
        <Table columnas={columnas} filas={lista} vacio="Todavía no hay pedidos registrados" />
      </div>
    </div>
  );
}
