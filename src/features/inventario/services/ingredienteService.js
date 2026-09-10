import api from '../../../shared/services/api.js';

export const ingredienteService = {
  async listar() {
    const { data } = await api.get('/api/ingredientes');
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/api/ingredientes', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/api/ingredientes/${id}`, payload);
    return data.data;
  },
  async eliminar(id) {
    await api.delete(`/api/ingredientes/${id}`);
  },
  async registrarMovimiento(id, payload) {
    const { data } = await api.post(`/api/ingredientes/${id}/movimientos`, payload);
    return data.data;
  },
};
