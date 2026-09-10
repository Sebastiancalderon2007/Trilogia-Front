import { useState } from 'react';

const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const VACIO = { clienteNombre: '', telefono: '', tipoEntrega: 'EN_LOCAL', direccion: '', notas: '', items: [] };

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
  const [notas, setNotas] = useState(iniciales.notas || '');
  const [items, setItems] = useState(iniciales.items);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);

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
    try {
      await onSubmit({
        clienteNombre: clienteNombre || null,
        telefono: telefono || null,
        tipoEntrega,
        direccion: tipoEntrega === 'DOMICILIO' ? direccion : null,
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
