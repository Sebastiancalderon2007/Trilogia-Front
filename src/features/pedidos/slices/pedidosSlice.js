import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pedidoService } from '../services/pedidoService.js';

export const fetchPedidos = createAsyncThunk('pedidos/fetch', (filtros) => pedidoService.listar(filtros));

export const crearPedido = createAsyncThunk('pedidos/crear', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const resultado = await pedidoService.crear(payload);
    dispatch(fetchPedidos());
    return resultado;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'No se pudo crear el pedido');
  }
});

export const actualizarPedido = createAsyncThunk('pedidos/actualizar', async ({ id, payload }, { dispatch, rejectWithValue }) => {
  try {
    const resultado = await pedidoService.actualizar(id, payload);
    dispatch(fetchPedidos());
    return resultado;
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'No se pudo actualizar el pedido');
  }
});

export const actualizarEstadoPedido = createAsyncThunk(
  'pedidos/actualizarEstado',
  async ({ id, estado }, { dispatch }) => {
    await pedidoService.actualizarEstado(id, estado);
    dispatch(fetchPedidos());
  }
);

const pedidosSlice = createSlice({
  name: 'pedidos',
  initialState: { lista: [], loading: false, error: null, ultimaAlerta: null },
  reducers: {
    limpiarAlerta(state) {
      state.ultimaAlerta = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPedidos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPedidos.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchPedidos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(crearPedido.fulfilled, (state, action) => {
        state.ultimaAlerta = action.payload.alertasStock;
      });
  },
});

export const { limpiarAlerta } = pedidosSlice.actions;
export default pedidosSlice.reducer;
