import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// const base_url = "https://sahalsabith.pythonanywhere.com/api/";
const base_url = "http://192.168.29.42:8000/api/";

// Helper functions for localStorage
const getTokenFromStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const setTokenInStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('Failed to save token to localStorage:', error);
  }
};

const removeTokenFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove token from localStorage:', error);
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Fixed verifyToken async thunk with proper error handling
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      
      // Safe access to auth state with fallback
      const authState = state.auth || {};
      let accessToken = authState.accessToken;
      let refreshToken = authState.refreshToken;
      
      // If no token in state, try to get from localStorage
      if (!accessToken) {
        accessToken = getTokenFromStorage('accessToken');
      }
      
      if (!refreshToken) {
        refreshToken = getTokenFromStorage('refreshToken');
      }
      
      if (!accessToken) {
        throw new Error('No access token');
      }
      
      // Check if token is expired
      if (isTokenExpired(accessToken)) {
        console.log('Access token expired, trying to refresh...');
        
        if (!refreshToken) {
          throw new Error('No refresh token available for refresh');
        }
        
        // Try to refresh the token
        const refreshResult = await thunkAPI.dispatch(refreshAccessToken()).unwrap();
        return { tokens: refreshResult, verified: true };
      }
      
      // If token appears valid, just return success
      // You can add a backend verification call here if needed
      console.log('Token appears valid');
      return { verified: true, token: accessToken };
      
    } catch (error) {
      console.log('Token verification failed:', error.message);
      
      // Try to get refresh token safely before attempting refresh
      const state = thunkAPI.getState();
      const authState = state.auth || {};
      const refreshToken = authState.refreshToken || getTokenFromStorage('refreshToken');
      
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const refreshResult = await thunkAPI.dispatch(refreshAccessToken()).unwrap();
          return { tokens: refreshResult, verified: true };
        } catch (refreshError) {
          console.log('Token refresh also failed:', refreshError);
          return thunkAPI.rejectWithValue(error.response?.data || error.message);
        }
      } else {
        console.log('No valid refresh token available');
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
      }
    }
  }
);

// Async thunk for login
export const login = createAsyncThunk(
  'auth/login',
  async (loginData, thunkAPI) => {
    try {
      const response = await axios.post(`${base_url}login/`, loginData);
      
      // Store tokens in localStorage
      if (response.data.tokens) {
        setTokenInStorage('accessToken', response.data.tokens.access);
        setTokenInStorage('refreshToken', response.data.tokens.refresh);
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for signup
export const signup = createAsyncThunk(
  'auth/signup',
  async (signupData, thunkAPI) => {
    try {
      const response = await axios.post(`${base_url}signup/`, signupData);
      
      // Store tokens in localStorage
      if (response.data.tokens) {
        setTokenInStorage('accessToken', response.data.tokens.access);
        setTokenInStorage('refreshToken', response.data.tokens.refresh);
      }
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const refreshToken = state.auth.refreshToken;
      
      if (refreshToken) {
        // Send logout request with refresh token
        await axios.post(`${base_url}logout/`, {
          refresh: refreshToken
        });
      }
      
      // Clear tokens from localStorage
      removeTokenFromStorage('accessToken');
      removeTokenFromStorage('refreshToken');
      
      return {};
    } catch (error) {
      // Even if logout fails on server, clear tokens locally
      removeTokenFromStorage('accessToken');
      removeTokenFromStorage('refreshToken');
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for refreshing access token
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      // Check if refresh token is expired
      if (isTokenExpired(refreshToken)) {
        throw new Error('Refresh token expired');
      }
      
      const response = await axios.post(`${base_url}token/refresh/`, {
        refresh: refreshToken
      });
      
      // Update access token in localStorage
      if (response.data.access) {
        setTokenInStorage('accessToken', response.data.access);
      }
      
      return response.data;
    } catch (error) {
      // If refresh fails, user needs to login again
      removeTokenFromStorage('accessToken');
      removeTokenFromStorage('refreshToken');
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get initial authentication state
const getInitialAuthState = () => {
  const accessToken = getTokenFromStorage('accessToken');
  const refreshToken = getTokenFromStorage('refreshToken');
  
  // If we have tokens, assume authenticated initially
  // The component will verify the tokens
  const hasTokens = accessToken && refreshToken;
  
  return {
    accessToken,
    refreshToken,
    user: null,
    isAuthenticated: hasTokens,
    status: hasTokens ? 'idle' : 'unauthenticated',
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialAuthState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthState: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
      state.status = 'unauthenticated';
      state.error = null;
      removeTokenFromStorage('accessToken');
      removeTokenFromStorage('refreshToken');
    },
    setAuthState: (state, action) => {
      const { accessToken, refreshToken, user } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;
      state.isAuthenticated = true;
      state.status = 'succeeded';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Token verification cases
      .addCase(verifyToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.isAuthenticated = true;
        state.error = null;
        
        // Update tokens if they were refreshed during verification
        if (action.payload.tokens) {
          if (action.payload.tokens.access) {
            state.accessToken = action.payload.tokens.access;
          }
          if (action.payload.tokens.refresh) {
            state.refreshToken = action.payload.tokens.refresh;
          }
        }
        
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      })
      .addCase(verifyToken.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'unauthenticated';
        removeTokenFromStorage('accessToken');
        removeTokenFromStorage('refreshToken');
      })
      
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Signup cases
      .addCase(signup.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.tokens.access;
        state.refreshToken = action.payload.tokens.refresh;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'unauthenticated';
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout fails, clear the state
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'unauthenticated';
      })
      
      // Refresh token cases
      .addCase(refreshAccessToken.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.access;
        state.isAuthenticated = true;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // If refresh fails, user needs to login again
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.status = 'unauthenticated';
      });
  },
});

export const { clearError, clearAuthState, setAuthState } = authSlice.actions;
export default authSlice.reducer;