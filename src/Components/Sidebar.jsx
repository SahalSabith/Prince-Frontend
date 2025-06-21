import React, { useState } from 'react';
import { Home, ShoppingBag, BarChart3, Settings, ChefHat, TrendingUp, Users, Calendar } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Dashboard', icon: Home, description: 'Overview & Summary', color: 'from-blue-500 to-blue-600' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, description: 'Manage Orders', color: 'from-green-500 to-green-600' },
    { id: 'sales', label: 'Analytics', icon: BarChart3, description: 'Sales & Reports', color: 'from-purple-500 to-purple-600' },
    { id: 'customers', label: 'Customers', icon: Users, description: 'Customer Data', color: 'from-pink-500 to-pink-600' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'App Configuration', color: 'from-gray-500 to-gray-600' },
  ];

  const quickStats = [
    { label: "Today's Orders", value: "24", trend: "+12%", color: "text-emerald-600", bgColor: "bg-emerald-50" },
    { label: "Revenue", value: "₹4,320", trend: "+8%", color: "text-blue-600", bgColor: "bg-blue-50" },
    { label: "Customers", value: "156", trend: "+15%", color: "text-purple-600", bgColor: "bg-purple-50" }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-2xl transform transition-all duration-300 ease-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 overflow-hidden border-r border-gray-100`}
      >
        {/* Header Section */}
        <div className="relative p-6 bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white rounded-full animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                <ChefHat size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Prince Bakery</h1>
                <p className="text-white/80 text-sm font-medium">Admin Dashboard</p>
              </div>
            </div>
            
            {/* Welcome Card */}
            <div className="bg-white/15 rounded-2xl p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-white/90 text-sm font-semibold">System Online</p>
              </div>
              <p className="text-white/70 text-xs">Everything running smoothly</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/25`
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={{ 
                    animationDelay: `${index * 80}ms`,
                    animation: 'slideInLeft 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-sm'
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <IconComponent size={22} className={isActive ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-base leading-tight">{item.label}</p>
                      <p className={`text-xs mt-0.5 transition-colors duration-300 ${
                        isActive
                          ? 'text-white/70'
                          : 'text-gray-500 group-hover:text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active indicator with glow */}
                  {isActive && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-2 h-8 bg-white rounded-full opacity-80 shadow-lg"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats Section */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            Quick Stats
          </h3>
          <div className="space-y-3">
            {quickStats.map((stat, index) => (
              <div key={index} className={`${stat.bgColor} rounded-2xl p-3 border border-gray-100`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                <ChefHat size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-700">Prince Bakery</p>
                <p className="text-xs text-gray-500">Dashboard v2.1</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
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
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default Sidebar;