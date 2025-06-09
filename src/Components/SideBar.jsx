import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  FileText, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  ChevronDown,
  X,
  User,
  Lock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../Redux/authSlice';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeMenuItem, 
  setActiveMenuItem, 
  onProfileAction 
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);
  const authStatus = useSelector((state) => state.auth?.status || 'idle');

  const menuItems = [
    { icon: BarChart3, label: 'Point of Sales', active: true },
    { icon: Activity, label: 'Activity' },
    { icon: FileText, label: 'Report' },
    { icon: Package, label: 'Inventory' },
    { icon: Users, label: 'Teams' },
    { icon: Settings, label: 'Settings' }
  ];

  const handleProfileAction = (action) => {
    if (onProfileAction) {
      onProfileAction(action);
    }
    setProfileDropdownOpen(false);
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveMenuItem(item.label);
    setSidebarOpen(false);
  };

  return (
    <>
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
                    onClick={() => handleMenuItemClick(item)}
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
    </>
  );
};

export default Sidebar;