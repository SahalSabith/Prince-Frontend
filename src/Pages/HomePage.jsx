import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Menu, Home, Settings, CheckCircle, Package, UtensilsCrossed } from 'lucide-react';
import ProductModal from '../Components/ProductModal'
import Sidebar from '../Components/Sidebar';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchProductDetail } from '../Redux/Slices/ProductSlice';
import { addToCart } from '../Redux/Slices/CartSlice';
import { addCartItemExtra, removeCartItemExtra, addExtraOptimistic, removeExtraOptimistic } from '../Redux/Slices/CartSlice';
import { Search, Plus, Minus, ShoppingCart, X, ChefHat, Printer, AlertCircle, Trash2 } from 'lucide-react';
import { 
  getCart, 
  placeOrder, 
  editCart, 
  updateCartItem,
  removeCartItem,
  clearError, 
  clearSuccessMessage,
  updateItemOptimistic,
  removeItemOptimistic
} from '../Redux/Slices/CartSlice';

// Function to generate short names for items
const generateShortName = (itemName) => {
  if (!itemName) return 'UN';
  
  const words = itemName.split(' ').filter(word => word.length > 0);
  
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  } else if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  
  return itemName.substring(0, 2).toUpperCase();
};

// Order Confirmation Modal Component
const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, cartItems, total, orderType, tableNumber, loading }) => {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
        onClick={onClose}
        style={{ zIndex: 10000 }}
      />
      
      <div 
        className="fixed inset-0 flex items-center justify-center z-[10001] p-4 pointer-events-none"
        style={{ zIndex: 10001 }}
      >
        <div 
          className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Confirm Your Order</h3>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                disabled={loading}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Order Type */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              {orderType === 'table' ? (
                <UtensilsCrossed size={20} className="text-blue-600" />
              ) : (
                <Package size={20} className="text-blue-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {orderType === 'table' ? 'Dine In' : 'Takeaway'}
                </p>
                {orderType === 'table' && tableNumber && (
                  <p className="text-sm text-gray-600">Table: {tableNumber}</p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Order Items</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((cartItem) => (
                  <div key={cartItem.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {cartItem.item?.name || 'Unnamed Item'}
                        </p>
                        <p className="text-xs text-gray-500">
                          ₹{cartItem.item?.price || 0} × {cartItem.quantity || 1}
                        </p>
                        
                        {/* Extras in Modal */}
                        {cartItem.extras && cartItem.extras.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-medium text-gray-600">Extras:</p>
                            {cartItem.extras.map((extraItem, index) => (
                              <div key={extraItem.id || index} className="flex justify-between items-center text-xs text-gray-500 ml-2">
                                <span>+ {extraItem.extra?.name || extraItem.name}</span>
                                <span>₹{extraItem.total_amount || extraItem.price}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {cartItem.note && (
                          <p className="text-xs text-gray-400 mt-1">Note: {cartItem.note}</p>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{((cartItem.item?.price || 0) * (cartItem.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-green-600">₹{total}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Confirm Order
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

function Cart({ onClose, isMobile = false }) {
  const [orderType, setOrderType] = useState('parcel');
  const [tableNumber, setTableNumber] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [operationLoading, setOperationLoading] = useState({});
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  
  // Get cart state from Redux store
  const { 
    fetchCart, 
    loading, 
    updateLoading, 
    error, 
    successMessage,
    itemUpdateLoading,
    extraLoading
  } = useSelector((state) => state.cart);
  
  // Get products state to access extras information
  const products = useSelector((state) => state.products?.products || []);
  
  // Extract cart items and merge with product extras data
  const cartItemsWithExtras = useMemo(() => {
    const items = fetchCart?.items || [];
    
    return items.map(cartItem => {
      // Find the corresponding product to get available extras
      const product = products?.find(p => p.id === cartItem.item?.id);
      const availableExtras = product?.extras || [];
      
      // Get selected extras from cart item (these come from the API)
      const selectedExtras = cartItem.extras || [];

      return {
        ...cartItem,
        availableExtras,
        extras: selectedExtras // Use actual extras from API
      };
    });
  }, [fetchCart?.items, products]);
  
  // Ref for debounce timeout
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  // Initialize local state from cart data
  useEffect(() => {
    if (fetchCart) {
      setOrderType(fetchCart.order_type || 'parcel');
      setTableNumber(fetchCart.table_number || '');
    }
  }, [fetchCart]);

  // Clear messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const orderTypes = [
    { value: 'parcel', label: 'Parcel', icon: '📦' },
    { value: 'table', label: 'Table', icon: '🍽️' },
  ];

  const calculateTotal = useCallback(() => {
    return cartItemsWithExtras.reduce((total, cartItem) => {
      return total + (cartItem.total_amount || 0);
    }, 0);
  }, [cartItemsWithExtras]);

  // Fixed function to handle extra toggle
  const handleExtraToggle = async (cartItemId, extra) => {
    const cartItem = cartItemsWithExtras.find(item => item.id === cartItemId);
    const isSelected = cartItem.extras?.some(selectedExtra => 
      (selectedExtra.extra?.id || selectedExtra.id) === extra.id
    );
    
    try {
      if (isSelected) {
        // Remove extra - use optimistic update first
        dispatch(removeExtraOptimistic({ itemId: cartItemId, extraId: extra.id }));
        await dispatch(removeCartItemExtra({ itemId: cartItemId, extraId: extra.id })).unwrap();
      } else {
        // Add extra - use optimistic update first
        dispatch(addExtraOptimistic({ 
          itemId: cartItemId, 
          extra: {
            id: extra.id,
            name: extra.name,
            price: extra.price
          }, 
          quantity: 1 
        }));
        await dispatch(addCartItemExtra({ itemId: cartItemId, extraId: extra.id, quantity: 1 })).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle extra:', error);
      // Revert optimistic update on error by refetching cart
      dispatch(getCart());
    }
  };

  // Debounced cart update function
  const updateCartWithDebounce = useCallback((updateData) => {
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout
    updateTimeoutRef.current = setTimeout(async () => {
      try {
        await dispatch(editCart(updateData));
      } catch (error) {
        console.error('Failed to update cart:', error);
      }
    }, 800);
  }, [dispatch]);

  const handleOrderTypeChange = (newOrderType) => {
    setOrderType(newOrderType);
    
    const updateData = {
      order_type: newOrderType,
      table_number: newOrderType === 'table' ? tableNumber : null,
    };

    updateCartWithDebounce(updateData);
  };

  const handleTableNumberChange = (newTableNumber) => {
    setTableNumber(newTableNumber);
    
    if (orderType === 'table') {
      const updateData = {
        order_type: orderType,
        table_number: newTableNumber,
      };

      updateCartWithDebounce(updateData);
    }
  };

  // Fixed quantity update handler
  const handleQuantityUpdate = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemoveItem(itemId);
      return;
    }

    try {
      const cartItem = cartItemsWithExtras.find(item => item.id === itemId);
      
      // Optimistic update
      dispatch(updateItemOptimistic({ itemId, quantity: newQuantity }));

      await dispatch(updateCartItem({ 
        itemId, 
        quantity: newQuantity, 
        note: cartItem?.note || '' 
      })).unwrap();

    } catch (error) {
      console.error('Failed to update quantity:', error);
      dispatch(getCart());
    }
  };

  // Fixed remove item handler
  const handleRemoveItem = async (itemId) => {
    try {
      // Optimistic update
      dispatch(removeItemOptimistic(itemId));

      await dispatch(removeCartItem(itemId)).unwrap();

    } catch (error) {
      console.error('Failed to remove item:', error);
      dispatch(getCart());
    }
  };

  const handlePlaceOrderConfirm = async () => {
    const orderData = {
      order_type: orderType,
      table_number: orderType === 'table' ? tableNumber.trim() : null,
    };
    
    try {
      await dispatch(placeOrder(orderData)).unwrap();

      setOrderType('parcel');
      setTableNumber('');
      setShowConfirmModal(false);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      setShowConfirmModal(false);
    }
  };

  const handlePlaceOrder = () => {
    setValidationError('');
    
    if (orderType === 'table' && !tableNumber.trim()) {
      setValidationError('Please enter a table number for table orders');
      return;
    }

    if (cartItemsWithExtras.length === 0) {
      setValidationError('Your cart is empty');
      return;
    }

    setShowConfirmModal(true);
  };

  const handleRetry = () => {
    dispatch(clearError());
    dispatch(getCart());
  };

  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Show loading state
  if (loading && !fetchCart) {
    return (
      <div className="flex items-center justify-center p-6 min-h-[300px]">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="ml-2 text-slate-600 text-sm">Loading cart...</p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full bg-white flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={14} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Your Cart</h2>
                  {cartItemsWithExtras.length > 0 && (
                    <p className="text-xs text-slate-600">
                      {cartItemsWithExtras.reduce((sum, cartItem) => sum + (cartItem.quantity || 0), 0)} items
                    </p>
                  )}
                </div>
              </div>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <X size={16} className="text-slate-600" />
                </button>
              )}
            </div>
            
            {updateLoading && (
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Updating cart...</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {(error || successMessage || validationError) && (
          <div className="flex-shrink-0 p-3 space-y-2">
            {validationError && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-orange-700 text-sm font-medium">{validationError}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium">
                    {typeof error === 'string' ? error : error.message || 'Something went wrong'}
                  </p>
                  <button 
                    onClick={handleRetry}
                    className="text-red-600 hover:text-red-800 text-sm underline mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* Order Type Selector */}
        <div className="flex-shrink-0 p-3 bg-slate-50 border-b border-slate-200">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              {orderTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleOrderTypeChange(type.value)}
                  className={`flex flex-col items-center justify-center p-2 border rounded-lg text-xs font-medium transition ${
                    orderType === type.value
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm">{type.icon}</span>
                  <span className="mt-1">{type.label}</span>
                </button>
              ))}
            </div>

            {orderType === 'table' && (
              <input
                type="text"
                placeholder="Enter table number"
                value={tableNumber}
                onChange={(e) => handleTableNumberChange(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cartItemsWithExtras.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShoppingCart size={24} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm">Your cart is empty.</p>
              <p className="text-slate-400 text-xs mt-1">Add some items to get started!</p>
            </div>
          ) : (
            cartItemsWithExtras.map((cartItem) => {
              const itemName = cartItem.item?.name || 'Unnamed Item';
              const itemPrice = cartItem.item?.price || 0;
              const quantity = cartItem.quantity || 1;
              const shortName = generateShortName(itemName);
              const isItemLoading = itemUpdateLoading[cartItem.id];

              return (
                <div
                  key={cartItem.id}
                  className={`bg-white border border-slate-200 rounded-lg transition-opacity ${
                    isItemLoading ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  {/* Main Item Row */}
                  <div className="flex items-center gap-2 p-2.5">
                    {/* Item Icon */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-xs">{shortName}</span>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{itemName}</p>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>₹{itemPrice} × {quantity}</span>
                        {cartItem.extras && cartItem.extras.length > 0 && (
                            <span className="text-green-600">
                              + {cartItem.extras.reduce((sum, extra) => sum + (extra.quantity || 1), 0)} extra
                              {cartItem.extras.reduce((sum, extra) => sum + (extra.quantity || 1), 0) > 1 ? 's' : ''}
                            </span>
                          )}
                      </div>

                      {/* Detailed Extras List */}
                      {cartItem.extras && cartItem.extras.length > 0 && (
                        <ul className="ml-2 mt-1 text-xs text-slate-600 list-disc list-inside">
                          {cartItem.extras.map((extra, index) => (
                            <li key={index}>
                              {extra.extra_name} × {extra.quantity || 1}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="text-xs text-slate-600 font-medium">
                        Total: ₹{cartItem.total_amount || (itemPrice * quantity)}
                      </div>

                      {cartItem.note && (
                        <p className="text-xs text-slate-400 mt-1 truncate">Note: {cartItem.note}</p>
                      )}
                    </div>


                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleQuantityUpdate(cartItem.id, quantity - 1)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed rounded text-slate-600 transition-colors"
                        disabled={isItemLoading}
                      >
                        <Minus size={15} />
                      </button>
                      <span className="px-1.5 font-medium text-sm min-w-[20px] text-center">
                        {isItemLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mx-auto"></div>
                        ) : (
                          quantity
                        )}
                      </span>
                      <button
                        onClick={() => handleQuantityUpdate(cartItem.id, quantity + 1)}
                        className="p-1 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 disabled:cursor-not-allowed rounded text-slate-600 transition-colors"
                        disabled={isItemLoading}
                      >
                        <Plus size={15} />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(cartItem.id)}
                        className="ml-1 text-red-500 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed transition-colors"
                        disabled={isItemLoading}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Extras Section - Only show if there are available extras */}
                  {cartItem.availableExtras && cartItem.availableExtras.length > 0 && (
                    <div className="border-t border-slate-100 p-2.5 bg-slate-25">
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-600 flex items-center gap-1">
                          <Plus size={10} />
                          Available Extras
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {cartItem.availableExtras.map((extra) => {
                            const isSelected = cartItem.extras?.some(selectedExtra => 
                              (selectedExtra.extra?.id || selectedExtra.id) === extra.id
                            );
                            const extraLoadingKey = `${cartItem.id}-${extra.id}`;
                            const isExtraLoading = extraLoading[extraLoadingKey];
                            
                            return (
                              <button
                                key={extra.id}
                                onClick={() => handleExtraToggle(cartItem.id, extra)}
                                className={`flex items-center justify-between p-2 rounded text-xs transition-colors ${
                                  isSelected
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                } ${isExtraLoading ? 'opacity-50' : ''}`}
                                disabled={isItemLoading || isExtraLoading}
                              >
                                <span className="flex items-center gap-1">
                                  {isExtraLoading ? (
                                    <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-current"></div>
                                  ) : (
                                    isSelected && <CheckCircle size={10} />
                                  )}
                                  {extra.name}
                                </span>
                                <span className="font-medium">₹{extra.price}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {cartItemsWithExtras.length > 0 && (
          <div className="flex-shrink-0 border-t border-slate-200 p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-700">Total:</span>
              <span className="text-sm font-bold text-slate-900">
                ₹{fetchCart?.total_amount || calculateTotal()}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              className="w-full flex items-center justify-center p-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium text-sm transition-colors"
              disabled={loading || updateLoading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handlePlaceOrderConfirm}
        cartItems={cartItemsWithExtras}
        total={fetchCart?.total_amount || calculateTotal()}
        orderType={orderType}
        tableNumber={tableNumber}
        loading={loading}
      />
    </>
  );
}

const toggleFullScreen = () => {
  const elem = document.documentElement;

  if (!document.fullscreenElement &&
      !document.webkitFullscreenElement &&
      !document.mozFullScreenElement &&
      !document.msFullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
  }
};

const HomePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  const dispatch = useDispatch();
  const { products, categories, productDetail, loading, error } = useSelector((state) => state.product);
  const { fetchCart } = useSelector((state) => state.cart);

  // Get total items from Redux cart
  const totalItems = fetchCart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;


  const filteredProducts = products.filter(product => {
      let matchesCategory;
      
      if (selectedCategory === 'all') {
          matchesCategory = true; // Show all products
      } else if (selectedCategory === 'popular') {
          matchesCategory = product.is_popular; // Show only popular products
      } else {
          matchesCategory = product.category.id === selectedCategory; // Show products in selected category
      }
      
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
    dispatch(getCart()); // Load cart on component mount
  }, [dispatch]);

  const addToCartFunc = async (product, quantity = 1, note = '') => {
    try {
      await dispatch(addToCart({ item: product.id, quantity, note })).unwrap();
      // Optionally show success message or refresh cart
      dispatch(getCart());
    } catch (error) {
      console.error('Failed to add item to cart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* Main Layout Container */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
        
        {/* Main Content Area */}
        <div className="min-h-screen lg:pr-[320px]">
          {/* Top Header Bar */}
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-4 lg:p-6">
              {/* Left side - Menu button and Logo */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors z-50 relative"
                >
                  <Menu size={24} className="text-slate-600" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <ChefHat size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Prince Bakery</h1>
                    <p className="text-sm text-slate-500 hidden md:block">Fresh & Delicious</p>
                  </div>
                  <button
                    onClick={toggleFullScreen}
                    className="ml-3 flex items-center px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium"
                  >
                    Fullscreen
                  </button>
                </div>
              </div>

              {/* Mobile Cart Button */}
              <button
                onClick={() => setShowMobileCart(true)}
                className="lg:hidden relative p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all z-50"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 lg:p-8 space-y-8">
            {/* Welcome Section */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-2">
                Welcome to Our Kitchen
              </h2>
              <p className="text-slate-600 text-lg">Discover amazing flavors crafted with love</p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto lg:mx-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for your favorite dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-base placeholder-slate-400"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Categories</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {/* Popular Button */}
                <button
                  onClick={() => setSelectedCategory('popular')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max font-medium ${
                    selectedCategory === 'popular'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <span>Popular</span>
                </button>

                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  <span>All Items</span>
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-200 min-w-max font-medium ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-800">
                  {selectedCategory === 'all' ? 'All Dishes' : categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <span className="text-slate-500 text-sm">{filteredProducts.length} items</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 hover:border-blue-200 transform hover:-translate-y-1"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image ? (
                      <>
                        <div className="relative overflow-hidden">
                          <img
                            src={`http://192.168.0.109:8000/${product.image}`}
                            alt={product.name}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            ₹{product.price}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="p-5">
                          <h4 className="font-bold text-slate-800 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h4>
                          <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCartFunc(product);
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 h-full flex flex-col justify-center items-center text-center min-h-[280px]">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                          <span className="text-blue-500 font-bold text-lg">{generateShortName(product.name)}</span>
                        </div>
                        <div className="bg-white/90 backdrop-blur-sm text-slate-800 px-4 py-2 rounded-full text-lg font-bold shadow-lg mb-3">
                          ₹{product.price}
                        </div>
                        <h4 className="font-bold text-slate-800 mb-3 text-xl group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                          {product.description}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCartFunc(product);
                          }}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={40} className="text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-xl font-medium mb-2">No dishes found</p>
                  <p className="text-slate-400 text-base">Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Cart - Desktop Only - Fixed position */}
        <div className="hidden lg:block fixed right-0 top-0 w-[320px] h-screen bg-white border-l border-slate-200 shadow-xl z-20">
          <Cart 
            onClose={null} // No close button needed for fixed sidebar
            isMobile={false}
          />
        </div>
      </div>

      {/* Mobile Cart Modal */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-[9998] flex items-end">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setShowMobileCart(false)} 
          />
          <div className="relative w-full h-[90vh] bg-white rounded-t-3xl overflow-hidden shadow-2xl">
            <Cart
              onClose={() => setShowMobileCart(false)}
              isMobile={true}
            />
          </div>
        </div>
      )}

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCartFunc}
          openCart={() => setShowMobileCart(true)}
        />
      )}
    </div>
  );
};

export default HomePage;