const UNIDADES = ['g', 'ml', 'und'];

// Editor de la lista de ingredientes de una receta. Cada fila referencia
// exactamente un Ingrediente (insumo real) o una sub-preparación (otro producto).
export default function RecetaItemsEditor({ items, onChange, ingredientes, subpreparaciones, productoIdActual }) {
  const agregar = () => {
    onChange([...items, { origen: 'ingrediente', ingredienteId: '', subpreparacionId: '', cantidad: '', unidad: 'g' }]);
  };

  const actualizar = (idx, cambios) => {
    const copia = items.map((it, i) => (i === idx ? { ...it, ...cambios } : it));
    onChange(copia);
  };

  const quitar = (idx) => onChange(items.filter((_, i) => i !== idx));

  const opcionesSubprep = subpreparaciones.filter((s) => s.id !== productoIdActual);

  return (
    <div className="receta-editor">
      {items.map((item, idx) => (
        <div className="receta-fila" key={idx}>
          <select
            value={item.origen}
            onChange={(e) => actualizar(idx, { origen: e.target.value, ingredienteId: '', subpreparacionId: '' })}
          >
            <option value="ingrediente">Insumo</option>
            <option value="subpreparacion">Sub-preparación</option>
          </select>

          {item.origen === 'ingrediente' ? (
            <select value={item.ingredienteId} onChange={(e) => actualizar(idx, { ingredienteId: e.target.value })} required>
              <option value="">Elegir insumo…</option>
              {ingredientes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.nombre}
                </option>
              ))}
            </select>
          ) : (
            <select value={item.subpreparacionId} onChange={(e) => actualizar(idx, { subpreparacionId: e.target.value })} required>
              <option value="">Elegir sub-preparación…</option>
              {opcionesSubprep.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre}
                </option>
              ))}
            </select>
          )}

          <input
            type="number"
            step="0.001"
            placeholder="Cantidad"
            value={item.cantidad}
            onChange={(e) => actualizar(idx, { cantidad: e.target.value })}
            required
          />

          <select value={item.unidad} onChange={(e) => actualizar(idx, { unidad: e.target.value })}>
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          <button type="button" className="btn btn-peligro btn-sm" onClick={() => quitar(idx)}>
            Quitar
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-secundario btn-sm" onClick={agregar}>
        + Agregar ingrediente
      </button>
    </div>
  );
}
