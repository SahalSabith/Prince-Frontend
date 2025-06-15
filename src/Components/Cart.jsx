import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getCart, 
  placeOrder, 
  editCart, 
  updateCartItem,
  removeCartItem,
  clearError, 
  clearSuccessMessage,
  updateItemOptimistic,
  removeItemOptimistic
} from '../Redux/Slices/CartSlice';

function Cart({ onClose, isMobile = false }) {
  const [orderType, setOrderType] = useState('delivery');
  const [tableNumber, setTableNumber] = useState('');
  
  const dispatch = useDispatch();
  const { 
    fetchCart, 
    loading, 
    updateLoading, 
    error, 
    successMessage,
    itemUpdateLoading
  } = useSelector(state => state.cart);
  
  // Extract cart items from fetchCart
  const cartItems = fetchCart?.items || [];
  
  // Ref for debounce timeout
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Initialize local state from cart data
  useEffect(() => {
    if (fetchCart) {
      setOrderType(fetchCart.order_type || 'delivery');
      setTableNumber(fetchCart.table_number || '');
    }
  }, [fetchCart]);

  // Clear messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const orderTypes = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'parcel', label: 'Parcel' },
    { value: 'table', label: 'Table' },
  ];

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.item.price * item.quantity), 0);
  }, [cartItems]);

  // Debounced cart update function
  const updateCartWithDebounce = useCallback((updateData) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await dispatch(editCart(updateData)).unwrap();
      } catch (error) {
        console.error('Failed to update cart:', error);
      }
    }, 800); // 800ms delay
  }, [dispatch]);

  const handleOrderTypeChange = (newOrderType) => {
    setOrderType(newOrderType);
    
    // Prepare update data
    const updateData = {
      order_type: newOrderType,
      table_number: newOrderType === 'table' ? tableNumber : null,
    };

    // Update cart with debounce
    updateCartWithDebounce(updateData);
  };

  const handleTableNumberChange = (newTableNumber) => {
    setTableNumber(newTableNumber);
    
    if (orderType === 'table') {
      // Prepare update data
      const updateData = {
        order_type: orderType,
        table_number: newTableNumber,
      };

      // Update cart with debounce
      updateCartWithDebounce(updateData);
    }
  };

  // Fixed quantity update handler
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      handleRemoveItem(itemId);
      return;
    }

    try {
      // Optimistic update for better UX
      dispatch(updateItemOptimistic({ itemId, quantity: newQuantity }));

      // Use the correct Redux action for updating cart item
      await dispatch(updateCartItem({ 
        itemId, 
        quantity: newQuantity, 
        note: cartItems.find(item => item.id === itemId)?.note || '' 
      })).unwrap();

    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Revert optimistic update on error by refetching cart
      dispatch(getCart());
    }
  };

  // Fixed remove item handler
  const handleRemoveItem = async (itemId) => {
    try {
      // Optimistic update - remove item from local state
      dispatch(removeItemOptimistic(itemId));

      // Use the correct Redux action for removing cart item
      await dispatch(removeCartItem(itemId)).unwrap();

    } catch (error) {
      console.error('Failed to remove item:', error);
      // Revert optimistic update on error by refetching cart
      dispatch(getCart());
    }
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'table' && !tableNumber.trim()) {
      alert('Please enter a table number');
      return;
    }

    const orderData = {
      order_type: orderType,
      table_number: orderType === 'table' ? tableNumber.trim() : null,
    };
    
    try {
      await dispatch(placeOrder(orderData)).unwrap();
      // Reset form after successful order
      setOrderType('delivery');
      setTableNumber('');
      // Close cart on successful order
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  const handlePrintBill = () => {
    const printContent = `
      <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0;">RESTAURANT BILL</h2>
          <p style="margin: 5px 0;">Order Type: ${orderType.toUpperCase()}</p>
          ${orderType === 'table' ? `<p style="margin: 5px 0;">Table: ${tableNumber}</p>` : ''}
          <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;">Time: ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          ${cartItems.map(item => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div style="flex: 1;">
                <div style="font-weight: bold;">${item.item.name}</div>
                <div style="font-size: 12px;">₹${item.item.price} × ${item.quantity}</div>
                ${item.note ? `<div style="font-size: 10px; color: #666;">Note: ${item.note}</div>` : ''}
              </div>
              <div style="font-weight: bold;">₹${item.item.price * item.quantity}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="border-top: 2px solid #000; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold;">
            <span>TOTAL:</span>
            <span>₹${fetchCart?.total_amount || calculateTotal()}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px;">
          <p>Thank you for your order!</p>
          <p>Please visit again</p>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { margin: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleKitchenPrint = () => {
    const kotContent = `
      <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0;">KITCHEN ORDER</h2>
          <p style="margin: 5px 0;">Order Type: ${orderType.toUpperCase()}</p>
          ${orderType === 'table' ? `<p style="margin: 5px 0; font-size: 18px; font-weight: bold;">TABLE: ${tableNumber}</p>` : ''}
          <p style="margin: 5px 0;">Time: ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          ${cartItems.map(item => `
            <div style="margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
              <div style="font-size: 16px; font-weight: bold;">${item.item.name}</div>
              <div style="font-size: 14px; margin: 5px 0;">Quantity: ${item.quantity}</div>
              ${item.note ? `<div style="font-size: 12px; color: #666; background: #f0f0f0; padding: 5px; border-radius: 3px;">Special Instructions: ${item.note}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 14px; font-weight: bold;">
          Total Items: ${cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Kitchen Order</title>
          <style>
            body { margin: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>${kotContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(getCart());
  };

  // Show loading state
  if (loading && !fetchCart) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="ml-3 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col max-h-screen">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <ShoppingCart size={18} className="text-amber-600 sm:w-5 sm:h-5" />
          <h2 className="text-base sm:text-lg font-bold text-gray-800">Cart</h2>
          {cartItems.length > 0 && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
          {updateLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors duration-200"
          >
            <X size={18} className="text-gray-600 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="flex-shrink-0 p-3 sm:p-4 space-y-2">
          {/* Error Display */}
          {error && (
            <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
              <div className="flex-1 min-w-0">
                <p className="text-red-700 text-xs sm:text-sm break-words">
                  {typeof error === 'string' ? error : error.message || 'Something went wrong'}
                </p>
                <button 
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-800 text-xs underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-xs sm:text-sm">{successMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Order Type Selector */}
      <div className="flex-shrink-0 p-3 sm:p-4 bg-gray-50">
        <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => handleOrderTypeChange(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
        >
          {orderTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        
        {orderType === 'table' && (
          <div className="mt-3">
            <label className="block text-xs sm:text-sm font-semibold mb-1 text-gray-700">
              Table Number *
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => handleTableNumberChange(e.target.value)}
              placeholder="Enter table number"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            />
          </div>
        )}
      </div>

      {/* Cart Items - Scrollable with proper height calculation */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-3 sm:p-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <ShoppingCart size={40} className="text-gray-300 mx-auto mb-3 sm:mb-4 sm:w-12 sm:h-12" />
              <p className="text-gray-500 text-sm sm:text-base font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Add some delicious items!</p>
            </div>
          ) : (
            <div className="space-y-3 pb-2">
              {cartItems.map(item => {
                const isItemLoading = itemUpdateLoading[item.id];
                
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-2">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight">{item.item.name}</h4>
                        <p className="text-amber-600 font-bold text-xs sm:text-sm mt-1">₹{item.item.price}</p>
                        {item.note && (
                          <p className="text-gray-500 text-xs mt-2 italic bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                            Note: {item.note}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isItemLoading}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {isItemLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-red-500"></div>
                        ) : (
                          <X size={14} className="sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity - 1)}
                          disabled={isItemLoading}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                        >
                          <Minus size={12} className="text-gray-600 sm:w-3.5 sm:h-3.5" />
                        </button>
                        
                        <span className="font-semibold text-gray-800 min-w-[1.5rem] sm:min-w-[2rem] text-center text-sm sm:text-base">
                          {isItemLoading ? (
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-amber-600 mx-auto"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityUpdate(item.id, item.quantity + 1)}
                          disabled={isItemLoading}
                          className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50"
                        >
                          <Plus size={12} className="text-white sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                      
                      <span className="font-bold text-gray-800 text-sm sm:text-base">
                        ₹{item.item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Total and Actions - Fixed at bottom */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 border-t border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4 bg-white">
          {/* Total */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                ₹{fetchCart?.total_amount || calculateTotal()}
              </span>
            </div>
          </div>

          {/* Print Options */}
          <div className="flex gap-2">
            <button
              onClick={handlePrintBill}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-200 text-xs sm:text-sm border border-gray-200 shadow-sm"
            >
              <Printer size={14} className="sm:w-4 sm:h-4" />
              <span>Bill</span>
            </button>
            
            <button
              onClick={handleKitchenPrint}
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all duration-200 text-xs sm:text-sm border border-orange-200 shadow-sm"
            >
              <ChefHat size={14} className="sm:w-4 sm:h-4" />
              <span>KOT</span>
            </button>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={
              loading || 
              (orderType === 'table' && !tableNumber.trim()) ||
              cartItems.length === 0
            }
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-2.5 sm:py-3 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Placing Order...</span>
                <span className="sm:hidden">Placing...</span>
              </>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;