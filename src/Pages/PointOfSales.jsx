import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CategoryNav from '../Components/CategoryNav.jsx';
import SearchBar from '../Components/SearchBar.jsx';
import ProductGrid from '../Components/ProductGrid.jsx';
import ProductDetail from '../Components/ProductDetail.jsx';
import Cart from './Cart.jsx';
import AddDishPage from '../Pages/AddDishPage.jsx';
import { fetchDish } from '../Redux/productSlice';

const PointOfSales = () => {
  const [selectedCategory, setSelectedCategory] = useState('All Menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('menu');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const dispatch = useDispatch();
  const { dishes, loading, error } = useSelector((state) => state.product);

  // Filter products based on category and search
  useEffect(() => {
    let result = dishes || [];
    
    // Apply category filter
    if (selectedCategory !== 'All Menu') {
      result = result.filter(product => 
        product.category === selectedCategory
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name?.toLowerCase().includes(query) || 
        product.category?.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(result);
  }, [dishes, selectedCategory, searchQuery]);

  const handleAddDishClick = () => {
    setCurrentPage('add-dish');
  };

  const handleBackClick = () => {
    setCurrentPage('menu');
    // Refresh data after adding new dish
    dispatch(fetchDish());
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseProductDetail = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (cartItem) => {
    setCart([...cart, { ...cartItem, id: `${cartItem.id}-${Date.now()}` }]);
  };

  const handleUpdateCart = (itemId, newQuantity) => {
    setCart(cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="flex h-full">
      {/* Left Section - Product Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Fixed Header Section */}
        <div className="flex-shrink-0 p-4 md:p-6 bg-gray-50">
          {currentPage === 'menu' ? (
            <>
              <CategoryNav 
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
                onAddDishClick={handleAddDishClick} 
              />
              
              <SearchBar 
                onSearch={handleSearch} 
                searchQuery={searchQuery}
              />
            </>
          ) : null}
        </div>

        {/* Scrollable Content Section */}
        <div className="flex-1 px-4 md:px-6 bg-gray-50 overflow-y-auto">
          {currentPage === 'menu' ? (
            <>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Error loading dishes: {error}</p>
                  <button 
                    onClick={() => dispatch(fetchDish())}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <ProductGrid 
                  products={filteredProducts} 
                  onProductClick={handleProductClick} 
                />
              )}
            </>
          ) : (
            <AddDishPage onBackClick={handleBackClick} />
          )}
        </div>
      </div>

      {/* Right Section - Cart */}
      <Cart 
        cart={cart}
        onUpdateCart={handleUpdateCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetail 
          product={selectedProduct}
          onClose={handleCloseProductDetail}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default PointOfSales;