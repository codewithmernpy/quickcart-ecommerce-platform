import { useEffect, useState } from "react";
import { Trash2, Package } from "lucide-react";
import api from '../utils/api';

function SellerProducts() {
  let [products, setProducts] = useState([])
  let [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/products/my-products', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).then(res => setProducts(res.data))
  }, [])

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
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Manage Products</h2>

        {products.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package size={48} />
                    </div>
                  )}

                  {product.images?.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      +{product.images.length - 1} more
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">{product.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400">${product.price.toFixed(2)}</p>

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${product.stock > 0
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>

                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center"
                      aria-label={`Delete product ${product.name}`}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
export default SellerProducts