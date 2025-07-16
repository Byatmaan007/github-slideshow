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

// Product Detail Modal
const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                  {product.original_price && (
                    <span className="text-xl text-gray-500 line-through">{formatPrice(product.original_price)}</span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{product.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Suit Type</h4>
                  <p className="text-gray-600 capitalize">{product.suit_type}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Fabric</h4>
                  <p className="text-gray-600">{product.fabric_description}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Available Colors</h4>
                <div className="flex flex-wrap space-x-2">
                  {product.colors.map((color, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() === 'charcoal' ? '#36454F' : color.toLowerCase() === 'navy' ? '#000080' : color.toLowerCase() }}
                      />
                      <span className="text-sm text-gray-600">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Available Sizes</h4>
                <div className="flex flex-wrap space-x-2">
                  {product.sizes.map((size, index) => (
                    <span key={index} className="border border-gray-300 px-3 py-1 rounded text-sm">
                      {size}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Care Instructions</h4>
                <p className="text-gray-600 text-sm">{product.care_instructions}</p>
              </div>
              
              <div className="pt-4">
                <button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg"
                  onClick={() => alert('Shopping cart coming soon!')}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [initialized, setInitialized] = useState(false);

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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Authentic Suits</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Shop</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Premium Authentic Suits</h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">Crafted with precision, designed for perfection</p>
            <button className="bg-white text-blue-900 px-8 py-3 rounded-md font-semibold text-lg hover:bg-gray-100 transition-colors">
              Shop Collection
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <ProductFilters onFilterChange={handleFilterChange} filters={filters} />

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-xl text-gray-600">Loading products...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
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