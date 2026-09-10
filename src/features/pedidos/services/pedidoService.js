import api from '../../../shared/services/api.js';

export const pedidoService = {
  async listar(filtros = {}) {
    const { data } = await api.get('/api/pedidos', { params: filtros });
    return data.data;
  },
  async obtener(id) {
    const { data } = await api.get(`/api/pedidos/${id}`);
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/api/pedidos', payload);
    return data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/api/pedidos/${id}`, payload);
    return data;
  },
  async actualizarEstado(id, estado) {
    const { data } = await api.patch(`/api/pedidos/${id}/estado`, { estado });
    return data.data;
  },
};
