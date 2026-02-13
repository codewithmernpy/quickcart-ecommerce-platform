import { useState, useEffect } from 'react';
import { useLocation, Link, useOutletContext } from 'react-router-dom';
import { Filter } from 'lucide-react';

const SearchResults = () => {
  const { products: contextProducts = [] } = useOutletContext();

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    sort: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    category: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';

  useEffect(() => {
    setLoading(true);
    let results = [...contextProducts];


    if (query.trim()) {
      const searchTerm = query.toLowerCase().trim();
      results = results.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm)) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
      );
    }


    results = applyAllFilters(results);
    setFilteredProducts(results);
    setLoading(false);
  }, [contextProducts, query, filters]);

  const applyAllFilters = (products) => {
    let results = [...products];


    if (filters.minPrice) {
      results = results.filter(p => p.price >= parseFloat(filters.minPrice));
    }
    if (filters.maxPrice) {
      results = results.filter(p => p.price <= parseFloat(filters.maxPrice));
    }


    if (filters.rating) {
      results = results.filter(p => (p.averageRating || 0) >= parseFloat(filters.rating));
    }


    if (filters.category) {
      results = results.filter(p =>
        p.category && p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }


    if (filters.sort) {
      switch (filters.sort) {
        case 'price-asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating-desc':
          results.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
          break;
        default:
          break;
      }
    }

    return results;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      sort: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      category: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 transition-colors duration-300 ease-in-out font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {query ? `Search Results for "${query}"` : 'All Products'}
          </h2>
          <div className="flex gap-3">
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Reset Filters
              </button>
            )}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 dark:bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
            <span className="ml-4 text-lg font-medium text-gray-600 dark:text-gray-300">
              Loading products...
            </span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {isFilterOpen && (
              <div className="md:w-1/4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-5">
                  Filters
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Sort By
                    </label>
                    <select
                      name="sort"
                      value={filters.sort}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option value="">Default</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating-desc">Rating: High to Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Price Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="minPrice"
                        value={filters.minPrice}
                        onChange={handleFilterChange}
                        placeholder="Min"
                        className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        name="maxPrice"
                        value={filters.maxPrice}
                        onChange={handleFilterChange}
                        placeholder="Max"
                        className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Minimum Rating
                    </label>
                    <select
                      name="rating"
                      value={filters.rating}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option value="">Any Rating</option>
                      <option value="4">4+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="2">2+ Stars</option>
                      <option value="1">1+ Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    >
                      <option value="">All Categories</option>
                      {[...new Set(contextProducts.map(p => p.category))].filter(Boolean).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className={isFilterOpen ? 'md:w-3/4' : 'w-full'}>
              {filteredProducts.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                  <p className="text-lg font-medium text-gray-500 dark:text-gray-300">
                    {query
                      ? `No products found matching "${query}"`
                      : 'No products available'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
                    {hasActiveFilters
                      ? 'Try adjusting your filters'
                      : query
                        ? 'Try a different search term'
                        : 'Please check back later'}
                  </p>
                  {(query || hasActiveFilters) && (
                    <button
                      onClick={resetFilters}
                      className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                    >
                      {hasActiveFilters ? 'Reset All Filters' : <Link to={'/'}>Back to Home</Link>}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      to={`/product/${product._id}`}
                      key={product._id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-200 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="relative w-full h-48 overflow-hidden">
                        <img
                          src={product.images?.[0] || fallbackImage}
                          alt={product.name}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => (e.target.src = fallbackImage)}
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {product.description || 'No description available.'}
                        </p>
                        <div className="flex justify-between items-center mt-3">
                          <p className="text-lg font-bold text-gray-800 dark:text-white">
                            ${product.price.toFixed(2)}
                          </p>
                          <div className="flex items-center">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                              {product.averageRating?.toFixed(1) || '0.0'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;