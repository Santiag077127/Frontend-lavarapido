/**
 * profile/slice.ts
 * RF9: Configurar perfil
 * RF10: Preferencias (idioma y tema)
 */
import { createSlice } from '@reduxjs/toolkit';

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null as any,
    vehicle: null as any,
    language: 'es' as 'es' | 'en' | 'fr' | 'pt', // RF10.1
    theme: 'default' as 'light' | 'dark' | 'default', // RF10.2
    loading: false,
  },
  reducers: {
    updateProfile:  (state, { payload }) => { state.user = { ...state.user, ...payload }; },
    updateVehicle:  (state, { payload }) => { state.vehicle = payload; },
    setLanguage:    (state, { payload }) => { state.language = payload; }, // RF10.1
    setTheme:       (state, { payload }) => { state.theme = payload; },   // RF10.2
  },
});

export const { updateProfile, updateVehicle, setLanguage, setTheme } = profileSlice.actions;
export default profileSlice.reducer;
