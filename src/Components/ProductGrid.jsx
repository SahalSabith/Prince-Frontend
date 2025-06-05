import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onProductClick }) => {
  const safeProducts = Array.isArray(products) ? products : [];

  if (safeProducts.length === 0) {
    return (
      <div className="w-full px-4 py-8 sm:py-12">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-1 1m-6 0l-1-1m2 7h.01" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No products found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4">
            We couldn't find any products matching your criteria
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-gray-400">
            <p>• Try adjusting your search terms</p>
            <p>• Check different categories</p>
            <p>• Clear any active filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6">
      {/* Products count indicator for mobile */}
      <div className="mb-4 sm:mb-6">
        <p className="text-sm text-gray-600">
          Showing {safeProducts.length} product{safeProducts.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Mobile-first grid with better spacing and sizing */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {safeProducts.map(product => (
          <ProductCard
            key={product.id || product._id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
      
      {/* Bottom spacing for mobile scroll */}
      <div className="h-4 sm:h-6"></div>
    </div>
  );
};

export default ProductGrid;