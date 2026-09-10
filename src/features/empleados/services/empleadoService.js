import api from '../../../shared/services/api.js';

export const empleadoService = {
  async listar() {
    const { data } = await api.get('/api/empleados');
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/api/empleados', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/api/empleados/${id}`, payload);
    return data.data;
  },
  async eliminar(id) {
    await api.delete(`/api/empleados/${id}`);
  },
};

export const turnoService = {
  async listar(filtros = {}) {
    const { data } = await api.get('/api/turnos', { params: filtros });
    return data.data;
  },
  async crear(payload) {
    const { data } = await api.post('/api/turnos', payload);
    return data.data;
  },
  async actualizar(id, payload) {
    const { data } = await api.put(`/api/turnos/${id}`, payload);
    return data.data;
  },
  async eliminar(id) {
    await api.delete(`/api/turnos/${id}`);
  },
};
