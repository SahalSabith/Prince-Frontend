// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../axiosInstance'

const API_BASE = 'http://localhost:8000/api';


const getTokenHeader = () => {
  const token = localStorage.getItem('access');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const addToCart = createAsyncThunk('cart/addToCart', async (cartData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/cart/add/`, cartData, getTokenHeader());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const getCart = createAsyncThunk('cart/getCart', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/cart/`,getTokenHeader());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Error fetching cart');
  }
});

export const placeOrder = createAsyncThunk('cart/placeOrder', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`${API_BASE}/order/`, {}, getTokenHeader());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const getOrders = createAsyncThunk('cart/getOrders', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/orders/`, getTokenHeader());
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

// --- Slice ---
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    fetchCart: null,
    orders: [],
    loading: false,
    error: null,
    successMessage: null
  },
  reducers: {
    clearCartState: (state) => {
      state.fetchCart = null;
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = action.payload;
        state.successMessage = 'Cart updated successfully';
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = null;
        state.successMessage = action.payload.detail || 'Order placed successfully';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Orders
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //get cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = action.payload;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCartState } = cartSlice.actions;

export default cartSlice.reducer;