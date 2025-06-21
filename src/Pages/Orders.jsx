import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders, repeatOrder } from '../Redux/Slices/CartSlice';
import { ShoppingCart, Clock, CheckCircle, XCircle, RotateCcw, Package, MapPin } from 'lucide-react';
import Sidebar from '../Components/Sidebar';

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(state => state.cart);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  const handleRepeatOrder = (orderId) => {
    dispatch(repeatOrder(orderId));
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Package className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const filterOrders = (orders, tab) => {
    if (!orders) return [];
    
    switch (tab) {
      case 'pending':
        return orders.filter(order => order.status?.toLowerCase() === 'pending');
      case 'completed':
        return orders.filter(order => order.status?.toLowerCase() === 'completed');
      case 'cancelled':
        return orders.filter(order => order.status?.toLowerCase() === 'cancelled');
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrders(orders, activeTab);

  const tabs = [
    { id: 'all', label: 'All Orders', count: orders?.length || 0 },
    { id: 'pending', label: 'Pending', count: orders?.filter(o => o.status?.toLowerCase() === 'pending').length || 0 },
    { id: 'completed', label: 'Completed', count: orders?.filter(o => o.status?.toLowerCase() === 'completed').length || 0 },
    { id: 'cancelled', label: 'Cancelled', count: orders?.filter(o => o.status?.toLowerCase() === 'cancelled').length || 0 }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
              <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Your Orders</h1>
                <p className="text-sm text-gray-600">Track and manage your orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <XCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {activeTab === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${activeTab} orders found.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.ordered_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status || 'Processing'}</span>
                      </div>
                      <button
                        onClick={() => handleRepeatOrder(order.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reorder
                      </button>
                    </div>
                  </div>
                  
                  {/* Order Info */}
                  <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium">Order Type:</span>
                      <span className="ml-1 capitalize">{order.order_type}</span>
                    </div>
                    {order.table_number && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>Table {order.table_number}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="font-medium">Total:</span>
                      <span className="ml-1 font-semibold text-gray-900">₹{order.total_amount}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="bg-white p-2 rounded-lg border">
                              <span className="text-sm font-medium text-gray-900">
                                {item.item?.name || 'Unknown Item'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.item?.name || 'Unknown Item'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                              {item.note && (
                                <p className="text-xs text-gray-600 italic">
                                  Note: {item.note}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Extras */}
                          {item.extras && item.extras.length > 0 && (
                            <div className="mt-2 ml-14">
                              <p className="text-xs text-gray-600 mb-1">Extras:</p>
                              <div className="flex flex-wrap gap-1">
                                {item.extras.map((extra) => (
                                  <span key={extra.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                    {extra.extra?.name} (x{extra.quantity})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ₹{item.total_amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;