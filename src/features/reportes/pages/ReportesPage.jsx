import { useState } from 'react';
import * as XLSX from 'xlsx';
import { pedidoService } from '../../pedidos/services/pedidoService.js';
import { gastoService } from '../../gastos/services/gastoService.js';
import { turnoService } from '../../empleados/services/empleadoService.js';

const hoy = new Date().toISOString().slice(0, 10);
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

const descargarLibro = (filas, nombreHoja, nombreArchivo) => {
  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, nombreHoja);
  XLSX.writeFile(libro, nombreArchivo);
};

export default function ReportesPage() {
  const [desde, setDesde] = useState(inicioMes);
  const [hasta, setHasta] = useState(hoy);
  const [cargando, setCargando] = useState(null);
  const [error, setError] = useState(null);

  const conCarga = (clave, fn) => async () => {
    setError(null);
    setCargando(clave);
    try {
      await fn();
    } catch (err) {
      setError(err?.response?.data?.message || `No se pudo generar el reporte de ${clave}`);
    } finally {
      setCargando(null);
    }
  };

  const exportarVentas = conCarga('ventas', async () => {
    const pedidos = await pedidoService.listar({ desde, hasta });
    if (pedidos.length === 0) throw new Error('No hay ventas en ese rango de fechas');
    const filas = pedidos.flatMap((p) =>
      p.items.map((i) => ({
        Pedido: p.id,
        Fecha: new Date(p.fecha).toLocaleString('es-CO'),
        Cliente: p.clienteNombre || '',
        Entrega: p.tipoEntrega,
        Direccion: p.direccion || '',
        Producto: i.producto?.nombre || '',
        Cantidad: Number(i.cantidad),
        PrecioUnitario: Number(i.precioUnitario),
        Subtotal: Number(i.subtotal),
        Estado: p.estado,
      }))
    );
    descargarLibro(filas, 'Ventas', `ventas_${desde}_a_${hasta}.xlsx`);
  });

  const exportarGastos = conCarga('gastos', async () => {
    const gastos = await gastoService.listar({ desde, hasta });
    if (gastos.length === 0) throw new Error('No hay gastos en ese rango de fechas');
    const filas = gastos.map((g) => ({
      Fecha: new Date(g.fecha).toLocaleDateString('es-CO'),
      Categoria: g.categoria || '',
      Descripcion: g.descripcion,
      Valor: Number(g.valor),
    }));
    descargarLibro(filas, 'Gastos', `gastos_${desde}_a_${hasta}.xlsx`);
  });

  const exportarNomina = conCarga('nomina', async () => {
    const turnos = await turnoService.listar({ desde, hasta });
    if (turnos.length === 0) throw new Error('No hay turnos en ese rango de fechas');
    const filas = turnos.map((t) => ({
      Empleado: t.empleado?.nombre || '',
      Fecha: new Date(t.fecha).toLocaleDateString('es-CO'),
      Ingreso: t.horaIngreso,
      Salida: t.horaSalida,
      Horas: Number(t.horasTrabajadas),
      Propina: Number(t.propina),
      Deducciones: Number(t.deducciones),
      TotalPagar: Number(t.totalPagar),
    }));
    descargarLibro(filas, 'Nomina', `nomina_${desde}_a_${hasta}.xlsx`);
  });

  return (
    <div className="pagina">
      <div className="pagina-header">
        <h1>Reportes</h1>
      </div>

      <div className="panel">
        <div className="form-grid">
          <div className="campo">
            <label>Desde</label>
            <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </div>
          <div className="campo">
            <label>Hasta</label>
            <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </div>
        </div>

        {error && <div className="alerta-stock">{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
          <button className="btn btn-primario" onClick={exportarVentas} disabled={!!cargando}>
            {cargando === 'ventas' ? 'Generando…' : 'Exportar ventas (.xlsx)'}
          </button>
          <button className="btn btn-primario" onClick={exportarGastos} disabled={!!cargando}>
            {cargando === 'gastos' ? 'Generando…' : 'Exportar gastos (.xlsx)'}
          </button>
          <button className="btn btn-primario" onClick={exportarNomina} disabled={!!cargando}>
            {cargando === 'nomina' ? 'Generando…' : 'Exportar nómina (.xlsx)'}
          </button>
        </div>
      </div>
    </div>
  );
}
