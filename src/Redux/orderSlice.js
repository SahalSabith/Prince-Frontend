import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const base_url = "http://192.168.29.56:8000/api/"
// const base_url = "http://127.0.0.1:8000/api/";

const getAuthToken = () => {
    return localStorage.getItem('accessToken');
};

const getAuthConfig = () => ({
    headers: {
        Authorization: `Bearer ${getAuthToken()}`,
    },
});

// Cart API calls
export const fetchCart = createAsyncThunk(
    'order/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base_url}cart/`, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateCart = createAsyncThunk(
    'order/updateCart',
    async (cartData, { rejectWithValue }) => {
        try {
            const response = await axios.patch(`${base_url}cart/`, cartData, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const clearCart = createAsyncThunk(
    'order/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.delete(`${base_url}cart/`, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Cart Items API calls
export const fetchCartItems = createAsyncThunk(
    'order/fetchCartItems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base_url}cart/items/`, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createCartItem = createAsyncThunk(
    'order/createCartItem',
    async (cartData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${base_url}cart/items/`, cartData, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchCartItem = createAsyncThunk(
    'order/fetchCartItem',
    async (itemId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base_url}cart/items/${itemId}/`, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'order/updateCartItem',
    async ({ itemId, quantity }, { rejectWithValue }) => {
        try {
            const response = await axios.patch(
                `${base_url}cart/items/${itemId}/`,
                { quantity },
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteCartItem = createAsyncThunk(
    'order/deleteCartItem',
    async (itemId, { rejectWithValue }) => {
        try {
            await axios.delete(`${base_url}cart/items/${itemId}/`, getAuthConfig());
            return itemId;
        } catch (error) {
            console.log(error.response?.data || error.message);
            
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Order API calls
export const placeOrder = createAsyncThunk(
    'order/placeOrder',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${base_url}orders/place/`, {}, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchOrders = createAsyncThunk(
    'order/fetchOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base_url}orders/`, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchOrderDetail = createAsyncThunk(
    'order/fetchOrderDetail',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${base_url}orders/${orderId}/`, getAuthConfig());
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Print Order API call
export const printOrder = createAsyncThunk(
    'order/printOrder',
    async ({ orderId, printType = 'receipt', printerName = null }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${base_url}orders/${orderId}/print/`, 
                { 
                    print_type: printType,
                    printer_name: printerName 
                }, 
                getAuthConfig()
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const getInitialState = () => {
    return {
        // Cart state
        cart: null,
        cartItems: [],
        
        // Orders state
        orders: [],
        currentOrder: null,
        
        // Print state
        printResults: [],
        printLoading: false,
        printError: null,
        printSuccess: false,
        
        // Loading states
        loading: false,
        cartLoading: false,
        orderLoading: false,
        
        // Error states
        error: null,
        cartError: null,
        orderError: null,
        
        // Success states
        success: false,
        cartSuccess: false,
        orderSuccess: false,
        
        // Messages
        message: null,
    };
};

const orderSlice = createSlice({
    name: 'order',
    initialState: getInitialState(),
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.cartError = null;
            state.orderError = null;
            state.printError = null;
            state.message = null;
        },
        resetSuccess: (state) => {
            state.success = false;
            state.cartSuccess = false;
            state.orderSuccess = false;
            state.printSuccess = false;
        },
        clearCart: (state) => {
            state.cart = null;
            state.cartItems = [];
        },
        clearOrders: (state) => {
            state.orders = [];
            state.currentOrder = null;
        },
        clearPrintResults: (state) => {
            state.printResults = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => {
                state.cartLoading = true;
                state.cartError = null;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.cartLoading = false;
                state.cart = action.payload;
                state.cartItems = action.payload.items || [];
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.cartLoading = false;
                state.cartError = action.payload;
            })

            // Update Cart
            .addCase(updateCart.pending, (state) => {
                state.cartLoading = true;
                state.cartError = null;
            })
            .addCase(updateCart.fulfilled, (state, action) => {
                state.cartLoading = false;
                state.cart = action.payload;
                state.cartSuccess = true;
                state.message = 'Cart updated successfully';
            })
            .addCase(updateCart.rejected, (state, action) => {
                state.cartLoading = false;
                state.cartError = action.payload;
            })

            // Clear Cart
            .addCase(clearCart.pending, (state) => {
                state.cartLoading = true;
                state.cartError = null;
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.cartLoading = false;
                state.cartItems = [];
                state.cart = { ...state.cart, items: [], total_amount: 0 };
                state.cartSuccess = true;
                state.message = action.payload.message || 'Cart cleared successfully';
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.cartLoading = false;
                state.cartError = action.payload;
            })

            // Fetch Cart Items
            .addCase(fetchCartItems.pending, (state) => {
                state.cartLoading = true;
                state.cartError = null;
            })
            .addCase(fetchCartItems.fulfilled, (state, action) => {
                state.cartLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(fetchCartItems.rejected, (state, action) => {
                state.cartLoading = false;
                state.cartError = action.payload;
            })

            // Create Cart Item
            .addCase(createCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                
                // Update cart items
                const existingItemIndex = state.cartItems.findIndex(
                    item => item.id === action.payload.item.id
                );
                
                if (existingItemIndex !== -1) {
                    state.cartItems[existingItemIndex] = action.payload.item;
                } else {
                    state.cartItems.push(action.payload.item);
                }
            })
            .addCase(createCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            })

            // Fetch Cart Item
            .addCase(fetchCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCartItem.fulfilled, (state, action) => {
                state.loading = false;
                // Update specific item in cartItems array
                const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
                if (itemIndex !== -1) {
                    state.cartItems[itemIndex] = action.payload;
                }
            })
            .addCase(fetchCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update Cart Item
            .addCase(updateCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Update specific item in cartItems array
                const itemIndex = state.cartItems.findIndex(item => item.id === action.payload.id);
                if (itemIndex !== -1) {
                    state.cartItems[itemIndex] = action.payload;
                }
                state.message = 'Item updated successfully';
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete Cart Item
            .addCase(deleteCartItem.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCartItem.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                
                // Remove item from cartItems array
                state.cartItems = state.cartItems.filter(item => item.id !== action.payload);
                state.message = 'Item removed from cart';
            })
            .addCase(deleteCartItem.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Place Order
            .addCase(placeOrder.pending, (state) => {
                state.orderLoading = true;
                state.orderError = null;
                state.orderSuccess = false;
            })
            .addCase(placeOrder.fulfilled, (state, action) => {
                state.orderLoading = false;
                state.orderSuccess = true;
                state.message = action.payload.message;
                
                // Store print results if available
                if (action.payload.print_results) {
                    state.printResults = action.payload.print_results;
                }
                
                // Add new order to orders array
                state.orders.unshift(action.payload.order);
                
                // Clear cart after successful order
                state.cart = null;
                state.cartItems = [];
            })
            .addCase(placeOrder.rejected, (state, action) => {
                state.orderLoading = false;
                state.orderError = action.payload;
                state.orderSuccess = false;
            })

            // Fetch Orders
            .addCase(fetchOrders.pending, (state) => {
                state.orderLoading = true;
                state.orderError = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action) => {
                state.orderLoading = false;
                state.orders = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.orderLoading = false;
                state.orderError = action.payload;
            })

            // Fetch Order Detail
            .addCase(fetchOrderDetail.pending, (state) => {
                state.orderLoading = true;
                state.orderError = null;
            })
            .addCase(fetchOrderDetail.fulfilled, (state, action) => {
                state.orderLoading = false;
                state.currentOrder = action.payload;
            })
            .addCase(fetchOrderDetail.rejected, (state, action) => {
                state.orderLoading = false;
                state.orderError = action.payload;
            })

            // Print Order
            .addCase(printOrder.pending, (state) => {
                state.printLoading = true;
                state.printError = null;
                state.printSuccess = false;
            })
            .addCase(printOrder.fulfilled, (state, action) => {
                state.printLoading = false;
                state.printSuccess = true;
                state.message = action.payload.message;
                
                // Store print result
                if (action.payload.result) {
                    state.printResults = [action.payload.result];
                }
            })
            .addCase(printOrder.rejected, (state, action) => {
                state.printLoading = false;
                state.printError = action.payload;
                state.printSuccess = false;
            });
    },
});

export const { 
    clearMessages, 
    resetSuccess, 
    clearCart: clearCartState, 
    clearOrders,
    clearPrintResults
} = orderSlice.actions;

export default orderSlice.reducer;

// Selectors
export const selectCart = (state) => state.order.cart;
export const selectCartItems = (state) => state.order.cartItems;
export const selectOrders = (state) => state.order.orders;
export const selectCurrentOrder = (state) => state.order.currentOrder;
export const selectOrderLoading = (state) => state.order.orderLoading;
export const selectCartLoading = (state) => state.order.cartLoading;
export const selectLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.orderError;
export const selectCartError = (state) => state.order.cartError;
export const selectError = (state) => state.order.error;
export const selectMessage = (state) => state.order.message;
export const selectOrderSuccess = (state) => state.order.orderSuccess;
export const selectCartSuccess = (state) => state.order.cartSuccess;
export const selectSuccess = (state) => state.order.success;
export const selectPrintResults = (state) => state.order.printResults;
export const selectPrintLoading = (state) => state.order.printLoading;
export const selectPrintError = (state) => state.order.printError;
export const selectPrintSuccess = (state) => state.order.printSuccess;