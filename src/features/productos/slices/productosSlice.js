import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productoService } from '../services/productoService.js';

export const fetchProductos = createAsyncThunk('productos/fetch', () => productoService.listar());

export const crearProducto = createAsyncThunk('productos/crear', async (payload, { dispatch }) => {
  await productoService.crear(payload);
  dispatch(fetchProductos());
});

export const actualizarProducto = createAsyncThunk(
  'productos/actualizar',
  async ({ id, payload }, { dispatch }) => {
    await productoService.actualizar(id, payload);
    dispatch(fetchProductos());
  }
);

export const eliminarProducto = createAsyncThunk('productos/eliminar', async (id, { dispatch }) => {
  await productoService.eliminar(id);
  dispatch(fetchProductos());
});

export const reactivarProducto = createAsyncThunk('productos/reactivar', async (id, { dispatch }) => {
  await productoService.reactivar(id);
  dispatch(fetchProductos());
});

const productosSlice = createSlice({
  name: 'productos',
  initialState: { lista: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default productosSlice.reducer;
