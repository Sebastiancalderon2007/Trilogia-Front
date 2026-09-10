import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice.js';
import ingredientesReducer from '../features/inventario/slices/ingredientesSlice.js';
import productosReducer from '../features/productos/slices/productosSlice.js';
import pedidosReducer from '../features/pedidos/slices/pedidosSlice.js';
import empleadosReducer from '../features/empleados/slices/empleadosSlice.js';
import gastosReducer from '../features/gastos/slices/gastosSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ingredientes: ingredientesReducer,
    productos: productosReducer,
    pedidos: pedidosReducer,
    empleados: empleadosReducer,
    gastos: gastosReducer,
  },
});
