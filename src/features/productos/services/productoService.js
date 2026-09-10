import api from '../../../shared/services/api.js';

export const productoService = {
  async listar(tipo) {
    const { data } = await api.get('/api/productos', { params: tipo ? { tipo } : {} });
    return data.data;
  },
  async obtener(id) {
    const { data } = await api.get(`/api/productos/${id}`);
    return data.data;
  },
  async costeo(id) {
    const { data } = await api.get(`/api/productos/${id}/costeo`);
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/api/productos', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/api/productos/${id}`, payload);
    return data.data;
  },
  async eliminar(id) {
    await api.delete(`/api/productos/${id}`);
  },
};
