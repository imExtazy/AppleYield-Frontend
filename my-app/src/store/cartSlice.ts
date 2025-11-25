import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../api/axiosInstance';

type CartState = {
  orderId: number | null;
  itemsCount: number;
  loading: boolean;
  error: string | null;
};

const initialState: CartState = {
  orderId: null,
  itemsCount: 0,
  loading: false,
  error: null,
};

export const fetchCartThunk = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<{ order_id: number | null; items_count: number }>('/months_calculation/cart/');
    return data;
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 401 || status === 403) {
      return { order_id: null, items_count: 0 };
    }
    const message = e?.response?.data?.detail || e?.message || 'Ошибка корзины';
    return rejectWithValue(message);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart(state, action: PayloadAction<{ order_id: number | null; items_count: number }>) {
      state.orderId = action.payload.order_id;
      state.itemsCount = action.payload.items_count;
      state.error = null;
    },
    resetCart(state) {
      state.orderId = null;
      state.itemsCount = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action: PayloadAction<{ order_id: number | null; items_count: number }>) => {
        state.loading = false;
        state.orderId = action.payload.order_id;
        state.itemsCount = action.payload.items_count;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка корзины';
      });
  },
});

export const { setCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;


