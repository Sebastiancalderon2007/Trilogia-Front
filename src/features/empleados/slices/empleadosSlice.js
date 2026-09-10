import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { empleadoService, turnoService } from '../services/empleadoService.js';

export const fetchEmpleados = createAsyncThunk('empleados/fetch', () => empleadoService.listar());

export const crearEmpleado = createAsyncThunk('empleados/crear', async (payload, { dispatch }) => {
  await empleadoService.crear(payload);
  dispatch(fetchEmpleados());
});

export const actualizarEmpleado = createAsyncThunk(
  'empleados/actualizar',
  async ({ id, payload }, { dispatch }) => {
    await empleadoService.actualizar(id, payload);
    dispatch(fetchEmpleados());
  }
);

export const eliminarEmpleado = createAsyncThunk('empleados/eliminar', async (id, { dispatch }) => {
  await empleadoService.eliminar(id);
  dispatch(fetchEmpleados());
});

export const reactivarEmpleado = createAsyncThunk('empleados/reactivar', async (id, { dispatch }) => {
  await empleadoService.actualizar(id, { activo: true });
  dispatch(fetchEmpleados());
});

export const fetchTurnos = createAsyncThunk('turnos/fetch', (filtros) => turnoService.listar(filtros));

export const crearTurno = createAsyncThunk('turnos/crear', async (payload, { dispatch, rejectWithValue }) => {
  try {
    await turnoService.crear(payload);
    dispatch(fetchTurnos());
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'No se pudo registrar el turno');
  }
});

export const eliminarTurno = createAsyncThunk('turnos/eliminar', async (id, { dispatch }) => {
  await turnoService.eliminar(id);
  dispatch(fetchTurnos());
});

const empleadosSlice = createSlice({
  name: 'empleados',
  initialState: { lista: [], turnos: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmpleados.fulfilled, (state, action) => {
        state.lista = action.payload;
      })
      .addCase(fetchTurnos.fulfilled, (state, action) => {
        state.turnos = action.payload;
      });
  },
});

export default empleadosSlice.reducer;
