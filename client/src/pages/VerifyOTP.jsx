import { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/verify-otp', {
        email: state.email,
        otp,
      });
      login(res.data.user, res.data.token,navigate);
    } catch (err) {
      setError('OTP verification failed');
    }
  };

  return (
    <div className="container min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ease-in-out py-6 flex items-center justify-center">
      <div className="card p-6 w-full max-w-md animate-slide-in">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 dark:text-white animate-fade-in">
          Verify OTP
        </h1>
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-500 p-3 rounded-md mb-4 animate-slide-in">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            className="input-field"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary w-full">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOTP;
