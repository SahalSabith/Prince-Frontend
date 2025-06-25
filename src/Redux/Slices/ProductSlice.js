import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../axiosInstance'

const API_URL = 'http://0.0.0.0:8000/api';

export const fetchCategories = createAsyncThunk(
  'product/fetchCategories',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/categories/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchProducts = createAsyncThunk(
  'product/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/products/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchProductDetail = createAsyncThunk(
  'product/fetchProductDetail',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/products/${id}/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const fetchProductExtras = createAsyncThunk(
  'product/fetchProductExtras',
  async (productId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`${API_URL}/products/${productId}/extras/`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    categories: [],
    products: [],
    productExtras: null,
    productDetail: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Product Detail
    builder.addCase(fetchProductDetail.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProductDetail.fulfilled, (state, action) => {
      state.loading = false;
      state.productDetail = action.payload;
    });
    builder.addCase(fetchProductDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Product Extras
    builder.addCase(fetchProductExtras.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchProductExtras.fulfilled, (state, action) => {
      state.loading = false;
      state.productExtras = action.payload;
    });
    builder.addCase(fetchProductExtras.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default productSlice.reducer;