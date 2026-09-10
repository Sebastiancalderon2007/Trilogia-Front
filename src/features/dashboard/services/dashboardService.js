import api from '../../../shared/services/api.js';

export const dashboardService = {
  async resumen() {
    const { data } = await api.get('/api/dashboard/resumen');
    return data.data;
  },
  async serie(periodo) {
    const { data } = await api.get('/api/dashboard/serie', { params: { periodo } });
    return data.data;
  },
};
