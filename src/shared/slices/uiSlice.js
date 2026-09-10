import { createSlice, nanoid } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: { notificaciones: [], conectando: false },
  reducers: {
    notificar: {
      reducer(state, action) {
        state.notificaciones.push(action.payload);
      },
      prepare(mensaje, tipo = 'info') {
        return { payload: { id: nanoid(), mensaje, tipo } };
      },
    },
    quitarNotificacion(state, action) {
      state.notificaciones = state.notificaciones.filter((n) => n.id !== action.payload);
    },
    setConectando(state, action) {
      state.conectando = action.payload;
    },
  },
});

export const { notificar, quitarNotificacion, setConectando } = uiSlice.actions;
export default uiSlice.reducer;
