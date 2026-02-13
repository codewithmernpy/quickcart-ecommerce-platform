import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { convertPrice, formatPrice } from '../components/CurrencySelector';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, loading: authLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const res = await api.get('/api/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const sortedOrders = Array.isArray(res.data) ? res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ) : [];

        setOrders(sortedOrders);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load orders. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
    else {
      setError('Please log in to view your orders');
      setLoading(false);
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
          Order History
        </h1>
        <div className="loading-spinner animate-slide-in">
          <div className="spinner"></div>
          <span className="text-base font-medium text-gray-600 dark:text-gray-300">
            Loading your order history...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
          Order History
        </h1>
        <div className="card p-4 animate-slide-in">
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            <Link to="/login" className="btn-primary mt-4 inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
        Order History
      </h1>
      {orders.length === 0 ? (
        <div className="card p-6 text-center animate-slide-in">
          <Package className="w-10 h-10 mx-auto text-gray-400 dark:text-gray-300" />
          <p className="mt-4 text-base text-gray-500 dark:text-gray-300">
            You haven't placed any orders yet.
          </p>
          <Link to="/" className="btn-primary mt-4 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4 animate-slide-in">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    Order ID: {order._id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Placed on: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'delivered'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : order.status === 'rejected'
                        ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        : order.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            : order.status === 'processing'
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100'
                              : order.status === 'return approved'
                                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                : order.status === 'replacement approved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                  : order.status === 'return rejected'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                    : order.status === 'replacement rejected'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                                      : order.status === 'pending return'
                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                                        : order.status === 'pending replacement'
                                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-100'
                                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                    }`}
                >
                  Status: {order.status === 'pending return' ? 'Pending Return' :
                    order.status === 'pending replacement' ? 'Pending Replacement' :
                      order.status === 'return approved' ? 'Return Approved' :
                        order.status === 'replacement approved' ? 'Replacement Approved' :
                          order.status === 'return rejected' ? 'Return Rejected' :
                            order.status === 'replacement rejected' ? 'Replacement Rejected' :
                              order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {order.status === 'rejected' && order.rejectionNotes && (
                <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-3 mb-4">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Rejection Reason:</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{order.rejectionNotes}</p>
                </div>
              )}

              <div className="border-t pt-4 pb-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                  Delivery Address
                </h3>
                {order.address ? (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.address.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.address.street}, {order.address.city}, {order.address.state}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {order.address.country} - {order.address.pincode}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Phone: {order.address.phone}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                    No address provided
                  </p>
                )}
              </div>

              <div className="border-t pt-4 pb-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">
                  Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.product?._id || 'unknown'}-${idx}`}
                      className="flex items-center gap-3"
                    >
                      <Link to={`/product/${item.product?._id}`}>
                        <img
                          src={item.product?.images[0] || 'https://via.placeholder.com/100x100'}
                          alt={item.product?.name || 'Product Image'}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}

                        />
                      </Link>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">
                          {item.product?.name || 'Unnamed Product'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Price: {formatPrice(item.price || item.product?.price || 0, localStorage.getItem('currency') || 'USD')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                          {formatPrice((item.price || item.product?.price || 0) * item.quantity, localStorage.getItem('currency') || 'USD')}
                        </p>
                        {order.status === 'delivered' && (
                          <Link
                            to={`/return/${order._id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                          >
                            Return/Replace
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap justify-between items-center border-t pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Payment: {order.paymentMethod || 'N/A'}
                </p>
                <p className="text-base font-bold text-gray-800 dark:text-white">
                  Total: {formatPrice(order.total || 0, localStorage.getItem('currency') || 'USD')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;
