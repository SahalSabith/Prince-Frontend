import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer } from 'lucide-react';
import ProductModal from '../Components/ProductModal'
import Cart from '../Components/Cart';
import Sidebar from '../Components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchProductDetail } from '../Redux/Slices/ProductSlice';
import { addToCart, getCart } from '../Redux/Slices/CartSlice';

// Updated Cart Modal for HomePage
const CartModal = ({ showCart, setShowCart }) => {
  if (!showCart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={() => setShowCart(false)} 
      />
      
      {/* Cart Container - Responsive */}
      <div className="relative w-full h-[90vh] sm:h-[85vh] sm:max-w-md sm:max-h-[600px] lg:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl">
        <Cart
          onClose={() => setShowCart(false)}
          isMobile={window.innerWidth < 768}
        />
      </div>
    </div>
  );
};

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart, setShowCart] = useState(false);
  
  const dispatch = useDispatch();
  const { products, categories, productDetail, loading, error } = useSelector((state) => state.product);
  const { fetchCart } = useSelector((state) => state.cart);

  // Get total items from Redux cart
  const totalItems = fetchCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category.id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    dispatch(getCart()); // Load cart on component mount
  }, [dispatch]);

  const addToCartFunc = (product, quantity = 1, note = '') => {
    dispatch(addToCart({ item: product.id, quantity, note }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Sidebar - Fixed Outside Main Content */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Content */}
      <div className={`pb-20 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-0'}`}>
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 mt-7">
              Welcome to Prince Bakery
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Fresh and delicious food made with love</p>
          </div>

          {/* Search - Mobile First */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-base shadow-sm"
              />
            </div>
          </div>

          {/* Categories - Horizontal Scroll */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Categories</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                    : 'bg-yellow-400 text-gray-700 hover:bg-amber-50 border-2 border-gray-100 hover:border-amber-200'
                }`}
              >
                <span className="font-medium text-sm sm:text-base">All</span>
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-105'
                      : 'bg-yellow-400 text-gray-700 hover:bg-amber-50 border-2 border-gray-100 hover:border-amber-200'
                  }`}
                >
                  <span className="font-medium text-sm sm:text-base">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid - Mobile First */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative">
                  <img
                    src={`http://192.168.0.109:8000/${product.image}`}
                    alt={product.name}
                    className="w-full h-44 sm:h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                    ₹{product.price}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCartFunc(product);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200 text-base shadow-md hover:shadow-lg"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-300 mb-4">
                <Search size={64} className="mx-auto" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try searching for something else</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Cart Button - Always Visible */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-full shadow-2xl z-40 transform hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {/* Cart Modal - Using the corrected CartModal component */}
      <CartModal showCart={showCart} setShowCart={setShowCart} />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCartFunc}
        />
      )}
    </div>
  );
};

export default HomePage;