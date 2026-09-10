import api from '../../../shared/services/api.js';

export const authService = {
  async login(correo, password) {
    const response = await api.post('/api/auth/login', { correo, password });
    return response.data;
  },
  async me() {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};
