import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart, Printer, ChefHat } from 'lucide-react';

const Cart = ({ cart, updateQuantity, removeFromCart, onClose, isMobile = false }) => {
  const [orderType, setOrderType] = useState('delivery');
  const [tableNumber, setTableNumber] = useState('');

  const orderTypes = [
    { value: 'delivery', label: 'Delivery' },
    { value: 'parcel', label: 'Parcel' },
    { value: 'table', label: 'Table' },
  ];

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    // TODO: Add API integration for placing order
    const orderData = {
      items: cart,
      orderType,
      tableNumber: orderType === 'table' ? tableNumber : null,
      total: calculateTotal(),
      timestamp: new Date().toISOString(),
    };
    
    // Example API call structure:
    // try {
    //   const response = await dispatch(placeOrder(orderData)).unwrap();
    //   console.log('Order placed successfully:', response);
    //   // Clear cart and show success message
    // } catch (error) {
    //   console.error('Error placing order:', error);
    //   // Show error message
    // }
    
    console.log('Order Data:', orderData);
    alert('Order placed successfully!');
  };

  const handlePrintBill = () => {
    // TODO: Add API integration for printing bill
    console.log('Printing bill...');
    window.print();
  };

  const handleKitchenPrint = () => {
    // TODO: Add API integration for kitchen printing
    console.log('Sending to kitchen printer...');
    alert('Order sent to kitchen!');
  };

  return (
    <div className={`bg-white ${isMobile ? 'h-full' : 'w-80 h-full border-l border-gray-200'} flex flex-col`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} className="text-amber-600" />
          <h2 className="text-xl font-bold text-gray-800">Cart</h2>
          {cart.length > 0 && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-1 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Order Type Selector */}
      <div className="p-4 border-b border-gray-200">
        <label className="block text-sm font-semibold mb-2 text-gray-700">Order Type</label>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white"
        >
          {orderTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        
        {/* Table Number Input */}
        {orderType === 'table' && (
          <div className="mt-3">
            <label className="block text-sm font-semibold mb-1 text-gray-700">Table Number</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Enter table number"
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-gray-400 text-sm">Add some delicious items!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
                    <p className="text-amber-600 font-bold text-sm">₹{item.price}</p>
                    {item.note && (
                      <p className="text-gray-500 text-xs mt-1 italic">Note: {item.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Minus size={12} className="text-gray-600" />
                    </button>
                    
                    <span className="font-semibold text-gray-800 min-w-[1.5rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center transition-colors duration-200"
                    >
                      <Plus size={12} className="text-white" />
                    </button>
                  </div>
                  
                  <span className="font-bold text-gray-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total and Actions */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Total */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                ₹{calculateTotal()}
              </span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={orderType === 'table' && !tableNumber}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-3 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Place Order
          </button>

          {/* Print Options */}
          <div className="flex gap-2">
            <button
              onClick={handlePrintBill}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-xl transition-all duration-200 text-sm"
            >
              <Printer size={16} />
              Print Bill
            </button>
            
            <button
              onClick={handleKitchenPrint}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-3 rounded-xl transition-all duration-200 text-sm"
            >
              <ChefHat size={16} />
              Kitchen Print
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;