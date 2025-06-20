import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer, Menu, Home, Settings } from 'lucide-react';
import ProductModal from '../Components/ProductModal'
import Cart from '../Components/Cart';
import Sidebar from '../Components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchProductDetail } from '../Redux/Slices/ProductSlice';
import { addToCart, getCart } from '../Redux/Slices/CartSlice';

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Layout Container */}
      <div className={`flex transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:pr-[420px] min-h-screen">
          {/* Top Header Bar */}
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 lg:p-6">
              {/* Left side - Menu button and Logo */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors lg:hidden"
                >
                  <Menu size={24} className="text-slate-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ChefHat size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Prince Bakery</h1>
                    <p className="text-sm text-slate-500 hidden md:block">Fresh & Delicious</p>
                  </div>
                </div>
              </div>

              {/* Mobile Cart Button */}
              <button
                onClick={() => setShowMobileCart(true)}
                className="lg:hidden relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 lg:p-8 space-y-8">
            {/* Welcome Section */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                Welcome to Our Kitchen
              </h2>
              <p className="text-slate-600 text-lg">Discover amazing flavors crafted with love</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto lg:mx-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for your favorite dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base placeholder-slate-400"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Categories</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <span>All Items</span>
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max font-medium ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">
                  {selectedCategory === 'all' ? 'All Dishes' : categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <span className="text-slate-500 text-sm">{filteredProducts.length} items</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 hover:border-blue-200 transform hover:-translate-y-1"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image ? (
                      <>
                        <div className="relative overflow-hidden">
                          <img
                            src={`http://192.168.0.109:8000/${product.image}`}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            ₹{product.price}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-slate-800 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCartFunc(product);
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 h-full flex flex-col justify-center items-center text-center min-h-[280px]">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                          <ChefHat size={32} className="text-blue-500" />
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-full text-lg font-bold shadow-lg mb-3">
                          ₹{product.price}
                        </div>
                        <h4 className="font-bold text-slate-800 mb-3 text-xl group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCartFunc(product);
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={40} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-xl font-medium mb-2">No dishes found</p>
                  <p className="text-slate-400 text-base">Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Cart - Desktop Only */}
        <div className="hidden lg:block fixed right-0 top-0 w-[400px] h-screen bg-white border-l border-slate-200 shadow-xl z-40">
          <Cart 
            onClose={null} // No close button needed for fixed sidebar
            isMobile={false}
          />
        </div>
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowMobileCart(false)} 
          />
          <div className="relative w-full h-[90vh] bg-white rounded-t-3xl overflow-hidden shadow-2xl">
            <Cart
              onClose={() => setShowMobileCart(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCartFunc}
          openCart={() => setShowMobileCart(true)}
        />
      )}
    </div>
  );
};

export default HomePage;