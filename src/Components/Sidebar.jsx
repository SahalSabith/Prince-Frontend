import React, { useState } from 'react';
import { X, Menu, Home, ShoppingBag, BarChart3, Settings, ChefHat } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home, description: 'Menu & Orders' },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, description: 'Manage Orders' },
    { id: 'sales', label: 'Sales', icon: BarChart3, description: 'Reports & Analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'App Settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button - Enhanced */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl shadow-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 md:hidden"
        aria-label="Toggle menu"
      >
        <div className="relative">
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </div>
      </button>

      {/* Overlay for mobile - Enhanced */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Redesigned */}
      <div
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-2xl transform transition-all duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-80 md:w-72 overflow-hidden`}
      >
        {/* Header Section - Enhanced */}
        <div className="relative p-6 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <ChefHat size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Prince Bakery</h1>
                <p className="text-white/80 text-sm">Admin Dashboard</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <p className="text-white/90 text-xs font-medium">Welcome back!</p>
              <p className="text-white/70 text-xs">Manage your restaurant</p>
            </div>
          </div>
        </div>

        {/* Menu Items - Enhanced */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-2">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group relative overflow-hidden rounded-2xl transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg scale-[1.02]'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-amber-800'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-white/20'
                        : 'bg-gray-100 group-hover:bg-amber-100'
                    }`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-base">{item.label}</p>
                      <p className={`text-xs transition-colors duration-300 ${
                        activeTab === item.id
                          ? 'text-white/70'
                          : 'text-gray-500 group-hover:text-amber-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {activeTab === item.id && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full opacity-80" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Stats - New Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-800">Today's Orders</p>
              <span className="text-lg font-bold text-green-600">24</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-green-600">Revenue</p>
              <span className="text-sm font-bold text-green-700">₹4,320</span>
            </div>
          </div>
        </div>

        {/* Footer - Enhanced */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="text-center">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full mx-auto mb-2 flex items-center justify-center">
              <ChefHat size={16} className="text-white" />
            </div>
            <p className="text-xs text-gray-500 font-medium">Prince Bakery Dashboard</p>
            <p className="text-xs text-gray-400">Version 2.0</p>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Toggle - Optional */}
      <div className="hidden md:block">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-amber-50"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        )}
      </div>
    </>
  );
};

export default Sidebar;