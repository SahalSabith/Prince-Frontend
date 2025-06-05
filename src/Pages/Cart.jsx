import React, { useEffect, useState } from 'react';
import { Minus, Plus, Edit3, Trash2, Printer, CheckCircle, XCircle, AlertCircle, ShoppingCart, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCart, 
  updateCart, 
  updateCartItem, 
  deleteCartItem, 
  clearCart, 
  placeOrder,
  printOrder,
  clearMessages,
  clearPrintResults,
  fetchOrders
} from '../Redux/orderSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const { 
    cart, 
    cartItems, 
    loading, 
    cartLoading, 
    orderLoading, 
    printLoading,
    error, 
    cartError, 
    orderError, 
    printError,
    message, 
    orderSuccess,
    printSuccess,
    printResults,
    orders
  } = useSelector((state) => state.order);

  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState('dine_in');
  const [showPrintStatus, setShowPrintStatus] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
    dispatch(fetchOrders());
  }, [dispatch]);

  useEffect(() => {
    if (cart) {
      setTableNumber(cart.table_number || '');
      setOrderType(cart.order_type || 'dine_in');
    }
  }, [cart]);

  useEffect(() => {
    if (orderSuccess) {
      if (printResults && printResults.length > 0) {
        setShowPrintStatus(true);
      }
      
      if (orders && orders.length > 0) {
        setLastOrderId(orders[0].id);
      }
      
      setTimeout(() => {
        dispatch(clearMessages());
        setShowPrintStatus(false);
        dispatch(clearPrintResults());
      }, 5000);
    }
  }, [orderSuccess, printResults, orders, dispatch]);

  useEffect(() => {
    if (printSuccess) {
      setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
    }
  }, [printSuccess, dispatch]);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(deleteCartItem(itemId));
    } else {
      dispatch(updateCartItem({ itemId, quantity: newQuantity }));
    }
  };

  const handleCartUpdate = () => {
    if (tableNumber || orderType !== 'dine_in') {
      dispatch(updateCart({
        table_number: tableNumber,
        order_type: orderType
      }));
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      dispatch(clearCart());
    }
  };

  const handlePlaceOrder = () => {
    if (orderType === 'dine_in' && !tableNumber) {
      alert('Please enter a table number for dine-in orders');
      return;
    }

    const cartUpdateData = {
      table_number: tableNumber,
      order_type: orderType
    };

    dispatch(updateCart(cartUpdateData)).then((result) => {
      if (result.type === 'order/updateCart/fulfilled') {
        dispatch(placeOrder());
      }
    });
  };

  const handleReprintOrder = (orderId, printType = 'receipt') => {
    if (!orderId) {
      alert('No order available to reprint');
      return;
    }
    
    dispatch(printOrder({ 
      orderId, 
      printType, 
      printerName: null 
    }));
  };

  // Calculate totals
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.dish_price * item.quantity), 0);

  // Get the latest order for reprint functionality
  const latestOrder = orders && orders.length > 0 ? orders[0] : null;
  const availableOrderId = lastOrderId || latestOrder?.id;

  // Mobile floating cart button
  const CartFloatingButton = () => (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsCartOpen(true)}
        className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200 relative"
      >
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </button>
    </div>
  );

  // Mobile cart overlay
  const MobileCartOverlay = () => (
    <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Cart Panel */}
      <div className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl transform transition-transform duration-300 ${isCartOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-bold text-gray-800">
                Order #{cart?.id || 'New'}
              </h2>
              <p className="text-xs text-gray-500">{itemCount} items</p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Service Options */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Order Type</label>
              <select 
                value={orderType}
                onChange={(e) => {
                  setOrderType(e.target.value);
                  setTimeout(() => handleCartUpdate(), 100);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="dine_in">Dine In</option>
                <option value="takeaway">Take Away</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {orderType === 'dine_in' ? 'Table Number *' : 'Name/Table'}
              </label>
              <input
                type="text"
                placeholder={orderType === 'dine_in' ? "Enter table number" : "Enter your name"}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                onBlur={handleCartUpdate}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                  orderType === 'dine_in' && !tableNumber ? 'border-red-300 focus:ring-red-400' : 'border-gray-300'
                }`}
              />
              {orderType === 'dine_in' && !tableNumber && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Table number is required
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Print Status */}
        {showPrintStatus && printResults && printResults.length > 0 && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
            <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <Printer className="w-3 h-3" />
              Print Status:
            </h4>
            <div className="space-y-1">
              {printResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {result.success ? (
                    <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                  )}
                  <span className={result.success ? "text-green-700" : "text-red-700"}>
                    <span className="font-medium">
                      {result.type === 'customer_receipt' ? 'Customer Receipt' : 
                       result.type === 'kitchen_order' ? 'Kitchen Order' : 'Print'}:
                    </span> {result.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {(message || error || cartError || orderError || printError) && (
          <div className="px-4 py-2">
            {message && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {typeof message === 'string' ? message : 'Operation successful'}
              </div>
            )}
            {(error || cartError || orderError || printError) && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 flex-shrink-0" />
                {typeof (error || cartError || orderError || printError) === 'string' 
                  ? (error || cartError || orderError || printError) 
                  : 'An error occurred'}
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="max-h-80 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-center">Your cart is empty</p>
              <p className="text-sm text-gray-400 text-center mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-200 p-3 rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">
                      {item.dish_name?.charAt(0)?.toUpperCase() || 'D'}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm leading-tight">
                      {item.dish_name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-blue-600">
                        ${parseFloat(item.dish_price || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total: ${(parseFloat(item.dish_price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={loading}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 space-y-4">
            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-blue-600">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClearCart}
                disabled={loading}
                className="flex-1 text-red-600 border border-red-200 py-3 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              
              {availableOrderId && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReprintOrder(availableOrderId, 'kitchen')}
                    disabled={printLoading}
                    className="flex-1 text-blue-600 border border-blue-200 py-3 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Kitchen
                  </button>
                  <button
                    onClick={() => handleReprintOrder(availableOrderId, 'receipt')}
                    disabled={printLoading}
                    className="flex-1 text-green-600 border border-green-200 py-3 rounded-lg font-medium hover:bg-green-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Receipt
                  </button>
                </div>
              )}
            </div>
            
            <button 
              onClick={handlePlaceOrder}
              disabled={
                cartItems.length === 0 || 
                orderLoading || 
                (orderType === 'dine_in' && !tableNumber) ||
                cartLoading
              }
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
              {orderLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Placing Order & Printing...
                </div>
              ) : cartItems.length === 0 ? (
                'Add Items to Order'
              ) : orderType === 'dine_in' && !tableNumber ? (
                'Enter Table Number'
              ) : (
                `Place Order • $${subtotal.toFixed(2)}`
              )}
            </button>
            
            <div className="text-xs text-gray-500 text-center">
              {cartItems.length} item{cartItems.length > 1 ? 's' : ''} • {orderType.replace('_', ' ')}
              {orderType === 'dine_in' && tableNumber && ` • Table ${tableNumber}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Desktop cart
  const DesktopCart = () => (
    <div className="hidden md:flex w-full h-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-lg flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Order #{cart?.id || 'New'}
            </h2>
            <p className="text-xs text-gray-600">
              {orderType === 'dine_in' ? `Table ${tableNumber || '?'}` : 
               orderType === 'takeaway' ? 'Take Away' : 'Delivery'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-gray-500" />
            {availableOrderId && (
              <button
                onClick={() => handleReprintOrder(availableOrderId, 'receipt')}
                disabled={printLoading}
                className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
                title="Reprint Customer Receipt"
              >
                {printLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                ) : (
                  <Printer className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Service Options */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder={orderType === 'dine_in' ? "Table Number *" : "Table/Name"}
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            onBlur={handleCartUpdate}
            className={`px-2 py-1.5 text-xs bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${
              orderType === 'dine_in' && !tableNumber ? 'border-red-300' : 'border-gray-200'
            }`}
          />
          <select 
            value={orderType}
            onChange={(e) => {
              setOrderType(e.target.value);
              setTimeout(() => handleCartUpdate(), 100);
            }}
            className="px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          >
            <option value="takeaway">Take Away</option>
            <option value="dine_in">Dine In</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
        {orderType === 'dine_in' && !tableNumber && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Table number is required for dine-in orders
          </p>
        )}
      </div>

      {/* Print Status */}
      {showPrintStatus && printResults && printResults.length > 0 && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
          <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
            <Printer className="w-3 h-3" />
            Print Status:
          </h4>
          <div className="space-y-1">
            {printResults.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                {result.success ? (
                  <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                )}
                <span className={result.success ? "text-green-700" : "text-red-700"}>
                  <span className="font-medium">
                    {result.type === 'customer_receipt' ? 'Customer Receipt' : 
                     result.type === 'kitchen_order' ? 'Kitchen Order' : 'Print'}:
                  </span> {result.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {(message || error || cartError || orderError || printError) && (
        <div className="px-4 py-2 space-y-1">
          {message && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3 flex-shrink-0" />
              {typeof message === 'string' ? message : 'Operation successful'}
            </div>
          )}
          {(error || cartError || orderError || printError) && (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1">
              <XCircle className="w-3 h-3 flex-shrink-0" />
              {typeof (error || cartError || orderError || printError) === 'string' 
                ? (error || cartError || orderError || printError) 
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
            <p className="text-sm text-gray-500 text-center">Cart is empty</p>
            <p className="text-xs text-gray-400 text-center mt-1">Add items to get started</p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-lg hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {item.dish_name?.charAt(0)?.toUpperCase() || 'D'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {item.dish_name}
                  </h4>
                  <p className="text-sm font-bold text-blue-600">
                    ${parseFloat(item.dish_price || 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${(parseFloat(item.dish_price || 0) * item.quantity).toFixed(2)} total
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

      {/* Total & Actions */}
      {cartItems.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-gray-800">Total</span>
            <span className="text-xl font-bold text-blue-600">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <button
              onClick={handleClearCart}
              disabled={cartLoading}
              className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear Cart
            </button>
            {availableOrderId && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleReprintOrder(availableOrderId, 'kitchen')}
                  disabled={printLoading}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3 h-3" />
                  Kitchen
                </button>
                <button
                  onClick={() => handleReprintOrder(availableOrderId, 'receipt')}
                  disabled={printLoading}
                  className="text-xs text-green-600 hover:text-green-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  <Printer className="w-3 h-3" />
                  Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Place Order Button */}
      <div className="p-4">
        <button 
          onClick={handlePlaceOrder}
          disabled={
            cartItems.length === 0 || 
            orderLoading || 
            (orderType === 'dine_in' && !tableNumber) ||
            cartLoading
          }
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-sm"
        >
          {orderLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Placing Order & Printing...
            </div>
          ) : cartItems.length === 0 ? (
            'Add Items to Order'
          ) : orderType === 'dine_in' && !tableNumber ? (
            'Enter Table Number'
          ) : (
            `Place Order (${cartItems.length} item${cartItems.length > 1 ? 's' : ''})`
          )}
        </button>
        
        {/* Order summary */}
        {cartItems.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            {cartItems.length} item{cartItems.length > 1 ? 's' : ''} • ${subtotal.toFixed(2)} • {orderType.replace('_', ' ')}
            {orderType === 'dine_in' && tableNumber && ` • Table ${tableNumber}`}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <DesktopCart />
      
      <CartFloatingButton />
      
      <MobileCartOverlay />
    </div>
  );
};

export default Cart;