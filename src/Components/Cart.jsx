import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer, AlertCircle, Trash2 } from 'lucide-react';
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
    { value: 'delivery', label: 'Delivery', icon: '🚚' },
    { value: 'parcel', label: 'Parcel', icon: '📦' },
    { value: 'table', label: 'Table', icon: '🍽️' },
  ];

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, cartItem) => {
      const price = cartItem.item?.price || 0;
      const quantity = cartItem.quantity || 0;
      return total + (price * quantity);
    }, 0);
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
      const cartItem = cartItems.find(item => item.id === itemId);
      await dispatch(updateCartItem({ 
        itemId, 
        quantity: newQuantity, 
        note: cartItem?.note || '' 
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
          <h2 style="margin: 0;">PRINCE BAKERY</h2>
          <p style="margin: 5px 0;">Order Type: ${orderType.toUpperCase()}</p>
          ${orderType === 'table' ? `<p style="margin: 5px 0;">Table: ${tableNumber}</p>` : ''}
          <p style="margin: 5px 0;">Date: ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;">Time: ${new Date().toLocaleTimeString()}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          ${cartItems.map(cartItem => {
            const itemName = cartItem.item?.name || 'Unknown Item';
            const itemPrice = cartItem.item?.price || 0;
            const quantity = cartItem.quantity || 0;
            const note = cartItem.note || '';
            
            return `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <div style="flex: 1;">
                  <div style="font-weight: bold;">${itemName}</div>
                  <div style="font-size: 12px;">₹${itemPrice} × ${quantity}</div>
                  ${note ? `<div style="font-size: 10px; color: #666;">Note: ${note}</div>` : ''}
                </div>
                <div style="font-weight: bold;">₹${itemPrice * quantity}</div>
              </div>
            `;
          }).join('')}
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
          ${cartItems.map(cartItem => {
            const itemName = cartItem.item?.name || 'Unknown Item';
            const quantity = cartItem.quantity || 0;
            const note = cartItem.note || '';
            
            return `
              <div style="margin-bottom: 15px; border-bottom: 1px dashed #ccc; padding-bottom: 10px;">
                <div style="font-size: 16px; font-weight: bold;">${itemName}</div>
                <div style="font-size: 14px; margin: 5px 0;">Quantity: ${quantity}</div>
                ${note ? `<div style="font-size: 12px; color: #666; background: #f0f0f0; padding: 5px; border-radius: 3px;">Special Instructions: ${note}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 14px; font-weight: bold;">
          Total Items: ${cartItems.reduce((sum, cartItem) => sum + (cartItem.quantity || 0), 0)}
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-slate-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ShoppingCart size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Your Cart</h2>
                {cartItems.length > 0 && (
                  <p className="text-sm text-slate-600">
                    {cartItems.reduce((sum, cartItem) => sum + (cartItem.quantity || 0), 0)} items
                  </p>
                )}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-xl transition-colors"
              >
                <X size={20} className="text-slate-600" />
              </button>
            )}
          </div>
          
          {updateLoading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Updating cart...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="flex-shrink-0 p-4 space-y-3">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-sm">
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
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm">{successMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Order Type Selector */}
      <div className="flex-shrink-0 p-4 lg:p-6 bg-slate-50 border-b border-slate-200">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">Order Type</label>
          <div className="grid grid-cols-3 gap-2">
            {orderTypes.map(type => (
              <button
                                key={type.value}
                onClick={() => handleOrderTypeChange(type.value)}
                className={`flex flex-col items-center justify-center p-3 border rounded-xl text-sm font-medium transition ${
                  orderType === type.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          {orderType === 'table' && (
            <input
              type="text"
              placeholder="Enter table number"
              value={tableNumber}
              onChange={(e) => handleTableNumberChange(e.target.value)}
              className="w-full p-2 mt-2 border border-slate-300 rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
        {cartItems.length === 0 ? (
          <p className="text-center text-slate-500">Your cart is empty.</p>
        ) : (
          cartItems.map((cartItem) => {
            const itemName = cartItem.item?.name || 'Unnamed Item';
            const itemPrice = cartItem.item?.price || 0;
            const quantity = cartItem.quantity || 1;

            return (
              <div
                key={cartItem.id}
                className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl"
              >
                <div>
                  <p className="font-semibold text-slate-800">{itemName}</p>
                  <p className="text-sm text-slate-500">₹{itemPrice}</p>
                  {cartItem.note && (
                    <p className="text-xs text-slate-400 mt-1">Note: {cartItem.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityUpdate(cartItem.id, quantity - 1)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded"
                    disabled={itemUpdateLoading}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityUpdate(cartItem.id, quantity + 1)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded"
                    disabled={itemUpdateLoading}
                  >
                    <Plus size={14} />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(cartItem.id)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 border-t border-slate-200 p-4 lg:p-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-slate-700">Total:</span>
            <span className="text-lg font-bold text-slate-900">
              ₹{fetchCart?.total_amount || calculateTotal()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handlePrintBill}
              className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium text-sm"
            >
              <Printer className="mr-2" size={16} /> Bill
            </button>
            <button
              onClick={handleKitchenPrint}
              className="flex items-center justify-center p-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-medium text-sm"
            >
              <ChefHat className="mr-2" size={16} /> KOT
            </button>
            <button
              onClick={handlePlaceOrder}
              className="flex items-center justify-center p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm"
              disabled={loading || updateLoading}
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;