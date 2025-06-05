import React from 'react';

const getCategoryColor = (category) => {
  const colors = {
    Sandwich: 'bg-orange-50 text-orange-700 border-orange-200',
    Pastry: 'bg-green-50 text-green-700 border-green-200', 
    Donut: 'bg-amber-50 text-amber-700 border-amber-200',
    Cake: 'bg-pink-50 text-pink-700 border-pink-200',
    Bread: 'bg-blue-50 text-blue-700 border-blue-200',
    Tart: 'bg-purple-50 text-purple-700 border-purple-200'
  };
  
  return colors[category] || 'bg-gray-50 text-gray-700 border-gray-200';
};

const ProductCard = ({ product, onClick }) => {
  if (!product) return null;

  const getImageUrl = () => {
    if (product.dish_image) {
      if (product.dish_image.startsWith('http')) {
        return product.dish_image;
      }
      return `http://192.168.29.42:8000${product.dish_image}`;
    }
    return product.image_url || '/api/placeholder/300/300';
  };
  
  const imageUrl = getImageUrl();
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const categoryDisplay = product.category || 'Uncategorized';
  const categoryStyles = getCategoryColor(categoryDisplay);
  
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
      onClick={() => onClick(product)}
    >
      {/* Product Image - Optimized for mobile viewing */}
      <div className="relative bg-gray-50 overflow-hidden">
        <div className="aspect-square p-3 sm:p-4">
          <img 
            src={imageUrl} 
            alt={product.name || 'Product'} 
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback for failed images */}
          <div 
            className="absolute inset-3 sm:inset-4 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs sm:text-sm"
            style={{ display: 'none' }}
          >
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-1 opacity-50">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </div>
              <span>No Image</span>
            </div>
          </div>
        </div>
        
        {/* Category Badge - Positioned for better mobile visibility */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${categoryStyles}`}>
            {categoryDisplay}
          </span>
        </div>
      </div>
      
      {/* Product Info - Optimized spacing for mobile */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 line-clamp-2 leading-tight">
          {product.name || 'Unnamed Product'}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">Price</span>
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ${price.toFixed(2)}
            </span>
          </div>
          
          {/* Add to cart indicator */}
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white transition-colors">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;