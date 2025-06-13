import React, { useState } from 'react';
import { X, Menu, Home, ShoppingBag, BarChart3, Settings } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'sales', label: 'Sales Report', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl shadow-lg md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-amber-50 to-orange-50 border-r border-amber-200 shadow-xl transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 md:w-72`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-amber-200">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600">
            Prince Bakery
          </h1>
          <p className="text-sm text-amber-700 mt-1">Fresh • Delicious • Premium</p>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false); // Close sidebar on mobile after selection
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                    : 'text-amber-800 hover:bg-amber-100 hover:text-amber-900'
                }`}
              >
                <IconComponent size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4 p-4 bg-white/50 rounded-xl border border-amber-200">
          <p className="text-xs text-amber-700 text-center">
            © 2025 Prince Bakery
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;