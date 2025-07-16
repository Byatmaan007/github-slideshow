import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cart Context
const CartContext = React.createContext();

// Cart Provider
const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [sessionId] = useState(() => {
    let id = localStorage.getItem('sessionId');
    if (!id) {
      id = Date.now().toString();
      localStorage.setItem('sessionId', id);
    }
    return id;
  });

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API}/cart/${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity, color, size) => {
    try {
      const response = await axios.post(`${API}/cart/${sessionId}/items`, {
        product_id: productId,
        quantity: quantity,
        selected_color: color,
        selected_size: size
      });
      setCart(response.data.cart);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`${API}/cart/${sessionId}/items/${productId}`);
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const response = await axios.put(`${API}/cart/${sessionId}/items/${productId}`, {
        quantity: quantity
      });
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [sessionId]);

  return (
    <CartContext.Provider value={{ 
      cart, 
      sessionId, 
      addToCart, 
      removeFromCart, 
      updateCartItem, 
      fetchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <div className={`mobile-menu ${isOpen ? 'open' : 'closed'}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">🇳🇵 Authentic Suits</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>
        <nav className="space-y-4">
          <a href="#home" className="block text-xl text-gray-700 hover:text-blue-600 py-2">🏠 Home</a>
          <a href="#products" className="block text-xl text-gray-700 hover:text-blue-600 py-2">🛍️ Shop</a>
          <a href="#culture" className="block text-xl text-gray-700 hover:text-blue-600 py-2">🏛️ Our Culture</a>
          <a href="#about" className="block text-xl text-gray-700 hover:text-blue-600 py-2">ℹ️ About</a>
          <a href="#contact" className="block text-xl text-gray-700 hover:text-blue-600 py-2">📞 Contact</a>
        </nav>
      </div>
    </div>
  );
};

// Shopping Cart Component
const ShoppingCart = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartItem } = React.useContext(CartContext);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md ml-auto mr-0 h-full" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-gray-800">
            🛒 Shopping Cart ({getTotalItems()})
          </h2>
          <button 
            onClick={onClose}
            className="modal-close"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <button 
                onClick={onClose}
                className="btn-primary"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {cart.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">Product #{item.product_id.slice(-6)}</h4>
                      <button 
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <p>Color: {item.selected_color}</p>
                      <p>Size: {item.selected_size}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateCartItem(item.product_id, Math.max(1, item.quantity - 1))}
                          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full text-gray-800 font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartItem(item.product_id, item.quantity + 1)}
                          className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full text-gray-800 font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-blue-600">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatPrice(cart.total)}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    onClose();
                    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary w-full"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Payment Component
const PaymentSection = () => {
  const { cart, sessionId } = React.useContext(CartContext);
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handlePayment = async (method) => {
    try {
      // Simulate payment processing
      alert(`Processing payment with ${method}...`);
      
      // In a real implementation, you'd integrate with actual payment providers
      setTimeout(() => {
        alert(`Payment successful! Order confirmation will be sent to your email.`);
      }, 2000);
      
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🛒</div>
        <p className="text-gray-600 mb-4">Add items to your cart to proceed with checkout</p>
        <button 
          onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
          className="btn-primary"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">💳 Payment Options</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Choose Payment Method</h4>
          <div className="space-y-3">
            {/* PayPal */}
            <button
              onClick={() => handlePayment('PayPal')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Pay with PayPal</span>
            </button>
            
            {/* Google Pay */}
            <button
              onClick={() => handlePayment('Google Pay')}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>📱</span>
              <span>Google Pay</span>
            </button>
            
            {/* Apple Pay */}
            <button
              onClick={() => handlePayment('Apple Pay')}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>🍎</span>
              <span>Apple Pay</span>
            </button>
            
            {/* Credit Cards */}
            <button
              onClick={() => handlePayment('Credit Card')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>💳</span>
              <span>Visa / Mastercard</span>
            </button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Order Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>{formatPrice(cart.total * 0.08)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>{cart.total > 500 ? 'FREE' : formatPrice(25)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-blue-600">
                  {formatPrice(cart.total + (cart.total * 0.08) + (cart.total > 500 ? 0 : 25))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Culture Section Component
const CultureSection = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCultureStories();
  }, []);

  const fetchCultureStories = async () => {
    try {
      // Initialize culture stories
      await axios.post(`${API}/culture/initialize`);
      
      // Fetch stories
      const response = await axios.get(`${API}/culture/stories`);
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching culture stories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🇳🇵 Our Nepalese Heritage
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the rich cultural heritage and traditional craftsmanship that makes our authentic suits truly special. 
            Each piece tells a story of Nepal's textile legacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, index) => (
            <div key={story.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <img 
                  src={story.image_url} 
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{story.title}</h3>
                  {story.featured && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-gray-600 line-clamp-3 mb-4">{story.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-600 font-semibold capitalize">
                    {story.category}
                  </span>
                  <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Nepal Flag and Quote */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
            <div className="text-6xl mb-4">🇳🇵</div>
            <blockquote className="text-2xl italic text-gray-700 mb-4">
              "Every thread tells a story, every stitch carries tradition, and every suit embodies the spirit of Nepal."
            </blockquote>
            <p className="text-gray-600 font-semibold">
              - Master Tailor Tradition, passed down through generations
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Filter Component
const ProductFilters = ({ onFilterChange, filters, productsCount }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const suitTypes = [
    { value: '', label: 'All Suits', icon: '👔' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'formal', label: 'Formal', icon: '🎩' },
    { value: 'wedding', label: 'Wedding', icon: '💒' },
    { value: 'casual', label: 'Casual', icon: '👕' },
    { value: 'tuxedo', label: 'Tuxedo', icon: '🤵' }
  ];

  const fabrics = [
    { value: '', label: 'All Fabrics', icon: '🧵' },
    { value: 'wool', label: 'Wool', icon: '🐑' },
    { value: 'cotton', label: 'Cotton', icon: '🌱' },
    { value: 'silk', label: 'Silk', icon: '🪱' },
    { value: 'linen', label: 'Linen', icon: '🌾' },
    { value: 'blend', label: 'Blend', icon: '🔄' }
  ];

  const clearFilters = () => {
    onFilterChange('suit_type', '');
    onFilterChange('fabric', '');
    onFilterChange('in_stock', undefined);
  };

  const hasActiveFilters = filters.suit_type || filters.fabric || filters.in_stock !== undefined;

  return (
    <div className="filter-section mb-8 glass-effect">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="mr-2">🔍</span>
          Filter Products
          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {productsCount} found
          </span>
        </h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-ghost text-sm"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden btn-ghost text-sm"
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isExpanded ? 'block' : 'hidden md:grid'}`}>
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Suit Type</label>
          <select 
            value={filters.suit_type || ''}
            onChange={(e) => onFilterChange('suit_type', e.target.value)}
            className="form-select interactive-element"
          >
            {suitTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Fabric</label>
          <select 
            value={filters.fabric || ''}
            onChange={(e) => onFilterChange('fabric', e.target.value)}
            className="form-select interactive-element"
          >
            {fabrics.map(fabric => (
              <option key={fabric.value} value={fabric.value}>
                {fabric.icon} {fabric.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Availability</label>
          <select 
            value={filters.in_stock !== undefined ? filters.in_stock.toString() : ''}
            onChange={(e) => onFilterChange('in_stock', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="form-select interactive-element"
          >
            <option value="">📦 All Products</option>
            <option value="true">✅ In Stock</option>
            <option value="false">❌ Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Enhanced Product Card Component
const ProductCard = ({ product, onViewDetails, index }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscount = () => {
    if (product.original_price) {
      const discount = Math.round(((product.original_price - product.price) / product.original_price) * 100);
      return discount;
    }
    return 0;
  };

  const getColorStyle = (color) => {
    const colorMap = {
      'charcoal': '#36454F',
      'navy': '#000080',
      'black': '#000000',
      'deep navy': '#000080',
      'midnight black': '#000000',
      'midnight blue': '#191970',
      'light grey': '#D3D3D3',
      'khaki': '#F0E68C',
      'dark grey': '#A9A9A9'
    };
    return colorMap[color.toLowerCase()] || color.toLowerCase();
  };

  return (
    <div 
      className={`product-card product-grid-item hover-shadow ${!product.in_stock ? 'opacity-75' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-image relative">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="loading-dots">
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          </div>
        )}
        
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-80 object-cover"
          onLoad={() => setIsImageLoaded(true)}
          loading="lazy"
        />
        
        {product.featured && (
          <div className="badge-featured">
            ⭐ Featured
          </div>
        )}
        
        {calculateDiscount() > 0 && (
          <div className="badge-sale">
            {calculateDiscount()}% OFF
          </div>
        )}
        
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white text-xl font-bold bg-red-500 px-4 py-2 rounded-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="price-display">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="price-original">{formatPrice(product.original_price)}</span>
            )}
          </div>
          {calculateDiscount() > 0 && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
              Save {formatPrice(product.original_price - product.price)}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {product.fabric_description}
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-700 capitalize bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {product.suit_type}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 mr-2">Colors:</span>
            <div className="flex space-x-1">
              {product.colors.slice(0, 4).map((color, colorIndex) => (
                <div 
                  key={colorIndex}
                  className="color-selector interactive-element"
                  style={{ backgroundColor: getColorStyle(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <div className="text-xs text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                  +{product.colors.length - 4}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>📏 Sizes:</span>
          <div className="flex space-x-1">
            {product.sizes.slice(0, 3).map((size, sizeIndex) => (
              <span key={sizeIndex} className="bg-gray-100 px-2 py-1 rounded text-xs">
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2 pt-4">
          <button 
            onClick={() => onViewDetails(product)}
            className="flex-1 btn-primary interactive-element"
            disabled={!product.in_stock}
          >
            View Details
          </button>
          <button 
            onClick={() => onViewDetails(product)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
            disabled={!product.in_stock}
          >
            🛒
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Product Detail Modal
const ProductDetailModal = ({ product, onClose }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  
  const { addToCart } = React.useContext(CartContext);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || '');
      setSelectedSize(product.sizes[0] || '');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscount = () => {
    if (product.original_price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return 0;
  };

  const getColorStyle = (color) => {
    const colorMap = {
      'charcoal': '#36454F',
      'navy': '#000080',
      'black': '#000000',
      'deep navy': '#000080',
      'midnight black': '#000000',
      'midnight blue': '#191970',
      'light grey': '#D3D3D3',
      'khaki': '#F0E68C',
      'dark grey': '#A9A9A9'
    };
    return colorMap[color.toLowerCase()] || color.toLowerCase();
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select color and size');
      return;
    }

    setLoading(true);
    try {
      await addToCart(product.id, quantity, selectedColor, selectedSize);
      alert('Added to cart successfully!');
      onClose();
    } catch (error) {
      alert('Error adding to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-6xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-3xl font-bold text-gray-800">{product.name}</h2>
          <button 
            onClick={onClose}
            className="modal-close"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-96 lg:h-[500px] object-cover rounded-xl shadow-lg"
                />
                {calculateDiscount() > 0 && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                    {calculateDiscount()}% OFF
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">📷</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="border-b pb-4">
                <div className="flex items-center space-x-4 mb-2">
                  <span className="text-4xl font-bold text-gradient">{formatPrice(product.price)}</span>
                  {product.original_price && (
                    <span className="text-2xl text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                  )}
                </div>
                {calculateDiscount() > 0 && (
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-block">
                    Save {formatPrice(product.original_price - product.price)}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-gray-600 text-lg leading-relaxed mb-4">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Suit Type</h4>
                    <p className="text-gray-600 capitalize">{product.suit_type}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Fabric</h4>
                    <p className="text-gray-600">{product.fabric_description}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Color: {selectedColor}</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(color)}
                      className={`color-selector ${selectedColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: getColorStyle(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Size: {selectedSize}</h4>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(size)}
                      className={`size-selector ${selectedSize === size ? 'selected' : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Quantity</h4>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-10 h-10 rounded-lg font-semibold"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-10 h-10 rounded-lg font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || loading}
                  className="w-full btn-primary text-lg py-4"
                >
                  {loading ? 'Adding...' : product.in_stock ? `Add to Cart - ${formatPrice(product.price * quantity)}` : 'Out of Stock'}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-secondary">
                    ❤️ Add to Wishlist
                  </button>
                  <button className="btn-secondary">
                    📏 Size Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t pt-8">
            <div className="flex space-x-4 mb-6">
              {['details', 'care', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              {activeTab === 'details' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Product Details</h4>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Fabric: {product.fabric_description}</li>
                    <li>• Available Colors: {product.colors.join(', ')}</li>
                    <li>• Available Sizes: {product.sizes.join(', ')}</li>
                    <li>• Type: {product.suit_type.charAt(0).toUpperCase() + product.suit_type.slice(1)}</li>
                    <li>• Stock: {product.stock_quantity} items available</li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'care' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Care Instructions</h4>
                  <p className="text-gray-600 mb-4">{product.care_instructions}</p>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Store on padded hangers</li>
                    <li>• Avoid direct sunlight</li>
                    <li>• Professional cleaning recommended</li>
                    <li>• Iron at low temperature if needed</li>
                  </ul>
                </div>
              )}
              
              {activeTab === 'shipping' && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Shipping & Returns</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Free shipping on orders over $500</li>
                    <li>• Standard delivery: 3-5 business days</li>
                    <li>• Express delivery: 1-2 business days</li>
                    <li>• 30-day return policy</li>
                    <li>• Free returns and exchanges</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Main App Component
const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initializeProducts = async () => {
    try {
      await axios.post(`${API}/products/initialize`);
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing products:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const response = await axios.get(`${API}/products?${queryParams}`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await initializeProducts();
      await fetchProducts();
    };
    init();
  }, []);

  useEffect(() => {
    if (initialized) {
      fetchProducts();
    }
  }, [filters, initialized]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === '' ? undefined : value
    }));
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Header */}
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="header-logo">🇳🇵 Authentic Suits</h1>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <a href="#home" className="nav-link">🏠 Home</a>
                <a href="#products" className="nav-link">🛍️ Shop</a>
                <a href="#culture" className="nav-link">🏛️ Culture</a>
                <a href="#checkout" className="nav-link">💳 Checkout</a>
              </nav>
              
              <div className="flex items-center space-x-4">
                <CartContext.Consumer>
                  {({ cart }) => (
                    <button
                      onClick={() => setCartOpen(true)}
                      className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl">🛒</span>
                      {cart.items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cart.items.reduce((total, item) => total + item.quantity, 0)}
                        </span>
                      )}
                    </button>
                  )}
                </CartContext.Consumer>
                
                <button
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <span className="text-2xl">☰</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <MobileMenu 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />

        <ShoppingCart 
          isOpen={cartOpen} 
          onClose={() => setCartOpen(false)} 
        />

        {/* Enhanced Hero Section */}
        <section id="home" className="hero-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="hero-content text-center">
              <h2 className="hero-title">🇳🇵 Premium Authentic Suits</h2>
              <p className="hero-subtitle">Handcrafted with Nepalese tradition, designed for global elegance</p>
              <div className="hero-button">
                <button 
                  className="btn-primary text-lg px-8 py-4"
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                >
                  🛍️ Shop Collection
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Culture Section */}
        <section id="culture">
          <CultureSection />
        </section>

        {/* Main Content */}
        <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductFilters 
            onFilterChange={handleFilterChange} 
            filters={filters}
            productsCount={filteredProducts.length}
          />

          {loading && (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="loading-spinner"></div>
              <p className="text-xl text-gray-600">Loading premium suits...</p>
            </div>
          )}

          {!loading && (
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onViewDetails={handleViewDetails}
                  index={index}
                />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No suits found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more products</p>
              <button 
                onClick={() => {
                  setFilters({});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-secondary"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>

        {/* Checkout Section */}
        <section id="checkout" className="py-16 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">💳 Secure Checkout</h2>
              <p className="text-xl text-gray-600">
                Complete your purchase with our secure payment options
              </p>
            </div>
            <PaymentSection />
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">🇳🇵 Authentic Suits</h3>
                <p className="text-gray-400">Premium quality suits from Nepal, crafted with traditional techniques and modern design.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#products" className="hover:text-white">Shop All</a></li>
                  <li><a href="#culture" className="hover:text-white">Our Culture</a></li>
                  <li><a href="#checkout" className="hover:text-white">Checkout</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Customer Service</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Size Guide</a></li>
                  <li><a href="#" className="hover:text-white">Returns</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white text-2xl">📘</a>
                  <a href="#" className="text-gray-400 hover:text-white text-2xl">📷</a>
                  <a href="#" className="text-gray-400 hover:text-white text-2xl">🐦</a>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Authentic Nepal Suits. Handcrafted with ❤️ in Nepal.</p>
            </div>
          </div>
        </footer>

        {selectedProduct && (
          <ProductDetailModal 
            product={selectedProduct} 
            onClose={closeModal}
          />
        )}
      </div>
    </CartProvider>
  );
};

export default App;