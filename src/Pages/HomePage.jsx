import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import ProductModal from '../Components/ProductModal';
import Cart from '../Components/Cart';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Sample data - Replace with API calls
  const categories = [
    { id: 'all', name: 'All Items', emoji: '🍽️' },
    { id: 'biryani', name: 'Biryani', emoji: '🍛' },
    { id: 'juice', name: 'Juice', emoji: '🧃' },
    { id: 'breads', name: 'Breads', emoji: '🍞' },
    { id: 'snacks', name: 'Snacks', emoji: '🍿' },
    { id: 'sweets', name: 'Sweets', emoji: '🍬' },
  ];

  const products = [
    {
      id: 1,
      name: 'Chicken Biryani',
      price: 180,
      category: 'biryani',
      image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=300&h=200&fit=crop',
      description: 'Aromatic basmati rice with tender chicken pieces and traditional spices'
    },
    {
      id: 2,
      name: 'Mutton Biryani',
      price: 220,
      category: 'biryani',
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop',
      description: 'Rich and flavorful mutton biryani with fragrant spices'
    },
    {
      id: 3,
      name: 'Fresh Orange Juice',
      price: 40,
      category: 'juice',
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=300&h=200&fit=crop',
      description: 'Freshly squeezed orange juice packed with vitamin C'
    },
    {
      id: 4,
      name: 'Butter Naan',
      price: 35,
      category: 'breads',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
      description: 'Soft and fluffy naan bread with butter'
    },
    {
      id: 5,
      name: 'Samosa',
      price: 25,
      category: 'snacks',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop',
      description: 'Crispy samosa filled with spiced potatoes'
    },
    {
      id: 6,
      name: 'Gulab Jamun',
      price: 60,
      category: 'sweets',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop',
      description: 'Traditional sweet dumplings in sugar syrup'
    },
  ];

  // Filter products based on category and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add to cart function
  const addToCart = (product, quantity = 1, note = '') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity, note: note || item.note }
            : item
        );
      }
      return [...prevCart, { ...product, quantity, note }];
    });
  };

  // Update cart quantity
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showCart && window.innerWidth >= 768 ? 'mr-80' : ''}`}>
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Welcome to Prince Bakery
              </h1>
              <p className="text-gray-600">Fresh and delicious food made with love</p>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Categories</h2>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-amber-50 border border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{category.emoji}</span>
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                      ₹{product.price}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-2 rounded-xl font-medium hover:from-amber-600 hover:to-orange-700 transition-all duration-200"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar for Desktop */}
        <div className={`hidden md:block fixed right-0 top-0 h-full transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
          <Cart
            cart={cart}
            updateQuantity={updateCartQuantity}
            removeFromCart={removeFromCart}
            onClose={() => setShowCart(false)}
          />
        </div>
      </div>

      {/* Mobile Cart Button */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-4 right-4 md:hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-full shadow-lg z-40"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </div>
      </button>

      {/* Mobile Cart Modal */}
      {showCart && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[80vh] overflow-hidden">
            <Cart
              cart={cart}
              updateQuantity={updateCartQuantity}
              removeFromCart={removeFromCart}
              onClose={() => setShowCart(false)}
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
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default HomePage;