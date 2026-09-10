import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Recibo en escala de grises (con acentos de la marca) para no gastar tinta
// de color al imprimir en el local — mismo criterio de diseño usado en sigot.
const NEGRO = [17, 17, 17];
const ROJO = [211, 47, 47];
const GRIS = [110, 110, 110];
const LINEA = [225, 225, 225];
const SUAVE = [246, 246, 246];
const BLANCO = [255, 255, 255];

const PAGE_W = 210;
const M = 14;
const RIGHT = PAGE_W - M;

const money = (n) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(n) || 0);

const ENTREGA_LABEL = {
  DOMICILIO: 'Domicilio',
  RECOGE_TIENDA: 'Recoge en tienda',
  EN_LOCAL: 'En el local',
};

export function buildReciboPedido(pedido) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(...NEGRO);
  doc.rect(0, 0, PAGE_W, 30, 'F');
  doc.setFillColor(...ROJO);
  doc.rect(0, 30, PAGE_W, 1.6, 'F');

  doc.setTextColor(...BLANCO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TRILOGIA DE SABOR', M, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Recibo de pedido', M, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Pedido #${pedido.id}`, RIGHT, 13, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(new Date(pedido.fecha).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }), RIGHT, 20, { align: 'right' });

  let y = 40;
  doc.setFillColor(...SUAVE);
  doc.setDrawColor(...LINEA);
  doc.roundedRect(M, y, RIGHT - M, 26, 2.5, 2.5, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...GRIS);
  const filas = [
    ['Cliente', pedido.clienteNombre || '—'],
    ['Teléfono', pedido.telefono || '—'],
    ['Entrega', ENTREGA_LABEL[pedido.tipoEntrega] || pedido.tipoEntrega],
    ['Dirección', pedido.direccion || '—'],
  ];
  let fy = y + 7;
  filas.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS);
    doc.text(`${label}:`, M + 5, fy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NEGRO);
    doc.text(String(value), M + 32, fy);
    fy += 5.5;
  });
  y += 26 + 8;

  autoTable(doc, {
    startY: y,
    head: [['Producto', 'Cantidad', 'Precio unitario', 'Subtotal']],
    body: pedido.items.map((i) => [i.producto?.nombre || '—', Number(i.cantidad), money(i.precioUnitario), money(i.subtotal)]),
    theme: 'striped',
    headStyles: { fillColor: NEGRO, textColor: BLANCO, fontStyle: 'bold', fontSize: 9.5, cellPadding: 3 },
    bodyStyles: { fontSize: 9.5, textColor: NEGRO, cellPadding: 2.8 },
    alternateRowStyles: { fillColor: SUAVE },
    styles: { lineColor: LINEA, lineWidth: 0.1 },
    margin: { left: M, right: M },
    columnStyles: { 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
  });
  y = doc.lastAutoTable.finalY + 8;

  if (pedido.notas) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...GRIS);
    doc.text(`Notas: ${pedido.notas}`, M, y);
    y += 8;
  }

  const boxW = 82;
  const boxX = RIGHT - boxW;
  doc.setFillColor(...ROJO);
  doc.roundedRect(boxX, y, boxW, 14, 2.5, 2.5, 'F');
  doc.setTextColor(...BLANCO);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('TOTAL', boxX + 7, y + 9);
  doc.setFontSize(14);
  doc.text(money(pedido.total), RIGHT - 7, y + 9.5, { align: 'right' });

  doc.setDrawColor(...LINEA);
  doc.line(M, 284, RIGHT, 284);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text('Trilogia de Sabor', M, 289);
  doc.text('Gracias por tu compra', PAGE_W / 2, 289, { align: 'center' });

  return doc;
}

export function generarReciboPedido(pedido) {
  const doc = buildReciboPedido(pedido);
  doc.save(`recibo-pedido-${pedido.id}.pdf`);
}
