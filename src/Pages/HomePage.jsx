import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, Home, Settings } from 'lucide-react';
import ProductModal from '../Components/ProductModal'
import Sidebar from '../Components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchProductDetail } from '../Redux/Slices/ProductSlice';
import { addToCart } from '../Redux/Slices/CartSlice';

import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer, AlertCircle, Trash2 } from 'lucide-react';
import { 
  getCart, 
  placeOrder, 
  editCart, 
  updateCartItem,
  removeCartItem,
  clearError, 
  clearSuccessMessage,
  updateItemOptimistic,
  removeItemOptimistic
} from '../Redux/Slices/CartSlice';

// Function to generate short names for items
const generateShortName = (itemName) => {
  if (!itemName) return 'UN';
  
  const words = itemName.split(' ').filter(word => word.length > 0);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  
  return itemName.substring(0, 2).toUpperCase();
};

function Cart({ onClose, isMobile = false }) {
  const [orderType, setOrderType] = useState('parcel');
  const [tableNumber, setTableNumber] = useState('');
  
  const dispatch = useDispatch();
  const { 
    fetchCart, 
    loading, 
    updateLoading, 
    error, 
    successMessage,
    itemUpdateLoading
  } = useSelector(state => state.cart);
  
  // Extract cart items from fetchCart
  const cartItems = fetchCart?.items || [];
  
  // Ref for debounce timeout
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Initialize local state from cart data
  useEffect(() => {
    if (fetchCart) {
      setOrderType(fetchCart.order_type || 'parcel');
      setTableNumber(fetchCart.table_number || '');
    }
  }, [fetchCart]);

  // Clear messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const orderTypes = [
    { value: 'parcel', label: 'Parcel', icon: '📦' },
    { value: 'table', label: 'Table', icon: '🍽️' },
  ];

  const calculateTotal = useCallback(() => {
    return cartItems.reduce((total, cartItem) => {
      const price = cartItem.item?.price || 0;
      const quantity = cartItem.quantity || 0;
      return total + (price * quantity);
    }, 0);
  }, [cartItems]);

  // Debounced cart update function
  const updateCartWithDebounce = useCallback((updateData) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await dispatch(editCart(updateData)).unwrap();
      } catch (error) {
        console.error('Failed to update cart:', error);
      }
    }, 800); // 800ms delay
  }, [dispatch]);

  const handleOrderTypeChange = (newOrderType) => {
    setOrderType(newOrderType);
    
    // Prepare update data
    const updateData = {
      order_type: newOrderType,
      table_number: newOrderType === 'table' ? tableNumber : null,
    };

    // Update cart with debounce
    updateCartWithDebounce(updateData);
  };

  const handleTableNumberChange = (newTableNumber) => {
    setTableNumber(newTableNumber);
    
    if (orderType === 'table') {
      // Prepare update data
      const updateData = {
        order_type: orderType,
        table_number: newTableNumber,
      };

      // Update cart with debounce
      updateCartWithDebounce(updateData);
    }
  };

  // Fixed quantity update handler
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      handleRemoveItem(itemId);
      return;
    }

    try {
      // Optimistic update for better UX
      dispatch(updateItemOptimistic({ itemId, quantity: newQuantity }));

      // Use the correct Redux action for updating cart item
      const cartItem = cartItems.find(item => item.id === itemId);
      await dispatch(updateCartItem({ 
        itemId, 
        quantity: newQuantity, 
        note: cartItem?.note || '' 
      })).unwrap();

    } catch (error) {
      console.error('Failed to update quantity:', error);
      // Revert optimistic update on error by refetching cart
      dispatch(getCart());
    }
  };

  // Fixed remove item handler
  const handleRemoveItem = async (itemId) => {
    try {
      // Optimistic update - remove item from local state
      dispatch(removeItemOptimistic(itemId));

      // Use the correct Redux action for removing cart item
      await dispatch(removeCartItem(itemId)).unwrap();

    } catch (error) {
      console.error('Failed to remove item:', error);
      // Revert optimistic update on error by refetching cart
      dispatch(getCart());
    }
  };

  const handlePlaceOrder = async () => {
    if (orderType === 'table' && !tableNumber.trim()) {
      alert('Please enter a table number');
      return;
    }

    const orderData = {
      order_type: orderType,
      table_number: orderType === 'table' ? tableNumber.trim() : null,
    };
    
    try {
      await dispatch(placeOrder(orderData)).unwrap();
      // Reset form after successful order
      setOrderType('parcel');
      setTableNumber('');
      // Close cart on successful order
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to place order:', error);
    }
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(getCart());
  };

  // Show loading state
  if (loading && !fetchCart) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[300px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-slate-600 text-sm">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingCart size={14} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Your Cart</h2>
                {cartItems.length > 0 && (
                  <p className="text-xs text-slate-600">
                    {cartItems.reduce((sum, cartItem) => sum + (cartItem.quantity || 0), 0)} items
                  </p>
                )}
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
              >
                <X size={16} className="text-slate-600" />
              </button>
            )}
          </div>
          
          {updateLoading && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Updating cart...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {(error || successMessage) && (
        <div className="flex-shrink-0 p-3 space-y-2">
          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={12} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 text-xs">
                  {typeof error === 'string' ? error : error.message || 'Something went wrong'}
                </p>
                <button 
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-800 text-xs underline mt-1"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-xs">{successMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Order Type Selector */}
      <div className="flex-shrink-0 p-3 bg-slate-50 border-b border-slate-200">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">Order Type</label>
          <div className="grid grid-cols-2 gap-2">
            {orderTypes.map(type => (
              <button
                key={type.value}
                onClick={() => handleOrderTypeChange(type.value)}
                className={`flex flex-col items-center justify-center p-2 border rounded-lg text-xs font-medium transition ${
                  orderType === type.value
                    ? 'bg-blue-100 text-blue-700 border-blue-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm">{type.icon}</span>
                <span className="mt-1">{type.label}</span>
              </button>
            ))}
          </div>

          {orderType === 'table' && (
            <input
              type="text"
              placeholder="Enter table number"
              value={tableNumber}
              onChange={(e) => handleTableNumberChange(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm"
            />
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cartItems.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">Your cart is empty.</p>
          </div>
        ) : (
          cartItems.map((cartItem) => {
            const itemName = cartItem.item?.name || 'Unnamed Item';
            const itemPrice = cartItem.item?.price || 0;
            const quantity = cartItem.quantity || 1;
            const shortName = generateShortName(itemName);

            return (
              <div
                key={cartItem.id}
                className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg"
              >
                {/* Item Icon with Short Name */}
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-xs">{shortName}</span>
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{itemName}</p>
                  <p className="text-xs text-slate-500">₹{itemPrice}</p>
                  {cartItem.note && (
                    <p className="text-xs text-slate-400 mt-1 truncate">Note: {cartItem.note}</p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleQuantityUpdate(cartItem.id, quantity - 1)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                    disabled={itemUpdateLoading}
                  >
                    <Minus size={10} />
                  </button>
                  <span className="px-1.5 font-medium text-sm min-w-[16px] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityUpdate(cartItem.id, quantity + 1)}
                    className="p-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600"
                    disabled={itemUpdateLoading}
                  >
                    <Plus size={10} />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(cartItem.id)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Actions */}
      {cartItems.length > 0 && (
        <div className="flex-shrink-0 border-t border-slate-200 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-700">Total:</span>
            <span className="text-sm font-bold text-slate-900">
              ₹{fetchCart?.total_amount || calculateTotal()}
            </span>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full flex items-center justify-center p-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm"
            disabled={loading || updateLoading}
          >
            Place Order
          </button>
        </div>
      )}
    </div>
  );
}

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
        
        {/* Main Content Area - Fixed right margin for desktop cart */}
        <div className="flex-1 lg:mr-[320px] min-h-screen">
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
                          <span className="text-blue-500 font-bold text-lg">{generateShortName(product.name)}</span>
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

        {/* Right Side Cart - Desktop Only - Fixed position */}
        <div className="hidden lg:block fixed right-0 top-0 w-[320px] h-screen bg-white border-l border-slate-200 shadow-xl z-40">
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