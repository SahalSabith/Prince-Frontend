// src/redux/slices/accountSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL of your Django backend
// const API_URL = 'http://127.0.0.1:8000/api';
const API_URL = 'http://192.168.0.109:8000/api';

// -------- Async Thunks ---------

export const signupUser = createAsyncThunk(
  'account/signupUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/signup/`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const loginUser = createAsyncThunk(
  'account/loginUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/login/`, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// -------- Slice ---------

const accountSlice = createSlice({
  name: 'account',
  initialState: {
    user: null,
    access: null,
    refresh: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.access = null;
      state.refresh = null;
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access = action.payload.tokens.access;
        state.refresh = action.payload.tokens.refresh;
        localStorage.setItem('access', action.payload.tokens.access);
        localStorage.setItem('refresh', action.payload.tokens.refresh);
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.access = action.payload.tokens.access;
        state.refresh = action.payload.tokens.refresh;
        localStorage.setItem('access', action.payload.tokens.access);
        localStorage.setItem('refresh', action.payload.tokens.refresh);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = accountSlice.actions;
export default accountSlice.reducer;
