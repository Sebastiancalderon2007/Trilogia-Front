import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ingredienteService } from '../services/ingredienteService.js';

export const fetchIngredientes = createAsyncThunk('ingredientes/fetch', () => ingredienteService.listar());

export const crearIngrediente = createAsyncThunk('ingredientes/crear', async (payload, { dispatch }) => {
  await ingredienteService.crear(payload);
  dispatch(fetchIngredientes());
});

export const actualizarIngrediente = createAsyncThunk(
  'ingredientes/actualizar',
  async ({ id, payload }, { dispatch }) => {
    await ingredienteService.actualizar(id, payload);
    dispatch(fetchIngredientes());
  }
);

export const eliminarIngrediente = createAsyncThunk('ingredientes/eliminar', async (id, { dispatch }) => {
  await ingredienteService.eliminar(id);
  dispatch(fetchIngredientes());
});

export const registrarMovimiento = createAsyncThunk(
  'ingredientes/movimiento',
  async ({ id, payload }, { dispatch }) => {
    await ingredienteService.registrarMovimiento(id, payload);
    dispatch(fetchIngredientes());
  }
);

const ingredientesSlice = createSlice({
  name: 'ingredientes',
  initialState: { lista: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredientes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchIngredientes.fulfilled, (state, action) => {
        state.loading = false;
        state.lista = action.payload;
      })
      .addCase(fetchIngredientes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default ingredientesSlice.reducer;
