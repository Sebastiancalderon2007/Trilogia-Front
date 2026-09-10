import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { crearPedido } from '../slices/pedidosSlice.js';
import { fetchProductos } from '../../productos/slices/productosSlice.js';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

export default function NuevoPedidoPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lista: productos } = useSelector((state) => state.productos);

  const [clienteNombre, setClienteNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('EN_LOCAL');
  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    dispatch(fetchProductos());
  }, [dispatch]);

  const vendibles = productos.filter((p) => p.activo && p.tipo !== 'SUBPREPARACION' && p.precioVenta);

  const agregarItem = (productoId) => {
    if (!productoId) return;
    const existente = items.find((i) => i.productoId === Number(productoId));
    if (existente) {
      setItems(items.map((i) => (i.productoId === existente.productoId ? { ...i, cantidad: i.cantidad + 1 } : i)));
    } else {
      setItems([...items, { productoId: Number(productoId), cantidad: 1 }]);
    }
  };

  const cambiarCantidad = (productoId, cantidad) => {
    setItems(items.map((i) => (i.productoId === productoId ? { ...i, cantidad: Number(cantidad) } : i)));
  };

  const quitarItem = (productoId) => setItems(items.filter((i) => i.productoId !== productoId));

  const total = items.reduce((acc, item) => {
    const producto = productos.find((p) => p.id === item.productoId);
    return acc + (producto ? Number(producto.precioVenta) * item.cantidad : 0);
  }, 0);

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError('Agrega al menos un producto al pedido');
      return;
    }
    if (tipoEntrega === 'DOMICILIO' && !direccion.trim()) {
      setError('La dirección es obligatoria para pedidos a domicilio');
      return;
    }
    setEnviando(true);
    const resultado = await dispatch(
      crearPedido({
        clienteNombre: clienteNombre || null,
        telefono: telefono || null,
        tipoEntrega,
        direccion: tipoEntrega === 'DOMICILIO' ? direccion : null,
        notas: notas || null,
        items,
      })
    );
    setEnviando(false);
    if (crearPedido.rejected.match(resultado)) {
      setError(resultado.payload || 'No se pudo crear el pedido');
      return;
    }
    const alertas = resultado.payload.alertasStock;
    if (alertas?.length) {
      alert('Pedido creado. Atención: quedaron bajos de stock: ' + alertas.map((a) => a.nombre).join(', '));
    }
    navigate('/pedidos');
  };

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Nuevo pedido</h1>
      </div>

      <form onSubmit={enviar}>
        <div className="panel">
          <div className="form-grid">
            <div className="campo">
              <label>Nombre del cliente (opcional)</label>
              <input value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} />
            </div>
            <div className="campo">
              <label>Teléfono (opcional)</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div className="campo">
              <label>Tipo de entrega</label>
              <select value={tipoEntrega} onChange={(e) => setTipoEntrega(e.target.value)}>
                <option value="EN_LOCAL">En el local</option>
                <option value="RECOGE_TIENDA">Recoge en tienda</option>
                <option value="DOMICILIO">Domicilio</option>
              </select>
            </div>
            <div className="campo">
              <label>
                Dirección {tipoEntrega === 'DOMICILIO' && <span style={{ color: 'var(--color-rojo)' }}>*obligatoria</span>}
              </label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required={tipoEntrega === 'DOMICILIO'}
                disabled={tipoEntrega !== 'DOMICILIO'}
                placeholder={tipoEntrega === 'DOMICILIO' ? 'Calle, número, barrio…' : 'No aplica'}
              />
            </div>
          </div>
          <div className="campo">
            <label>Notas (opcional)</label>
            <textarea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
        </div>

        <div className="panel">
          <div className="campo">
            <label>Agregar producto</label>
            <select onChange={(e) => { agregarItem(e.target.value); e.target.value = ''; }} defaultValue="">
              <option value="" disabled>
                Elegir plato o bebida…
              </option>
              {vendibles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} — {money(p.precioVenta)}
                </option>
              ))}
            </select>
          </div>

          {items.length > 0 && (
            <div className="tabla-wrap">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const producto = productos.find((p) => p.id === item.productoId);
                    return (
                      <tr key={item.productoId}>
                        <td>{producto?.nombre}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.cantidad}
                            onChange={(e) => cambiarCantidad(item.productoId, e.target.value)}
                            style={{ width: '70px' }}
                          />
                        </td>
                        <td>{producto ? money(producto.precioVenta * item.cantidad) : '—'}</td>
                        <td>
                          <button type="button" className="btn btn-peligro btn-sm" onClick={() => quitarItem(item.productoId)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: '0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>
            Total: {money(total)}
          </div>
        </div>

        {error && <div className="alerta-stock">{error}</div>}

        <div className="acciones-form">
          <button type="button" className="btn btn-secundario" onClick={() => navigate('/pedidos')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Confirmar pedido'}
          </button>
        </div>
      </form>
    </div>
  );
}
