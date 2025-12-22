import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Search, Filter, X } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';
import Loader from '../components/common/Loader';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery(
    ['products', filters],
    async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    }
  );

  const categories = [
    'cement', 'bricks', 'steel', 'wood', 'tiles', 'sand', 'gravel', 'paint', 'electrical', 'plumbing'
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Construction Materials</h1>
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline flex items-center justify-center space-x-2"
          >
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <X className="h-4 w-4" />
              <span>Clear All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                className="input-field"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="10000"
                className="input-field"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-end">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <Loader />
      ) : data?.data?.length > 0 ? (
        <>
          <div className="mb-4 text-gray-600">
            Showing {data.data.length} of {data.total} products
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.data.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
        </div>
      )}
    </div>
  );
}

export default Products;