import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';

const ProductDetail = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
      notes,
      cartId: Date.now()
    };
    onAddToCart(cartItem);
    onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Detail Menu</h2>
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
            <div className="w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden p-3 flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="text-center mb-4">
            <span className={`inline-block text-sm font-medium mb-2 ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
            <p className="text-gray-600 text-sm leading-relaxed mb-3 text-left">
              {product.description || "Premium butter croissant with a crispy pastry crust and soft inside will melt away on your mouth!"}
            </p>
            <p className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</p>
          </div>

          {/* Notes */}
          <div className="mb-4">
            <textarea
              placeholder="Add notes to your order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-gray-50"
              rows="2"
            />
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-center mb-6">
            <button 
              onClick={handleDecrement}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-bold text-gray-900 mx-8 min-w-[2rem] text-center">{quantity}</span>
            <button 
              onClick={handleIncrement}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Add to Cart (${(product.price * quantity).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo component to show the ProductDetail in action
const ProductDetailDemo = () => {
  const [showDetail, setShowDetail] = useState(true);
  
  const sampleProduct = {
    id: 1,
    name: "Buttermelt Croissant",
    category: "Pastry",
    price: 4.00,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=300&fit=crop&crop=center",
    description: "Premium butter croissant with a crispy pastry crust and soft inside will melt away on your mouth!"
  };

  const handleAddToCart = (item) => {
    console.log('Added to cart:', item);
    setShowDetail(false);
  };

  if (!showDetail) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <button 
          onClick={() => setShowDetail(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Show Product Detail
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100">
      <ProductDetail 
        product={sampleProduct}
        onClose={() => setShowDetail(false)}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default ProductDetailDemo;