import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, ChefHat, TrendingUp, Calendar, X, BarChart3 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen, className = "" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quickStatsData, setQuickStatsData] = useState({
    todayOrders: 0,
    revenue: 0,
    todayOrdersTrend: "+0%",
    revenueTrend: "+0%"
  });

  // Menu items configuration
  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      description: 'Overview & Summary', 
      color: 'from-blue-500 to-blue-600',
      path: '/',
      paths: ['/', '/dashboard'] // Multiple paths that should activate this item
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ShoppingBag, 
      description: 'Manage Orders', 
      color: 'from-green-500 to-green-600',
      path: '/orders',
      paths: ['/orders']
    }
  ];

  // Get active tab based on current location
  const getActiveTab = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => 
      item.paths.includes(currentPath) || 
      (currentPath.startsWith(item.path) && item.path !== '/')
    );
    return activeItem ? activeItem.id : 'dashboard';
  };

  const activeTab = getActiveTab();

  // Simulate fetching quick stats data
  useEffect(() => {
    // In a real app, this would be an API call
    const fetchQuickStats = () => {
      // Simulate API response
      setQuickStatsData({
        todayOrders: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 10000) + 2000,
        todayOrdersTrend: `+${Math.floor(Math.random() * 20) + 5}%`,
        revenueTrend: `+${Math.floor(Math.random() * 15) + 3}%`
      });
    };

    fetchQuickStats();
    // Update stats every 30 seconds
    const interval = setInterval(fetchQuickStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigation = (item) => {
    navigate(item.path);
    setIsOpen(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const quickStats = [
    { 
      label: "Today's Orders", 
      value: quickStatsData.todayOrders.toString(), 
      trend: quickStatsData.todayOrdersTrend, 
      color: "text-emerald-600", 
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200"
    },
    { 
      label: "Revenue", 
      value: formatCurrency(quickStatsData.revenue), 
      trend: quickStatsData.revenueTrend, 
      color: "text-blue-600", 
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    }
  ];

  // Close sidebar when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar-container') && !event.target.closest('.sidebar-toggle')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-container fixed left-0 top-0 h-full bg-white shadow-2xl transform transition-all duration-300 ease-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 flex flex-col overflow-hidden border-r border-gray-100 ${className}`}
      >
        {/* Header Section - Fixed */}
        <div className="relative flex-shrink-0 p-6 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white overflow-hidden">
          {/* Close button for mobile */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 lg:hidden w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-200"
          >
            <X size={16} className="text-white" />
          </button>

          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-full animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 right-8 w-16 h-16 bg-white rounded-full animate-pulse delay-500"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl">
                <ChefHat size={32} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold tracking-tight truncate">Prince Bakery</h1>
                <p className="text-white/80 text-sm font-medium">Admin Dashboard</p>
              </div>
            </div>
            
            {/* Welcome Card */}
            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <p className="text-white/90 text-sm font-semibold">System Online</p>
              </div>
              <p className="text-white/70 text-xs">Everything running smoothly</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gradient-to-r from-gray-300 to-transparent"></div>
            Navigation
          </h2>
          
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item)}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Hover effect background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="relative flex items-center gap-4 p-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-sm shadow-lg'
                        : 'bg-gray-100 group-hover:bg-gray-200 group-hover:shadow-md'
                    }`}>
                      <IconComponent size={24} className={isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-700'} />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-bold text-lg leading-tight truncate">{item.label}</p>
                      <p className={`text-sm mt-1 transition-colors duration-300 truncate ${
                        isActive
                          ? 'text-white/70'
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Navigation arrow */}
                    <div className={`flex-shrink-0 transition-all duration-300 ${
                      isActive ? 'text-white/80' : 'text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1'
                    }`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M6.22 3.22a.75.75 0 011.06 0L11.06 7a.75.75 0 010 1.06l-3.78 3.78a.75.75 0 01-1.06-1.06L9.44 7.5 6.22 4.28a.75.75 0 010-1.06z"/>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-1 h-10 bg-white rounded-full opacity-90 shadow-xl shadow-white/50"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <ChefHat size={18} className="text-white" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-700 truncate">Prince Bakery</p>
                <p className="text-xs text-gray-500">Dashboard v2.1</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <Calendar size={12} />
              <span>Last updated: Today</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Custom scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
    </>
  );
};

export default Sidebar;