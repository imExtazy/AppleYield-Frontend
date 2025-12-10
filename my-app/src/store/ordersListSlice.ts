import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { axiosInstance } from '../api/axiosInstance';

export type OrderShort = {
  id: number;
  status: string;
  created_at: string;
  submitted_at: string | null;
  finished_at: string | null;
  created_by_email?: string;
  moderator_email?: string | null;
  location?: string;
  person?: string;
  result_value?: string | null;
};

export type OrdersFilters = {
  status: string;
  submitted_from: string;
  submitted_to: string;
};

const LS_KEY = 'ordersList.filters';

function loadFilters(): OrdersFilters {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as OrdersFilters;
  } catch {}
  return { status: '', submitted_from: '', submitted_to: '' };
}

function saveFilters(f: OrdersFilters) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(f));
  } catch {}
}

type OrdersListState = {
  items: OrderShort[];
  loading: boolean;
  error: string | null;
  filters: OrdersFilters;
};

const initialState: OrdersListState = {
  items: [],
  loading: false,
  error: null,
  filters: loadFilters(),
};

export const fetchOrdersListThunk = createAsyncThunk(
  'ordersList/fetch',
  async (payload: OrdersFilters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (payload.status) params.set('status', payload.status);
      if (payload.submitted_from) params.set('submitted_from', payload.submitted_from);
      if (payload.submitted_to) params.set('submitted_to', payload.submitted_to);
      const qs = params.toString();
      const url = `/months_calculation/${qs ? `?${qs}` : ''}`;
      const { data } = await axiosInstance.get<OrderShort[]>(url);
      return data;
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 401 || status === 403) {
        return rejectWithValue('Требуется вход');
      }
      const message = e?.response?.data?.detail || e?.message || 'Ошибка загрузки заявок';
      return rejectWithValue(message);
    }
  },
);

const ordersListSlice = createSlice({
  name: 'ordersList',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<OrdersFilters>) {
      state.filters = action.payload;
      saveFilters(state.filters);
    },
    resetFilters(state) {
      state.filters = { status: '', submitted_from: '', submitted_to: '' };
      saveFilters(state.filters);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersListThunk.pending, (state) => {
        // Не включаем индикатор загрузки при активном списке, чтобы не "дёргать" таблицу на polling
        if (state.items.length === 0) state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersListThunk.fulfilled, (state, action: PayloadAction<OrderShort[]>) => {
        state.loading = false;
        const next = action.payload || [];
        // Обновляем список только при реальных изменениях, чтобы уменьшить "дёрганье" UI на polling
        const prev = state.items || [];
        let changed = prev.length !== next.length;
        if (!changed) {
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i];
            const b = next[i];
            if (!b || a.id !== b.id ||
                a.status !== b.status ||
                a.submitted_at !== b.submitted_at ||
                a.finished_at !== b.finished_at ||
                a.result_value !== b.result_value) {
              changed = true;
              break;
            }
          }
        }
        if (changed) state.items = next;
      })
      .addCase(fetchOrdersListThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка загрузки заявок';
      });
  },
});

export const { setFilters, resetFilters } = ordersListSlice.actions;
export default ordersListSlice.reducer;


