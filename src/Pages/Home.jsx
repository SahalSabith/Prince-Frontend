import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar,
  Clock,
  Menu
} from 'lucide-react';
import Profile from './Profile';
import { useDispatch, useSelector } from 'react-redux';
import { refreshAccessToken, verifyToken } from '../Redux/authSlice';
import { fetchDish, fetchCategories } from '../Redux/productSlice';
import Sidebar from '../Components/SideBar';
import PointOfSales from './PointOfSales';

const Home = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('Point of Sales');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('main');
  const [initialTab, setInitialTab] = useState('profile');

  const dispatch = useDispatch();
  const hasFetchedData = useRef(false); // Prevent multiple API calls

  const authStatus = useSelector((state) => state.auth?.status || 'idle');
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated || false);
  const user = useSelector((state) => state.auth?.user);
  const accessToken = useSelector((state) => state.auth?.accessToken);

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

  const handleProfileAction = (action) => {
    if (action === 'profile') {
      setCurrentView('profile');
      setInitialTab('profile');
    } else if (action === 'changePassword') {
      setCurrentView('profile');
      setInitialTab('password');
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

  // Render different pages based on active menu item
  const renderCurrentPage = () => {
    if (currentView === 'profile') {
      return (
        <Profile 
          initialTab={initialTab} 
          onBack={() => setCurrentView('main')} 
        />
      );
    }

    switch (activeMenuItem) {
      case 'Point of Sales':
        return <PointOfSales />;
      case 'Activity':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity</h2>
              <p className="text-gray-600">Activity page coming soon...</p>
            </div>
          </div>
        );
      case 'Report':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
              <p className="text-gray-600">Reports page coming soon...</p>
            </div>
          </div>
        );
      case 'Inventory':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventory</h2>
              <p className="text-gray-600">Inventory page coming soon...</p>
            </div>
          </div>
        );
      case 'Teams':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Teams</h2>
              <p className="text-gray-600">Teams page coming soon...</p>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Settings</h2>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          </div>
        );
      default:
        return <PointOfSales />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenuItem={activeMenuItem}
        setActiveMenuItem={setActiveMenuItem}
        onProfileAction={handleProfileAction}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Navbar - Fixed */}
        <header className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Center - Current Page Title */}
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-800">
                {currentView === 'profile' ? 'Profile' : activeMenuItem}
              </h1>
            </div>

            {/* Right Section - Date, Time, and Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              {activeMenuItem === 'Point of Sales' && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Open Order</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content - Takes remaining height */}
        <div className="flex-1 min-h-0">
          {renderCurrentPage()}
        </div>
      </div>
    </div>
  );
};

export default Home;