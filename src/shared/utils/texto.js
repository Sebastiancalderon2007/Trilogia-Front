// Normaliza para comparar sin importar mayúsculas/tildes (buscador de las tablas).
export const normalizarBusqueda = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export const coincide = (texto, termino) => normalizarBusqueda(texto).includes(normalizarBusqueda(termino));
