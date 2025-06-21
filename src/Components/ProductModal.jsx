import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X, ChefHat } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../Redux/Slices/CartSlice';
import { fetchProductExtras } from '../Redux/Slices/ProductSlice';

function ProductModal({ product, onClose, openCart }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');
  const [extraQuantities, setExtraQuantities] = useState({});
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [extrasTotal, setExtrasTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.cart);
  const { productExtras } = useSelector((state) => state.product);

  // Fetch product extras when modal opens
  useEffect(() => {
    if (product?.id) {
      dispatch(fetchProductExtras(product.id));
    }
  }, [dispatch, product?.id]);

  // Calculate totals whenever quantity, selectedExtras, or extraQuantities change
  useEffect(() => {
    const baseTotal = product.price * quantity;
    const extrasPrice = selectedExtras.reduce((sum, extra) => {
      const extraQty = extraQuantities[extra.id] || 1;
      return sum + (extra.price * extraQty);
    }, 0);
    setExtrasTotal(extrasPrice);
    setTotalAmount(baseTotal + extrasPrice);
  }, [quantity, selectedExtras, product.price, extraQuantities]);

  const handleExtraToggle = (extra) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id);
      if (exists) {
        // Remove extra and its quantity
        setExtraQuantities(prevQty => {
          const newQty = { ...prevQty };
          delete newQty[extra.id];
          return newQty;
        });
        return prev.filter(e => e.id !== extra.id);
      } else {
        // Add extra with default quantity of 1
        setExtraQuantities(prevQty => ({
          ...prevQty,
          [extra.id]: 1
        }));
        return [...prev, extra];
      }
    });
  };

  const handleExtraQuantityChange = (extraId, newQuantity) => {
    if (newQuantity < 1) return;
    setExtraQuantities(prev => ({
      ...prev,
      [extraId]: newQuantity
    }));
  };

const handleAddToCart = () => {
    // Fix: Send extras in the format your backend expects
    const extrasData = selectedExtras.map(extra => ({
      extra_id: extra.id,  // Changed from 'id' to 'extra_id'
      quantity: extraQuantities[extra.id] || 1
      // Removed name and price - backend will get these from the Extra model
    }));
    
    dispatch(addToCart({ 
      item: product.id, 
      quantity, 
      note,
      extras: extrasData  // Now sends correct format
    }));
    
    if (openCart) {
      openCart(true);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative bg-white w-full max-w-md md:max-w-lg rounded-xl shadow-xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header - Fixed */}
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={18} className="text-white" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ChefHat size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{product.name}</h2>
              {product.description && (
                <p className="text-white/90 text-sm opacity-90">{product.description}</p>
              )}
            </div>
          </div>
          
          <div className="mt-3">
            <span className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-lg font-bold">
              ₹{product.price}
            </span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-4">
            {/* Quantity Selector */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Quantity
              </label>
              <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 bg-white border border-gray-300 hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors shadow-sm"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} className={quantity <= 1 ? 'text-gray-400' : 'text-gray-600'} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-xl font-bold text-gray-800">{quantity}</span>
                </div>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-md flex items-center justify-center transition-colors shadow-sm"
                >
                  <Plus size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Product Extras */}
            {productExtras && productExtras.extras && productExtras.extras.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Add Extras
                </label>
                <div className="space-y-2">
                  {productExtras.extras.map(extra => {
                    const isSelected = selectedExtras.find(e => e.id === extra.id);
                    const extraQty = extraQuantities[extra.id] || 1;
                    
                    return (
                      <div 
                        key={extra.id}
                        className={`border rounded-lg transition-all ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="p-3 cursor-pointer"
                          onClick={() => handleExtraToggle(extra)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-gray-800 text-sm">{extra.name}</span>
                                {extra.description && (
                                  <p className="text-xs text-gray-500">{extra.description}</p>
                                )}
                              </div>
                            </div>
                            <span className="font-semibold text-blue-600 text-sm">₹{extra.price}</span>
                          </div>
                        </div>
                        
                        {isSelected && (
                          <div className="px-3 pb-3 border-t border-blue-200 bg-blue-25">
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">Qty:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExtraQuantityChange(extra.id, extraQty - 1);
                                    }}
                                    className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded flex items-center justify-center"
                                    disabled={extraQty <= 1}
                                  >
                                    <Minus size={12} className={extraQty <= 1 ? 'text-gray-400' : 'text-gray-600'} />
                                  </button>
                                  <span className="text-sm font-medium min-w-[1.5rem] text-center">{extraQty}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleExtraQuantityChange(extra.id, extraQty + 1);
                                    }}
                                    className="w-6 h-6 bg-blue-500 hover:bg-blue-600 rounded flex items-center justify-center"
                                  >
                                    <Plus size={12} className="text-white" />
                                  </button>
                                </div>
                              </div>
                              <span className="text-xs font-semibold text-blue-600">
                                ₹{extra.price * extraQty}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {extrasTotal > 0 && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Extras Total:</span>
                      <span className="font-semibold text-blue-600">₹{extrasTotal}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Special Note */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Special Instructions (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Any special requests..."
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          {/* Total Summary */}
          <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Item ({quantity}x):</span>
                <span className="font-medium">₹{product.price * quantity}</span>
              </div>
              {extrasTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Extras:</span>
                  <span className="font-medium">₹{extrasTotal}</span>
                </div>
              )}
              <div className="pt-1 border-t border-gray-200 flex justify-between">
                <span className="font-semibold text-gray-800">Total:</span>
                <span className="font-bold text-lg text-blue-600">₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={18} />
            )}
            {loading ? 'Adding...' : `Add to Cart - ₹${totalAmount}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;