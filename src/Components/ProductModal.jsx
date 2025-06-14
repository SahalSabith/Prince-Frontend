import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, placeOrder, getOrders } from '../Redux/Slices/CartSlice';

function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const dispatch = useDispatch();
  const [total_amount,setTotal_amount] = useState();
  const { fetchCart, orders, loading, error, successMessage } = useSelector((state) => state.cart);

  useEffect(() => {
    setTotal_amount(product.price * quantity)
  },[quantity])


  const handleAddToCart = () => {
    console.log(product.id, quantity, note)
    dispatch(addToCart({ product_id:product.id, quantity, note }));
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md mx-4 rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <img
            src={`http://127.0.0.1:8000/${product.image}`}
            alt={product.name}
            className="w-full h-48 sm:h-56 object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
          <div className="absolute bottom-4 left-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full font-bold">
            ₹{product.price}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>

          {/* Quantity Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
              >
                <Minus size={16} />
              </button>
              <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center"
              >
                <Plus size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Special Note */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Special Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold py-4 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-200 text-lg"
          >
            Add {quantity} to Cart - ₹{product.price * quantity}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductModal