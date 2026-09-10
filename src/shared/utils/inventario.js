// Un stockMinimo de 0 significa "nadie configuró un mínimo todavía", no "no
// hace falta nada de este insumo" — se excluye para no marcar como "bajo" a
// insumos que simplemente nunca tuvieron un mínimo definido.
export const bajoStock = (ingrediente) =>
  Number(ingrediente.stockMinimo) > 0 && Number(ingrediente.stockActual) <= Number(ingrediente.stockMinimo);
