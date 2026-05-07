/**
 * services/slice.ts
 * RF2: Mostrar y seleccionar servicios
 * RF3: Buscador/filtro de servicios
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService } from '../../services/serviceService';

export const fetchServices = createAsyncThunk('services/fetchAll', async () => {
  const res = await serviceService.getAll();
  return res.data;
});

export const searchServices = createAsyncThunk('services/search', async (query: string) => {
  const res = await serviceService.search(query);
  return res.data;
});

const servicesSlice = createSlice({
  name: 'services',
  initialState: {
    list: [] as any[],
    selected: null as any,
    loading: false,
    error: null as string | null,
    searchQuery: '',
  },
  reducers: {
    selectService: (state, { payload }) => { state.selected = payload; }, // RF2.2
    setSearchQuery: (state, { payload }) => { state.searchQuery = payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending,   (state) => { state.loading = true; })
      .addCase(fetchServices.fulfilled, (state, { payload }) => {
        state.list = payload; state.loading = false;
      })
      .addCase(searchServices.fulfilled, (state, { payload }) => {
        state.list = payload; state.loading = false;
      });
  },
});

export const { selectService, setSearchQuery } = servicesSlice.actions;
export default servicesSlice.reducer;
