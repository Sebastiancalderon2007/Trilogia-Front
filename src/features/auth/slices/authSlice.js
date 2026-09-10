import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService.js';
import { TOKEN_KEY } from '../../../shared/services/api.js';

const storedToken = localStorage.getItem(TOKEN_KEY);

export const loginThunk = createAsyncThunk('auth/login', async ({ correo, password }, { rejectWithValue }) => {
  try {
    return await authService.login(correo, password);
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Credenciales inválidas');
  }
});

export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  try {
    return await authService.me();
  } catch (err) {
    return rejectWithValue(err?.response?.data?.message || 'Sesión inválida');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: storedToken || null,
    usuario: null,
    restoring: !!storedToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.usuario = null;
      state.restoring = false;
      localStorage.removeItem(TOKEN_KEY);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.restoring = false;
        const { token, usuario } = action.payload.data;
        state.token = token;
        state.usuario = usuario;
        localStorage.setItem(TOKEN_KEY, token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.usuario = action.payload.data;
        state.restoring = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.token = null;
        state.usuario = null;
        state.restoring = false;
        localStorage.removeItem(TOKEN_KEY);
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
