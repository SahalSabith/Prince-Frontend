import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getCart, placeOrder } from '../Redux/Slices/CartSlice';

function Cart({ updateQuantity, removeFromCart, onClose, isMobile = false }) {
  const [orderType, setOrderType] = useState('delivery');
  const [tableNumber, setTableNumber] = useState('');
  const dispatch = useDispatch();
  const { fetchCart, loading, error, successMessage } = useSelector(state => state.cart);
  
  // Extract cart items from fetchCart
  const cartItems = fetchCart?.items || [];

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  const orderTypes = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'parcel', label: 'Parcel' },
    { value: 'table', label: 'Table' },
  ];

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    const orderData = {
      items: cartItems, 
      orderType,
      tableNumber: orderType === 'table' ? tableNumber : null,
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
    };
    
    console.log('Order Data:', orderData);
    
    try {
      await dispatch(placeOrder()).unwrap();
      alert('Order placed successfully!');
      // Clear the form after successful order
      setOrderType('delivery');
      setTableNumber('');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
  };

  const handlePrintBill = () => {
    console.log('Printing bill...');
    window.print();
  };

  const handleKitchenPrint = () => {
    console.log('Sending to kitchen printer...');
    alert('Order sent to kitchen!');
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`bg-white ${isMobile ? 'h-full' : 'w-80 h-full border-l border-gray-200'} flex flex-col items-center justify-center`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <p className="mt-2 text-gray-600">Loading cart...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`bg-white ${isMobile ? 'h-full' : 'w-80 h-full border-l border-gray-200'} flex flex-col items-center justify-center`}>
        <p className="text-red-600 text-center">Error loading cart: {error}</p>
        <button 
          onClick={() => dispatch(getCart())}
          className="mt-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white ${isMobile ? 'h-full' : 'w-80 h-full border-l border-gray-200'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-amber-600" />
          <h2 className="text-xl font-bold text-gray-800">Cart</h2>
          {cartItems.length > 0 && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full font-bold">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors duration-200"
        >
          <X size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Order Type Selector */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <label className="block text-sm font-semibold mb-2 text-gray-700">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
        >
          {orderTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        
        {orderType === 'table' && (
          <div className="mt-3">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Table Number</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
            />
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
            <p className="text-gray-400 text-sm mt-1">Add some delicious items!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-base">{item.product.name}</h4>
                    <p className="text-amber-600 font-bold text-sm">₹{item.product.price}</p>
                    {item.note && (
                      <p className="text-gray-500 text-xs mt-1 italic bg-gray-50 p-2 rounded-lg">
                        Note: {item.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart && removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity && updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    
                    <span className="font-semibold text-gray-800 min-w-[2rem] text-center text-lg">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity && updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Plus size={14} className="text-white" />
                    </button>
                  </div>
                  
                  <span className="font-bold text-gray-800 text-lg">
                    ₹{item.product.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total and Actions */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Total */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                ₹{fetchCart?.total_amount || calculateTotal()}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={orderType === 'table' && !tableNumber}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
          >
            Place Order
          </button>

          {/* Print Options */}
          <div className="flex gap-2">
            <button
              onClick={handlePrintBill}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-3 rounded-xl transition-all duration-200 text-sm border border-gray-200"
            >
              <Printer size={16} />
              <span className="hidden sm:inline">Print Bill</span>
              <span className="sm:hidden">Bill</span>
            </button>
            
            <button
              onClick={handleKitchenPrint}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-3 px-3 rounded-xl transition-all duration-200 text-sm border border-orange-200"
            >
              <ChefHat size={16} />
              <span className="hidden sm:inline">Kitchen</span>
              <span className="sm:hidden">KOT</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;