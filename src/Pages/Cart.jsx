import React, { useEffect, useState } from 'react';
import { Minus, Plus, Edit3, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart, 
  updateCart, 
  updateCartItem, 
  deleteCartItem, 
  clearCart, 
  placeOrder,
  clearMessages 
} from '../Redux/orderSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { 
    cart, 
    cartItems, 
    loading, 
    cartLoading, 
    orderLoading, 
    error, 
    cartError, 
    orderError, 
    message, 
    orderSuccess 
  } = useSelector((state) => state.order);

  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState('dine_in');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (cart) {
      setTableNumber(cart.table_number || '');
      setOrderType(cart.order_type || 'dine_in');
    }
  }, [cart]);

  useEffect(() => {
    if (orderSuccess) {
      // Clear messages after successful order
      setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
    }
  }, [orderSuccess, dispatch]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(deleteCartItem(itemId));
    } else {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  const handleCartUpdate = () => {
    dispatch(updateCart({
      table_number: tableNumber,
      order_type: orderType
    }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handlePlaceOrder = () => {
    // Update cart details first, then place order
    if (tableNumber && orderType) {
      dispatch(updateCart({
        table_number: tableNumber,
        order_type: orderType
      })).then(() => {
        dispatch(placeOrder());
      });
    } else {
      dispatch(placeOrder());
    }
  };

  // Calculate subtotal from cartItems
  const subtotal = cartItems.reduce((sum, item) => sum + (item.dish_price * item.quantity), 0);

  // Show loading state
  if (cartLoading && !cart) {
    return (
      <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-xl shadow-lg flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Order #{cart?.id || 'New'}
            </h2>
            <p className="text-xs text-gray-600">Your Order</p>
          </div>
          <Edit3 className="w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Service Options */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            onBlur={handleCartUpdate}
            className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <select 
            value={orderType}
            onChange={(e) => {
              setOrderType(e.target.value);
              // Auto-update cart when order type changes
              setTimeout(() => handleCartUpdate(), 100);
            }}
            className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="dine_in">Dine In</option>
            <option value="takeaway">Take Away</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {/* Success/Error Messages */}
      {(message || error || cartError || orderError) && (
        <div className="px-4 py-2">
          {message && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              {typeof message === 'string' ? message : 'Operation successful'}
            </div>
          )}
          {(error || cartError || orderError) && (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              {typeof (error || cartError || orderError) === 'string' 
                ? (error || cartError || orderError) 
                : 'An error occurred'}
            </div>
          )}
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 max-h-64 overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Cart is empty</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-lg hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {item.dish_name?.charAt(0) || 'D'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {item.dish_name}
                  </h4>
                  <p className="text-sm font-bold text-blue-600">
                    ${parseFloat(item.dish_price).toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    disabled={loading}
                    className="w-7 h-7 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    disabled={loading}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-blue-600">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleClearCart}
            disabled={cartLoading}
            className="mt-2 text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            Clear Cart
          </button>
        </div>
      )}

      {/* Place Order Button */}
      <div className="p-4">
        <button 
          onClick={handlePlaceOrder}
          disabled={cartItems.length === 0 || orderLoading || !tableNumber}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
        >
          {orderLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Placing Order...
            </div>
          ) : cartItems.length === 0 ? (
            'Add Items to Order'
          ) : !tableNumber ? (
            'Enter Table Number'
          ) : (
            'Place Order'
          )}
        </button>
      </div>
    </div>
  );
};

export default Cart;