/**
 * tracking/slice.ts
 * RF8: Mostrar ubicación en tiempo real
 * Patrón: Observer (WebSocket)
 */
import { createSlice } from '@reduxjs/toolkit';

const trackingSlice = createSlice({
  name: 'tracking',
  initialState: {
    latitude: null as number | null,
    longitude: null as number | null,
    lastUpdate: null as string | null,
    error: null as string | null,
    isTracking: false,
  },
  reducers: {
    updateOperatorLocation: (state, { payload }) => { // RF8.2
      state.latitude  = payload.latitude;
      state.longitude = payload.longitude;
      state.lastUpdate = new Date().toISOString();
    },
    setLocationError: (state, { payload }) => { state.error = payload; },
    startTracking:   (state) => { state.isTracking = true; state.error = null; },
    stopTracking:    (state) => { state.isTracking = false; },
  },
});

export const { updateOperatorLocation, setLocationError, startTracking, stopTracking } =
  trackingSlice.actions;
export default trackingSlice.reducer;
