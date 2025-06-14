import { configureStore } from '@reduxjs/toolkit';
import accountReducer from './Slices/AccountSlice';
import productReducer from './Slices/ProductSlice';
import cartReducer from './Slices/CartSlice';

const store = configureStore({
  reducer: {
    account: accountReducer,
    product: productReducer,
    cart: cartReducer,
  },
});

export default store;
