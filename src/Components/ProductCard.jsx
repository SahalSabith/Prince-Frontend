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
  const categoryColor = getCategoryColor(product.category);
  
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group border border-gray-100"
      onClick={() => onClick(product)}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 overflow-hidden relative p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      
      {/* Product Info */}
      <div className="px-4 pb-4">
        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className={`text-xs font-medium ${categoryColor}`}>
            {product.category}
          </span>
          <p className="text-lg font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;