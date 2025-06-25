import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '../Redux/Slices/CartSlice';
import { 
  ShoppingCart, 
  DollarSign,
  Package,
  BarChart3,
  Search,
  ChefHat,
  Menu,
  Calendar,
  Filter
} from 'lucide-react';
import Sidebar from '../Components/Sidebar';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.cart);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState('today'); // today, week, month, all

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  // Helper function to check if a date matches the filter
  const isDateInRange = (orderDate, filter, selectedDate) => {
    const orderDateObj = new Date(orderDate);
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return orderDateObj.toDateString() === today.toDateString();
      case 'selected':
        return orderDateObj.toDateString() === selectedDateObj.toDateString();
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDateObj >= weekAgo && orderDateObj <= today;
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDateObj >= monthAgo && orderDateObj <= today;
      case 'all':
      default:
        return true;
    }
  };

  // Filter orders based on date
  const getFilteredOrders = () => {
    if (!orders || orders.length === 0) return [];
    
    return orders.filter(order => {
      const orderDate = order.ordered_at || order.created_at;
      if (dateFilter === 'selected') {
        return isDateInRange(orderDate, 'selected', selectedDate);
      }
      return isDateInRange(orderDate, dateFilter, selectedDate);
    });
  };

  const filteredOrders = getFilteredOrders();

  // Calculate overall statistics from filtered orders
  const getOverallStats = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return {
        totalEarnings: 0,
        totalOrders: 0
      };
    }

    const totalEarnings = filteredOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.total_amount) || 0);
    }, 0);
    const totalOrders = filteredOrders.length;

    return {
      totalEarnings,
      totalOrders
    };
  };

  // Calculate item-level statistics from filtered orders
  const getItemStats = () => {
    if (!filteredOrders || filteredOrders.length === 0) return [];

    const itemStats = {};

    filteredOrders.forEach(order => {
      order.items?.forEach(orderItem => {
        const itemName = orderItem.item?.name || 'Unknown Item';
        const itemId = orderItem.item?.id || 'unknown';
        
        if (!itemStats[itemId]) {
          itemStats[itemId] = {
            id: itemId,
            name: itemName,
            totalOrders: 0,
            totalEarnings: 0,
            totalQuantity: 0,
            image: orderItem.item?.image || null,
            category: orderItem.item?.category?.name || 'Uncategorized'
          };
        }

        itemStats[itemId].totalOrders += 1;
        itemStats[itemId].totalEarnings += (parseFloat(orderItem.total_amount) || 0);
        itemStats[itemId].totalQuantity += (parseInt(orderItem.quantity) || 0);
      });
    });

    return Object.values(itemStats).sort((a, b) => b.totalEarnings - a.totalEarnings);
  };

  const overallStats = getOverallStats();
  const itemStats = getItemStats();

  // Filter items based on search
  const filteredItems = itemStats.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'selected': return `Selected Date (${selectedDate})`;
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'all': return 'All Time';
      default: return 'Today';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <p className="text-gray-700 font-medium">Loading analytics...</p>
            <p className="text-gray-500 text-sm mt-1">Crunching your sales data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {/* Menu Button - Now visible on all screen sizes */}
      <div className="fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200 hover:bg-white transition-all"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ml-0 lg:ml-16">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Sales Dashboard</h1>
                <p className="text-blue-100 text-lg">Track your business performance & top items</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-0 lg:ml-16">
        {/* Date Filter Section */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Filter by Date</h3>
                <p className="text-gray-600 text-sm">Currently showing: {getDateFilterLabel()}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'today'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'week'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'month'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  dateFilter === 'all'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-white/60 text-gray-700 hover:bg-white'
                }`}
              >
                All Time
              </button>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setDateFilter('selected');
                  }}
                  className="px-3 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Earnings</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(overallStats.totalEarnings)}</p>
                <p className="text-green-100 text-xs mt-1">{getDateFilterLabel()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{overallStats.totalOrders}</p>
                <p className="text-blue-100 text-xs mt-1">{getDateFilterLabel()}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl border border-blue-200">
                <span className="text-sm font-medium text-gray-700">
                  Showing {filteredItems.length} items
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Analytics */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="p-6 border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
                  <ChefHat className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Menu Performance</h2>
                  <p className="text-gray-600">Individual item sales & earnings for {getDateFilterLabel()}</p>
                </div>
              </div>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No items found</h3>
              <p className="text-gray-600">
                {searchQuery ? "Try adjusting your search terms." : `No orders found for ${getDateFilterLabel().toLowerCase()}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 rounded-xl object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <ChefHat className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1 rounded-lg border border-purple-200">
                            <span className="text-sm font-semibold text-purple-700">
                              {item.totalOrders}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-3 py-1 rounded-lg border border-indigo-200">
                          <span className="text-sm font-semibold text-indigo-700">
                            {item.totalQuantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1 rounded-lg border border-green-200">
                          <span className="text-sm font-bold text-green-700">
                            {formatCurrency(item.totalEarnings)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;