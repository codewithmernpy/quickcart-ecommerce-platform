import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Trash2, Package, X, ChevronLeft, ChevronRight } from 'lucide-react';

function SellerDashboard() {
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [],
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const res = await api.put(
        `/api/orders/${orderId}/seller`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(orders.map((order) => (order._id === orderId ? res.data : order)));
    } catch (err) {
      console.error('Update order error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const [productsRes, ordersRes] = await Promise.all([
        api.get('/api/products/my-products', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/orders/seller-orders', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setProducts(productsRes.data);
      setOrders(ordersRes.data);


      const totalProducts = productsRes.data.length;
      const totalOrders = ordersRes.data.length;
      const totalSales = ordersRes.data.reduce((sum, order) => sum + order.total, 0);

      setStats({ totalProducts, totalOrders, totalSales });
    } catch (err) {
      console.error('Fetch error:', err.response?.data || err.message);
      const errorMessage = err.response?.status === 401
        ? 'Session expired. Please login again.'
        : err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setError('');

    const maxImages = 5;
    if (files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      fileInputRef.current.value = null;
      return;
    }

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    const validFiles = files.filter((file) => {
      if (!validImageTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, WEBP allowed.`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File too large: ${file.name} (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      setError('No valid images selected');
      setNewProduct((prev) => ({ ...prev, images: [] }));
      setImagePreviews([]);
      fileInputRef.current.value = null;
      return;
    }

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    setNewProduct((prev) => ({ ...prev, images: validFiles }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...newProduct.images];
    updatedImages.splice(index, 1);

    const updatedPreviews = [...imagePreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);

    setNewProduct((prev) => ({ ...prev, images: updatedImages }));
    setImagePreviews(updatedPreviews);

    if (updatedImages.length === 0) {
      fileInputRef.current.value = null;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.stock) {
      setError('Please fill all required fields');
      setSubmitting(false);
      return;
    }

    if (newProduct.images.length === 0) {
      setError('Please select at least one image');
      setSubmitting(false);
      return;
    }

    if (parseFloat(newProduct.price) <= 0) {
      setError('Price must be greater than 0');
      setSubmitting(false);
      return;
    }

    if (parseInt(newProduct.stock) < 0) {
      setError('Stock quantity cannot be negative');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', parseFloat(newProduct.price));
      formData.append('category', newProduct.category);
      formData.append('stock', parseInt(newProduct.stock));
      newProduct.images.forEach((file) => formData.append('images', file));


      const res = await api.post('/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: [],
      });
      setImagePreviews([]);

      if (fileInputRef.current) fileInputRef.current.value = null;
      setProducts([...products, res.data]);
    } catch (err) {
      console.error('Add product error:', err.response?.data || err.message);
      let errorMessage = err.response?.data?.message || err.message || 'Failed to add product';

      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Unauthorized: Please ensure you are logged in';
      } else if (err.response?.data?.error?.includes('Cloudinary')) {
        errorMessage = 'Image upload failed: ' + err.response.data.error;
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      await api.delete(`/api/products/${productId}/seller`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProducts(products.filter((product) => product._id !== productId));
    } catch (err) {
      console.error('Delete product error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-base font-medium text-gray-600 dark:text-gray-300">
          Loading dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Seller Dashboard
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded-md mb-4">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {[
          { title: 'My Products', value: stats.totalProducts || 0, icon: '📦' },
          { title: 'My Orders', value: stats.totalOrders || 0, icon: <Package size={20} /> },
          { title: 'Total Sales', value: `$${stats.totalSales?.toFixed(2) || 0}`, icon: '💰' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center">
            <span className="text-2xl mr-4 text-blue-600 dark:text-blue-400">{stat.icon}</span>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</h3>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white min-h-[100px]"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="home">Home & Garden</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stock Quantity
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product Images (Max 5)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-100 dark:hover:file:bg-blue-800"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              JPEG, PNG, or WEBP (Max 5MB each)
            </p>

            {imagePreviews.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Selected Images ({imagePreviews.length} of 5):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewProduct({ ...newProduct, images: [] });
                      setImagePreviews([]);
                      if (fileInputRef.current) fileInputRef.current.value = null;
                    }}
                    className="text-red-600 dark:text-red-400 text-sm hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="h-24 w-24 object-cover rounded-md border border-gray-200 dark:border-gray-600 cursor-pointer"
                        onClick={() => {
                          setSelectedImage(preview);
                          setCurrentPreviewIndex(index);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out ${submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            {submitting ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={selectedImage}
                alt="Full size preview"
                className="w-full max-h-[80vh] object-contain"
              />
            </div>

            {imagePreviews.length > 1 && (
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => {
                    const newIndex = (currentPreviewIndex - 1 + imagePreviews.length) % imagePreviews.length;
                    setCurrentPreviewIndex(newIndex);
                    setSelectedImage(imagePreviews[newIndex]);
                  }}
                  className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
                >
                  <ChevronLeft size={24} />
                </button>

                <span className="text-white">
                  {currentPreviewIndex + 1} / {imagePreviews.length}
                </span>

                <button
                  onClick={() => {
                    const newIndex = (currentPreviewIndex + 1) % imagePreviews.length;
                    setCurrentPreviewIndex(newIndex);
                    setSelectedImage(imagePreviews[newIndex]);
                  }}
                  className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;