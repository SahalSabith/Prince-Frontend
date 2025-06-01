import React from 'react';

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

const ProductCard = ({ product, onClick }) => {
  // Add safety checks for product properties
  if (!product) return null;

  const categoryColor = getCategoryColor(product.category);
  
  // Handle image URL - prioritize dish_image from backend
  const getImageUrl = () => {
    if (product.dish_image) {
      // If it's a full URL, use as is
      if (product.dish_image.startsWith('http')) {
        return product.dish_image;
      }
      // If it's a relative path, prepend base URL
      return `http://127.0.0.1:8000${product.dish_image}`;
    }
    // Fallback to other possible image fields
    return product.image_url || '/api/placeholder/300/300';
  };
  
  const imageUrl = getImageUrl();
  
  // Ensure price is a number
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  
  // Category should now be a string after transformation in Redux
  const categoryDisplay = product.category || 'Uncategorized';
  
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group border border-gray-100"
      onClick={() => onClick(product)}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 overflow-hidden relative p-4">
        <img 
          src={imageUrl} 
          alt={product.name || 'Product'} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
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
      
      {/* Product Info */}
      <div className="px-4 pb-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
          {product.name || 'Unnamed Product'}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${getCategoryColor(categoryDisplay)}`}>
            {categoryDisplay}
          </span>
          <p className="text-lg font-bold text-gray-900">
            ${price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;