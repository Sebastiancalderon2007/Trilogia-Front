const money = (n) => `$${Number(n || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

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

// Asume números colombianos: si no trae indicativo de país, le agrega 57.
const limpiarTelefono = (telefono) => {
  const soloDigitos = String(telefono || '').replace(/\D/g, '');
  if (!soloDigitos) return null;
  return soloDigitos.startsWith('57') ? soloDigitos : `57${soloDigitos}`;
};

// Arma un link de WhatsApp (wa.me) con el resumen del pedido ya redactado,
// para que el negocio solo tenga que revisarlo y darle enviar. No manda nada
// automáticamente: abre WhatsApp con el mensaje precargado.
export function linkConfirmacionWhatsApp(pedido) {
  const numero = limpiarTelefono(pedido.telefono);
  if (!numero) return null;

  const lineasItems = pedido.items.map((item) => {
    let linea = `${Number(item.cantidad)}x ${item.producto?.nombre || ''}`;
    if (item.adiciones?.length) {
      linea += ' (' + item.adiciones.map((a) => `+ ${a.nombre}`).join(', ') + ')';
    }
    return linea;
  });

  const partes = [
    `Hola${pedido.clienteNombre ? ' ' + pedido.clienteNombre : ''}! Te confirmamos tu pedido en *Trilogia de Sabor*:`,
    '',
    ...lineasItems,
    '',
    `Entrega: ${ENTREGA_LABEL[pedido.tipoEntrega] || pedido.tipoEntrega}`,
  ];
  if (pedido.tipoEntrega === 'DOMICILIO' && pedido.direccion) {
    partes.push(`Dirección: ${pedido.direccion}`);
  }
  partes.push(`Forma de pago: ${FORMA_PAGO_LABEL[pedido.formaPago] || pedido.formaPago}`);
  partes.push(`Total: ${money(pedido.total)}`);
  partes.push('', '¡Gracias por tu compra!');

  return `https://wa.me/${numero}?text=${encodeURIComponent(partes.join('\n'))}`;
}
