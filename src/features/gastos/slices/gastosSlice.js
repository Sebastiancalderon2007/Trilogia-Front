import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { gastoService } from '../services/gastoService.js';

export const fetchGastos = createAsyncThunk('gastos/fetch', () => gastoService.listar());

export const crearGasto = createAsyncThunk('gastos/crear', async (payload, { dispatch }) => {
  await gastoService.crear(payload);
  dispatch(fetchGastos());
});

export const eliminarGasto = createAsyncThunk('gastos/eliminar', async (id, { dispatch }) => {
  await gastoService.eliminar(id);
  dispatch(fetchGastos());
});

const gastosSlice = createSlice({
  name: 'gastos',
  initialState: { lista: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchGastos.fulfilled, (state, action) => {
      state.lista = action.payload;
    });
  },
});

export default gastosSlice.reducer;
