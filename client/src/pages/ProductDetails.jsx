import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { ShoppingCart, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';

function ProductDetails() {
  const { id } = useParams();
  const { user, loading } = useContext(AuthContext);
  const [addcart, setAddedcart] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);

        setProduct(res.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await api.post(
        '/api/cart',
        { productId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddedcart(true)
      setTimeout(() => {
        setAddedcart(false)

      }, 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add to cart. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await api.post(
        '/api/cart',
        { productId: id, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/cart', { replace: true });
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.response?.data?.message || 'Failed to add to cart. Please try again.');
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post(
        '/api/wishlist',
        { productId: id },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/wishlist');
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await api.post(
        `/api/products/${id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const res = await api.get(`/api/products/${id}`);

      setProduct(res.data);
      setComment('');
      setRating(5);
      setError('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    }
  };

  const handleNextImage = () => {
    const validImages = product?.images?.filter((img) => img && typeof img === 'string' && img.startsWith('http')) || [];
    if (validImages.length) {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }
  };

  const handlePrevImage = () => {
    const validImages = product?.images?.filter((img) => img && typeof img === 'string' && img.startsWith('http')) || [];
    if (validImages.length) {
      setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  if (loading || !product) {
    return (
      <div className="loading-spinner animate-fade-in">
        <div className="spinner"></div>
        <span className="text-base font-medium text-gray-600 dark:text-gray-300">Loading...</span>
      </div>
    );
  }

  const validImages = product?.images?.filter((img) => img && typeof img === 'string' && img.startsWith('http')) || [];
  const currentImage = validImages[currentImageIndex] || 'https://via.placeholder.com/400x300';
  const hasMultipleImages = validImages.length > 1;

  return (
    <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded-md mb-4 animate-slide-in">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 animate-slide-in">
        <div className="relative w-full md:w-1/2">
          <img
            src={currentImage}
            alt={product.name}
            className="w-full h-64 sm:h-80 object-contain rounded-md shadow-md cursor-pointer bg-white"

            onClick={openModal}
            onError={(e) => {
              console.error('Image failed to load:', currentImage);
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
            }}
          />
          {hasMultipleImages && (
            <>
              {currentImageIndex !== 0 && (
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              {currentImageIndex < product.images.length - 1 && (
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
            {product.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
          <p className="text-base sm:text-lg font-bold text-gray-800 dark:text-white mb-2">
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Rating: {product.averageRating?.toFixed(1) || '0'} / 5
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Stock: {product.stock}
            {product.stock === 0 && (
              <span className="text-red-500 dark:text-red-400"> (Out of stock)</span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => {
                const value = Math.max(1, Math.min(Number(e.target.value), product.stock));
                setQuantity(value);
              }}
              className="input-field w-16"
              aria-label="Quantity"
            />
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addcart}
              className="btn-primary flex items-center gap-2 disabled:bg-green-400 dark:disabled:bg-green-600"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
              {addcart ? "Added to cart" : "Add to cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex items-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600"
              aria-label="Buy now"
            >
              <ShoppingCart size={16} />
              Buy now
            </button>
            <button
              onClick={handleAddToWishlist}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-500 transition-all duration-200 ease-in-out hover-underline text-sm"
              aria-label="Add to wishlist"
            >
              <Heart size={16} />
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-auto max-h-[80vh] object-contain"
              onError={(e) => {
                console.error('Modal image failed to load:', currentImage);
                e.target.src = 'https://via.placeholder.com/800x600?text=No+Image';
              }}
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="mt-8 animate-slide-in">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">
          Reviews
        </h2>
        <div className="space-y-4">
          {product.reviews?.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-300">No reviews yet.</p>
          ) : (
            product.reviews?.map((review, index) => (
              <div key={review._id || index} className="card p-4">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {review.user?.name || 'Anonymous'}
                </p>
                <p className="text-yellow-500 text-sm">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {user && (
          <div className="card p-6 mt-6">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
              Add a Review
            </h3>
            <div className="space-y-4">
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="input-field w-full sm:w-1/3"
                aria-label="Rating"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Star{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                className="input-field min-h-[100px]"
                rows="4"
                aria-label="Review comment"
                required
              />
              <button onClick={handleReviewSubmit} className="btn-primary">
                Submit Review
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
