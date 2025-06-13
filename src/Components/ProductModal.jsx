import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

const ProductModal = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  const handleAddToCart = () => {
    onAddToCart(product, quantity, note);
    onClose();
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Product Image */}
        <div className="relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-64 sm:h-72 object-cover rounded-t-3xl"
          />
          <div className="absolute bottom-4 right-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 py-2 rounded-full">
            <span className="text-lg font-bold">₹{product.price}</span>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Note Section */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Special Instructions (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special requests or modifications..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white resize-none"
              rows={3}
            />
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-700">Quantity</label>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={decrementQuantity}
                className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-200"
              >
                <Minus size={20} className="text-gray-600" />
              </button>
              
              <span className="text-2xl font-bold text-gray-800 min-w-[3rem] text-center">
                {quantity}
              </span>
              
              <button
                onClick={incrementQuantity}
                className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-full flex items-center justify-center transition-all duration-200"
              >
                <Plus size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Total Price */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">Total:</span>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                ₹{product.price * quantity}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-lg"
          >
            Add to Cart - ₹{product.price * quantity}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;