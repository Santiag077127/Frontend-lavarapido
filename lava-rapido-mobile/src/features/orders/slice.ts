/**
 * orders/slice.ts
 * RF2.2 Solicitar, RF6 Pago, RF7 Recibo
 * Patrón: Redux Slice + Strategy (pagos)
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';

export const createOrder = createAsyncThunk('orders/create', async (servicioId: string) => {
  const res = await orderService.create(servicioId);
  return res.data;
});

export const payOrder = createAsyncThunk('orders/pay', async (
  { orderId, method }: { orderId: string; method: string }
) => {
  const res = await paymentService.pay(orderId, method); // Patrón Strategy
  return res.data;
});

export const fetchReceipt = createAsyncThunk('orders/receipt', async (orderId: string) => {
  const res = await orderService.getReceipt(orderId);
  return res.data;
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    current: null as any,
    receipt: null as any,
    paymentMethods: [] as string[],
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearOrder: (state) => { state.current = null; state.receipt = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.fulfilled, (state, { payload }) => { state.current = payload; })
      .addCase(payOrder.fulfilled,    (state, { payload }) => {
        if (state.current) state.current.estado = 'pagado';
      })
      .addCase(fetchReceipt.fulfilled,(state, { payload }) => { state.receipt = payload; });
  },
});

export const { clearOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
