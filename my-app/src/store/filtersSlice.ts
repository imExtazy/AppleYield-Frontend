import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type FiltersState = {
  q: string;
};

const initialState: FiltersState = {
  q: '',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setQ(state, action: PayloadAction<string>) {
      state.q = action.payload;
    },
    reset(state) {
      state.q = '';
    },
  },
});

export const { setQ, reset } = filtersSlice.actions;
export default filtersSlice.reducer;


