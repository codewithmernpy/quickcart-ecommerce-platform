import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from '../utils/api';
import { useNavigate } from "react-router-dom";

function Profile() {
  const [primaryAddress, setPrimaryAddress] = useState([]);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const fetchPrimary = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setPrimaryAddress([]);
        return;
      }
      const res = await api.post('/api/profile/checkprimaryAddress', {},
        { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.primaryAddress?.length > 0) {
        setPrimaryAddress(res.data.primaryAddress);
      } else {
        setPrimaryAddress([]);
      }
    } catch (err) {
      console.error("Error fetching primary address:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
    if (user) {
      fetchPrimary();
    }
  }, [user, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-5">
      <h1 className="text-center mb-8 text-3xl font-bold">
        Your Profile
      </h1>

      <div className="bg-white p-8 rounded-lg shadow-lg mb-5">
        <h2 className="mb-5 text-2xl font-semibold border-b-2 border-lime-500 pb-2">
          Personal Information
        </h2>

        <div className="mb-5">
          <label className="block mb-1 font-bold">Full Name:</label>
          <input
            type="text"
            value={user?.name || ''}
            readOnly
            className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div className="mb-5">
          <label className="block mb-1 font-bold">Email:</label>
          <input
            type="email"
            value={user?.email || ''}
            readOnly
            className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
          />
        </div>
      </div>

      {primaryAddress.length > 0 && (
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="mb-5 text-2xl font-semibold border-b-2 border-lime-500 pb-2">
            Delivery Address
          </h2>
          {primaryAddress.map((addr, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
              <p><strong>Name:</strong> {addr.name}</p>
              <p><strong>Phone:</strong> {addr.phone}</p>
              <p><strong>Address:</strong> {addr.street}, {addr.city}, {addr.state} - {addr.pincode}, {addr.country}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;