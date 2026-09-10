import axios from 'axios';
import { setConectando } from '../slices/uiSlice.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TOKEN_KEY = 'trilogia_token';

// El store se inyecta desde main.jsx (setStoreRef) en vez de importarse aquí
// directamente: shared/services/api.js -> store/index.js -> .../slices ->
// .../services -> shared/services/api.js sería un ciclo de módulos.
let storeRef = null;
export const setStoreRef = (store) => {
  storeRef = store;
};

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// El plan gratuito de Render "duerme" la API tras 15 min sin uso: la primera
// petición después de eso tarda ~50 segundos. Sin aviso, parece que la app
// está rota. Si una petición tarda más de 2.5s se muestra un banner de
// "conectando"; se cuenta cuántas peticiones lentas hay activas para no
// ocultarlo de más si hay varias en paralelo.
let peticionesLentas = 0;
const marcarLenta = () => {
  peticionesLentas++;
  storeRef?.dispatch(setConectando(true));
};
const desmarcarLenta = () => {
  peticionesLentas = Math.max(0, peticionesLentas - 1);
  if (peticionesLentas === 0) storeRef?.dispatch(setConectando(false));
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config._timerLento = setTimeout(() => {
    config._marcoLenta = true;
    marcarLenta();
  }, 2500);
  return config;
});

const limpiarTimerLento = (config) => {
  if (config?._timerLento) {
    clearTimeout(config._timerLento);
    if (config._marcoLenta) desmarcarLenta();
  }
};

api.interceptors.response.use(
  (response) => {
    limpiarTimerLento(response.config);
    return response;
  },
  (error) => {
    limpiarTimerLento(error.config);
    const hadToken = !!localStorage.getItem(TOKEN_KEY);
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { TOKEN_KEY };
