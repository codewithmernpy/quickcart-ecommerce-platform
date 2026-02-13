import { useState, useEffect } from 'react';
import api from '../utils/api';

function SellerVerification() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const fetchPendingSellers = async () => {
    try {
      const res = await api.get('/api/seller/pending', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPendingSellers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (sellerId, status) => {
    try {
      await api.put(`/api/seller/verify/${sellerId}`, 
        { status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchPendingSellers();
      alert(`Seller ${status} successfully`);
    } catch (err) {
      alert('Failed to update seller status');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          Seller Verification
        </h1>

        {(pendingSellers || []).length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">No pending seller verifications</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(pendingSellers || []).map((seller) => (
              <div key={seller._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                      {seller.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">{seller.email}</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Business: {seller.businessName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      PAN: {seller.panCard}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Status: {seller.verificationStatus}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVerification(seller._id, 'approved')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerification(seller._id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerVerification;