import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Minus, Plus } from 'lucide-react';
import { createCartItem } from '../Redux/orderSlice'

const ProductDetail = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.order);
  
  const [quantity, setQuantity] = useState(1);
  const [note, setnote] = useState('');

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    const cartData = {
      dish: product.id,
      quantity: quantity,
      note: note
    };
    
    try {
      await dispatch(createCartItem(cartData)).unwrap();
      console.log(cartData)
      onClose();
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Sandwich: 'text-orange-600',
      Pastry: 'text-green-600',
      Donut: 'text-amber-600',
      Cake: 'text-pink-600',
      Bread: 'text-blue-600',
      Tart: 'text-purple-600'
    };
    
    return colors[category] || 'text-gray-600';
  };

  // Handle image URL - prioritize dish_image from backend
  const getImageUrl = () => {
    if (product.dish_image) {
      // If it's a full URL, use as is
      if (product.dish_image.startsWith('http')) {
        return product.dish_image;
      }
      // If it's a relative path, prepend base URL
      return `http://192.168.29.42:8000${product.dish_image}`;
    }
    // Fallback to other possible image fields
    return product.image_url || product.image || '/api/placeholder/300/300';
  };

  // Ensure price is a number
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  
  // Handle both dish_name (from backend) and name (if transformed)
  const dishName = product.dish_name || product.name || 'Unnamed Dish';
  
  // Category handling - could be object or string
  const categoryDisplay = typeof product.category === 'object' 
    ? product.category?.name || 'Uncategorized'
    : product.category || 'Uncategorized';

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Dish Details</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Product Image - Smaller and centered */}
          <div className="mb-4 flex justify-center">
            <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden p-3 flex items-center justify-center relative">
              <img 
                src={getImageUrl()} 
                alt={dishName} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to a simple colored div if image fails
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback div for when image fails */}
              <div 
                className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400 text-sm"
                style={{ display: 'none' }}
              >
                No Image
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="text-center mb-4">
            <span className={`inline-block text-sm font-medium mb-2 ${getCategoryColor(categoryDisplay)}`}>
              {categoryDisplay}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {dishName}
            </h3>
            
            {/* Description with fallback */}
            <p className="text-gray-600 text-sm leading-relaxed mb-3 text-left">
              {product.description || "Delicious dish prepared with finest ingredients and served fresh!"}
            </p>
            
            {/* Additional dish details if available */}
            {product.ingredients && (
              <div className="mb-3 text-left">
                <p className="text-xs font-medium text-gray-700 mb-1">Ingredients:</p>
                <p className="text-xs text-gray-600">{product.ingredients}</p>
              </div>
            )}
            
            {product.cooking_time && (
              <div className="mb-3 text-left">
                <p className="text-xs font-medium text-gray-700 mb-1">Cooking Time:</p>
                <p className="text-xs text-gray-600">{product.cooking_time} minutes</p>
              </div>
            )}
            
            {product.calories && (
              <div className="mb-3 text-left">
                <p className="text-xs font-medium text-gray-700 mb-1">Calories:</p>
                <p className="text-xs text-gray-600">{product.calories} kcal</p>
              </div>
            )}
            
            {product.spice_level && (
              <div className="mb-3 text-left">
                <p className="text-xs font-medium text-gray-700 mb-1">Spice Level:</p>
                <p className="text-xs text-gray-600">{product.spice_level}</p>
              </div>
            )}
            
            <p className="text-2xl font-bold text-blue-600">${price.toFixed(2)}</p>
          </div>

          {/* note */}
          <div className="mb-4">
            <textarea
              placeholder="Add note to your order..."
              value={note}
              onChange={(e) => setnote(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-gray-50"
              rows="2"
            />
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-center mb-6">
            <button 
              onClick={handleDecrement}
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-bold text-gray-900 mx-8 min-w-[2rem] text-center">{quantity}</span>
            <button 
              onClick={handleIncrement}
              disabled={loading}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {typeof error === 'string' ? error : 'Failed to add item to cart'}
            </div>
          )}

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : `Add to Cart ($${(price * quantity).toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;