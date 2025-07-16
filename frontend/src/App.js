import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mobile Menu Component
const MobileMenu = ({ isOpen, onClose }) => {
  return (
    <div className={`mobile-menu ${isOpen ? 'open' : 'closed'}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Authentic Suits</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>
        <nav className="space-y-4">
          <a href="#" className="block text-xl text-gray-700 hover:text-blue-600 py-2">Shop</a>
          <a href="#" className="block text-xl text-gray-700 hover:text-blue-600 py-2">About</a>
          <a href="#" className="block text-xl text-gray-700 hover:text-blue-600 py-2">Contact</a>
          <a href="#" className="block text-xl text-gray-700 hover:text-blue-600 py-2">Size Guide</a>
          <a href="#" className="block text-xl text-gray-700 hover:text-blue-600 py-2">Care Instructions</a>
        </nav>
      </div>
    </div>
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
        
        {/* Interactive Badges */}
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
        
        {/* Quick Action Buttons */}
        <div className={`absolute top-4 right-4 flex flex-col space-y-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
          <button className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <span className="text-lg">❤️</span>
          </button>
          <button className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
            <span className="text-lg">🔍</span>
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
          <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        </div>
        
        {/* Price Section */}
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
        
        {/* Product Details */}
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
        
        {/* Color Swatches */}
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
        
        {/* Size Indicator */}
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
        
        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <button 
            onClick={() => onViewDetails(product)}
            className="flex-1 btn-primary interactive-element"
            disabled={!product.in_stock}
          >
            View Details
          </button>
          <button 
            onClick={() => alert('Quick add to cart!')}
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
            {/* Image Section */}
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
              
              {/* Image Gallery Placeholder */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">📷</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Details Section */}
            <div className="space-y-6">
              {/* Price Section */}
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
              
              {/* Product Info */}
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
              
              {/* Color Selection */}
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
              
              {/* Size Selection */}
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
              
              {/* Quantity Selection */}
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
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  className="w-full btn-primary text-lg py-4"
                  onClick={() => alert(`Added ${quantity} ${product.name} (${selectedColor}, ${selectedSize}) to cart!`)}
                  disabled={!product.in_stock}
                >
                  {product.in_stock ? `Add to Cart - ${formatPrice(product.price * quantity)}` : 'Out of Stock'}
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
          
          {/* Tabbed Content */}
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
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Initialize sample products
  const initializeProducts = async () => {
    try {
      await axios.post(`${API}/products/initialize`);
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing products:', error);
    }
  };

  // Fetch products
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

  // Initialize products on first load
  useEffect(() => {
    const init = async () => {
      await initializeProducts();
      await fetchProducts();
    };
    init();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    if (initialized) {
      fetchProducts();
    }
  }, [filters, initialized]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value === '' ? undefined : value
    }));
  };

  // Handle product detail view
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="header-logo">✨ Authentic Suits</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="nav-link">🏠 Home</a>
              <a href="#" className="nav-link">🛍️ Shop</a>
              <a href="#" className="nav-link">ℹ️ About</a>
              <a href="#" className="nav-link">📞 Contact</a>
              <a href="#" className="nav-link">📏 Size Guide</a>
            </nav>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="text-2xl">☰</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="hero-content text-center">
            <h2 className="hero-title">Premium Authentic Suits</h2>
            <p className="hero-subtitle">Crafted with precision, designed for perfection</p>
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

      {/* Main Content */}
      <main id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Filters */}
        <ProductFilters 
          onFilterChange={handleFilterChange} 
          filters={filters}
          productsCount={filteredProducts.length}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="loading-spinner"></div>
            <p className="text-xl text-gray-600">Loading premium suits...</p>
          </div>
        )}

        {/* Products Grid */}
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

        {/* Empty State */}
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

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">✨ Authentic Suits</h3>
              <p className="text-gray-400">Premium quality suits crafted with precision and attention to detail.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Shop All</a></li>
                <li><a href="#" className="hover:text-white">Size Guide</a></li>
                <li><a href="#" className="hover:text-white">Care Instructions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Shipping</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-2xl">📘</a>
                <a href="#" className="text-gray-400 hover:text-white text-2xl">📷</a>
                <a href="#" className="text-gray-400 hover:text-white text-2xl">🐦</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Authentic Suits. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default App;