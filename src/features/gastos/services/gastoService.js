import api from '../../../shared/services/api.js';

export const gastoService = {
  async listar(filtros = {}) {
    const { data } = await api.get('/api/gastos', { params: filtros });
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/api/gastos', payload);
    return data.data;
  },
  async eliminar(id) {
    await api.delete(`/api/gastos/${id}`);
  },
};
