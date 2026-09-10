import { useState } from 'react';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

// Formato que espera <input type="datetime-local">, en hora local (no UTC).
const aFechaLocal = (fecha) => {
  const d = fecha ? new Date(fecha) : new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const FORMA_PAGO_LABEL = {
  EFECTIVO: 'Efectivo',
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia',
  OTRO: 'Otro',
};

const VACIO = {
  clienteNombre: '',
  telefono: '',
  tipoEntrega: 'EN_LOCAL',
  direccion: '',
  formaPago: 'EFECTIVO',
  fecha: null,
  notas: '',
  items: [],
};

// Formulario de pedido reutilizado tanto para crear (NuevoPedidoPage) como
// para editar uno existente (modal de edición en PedidosPage). `onSubmit`
// recibe el payload listo para la API y debe lanzar un Error con el mensaje
// a mostrar si la API lo rechaza.
export default function PedidoForm({ valoresIniciales, productos, onSubmit, onCancelar, textoBoton = 'Guardar' }) {
  const iniciales = { ...VACIO, ...valoresIniciales };
  const [clienteNombre, setClienteNombre] = useState(iniciales.clienteNombre || '');
  const [telefono, setTelefono] = useState(iniciales.telefono || '');
  const [tipoEntrega, setTipoEntrega] = useState(iniciales.tipoEntrega);
  const [direccion, setDireccion] = useState(iniciales.direccion || '');
  const [formaPago, setFormaPago] = useState(iniciales.formaPago || 'EFECTIVO');
  const [fecha, setFecha] = useState(aFechaLocal(iniciales.fecha));
  const [notas, setNotas] = useState(iniciales.notas || '');
  const [items, setItems] = useState(iniciales.items.map((i) => ({ adiciones: [], ...i })));
  const [nuevaAdicion, setNuevaAdicion] = useState({});
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const vendibles = productos.filter((p) => p.activo && p.tipo !== 'SUBPREPARACION' && p.precioVenta);

  const agregarItem = (productoId) => {
    if (!productoId) return;
    productoId = Number(productoId);
    const existente = items.find((i) => i.productoId === productoId);
    if (existente) {
      setItems(items.map((i) => (i.productoId === productoId ? { ...i, cantidad: i.cantidad + 1 } : i)));
    } else {
      const producto = productos.find((p) => p.id === productoId);
      setItems([...items, { productoId, cantidad: 1, precioUnitario: Number(producto.precioVenta), adiciones: [] }]);
    }
  };

  const cambiarCantidad = (productoId, cantidad) => {
    setItems(items.map((i) => (i.productoId === productoId ? { ...i, cantidad: Number(cantidad) } : i)));
  };

  const cambiarPrecio = (productoId, precioUnitario) => {
    setItems(items.map((i) => (i.productoId === productoId ? { ...i, precioUnitario: Number(precioUnitario) } : i)));
  };

  const quitarItem = (productoId) => setItems(items.filter((i) => i.productoId !== productoId));

  const agregarAdicion = (productoId) => {
    const { nombre, precio } = nuevaAdicion[productoId] || {};
    if (!nombre?.trim()) return;
    setItems(
      items.map((i) =>
        i.productoId === productoId ? { ...i, adiciones: [...i.adiciones, { nombre: nombre.trim(), precio: Number(precio) || 0 }] } : i
      )
    );
    setNuevaAdicion({ ...nuevaAdicion, [productoId]: { nombre: '', precio: '' } });
  };

  const quitarAdicion = (productoId, idx) => {
    setItems(items.map((i) => (i.productoId === productoId ? { ...i, adiciones: i.adiciones.filter((_, j) => j !== idx) } : i)));
  };

  const subtotalItem = (item) => {
    const totalAdiciones = item.adiciones.reduce((acc, a) => acc + Number(a.precio), 0);
    return (Number(item.precioUnitario) + totalAdiciones) * item.cantidad;
  };

  const total = items.reduce((acc, item) => acc + subtotalItem(item), 0);

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
    try {
      await onSubmit({
        clienteNombre: clienteNombre || null,
        telefono: telefono || null,
        tipoEntrega,
        direccion: tipoEntrega === 'DOMICILIO' ? direccion : null,
        formaPago,
        fecha: new Date(fecha).toISOString(),
        notas: notas || null,
        items,
      });
    } catch (err) {
      setError(err.message || 'No se pudo guardar el pedido');
    } finally {
      setEnviando(false);
    }
  };

  return (
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
          <div className="campo">
            <label>Forma de pago</label>
            <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)}>
              {Object.entries(FORMA_PAGO_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="campo">
            <label>Fecha y hora del pedido</label>
            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} />
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
          <select
            onChange={(e) => {
              agregarItem(e.target.value);
              e.target.value = '';
            }}
            defaultValue=""
          >
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
                  <th>Precio unit.</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const producto = productos.find((p) => p.id === item.productoId);
                  const adicion = nuevaAdicion[item.productoId] || { nombre: '', precio: '' };
                  return (
                    <tr key={item.productoId}>
                      <td>
                        {producto?.nombre}
                        <div style={{ marginTop: '0.4rem' }}>
                          {item.adiciones.map((a, idx) => (
                            <span
                              key={idx}
                              className="badge badge-gris"
                              style={{ marginRight: '0.3rem', marginBottom: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              + {a.nombre} ({money(a.precio)})
                              <button
                                type="button"
                                onClick={() => quitarAdicion(item.productoId, idx)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, lineHeight: 1 }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                            <input
                              placeholder="Adición (ej: extra queso)"
                              value={adicion.nombre}
                              onChange={(e) => setNuevaAdicion({ ...nuevaAdicion, [item.productoId]: { ...adicion, nombre: e.target.value } })}
                              style={{ width: '160px', fontSize: '0.82rem' }}
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="Precio"
                              value={adicion.precio}
                              onChange={(e) => setNuevaAdicion({ ...nuevaAdicion, [item.productoId]: { ...adicion, precio: e.target.value } })}
                              style={{ width: '90px', fontSize: '0.82rem' }}
                            />
                            <button type="button" className="btn btn-secundario btn-sm" onClick={() => agregarAdicion(item.productoId)}>
                              + Adición
                            </button>
                          </div>
                        </div>
                      </td>
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
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precioUnitario}
                          onChange={(e) => cambiarPrecio(item.productoId, e.target.value)}
                          style={{ width: '100px' }}
                        />
                      </td>
                      <td>{money(subtotalItem(item))}</td>
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
        {onCancelar && (
          <button type="button" className="btn btn-secundario" onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primario" disabled={enviando}>
          {enviando ? 'Guardando…' : textoBoton}
        </button>
      </div>
    </form>
  );
}
