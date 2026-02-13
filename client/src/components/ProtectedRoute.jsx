import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function ProtectedRoute({ component: Component, adminOnly }) {
  const { user} = useContext(AuthContext);

  

  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" />;

  return <Component />;
}

export default ProtectedRoute;
