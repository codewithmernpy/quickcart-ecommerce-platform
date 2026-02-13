import { Link, useOutletContext, useLocation } from 'react-router-dom';
import { convertPrice, formatPrice } from '../components/CurrencySelector';

function Home() {
  const { products = [] } = useOutletContext();
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');

  
  if (searchQuery) return null;

  const displayedProducts = Array.isArray(products) ? products.slice(0, 999) : [];
  const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <div className="container mx-auto min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 ease-in-out py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-gray-800 dark:text-white animate-fade-in tracking-tight">
        Featured Products
      </h1>

      {displayedProducts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slide-in">
          {displayedProducts.map((product) => (
            <div
              key={product._id}
              className="card relative bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-5 flex flex-col group"
            >
              <div className="w-full h-[300px] overflow-hidden rounded-md">
                <Link
                  to={`/product/${product._id}`}
                  className="group mt-4 inline-block text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  <div className="w-full aspect-square overflow-hidden rounded-lg bg-white">
                    <img
                      src={product.images?.[0] || fallbackImage}
                      alt={product.name}
                      className="w-full h-[300px] object-contain transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => (e.target.src = fallbackImage)}
                    />
                  </div>
                </Link>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white truncate">
                <b>{product.name}</b>
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-300 flex-1 mt-2 line-clamp-3">
                {product.description}
              </p>

              <p className="text-lg font-bold mt-3 text-gray-800 dark:text-white">
                {formatPrice(product.price, localStorage.getItem('currency') || 'USD')}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Rating: {product.averageRating?.toFixed(1) || 'N/A'} / 5
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 animate-slide-in">
          <p className="text-lg text-gray-500 dark:text-gray-300 font-medium">
            No products found.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-2">
            Check back later for new arrivals!
          </p>
        </div>
      )}
    </div>
  );
}

export default Home;