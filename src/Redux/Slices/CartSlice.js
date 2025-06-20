// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

const API_BASE = 'http://127.0.0.1:8000/api';

const getTokenHeader = () => {
  const token = localStorage.getItem('access');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart', 
  async (cartData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE}/cart/add/`, 
        cartData, 
        getTokenHeader()
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: err.message }
      );
    }
  }
);

// Get cart
export const getCart = createAsyncThunk(
  'cart/getCart', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE}/cart/`, 
        getTokenHeader()
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: 'Error fetching cart' }
      );
    }
  }
);

// Update cart item quantity and note
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, note }, { rejectWithValue }) => {
    try {
      console.log('Updating cart item:', { itemId, quantity, note });
      const response = await axiosInstance.patch(
        `${API_BASE}/cart/item/${itemId}/`,
        { quantity, note: note || '' },
        getTokenHeader()
      );
      console.log('Cart item update response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Cart item update error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: 'Error updating cart item' }
      );
    }
  }
);

// Remove cart item
export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      console.log('Removing cart item:', itemId);
      const response = await axiosInstance.delete(
        `${API_BASE}/cart/item/${itemId}/`,
        getTokenHeader()
      );
      console.log('Cart item removal response:', response.data);
      return { itemId, ...response.data };
    } catch (err) {
      console.error('Cart item removal error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: 'Error removing cart item' }
      );
    }
  }
);

// Edit/Update cart (for order type and table number)
export const editCart = createAsyncThunk(
  'cart/editCart', 
  async (cartData, { rejectWithValue }) => {
    try {
      console.log('Updating cart with:', cartData);
      const response = await axiosInstance.patch(
        `${API_BASE}/cart/`, 
        cartData, 
        getTokenHeader()
      );
      console.log('Cart update response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Cart update error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: 'Error updating cart' }
      );
    }
  }
);

// Place order
export const placeOrder = createAsyncThunk(
  'cart/placeOrder', 
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `${API_BASE}/order/`, 
        orderData || {}, 
        getTokenHeader()
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: err.message }
      );
    }
  }
);

// Get orders
export const getOrders = createAsyncThunk(
  'cart/getOrders', 
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `${API_BASE}/orders/`, 
        getTokenHeader()
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: err.message }
      );
    }
  }
);

// Clear cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        `${API_BASE}/cart/`,
        getTokenHeader()
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data || { error: 'Error clearing cart' }
      );
    }
  }
);

// --- Slice ---
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    fetchCart: null,
    orders: [],
    loading: false,
    error: null,
    successMessage: null,
    updateLoading: false, // Separate loading state for updates
    itemUpdateLoading: {}, // Track loading state for individual items
  },
  reducers: {
    clearCartState: (state) => {
      state.fetchCart = null;
      state.error = null;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    // Optimistic update for better UX
    updateCartOptimistic: (state, action) => {
      if (state.fetchCart) {
        state.fetchCart = { ...state.fetchCart, ...action.payload };
      }
    },
    // Optimistic update for individual items
    updateItemOptimistic: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (state.fetchCart && state.fetchCart.items) {
        const itemIndex = state.fetchCart.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          state.fetchCart.items[itemIndex].quantity = quantity;
          state.fetchCart.items[itemIndex].total_amount = 
            state.fetchCart.items[itemIndex].item.price * quantity;
          
          // Recalculate total
          state.fetchCart.total_amount = state.fetchCart.items.reduce(
            (total, item) => total + item.total_amount, 0
          );
        }
      }
    },
    // Optimistic removal
    removeItemOptimistic: (state, action) => {
      const itemId = action.payload;
      if (state.fetchCart && state.fetchCart.items) {
        state.fetchCart.items = state.fetchCart.items.filter(item => item.id !== itemId);
        
        // Recalculate total
        state.fetchCart.total_amount = state.fetchCart.items.reduce(
          (total, item) => total + item.total_amount, 0
        );
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Add To Cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = action.payload;
        state.successMessage = 'Item added to cart successfully';
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to add item to cart';
      })

      // Get Cart
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
        state.error = action.payload?.error || action.payload || 'Failed to fetch cart';
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemUpdateLoading[itemId] = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemUpdateLoading[itemId] = false;
        // Update the cart with the response data - the backend returns { cart: {...}, item: {...} }
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        state.successMessage = action.payload.message || 'Item updated successfully';
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemUpdateLoading[itemId] = false;
        state.error = action.payload?.error || action.payload || 'Failed to update cart item';
      })

      // Remove Cart Item
      .addCase(removeCartItem.pending, (state, action) => {
        const itemId = action.meta.arg;
        state.itemUpdateLoading[itemId] = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        const itemId = action.meta.arg;
        state.itemUpdateLoading[itemId] = false;
        // Update the cart with the response data - the backend returns { cart: {...} }
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        state.successMessage = action.payload.message || 'Item removed successfully';
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg;
        state.itemUpdateLoading[itemId] = false;
        state.error = action.payload?.error || action.payload || 'Failed to remove cart item';
      })

      // Edit Cart (order type, table number)
      .addCase(editCart.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(editCart.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.fetchCart = action.payload;
      })
      .addCase(editCart.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload?.error || action.payload || 'Failed to update cart';
      })

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = null; // Clear cart after successful order
        state.successMessage = action.payload.detail || action.payload.message || 'Order placed successfully';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to place order';
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
        state.error = action.payload?.error || action.payload || 'Failed to fetch orders';
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = null;
        state.successMessage = action.payload.message || 'Cart cleared successfully';
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || action.payload || 'Failed to clear cart';
      });
  }
});

export const { 
  clearCartState, 
  clearError, 
  clearSuccessMessage, 
  updateCartOptimistic,
  updateItemOptimistic,
  removeItemOptimistic
} = cartSlice.actions;

export default cartSlice.reducer;