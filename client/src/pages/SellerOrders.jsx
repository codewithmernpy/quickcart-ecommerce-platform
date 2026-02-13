import { useEffect, useState } from "react";
import api from '../utils/api';

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [rejectionModal, setRejectionModal] = useState({ show: false, orderId: null });
  const [rejectionNotes, setRejectionNotes] = useState('');


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/orders/seller-orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setOrders(res.data);
      setError('');
    } catch (err) {

      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    if (status === 'rejected') {
      setRejectionModal({ show: true, orderId });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const res = await api.put(
        `/api/orders/${orderId}/seller`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(orders.map((order) => (order._id === orderId ? res.data : order)));
      fetchOrders()

    } catch (err) {

      setError('Failed to update order status');
    }
  };

  const handleRejectOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const res = await api.put(
        `/api/orders/${rejectionModal.orderId}/seller`,
        { status: 'rejected', rejectionNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(orders.map((order) => (order._id === rejectionModal.orderId ? res.data : order)));
      setRejectionModal({ show: false, orderId: null });
      setRejectionNotes('');
      fetchOrders();

    } catch (err) {
      setError('Failed to reject order');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-200 text-red-900';
      case 'pending return':
        return 'bg-orange-100 text-orange-800';
      case 'pending replacement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Manage Orders</h2>
        <button
          onClick={fetchOrders}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500 dark:text-gray-300">Loading...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">No orders found</p>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {['Order ID', 'Customer', 'Product', 'Total', 'Status'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{order._id.slice(-8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.user?.email || 'Guest'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.items[0]?.product?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">${order.total?.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.status === 'rejected' && order.rejectionNotes && (
                        <span className="text-xs text-red-600 italic" title={order.rejectionNotes}>
                          (Notes: {order.rejectionNotes.substring(0, 20)}...)
                        </span>
                      )}
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                        className="ml-2 text-sm bg-transparent dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-gray-800 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                        {(order.status === 'pending return' || order.status === 'pending replacement') && (
                          <>
                            <option value="return approved">Approve Return</option>
                            <option value="replacement approved">Approve Replacement</option>
                            <option value="return rejected">Reject Return</option>
                            <option value="replacement rejected">Reject Replacement</option>
                          </>
                        )}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {rejectionModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Reject Order</h3>
            <textarea
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              rows="4"
              required
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setRejectionModal({ show: false, orderId: null });
                  setRejectionNotes('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrder}
                disabled={!rejectionNotes.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerOrders;