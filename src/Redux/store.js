import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './Slices/AccountSlice';

const store = configureStore({
  reducer: {
    account: accountReducer,
  },
});

export default store;
