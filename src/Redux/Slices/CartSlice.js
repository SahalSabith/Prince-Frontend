// redux/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../axiosInstance';

const API_BASE = 'http://0.0.0.0:8000/api';

const getTokenHeader = () => {
  const token = localStorage.getItem('access');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Helper function to extract error message
const extractErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  if (error?.detail) return error.detail;
  if (error?.non_field_errors) return error.non_field_errors[0];
  return 'An unexpected error occurred';
};

// Add item to cart (with extras support)
export const addToCart = createAsyncThunk(
  'cart/addToCart', 
  async (cartData, { rejectWithValue }) => {
    try {
      console.log('Adding to cart:', cartData);
      const response = await axiosInstance.post(
        `${API_BASE}/cart/add/`, 
        cartData, 
        getTokenHeader()
      );
      console.log('Add to cart response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Add to cart error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Failed to add item to cart' }
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
      console.log('Get cart response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Get cart error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error fetching cart' }
      );
    }
  }
);

// Update cart item quantity, note, and extras
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, note, extras }, { rejectWithValue }) => {
    try {
      console.log('Updating cart item:', { itemId, quantity, note, extras });
      
      const updateData = {};
      if (quantity !== undefined) updateData.quantity = quantity;
      if (note !== undefined) updateData.note = note || '';
      if (extras !== undefined) updateData.extras = extras;

      const response = await axiosInstance.patch(
        `${API_BASE}/cart/item/${itemId}/update/`,
        updateData,
        getTokenHeader()
      );
      console.log('Cart item update response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Cart item update error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error updating cart item' }
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
        `${API_BASE}/cart/item/${itemId}/delete/`,
        getTokenHeader()
      );
      console.log('Cart item removal response:', response.data);
      return { itemId, ...response.data };
    } catch (err) {
      console.error('Cart item removal error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error removing cart item' }
      );
    }
  }
);

// Add extra to cart item
export const addCartItemExtra = createAsyncThunk(
  'cart/addCartItemExtra',
  async ({ itemId, extraId, quantity = 1 }, { rejectWithValue }) => {
    try {
      console.log('Adding extra to cart item:', { itemId, extraId, quantity });
      const response = await axiosInstance.post(
        `${API_BASE}/cart/items/${itemId}/extras/`,
        { extra_id: extraId, quantity },
        getTokenHeader()
      );
      console.log('Add cart item extra response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Add cart item extra error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error adding extra to cart item' }
      );
    }
  }
);

// Remove extra from cart item
export const removeCartItemExtra = createAsyncThunk(
  'cart/removeCartItemExtra',
  async ({ itemId, extraId }, { rejectWithValue }) => {
    try {
      console.log('Removing extra from cart item:', { itemId, extraId });
      const response = await axiosInstance.delete(
        `${API_BASE}/cart/items/${itemId}/extras/${extraId}/`,
        getTokenHeader()
      );
      console.log('Remove cart item extra response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Remove cart item extra error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error removing extra from cart item' }
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
        err.response?.data || { error: err.message || 'Error updating cart' }
      );
    }
  }
);

// Place order
export const placeOrder = createAsyncThunk(
  'cart/placeOrder', 
  async (orderData, { rejectWithValue }) => {
    try {
      console.log('Placing order:', orderData);
      const response = await axiosInstance.post(
        `${API_BASE}/order/`, 
        orderData || {}, 
        getTokenHeader()
      );
      console.log('Place order response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Place order error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Failed to place order' }
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
      console.log('Get orders response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Get orders error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error fetching orders' }
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
      console.log('Clear cart response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Clear cart error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error clearing cart' }
      );
    }
  }
);

