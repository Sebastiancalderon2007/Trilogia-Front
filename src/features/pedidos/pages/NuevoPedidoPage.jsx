import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { crearPedido } from '../slices/pedidosSlice.js';
import { fetchProductos } from '../../productos/slices/productosSlice.js';
import PedidoForm from '../components/PedidoForm.jsx';

export default function NuevoPedidoPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lista: productos } = useSelector((state) => state.productos);

  useEffect(() => {
    dispatch(fetchProductos());
  }, [dispatch]);

  const manejarSubmit = async (datos) => {
    const resultado = await dispatch(crearPedido(datos));
    if (crearPedido.rejected.match(resultado)) {
      throw new Error(resultado.payload || 'No se pudo crear el pedido');
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
      <PedidoForm productos={productos} onSubmit={manejarSubmit} onCancelar={() => navigate('/pedidos')} textoBoton="Confirmar pedido" />
    </div>
  );
}
