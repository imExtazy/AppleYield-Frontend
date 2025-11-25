import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './filtersSlice';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import ordersListReducer from './ordersListSlice';

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    auth: authReducer,
    cart: cartReducer,
    ordersList: ordersListReducer,
  },
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