// Repeat order
export const repeatOrder = createAsyncThunk(
  'cart/repeatOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      console.log('Repeating order:', orderId);
      const response = await axiosInstance.post(
        `${API_BASE}/orders/${orderId}/repeat/`,
        {},
        getTokenHeader()
      );
      console.log('Repeat order response:', response.data);
      return response.data;
    } catch (err) {
      console.error('Repeat order error:', err.response?.data || err.message);
      return rejectWithValue(
        err.response?.data || { error: err.message || 'Error repeating order' }
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
    orderLoading: false, // Separate loading state for placing orders
    extraLoading: {}, // Track loading state for extras operations
  },
  reducers: {
    clearCartState: (state) => {
      state.fetchCart = null;
      state.error = null;
      state.successMessage = null;
      state.loading = false;
      state.updateLoading = false;
      state.orderLoading = false;
      state.itemUpdateLoading = {};
      state.extraLoading = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    // Optimistic update for cart level changes
    updateCartOptimistic: (state, action) => {
      if (state.fetchCart) {
        state.fetchCart = { ...state.fetchCart, ...action.payload };
      }
    },
    // Optimistic update for individual items
    updateItemOptimistic: (state, action) => {
      const { itemId, quantity, note } = action.payload;
      if (state.fetchCart && state.fetchCart.items) {
        const itemIndex = state.fetchCart.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          const item = state.fetchCart.items[itemIndex];
          if (quantity !== undefined) item.quantity = quantity;
          if (note !== undefined) item.note = note;
          
          // Recalculate item total if item has price
          if (item.item && item.item.price) {
            const baseTotal = item.item.price * (item.quantity || 0);
            const extrasTotal = item.extras ? item.extras.reduce((sum, extra) => 
              sum + (extra.total_amount || 0), 0) : 0;
            item.total_amount = baseTotal + extrasTotal;
          }
          
          // Recalculate cart total
          state.fetchCart.total_amount = state.fetchCart.items.reduce(
            (total, cartItem) => total + (cartItem.total_amount || 0), 0
          );
        }
      }
    },
    // Optimistic removal
    removeItemOptimistic: (state, action) => {
      const itemId = action.payload;
      if (state.fetchCart && state.fetchCart.items) {
        state.fetchCart.items = state.fetchCart.items.filter(item => item.id !== itemId);
        
        // Recalculate cart total
        state.fetchCart.total_amount = state.fetchCart.items.reduce(
          (total, cartItem) => total + (cartItem.total_amount || 0), 0
        );
      }
    },
    // Optimistic extra addition
    addExtraOptimistic: (state, action) => {
      const { itemId, extra, quantity } = action.payload;
      if (state.fetchCart && state.fetchCart.items) {
        const itemIndex = state.fetchCart.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          const item = state.fetchCart.items[itemIndex];
          if (!item.extras) item.extras = [];
          
          // Check if extra already exists
          const existingExtraIndex = item.extras.findIndex(e => e.extra.id === extra.id);
          if (existingExtraIndex !== -1) {
            item.extras[existingExtraIndex].quantity += quantity;
            item.extras[existingExtraIndex].total_amount = 
              extra.price * item.extras[existingExtraIndex].quantity;
          } else {
            item.extras.push({
              id: Date.now(), // Temporary ID
              extra: extra,
              quantity: quantity,
              total_amount: extra.price * quantity
            });
          }
          
          // Recalculate totals
          const baseTotal = item.item.price * item.quantity;
          const extrasTotal = item.extras.reduce((sum, e) => sum + e.total_amount, 0);
          item.total_amount = baseTotal + extrasTotal;
          
          state.fetchCart.total_amount = state.fetchCart.items.reduce(
            (total, cartItem) => total + cartItem.total_amount, 0
          );
        }
      }
    },
    // Optimistic extra removal
    removeExtraOptimistic: (state, action) => {
      const { itemId, extraId } = action.payload;
      if (state.fetchCart && state.fetchCart.items) {
        const itemIndex = state.fetchCart.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          const item = state.fetchCart.items[itemIndex];
          if (item.extras) {
            item.extras = item.extras.filter(e => e.extra.id !== extraId);
            
            // Recalculate totals
            const baseTotal = item.item.price * item.quantity;
            const extrasTotal = item.extras.reduce((sum, e) => sum + e.total_amount, 0);
            item.total_amount = baseTotal + extrasTotal;
            
            state.fetchCart.total_amount = state.fetchCart.items.reduce(
              (total, cartItem) => total + cartItem.total_amount, 0
            );
          }
        }
      }
    },
    // Reset item loading state
    resetItemLoading: (state, action) => {
      const itemId = action.payload;
      if (state.itemUpdateLoading[itemId]) {
        delete state.itemUpdateLoading[itemId];
      }
    },
    // Reset extra loading state
    resetExtraLoading: (state, action) => {
      const { itemId, extraId } = action.payload;
      const key = `${itemId}-${extraId}`;
      if (state.extraLoading[key]) {
        delete state.extraLoading[key];
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
        state.error = extractErrorMessage(action.payload);
      })

      // Get Cart
      .addCase(getCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCart.fulfilled, (state, action) => {
        state.loading = false;
        state.fetchCart = action.payload;
        state.error = null;
      })
      .addCase(getCart.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload);
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
        
        // Update the cart with the response data
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        
        state.successMessage = action.payload.message || 'Item updated successfully';
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg.itemId;
        state.itemUpdateLoading[itemId] = false;
        state.error = extractErrorMessage(action.payload);
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
        
        // Update the cart with the response data
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        
        state.successMessage = action.payload.message || 'Item removed successfully';
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        const itemId = action.meta.arg;
        state.itemUpdateLoading[itemId] = false;
        state.error = extractErrorMessage(action.payload);
      })

      // Add Cart Item Extra
      .addCase(addCartItemExtra.pending, (state, action) => {
        const { itemId, extraId } = action.meta.arg;
        const key = `${itemId}-${extraId}`;
        state.extraLoading[key] = true;
        state.error = null;
      })
      .addCase(addCartItemExtra.fulfilled, (state, action) => {
        const { itemId, extraId } = action.meta.arg;
        const key = `${itemId}-${extraId}`;
        state.extraLoading[key] = false;
        
        // Update the cart with the response data
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        
        state.successMessage = action.payload.message || 'Extra added successfully';
      })
      .addCase(addCartItemExtra.rejected, (state, action) => {
        const { itemId, extraId } = action.meta.arg;
        const key = `${itemId}-${extraId}`;
        state.extraLoading[key] = false;
        state.error = extractErrorMessage(action.payload);
      })

      // Remove Cart Item Extra
      .addCase(removeCartItemExtra.pending, (state, action) => {
        const { itemId, extraId } = action.meta.arg;
        const key = `${itemId}-${extraId}`;
        state.extraLoading[key] = true;
        state.error = null;
      })
      .addCase(removeCartItemExtra.fulfilled, (state, action) => {
        const { itemId, extraId } = action.meta.arg;
        const key = `${itemId}-${extraId}`;
        state.extraLoading[key] = false;
        
        // Update the cart with the response data
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        
        state.successMessage = action.payload.message || 'Extra removed successfully';
      })
      .addCase(removeCartItemExtra.rejected, (state, action) => {
        const { itemId, extraId } = action.meta.arg;
        const key = `${itemId}-${extraId}`;
        state.extraLoading[key] = false;
        state.error = extractErrorMessage(action.payload);
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
        state.error = extractErrorMessage(action.payload);
      })

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.orderLoading = true;
        state.loading = true; // Keep for backward compatibility
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.orderLoading = false;
        state.loading = false;
        state.fetchCart = null; // Clear cart after successful order
        state.successMessage = action.payload.detail || action.payload.message || 'Order placed successfully';
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.orderLoading = false;
        state.loading = false;
        state.error = extractErrorMessage(action.payload);
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
        state.error = extractErrorMessage(action.payload);
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
        state.error = extractErrorMessage(action.payload);
      })

      // Repeat Order
      .addCase(repeatOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(repeatOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.cart) {
          state.fetchCart = action.payload.cart;
        }
        state.successMessage = action.payload.message || 'Order items added to cart successfully';
      })
      .addCase(repeatOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload);
      });
  }
});

export const { 
  clearCartState, 
  clearError, 
  clearSuccessMessage, 
  updateCartOptimistic,
  updateItemOptimistic,
  removeItemOptimistic,
  addExtraOptimistic,
  removeExtraOptimistic,
  resetItemLoading,
  resetExtraLoading
} = cartSlice.actions;

export default cartSlice.reducer;