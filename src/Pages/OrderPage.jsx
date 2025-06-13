import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Eye, Printer, ChefHat, Search, Filter } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Sample orders data - Replace with API calls
  const sampleOrders = [
    {
      id: 'ORD001',
      customerName: 'John Doe',
      customerPhone: '9876543210',
      items: [
        { name: 'Chicken Biryani', quantity: 2, price: 180 },
        { name: 'Fresh Orange Juice', quantity: 1, price: 40 }
      ],
      total: 400,
      orderType: 'delivery',
      tableNumber: null,
      status: 'pending',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      note: 'Less spicy please'
    },
    {
      id: 'ORD002',
      customerName: 'Jane Smith',
      customerPhone: '9876543211',
      items: [
        { name: 'Mutton Biryani', quantity: 1, price: 220 },
        { name: 'Butter Naan', quantity: 2, price: 35 }
      ],
      total: 290,
      orderType: 'table',
      tableNumber: 'T5',
      status: 'preparing',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      note: ''
    },
    {
      id: 'ORD003',
      customerName: 'Mike Johnson',
      customerPhone: '9876543212',
      items: [
        { name: 'Samosa', quantity: 4, price: 25 },
        { name: 'Gulab Jamun', quantity: 1, price: 60 }
      ],
      total: 160,
      orderType: 'parcel',
      tableNumber: null,
      status: 'completed',
      timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      note: 'Pack separately'
    }
  ];

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchOrders();
    setOrders(sampleOrders);
  }, []);

  // TODO: Add API integration for fetching orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // const response = await dispatch(getOrders()).unwrap();
      // setOrders(response.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Add API integration for updating order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // const response = await dispatch(updateOrder({ orderId, status: newStatus })).unwrap();
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'preparing':
        return <ChefHat size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN');
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Orders Management</h1>
        <p className="text-gray-600">Track and manage all your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 focus:bg-white"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4 md:p-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="mb-2 md:mb-0">
                    <h3 className="text-lg font-bold text-gray-800">#{order.id}</h3>
                    <p className="text-gray-600">{order.customerName} • {order.customerPhone}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.timestamp)} at {formatTime(order.timestamp)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    
                    <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
                      {order.orderType.charAt(0).toUpperCase() + order.orderType.slice(1)}
                      {order.tableNumber && ` - ${order.tableNumber}`}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  {order.note && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
                      <span className="text-sm text-yellow-800">
                        <strong>Note:</strong> {order.note}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Footer */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 mb-3 md:mb-0">
                    Total: ₹{order.total}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200 text-sm"
                      >
                        <ChefHat size={16} />
                        Start Preparing
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200 text-sm"
                      >
                        <CheckCircle size={16} />
                        Mark Complete
                      </button>
                    )}
                    
                    <button
                      onClick={() => console.log('Print order:', order.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors duration-200 text-sm"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <XCircle size={24} className="text-gray-600" />
                </button>
              </div>
              
              {/* Detailed order information would go here */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Order ID:</h3>
                  <p className="text-gray-600">#{selectedOrder.id}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Customer:</h3>
                  <p className="text-gray-600">{selectedOrder.customerName}</p>
                  <p className="text-gray-600">{selectedOrder.customerPhone}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Order Type:</h3>
                  <p className="text-gray-600">
                    {selectedOrder.orderType.charAt(0).toUpperCase() + selectedOrder.orderType.slice(1)}
                    {selectedOrder.tableNumber && ` - Table ${selectedOrder.tableNumber}`}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700">Items:</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between p-2 bg-gray-50 rounded-lg">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {selectedOrder.note && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Special Instructions:</h3>
                    <p className="text-gray-600 p-2 bg-yellow-50 rounded-lg">{selectedOrder.note}</p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                      ₹{selectedOrder.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;