import api from '../utils/api';
import { useEffect, useState } from "react";

function Us() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [makingAdmin, setMakingAdmin] = useState({});

  const getUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await api.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (email) => {
    setMakingAdmin(prev => ({ ...prev, [email]: true }));
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const r = await api.post(
        '/api/users/manageAdmin',
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (r.data === "successful") {
        getUsers();
      }
    } catch (err) {
      console.error("Error making admin:", err);
    } finally {
      setMakingAdmin(prev => ({ ...prev, [email]: false }));
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-5">
      <h1 className="text-center mb-8 text-3xl font-bold text-yellow-600">
        User Management
      </h1>

      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="text-xl">Fetching user data...</p>
        </div>
      ) : (users || []).length === 0 ? (
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
          <p className="text-xl text-gray-600">No users registered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(users || []).map((user, index) => (
            <div key={user._id || index} className="bg-white p-6 rounded-lg shadow-lg border text-center">
              <div className="mb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${user.role === 'admin' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <span className={`text-2xl font-bold ${user.role === 'admin' ? 'text-green-600' : 'text-gray-600'}`}>
                    {user.role === 'admin' ? 'A' : 'U'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-lg font-semibold text-gray-900 break-all">
                  {user.email}
                </p>
                <p className="text-sm text-gray-500">
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>

              <div>
                {user.role === 'admin' ? (
                  <button 
                    disabled 
                    className="w-full px-4 py-2 bg-green-500 text-white rounded cursor-not-allowed opacity-75"
                  >
                    Already Admin
                  </button>
                ) : (
                  <button
                    onClick={() => handleClick(user.email)}
                    disabled={makingAdmin[user.email]}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    {makingAdmin[user.email] ? 'Granting...' : 'Make Admin'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Us;