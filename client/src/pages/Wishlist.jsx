import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Heart } from 'lucide-react';

function Wishlist() {
  const [wishlist, setWishlist] = useState(null);
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await api.get('/api/wishlist', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        setWishlist(res.data);
      } catch (err) {
      
      }
    };

    if (user) fetchWishlist();
  }, [user]);

const handleRemoveFromWishlist = async (productId) => {
  try {
    await api.delete(`/api/wishlist/${productId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const updated = await api.get('/api/wishlist', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setWishlist(updated.data);
  } catch (err) {
 
  }
};


  const handleAddToCart = async (productId) => {
    try {
      await api.post(
        '/api/cart',
        { productId, quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      navigate('/cart');
    } catch (err) {
   
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner animate-fade-in">
        <div className="spinner"></div>
        <span className="text-base font-medium text-gray-600 dark:text-gray-300">
          Loading...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
          My Wishlist
        </h1>
        <div className="card p-6 text-center animate-slide-in">
          <Heart className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-300" />
          <p className="mt-4 text-base text-gray-500 dark:text-gray-300">
            Please log in to view your wishlist.
          </p>
          <Link to="/login" className="btn-primary mt-4 inline-block">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (!wishlist || !wishlist.products || wishlist.products.length === 0) {
    return (
      <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
          My Wishlist
        </h1>
        <div className="card p-6 text-center animate-slide-in">
          <Heart className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-300" />
          <p className="mt-4 text-base text-gray-500 dark:text-gray-300">
            Your wishlist is empty.
          </p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
        My Wishlist
      </h1>
      <div className="card p-5 animate-slide-in">
        <div className="border-b pb-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Wishlist ({wishlist?.products?.length || 0} items)
          </h2>
        </div>
        <div className="space-y-4">
          {(wishlist?.products || []).map((product) => (
           
            <div key={product._id} className="flex items-center border-b py-3">
              <img
                src={product?.images?.[0] || 'https://via.placeholder.com/100x100'}
                alt={product.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md mr-4"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
              <div className="flex-1">
                <Link
                  to={`/product/${product._id}`}
                  className="text-base font-medium text-blue-600 dark:text-blue-400 hover-underline"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  ${product?.price ? Number(product.price).toFixed(2) : 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {product.stock === 0 ? (
                    <span className="text-red-500 dark:text-red-400">Out of stock</span>
                  ) : (
                    `In stock: ${product.stock}`
                  )}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                    className="btn-primary flex items-center gap-2 text-sm disabled:bg-gray-400 dark:disabled:bg-gray-600"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="text-red-600 dark:text-red-400 hover-underline text-sm"
                    aria-label={`Remove ${product.name} from wishlist`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;
