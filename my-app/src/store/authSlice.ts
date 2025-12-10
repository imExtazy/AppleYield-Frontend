import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { MeInfo } from '../api/auth';
import { axiosInstance } from '../api/axiosInstance';
import { fetchCartThunk } from './cartSlice';

type AuthState = {
  user: MeInfo | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      try { await axiosInstance.get('/csrf/'); } catch {}
      await axiosInstance.post('/login', payload);
      const { data } = await axiosInstance.get<MeInfo>('/users/me/');
      dispatch(fetchCartThunk() as any);
      return data;
    } catch (e: any) {
      const message = e?.response?.data?.detail || e?.message || 'Ошибка входа';
      return rejectWithValue(message);
    }
  },
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axiosInstance.post('/logout');
    return true;
  } catch (e: any) {
    const message = e?.response?.data?.detail || e?.message || 'Ошибка выхода';
    return rejectWithValue(message);
  }
});

export const fetchMeThunk = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<MeInfo>('/users/me/');
    return data;
  } catch (e: any) {
    const status = e?.response?.status;
    if (status === 401 || status === 403) return rejectWithValue('Требуется вход');
    const message = e?.response?.data?.detail || e?.message || 'Ошибка профиля';
    return rejectWithValue(message);
  }
});

export const updateMeThunk = createAsyncThunk(
  'auth/updateMe',
  async (payload: Partial<MeInfo>, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put<MeInfo>('/users/me/', payload);
      return data;
    } catch (e: any) {
      const message = e?.response?.data?.detail || e?.message || 'Ошибка обновления профиля';
      return rejectWithValue(message);
    }
  },
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (payload: { old_password: string; new_password: string }, { rejectWithValue }) => {
    try {
      await axiosInstance.post('/users/change_password/', payload);
      return true;
    } catch (e: any) {
      const message = e?.response?.data?.detail || e?.message || 'Ошибка смены пароля';
      return rejectWithValue(message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState(state) {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action: PayloadAction<MeInfo>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка входа';
      })
      .addCase(logoutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка выхода';
      })
      .addCase(fetchMeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action: PayloadAction<MeInfo>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка профиля';
      })
      .addCase(updateMeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMeThunk.fulfilled, (state, action: PayloadAction<MeInfo>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateMeThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка обновления профиля';
      })
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Ошибка смены пароля';
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;


