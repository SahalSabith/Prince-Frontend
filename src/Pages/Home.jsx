import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Activity, 
  FileText, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  Calendar,
  Clock,
  ChevronDown,
  Menu,
  X,
  User,
  Lock
} from 'lucide-react';
import Profile from './Profile';
import { useDispatch, useSelector } from 'react-redux';
import { logout, refreshAccessToken, verifyToken } from '../Redux/authSlice';
import CategoryNav from '../Components/CategoryNav.jsx';
import SearchBar from '../Components/SearchBar.jsx';
import ProductGrid from '../Components/ProductGrid.jsx';
import ProductDetail from '../Components/ProductDetail.jsx';
import Cart from './Cart.jsx';
import AddDishPage from '../Pages/AddDishPage.jsx';
import { fetchDish, fetchCategories } from '../Redux/productSlice';

const Home = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Point of Sales');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [initialTab, setInitialTab] = useState('profile');
  const [selectedCategory, setSelectedCategory] = useState('All Menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('menu');
  const [filteredProducts, setFilteredProducts] = useState([]);

  const dispatch = useDispatch();
  const hasFetchedData = useRef(false); // Prevent multiple API calls

  const { dishes, categories, loading, error } = useSelector((state) => state.product);
  const authStatus = useSelector((state) => state.auth?.status || 'idle');
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);
  const user = useSelector((state) => state.auth?.user);
  const accessToken = useSelector((state) => state.auth?.accessToken);

  const menuItems = [
    { icon: BarChart3, label: 'Point of Sales', active: true },
    { icon: Activity, label: 'Activity' },
    { icon: FileText, label: 'Report' },
    { icon: Package, label: 'Inventory' },
    { icon: Users, label: 'Teams' },
    { icon: Settings, label: 'Settings' }
  ];

  // Verify authentication on component mount - simplified approach
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedAccessToken && storedRefreshToken && !isAuthenticated && authStatus !== 'loading') {
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated, authStatus]);

  // Fetch data only once when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasFetchedData.current) {
      console.log('Fetching dishes and categories...');
      dispatch(fetchDish());
      dispatch(fetchCategories());
      hasFetchedData.current = true;
    }
  }, [dispatch, isAuthenticated]);

  // Auto-refresh token functionality
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      const refreshInterval = setInterval(async () => {
        try {
          await dispatch(refreshAccessToken()).unwrap();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
        }
      }, 14 * 60 * 1000); // 14 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, accessToken, dispatch]);

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

  const handleProfileAction = (action) => {
    if (action === 'profile') {
      setCurrentView('profile');
      setInitialTab('profile');
    } else if (action === 'changePassword') {
      setCurrentView('profile');
      setInitialTab('password');
    }
    setProfileDropdownOpen(false);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      hasFetchedData.current = false; // Reset flag for next login
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state while checking authentication or during auth operations
  if (authStatus === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated or authentication failed, show login prompt
  if (!isAuthenticated || authStatus === 'unauthenticated' || authStatus === 'failed') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to continue</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Close Button */}
        <div className="flex justify-end p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className="px-4 pb-4 mt-5 border-b border-gray-100 relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-sm font-semibold text-orange-600">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center justify-between w-full text-left group"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    {user?.name || 'User Name'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {user?.role || user?.email || 'User'}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-4 bg-white border border-gray-200 rounded-lg shadow-lg z-60 overflow-hidden">
              <button
                onClick={() => handleProfileAction('profile')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Profile</span>
              </button>
              <button
                onClick={() => handleProfileAction('changePassword')}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <Lock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Change Password</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = item.label === activeMenuItem;
              
              return (
                <li key={index}>
                  <button
                    onClick={() => {
                      setActiveMenuItem(item.label);
                      setSidebarOpen(false);
                      setCurrentView('main');
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            disabled={authStatus === 'loading'}
            className="w-full flex items-center space-x-3 px-3 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">
              {authStatus === 'loading' ? 'Logging out...' : 'Log Out'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Section - Product Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navbar */}
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6">
            <div className="flex items-center justify-between">
              {/* Left Section - Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Center - Date and Time */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Right Section - Status */}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Open Order</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 bg-gray-50 overflow-auto">
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
                
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">Error loading dishes: {error}</p>
                    <button 
                      onClick={() => {
                        hasFetchedData.current = false;
                        dispatch(fetchDish());
                      }}
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
          </main>
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
    </div>
  );
};

export default Home;