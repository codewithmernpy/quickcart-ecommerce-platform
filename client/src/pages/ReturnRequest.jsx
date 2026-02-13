import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

function ReturnRequest() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('return');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await api.get('/api/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const foundOrder = res.data.find(o => o._id === orderId);
      setOrder(foundOrder);


      if (foundOrder && foundOrder.items.length === 1) {
        setSelectedProduct(foundOrder.items[0].product._id);
      }
    } catch (err) {
      console.error('Failed to fetch order');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/returns', {
        orderId,
        productId: selectedProduct,
        reason,
        type
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Return request submitted successfully!');
      navigate('/orders');
    } catch (err) {
      console.error('Return request error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
          Return/Replacement Request
        </h1>

        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Order Details</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Order ID: #{order._id.slice(-6)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Status: {order.status}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Product {order.items.length === 1 ? '(Auto-selected)' : ''}
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {order.items.length > 1 && <option value="">Select a product</option>}
              {order.items.map((item) => (
                <option key={item.product._id} value={item.product._id}>
                  {item.product.name} (Qty: {item.quantity}) - ${item.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="return"
                  checked={type === 'return'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Return</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Get refund</div>
                </div>
              </label>
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="replacement"
                  checked={type === 'replacement'}
                  onChange={(e) => setType(e.target.value)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Replacement</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Get new item</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for {type}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder={`Please explain the reason for ${type}`}
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : `Submit ${type.charAt(0).toUpperCase() + type.slice(1)} Request`}
            </button>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReturnRequest;