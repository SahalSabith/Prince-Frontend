import React, { useState } from 'react';
import { Minus, Plus, Edit3, Trash2 } from 'lucide-react';

const Cart = ({ cart, onUpdateCart, onRemoveFromCart, onClearCart }) => {
  const [promoCode, setPromoCode] = useState('');
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const taxRate = 0.10; // 10% tax
  const tax = subtotal * taxRate;
  const discount = isPromoApplied ? 1.00 : 0; // $1 discount when promo applied
  const total = subtotal + tax - discount;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveFromCart(itemId);
    } else {
      onUpdateCart(itemId, newQuantity);
    }
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === 'discount10' || promoCode.toLowerCase() === 'save5') {
      setIsPromoApplied(true);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-800">Eloise's Order</h2>
          <Edit3 className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Order Number: #005</p>
      </div>

      {/* Table and Service Type */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="flex-1">
            <select className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Table 05</option>
              <option>Table 01</option>
              <option>Table 02</option>
              <option>Table 03</option>
            </select>
          </div>
          <div className="flex-1">
            <select className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Dine In</option>
              <option>Take Away</option>
              <option>Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No items in cart</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">{item.name}</h4>
                <p className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Summary */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (10%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        
        {isPromoApplied && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Discount</span>
            <span className="font-medium text-green-600">-${discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
          <span>TOTAL</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Promo Code */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add Promo or Voucher"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="flex-1 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={applyPromo}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Apply
          </button>
        </div>
        
        {isPromoApplied && (
          <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              ✓
            </div>
            <span>Promo Applied</span>
          </div>
        )}

        <button className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Cart;