import React, { useState, useEffect } from 'react';
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


const Home = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Point of Sales');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [initialTab, setInitialTab] = useState('profile');
  
  const dispatch = useDispatch();
  
  // Use separate selectors to avoid memoization issues
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
    // If we have tokens in localStorage but not authenticated in state, 
    // it means the tokens might be valid but state isn't updated
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    
    if (storedAccessToken && storedRefreshToken && !isAuthenticated && authStatus !== 'loading') {
      // Dispatch verification only if we have tokens but aren't authenticated
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated, authStatus]);

  // Auto-refresh token functionality
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      // Set up token refresh interval (e.g., every 14 minutes for 15-minute tokens)
      const refreshInterval = setInterval(async () => {
        try {
          await dispatch(refreshAccessToken()).unwrap();
        } catch (error) {
          console.error('Auto token refresh failed:', error);
          // If auto-refresh fails, the user will be logged out automatically
        }
      }, 14 * 60 * 1000); // 14 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, accessToken, dispatch]);

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
      console.log('Logged out successfully');
      // You might want to redirect here: navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, the state will be cleared
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
              onClick={() => window.location.href = '/login'} // or use navigate('/login')
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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

            {/* Right Section - Date and Time */}
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
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 bg-gray-100 overflow-auto">
          {currentView === 'main' && (
            <div className="bg-white rounded-lg shadow-sm h-full min-h-96 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-800 mb-2">POS Interface</h3>
                <p className="text-gray-500">Main content area - Product grid would go here</p>
                <div className="mt-4 text-sm text-gray-400">
                  Welcome, {user?.name || user?.email || 'User'}!
                </div>
              </div>
            </div>
          )}
          {currentView === 'profile' && <Profile setCurrentView={setCurrentView} initialTab={initialTab} />}
        </main>
      </div>
    </div>
  );
};

export default Home;