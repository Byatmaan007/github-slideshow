import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Filter Component
const ProductFilters = ({ onFilterChange, filters }) => {
  const suitTypes = [
    { value: '', label: 'All Suits' },
    { value: 'business', label: 'Business' },
    { value: 'formal', label: 'Formal' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'casual', label: 'Casual' },
    { value: 'tuxedo', label: 'Tuxedo' }
  ];

  const fabrics = [
    { value: '', label: 'All Fabrics' },
    { value: 'wool', label: 'Wool' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'silk', label: 'Silk' },
    { value: 'linen', label: 'Linen' },
    { value: 'blend', label: 'Blend' }
  ];

  return (
    <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Suit Type</label>
          <select 
            value={filters.suit_type || ''}
            onChange={(e) => onFilterChange('suit_type', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {suitTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fabric</label>
          <select 
            value={filters.fabric || ''}
            onChange={(e) => onFilterChange('fabric', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fabrics.map(fabric => (
              <option key={fabric.value} value={fabric.value}>{fabric.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          <select 
            value={filters.in_stock !== undefined ? filters.in_stock.toString() : ''}
            onChange={(e) => onFilterChange('in_stock', e.target.value === '' ? undefined : e.target.value === 'true')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Products</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onViewDetails }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.featured && (
          <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Featured
          </div>
        )}
        {product.original_price && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            Sale
          </div>
        )}
        {!product.in_stock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white text-xl font-bold">Out of Stock</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(product.original_price)}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {product.fabric_description}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 capitalize bg-gray-100 px-2 py-1 rounded">
            {product.suit_type}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {product.colors.slice(0, 3).map((color, index) => (
              <div 
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: color.toLowerCase() === 'charcoal' ? '#36454F' : color.toLowerCase() === 'navy' ? '#000080' : color.toLowerCase() }}
                title={color}
              />
            ))}
            {product.colors.length > 3 && (
              <span className="text-xs text-gray-500 ml-2">+{product.colors.length - 3}</span>
            )}
          </div>
          <button 
            onClick={() => onViewDetails(product)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold"
          >
            View Details
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