/**
 * auth/slice.ts — Patrón: Redux Feature Slice
 * RF1: Gestión de acceso al sistema
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

export const loginUser = createAsyncThunk('auth/login', async (
  creds: { correo: string; contrasena: string }, { rejectWithValue }
) => {
  try {
    const res = await authService.login(creds.correo, creds.contrasena);
    return res.data; // { user, token }
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Error de inicio de sesión');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (
  data: any, { rejectWithValue }
) => {
  try {
    const res = await authService.register(data);
    return res.data;
  } catch (e: any) {
    return rejectWithValue(e.response?.data?.message || 'Error de registro');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null as any,
    token: null as string | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    logout: (state) => {          // RF1.5
      state.user = null;
      state.token = null;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending,    (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled,  (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.token;
        state.loading = false;
      })
      .addCase(loginUser.rejected,   (state, { payload }) => {
        state.error = payload as string;
        state.loading = false;
      })
      .addCase(registerUser.pending,   (state) => { state.loading = true; })
      .addCase(registerUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.token = payload.token;
        state.loading = false;
      })
      .addCase(registerUser.rejected,  (state, { payload }) => {
        state.error = payload as string;
        state.loading = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
