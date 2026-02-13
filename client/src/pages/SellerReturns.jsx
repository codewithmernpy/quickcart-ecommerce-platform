import { useState, useEffect } from 'react';
import api from '../utils/api';

function SellerReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReturns();
  }, []);

  const fetchReturns = async () => {
    try {
      const res = await api.get('/api/returns/seller', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReturns(res.data);
    } catch (err) {
      console.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId, status) => {
    try {
      await api.put(`/api/returns/${returnId}/seller`,
        { status, adminNotes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setSelectedReturn(null);
      setAdminNotes('');
      fetchReturns();
      alert(`Return request ${status} successfully`);
    } catch (err) {
      alert('Failed to update return status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Return Requests</h2>
        <button
          onClick={fetchReturns}
          className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {returns.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">No return requests found</p>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {['Request ID', 'Customer', 'Product', 'Type', 'Reason', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {returns.map((returnReq) => (
                <tr key={returnReq._id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    #{returnReq._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {returnReq.user?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {returnReq.product?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {returnReq.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {returnReq.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(returnReq.status)}`}>
                      {returnReq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(returnReq.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {returnReq.status === 'pending' && (
                      <button
                        onClick={() => setSelectedReturn(returnReq)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Review {selectedReturn.type} Request
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Customer:</strong> {selectedReturn.user?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Product:</strong> {selectedReturn.product?.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <strong>Reason:</strong> {selectedReturn.reason}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Response Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                rows="3"
                placeholder="Add any notes for the customer..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => handleStatusUpdate(selectedReturn._id, 'approved')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedReturn._id, 'rejected')}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setSelectedReturn(null);
                  setAdminNotes('');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerReturns;