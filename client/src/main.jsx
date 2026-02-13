import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  useLocation
} from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './App';
import Home from './pages/Home';
import SearchResults from './components/SearchResults';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import OrderHistory from './pages/OrderHistory';
import AdminDashboard from './pages/AdminDashboard';
import Manageorders from './pages/Manageorders';
import ManageProducts from './pages/Manageproducts';
import Profile from './pages/Profile';
import Us from './pages/User';
import ReturnRequest from './pages/ReturnRequest';
import SellerVerification from './pages/SellerVerification';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import SellerReturns from './pages/SellerReturns';
import AddProduct from './pages/AddProduct';

import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import './index.css';

function Root() {
  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q');
  return searchQuery ? <SearchResults /> : <Home />;
}


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Root />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'verify-otp',
        element: <VerifyOTP />
      },
      {
        path: 'product/:id',
        element: <ProductDetails />
      },
      {
        path: 'cart',
        element: <ProtectedRoute component={Cart} />
      },
      {
        path: 'wishlist',
        element: <ProtectedRoute component={Wishlist} />
      },
      {
        path: 'orders',
        element: <ProtectedRoute component={OrderHistory} />
      },
      {
        path: 'admin',
        element: <ProtectedRoute component={AdminDashboard} adminOnly />
      },
      {
        path: 'manageOrders',
        element: <ProtectedRoute component={Manageorders} adminOnly />
      },
      {
        path: 'manageProducts',
        element: <ProtectedRoute component={ManageProducts} adminOnly />
      },
      {
        path: 'profile',
        element: <ProtectedRoute component={Profile} />
      },
      {
        path: 'Users',
        element: <ProtectedRoute component={Us} adminOnly />
      },
      {
        path: 'seller-verification',
        element: <ProtectedRoute component={SellerVerification} adminOnly />
      },
      {
        path: 'seller-dashboard',
        element: <ProtectedRoute component={SellerDashboard} />
      },
      {
        path: 'seller-products',
        element: <ProtectedRoute component={SellerProducts} />
      },
      {
        path: 'seller-orders',
        element: <ProtectedRoute component={SellerOrders} />
      },
      {
        path: 'seller-returns',
        element: <ProtectedRoute component={SellerReturns} />
      },
      {
        path: 'add-product',
        element: <ProtectedRoute component={AddProduct} />
      },
      {
        path: 'return/:orderId',
        element: <ProtectedRoute component={ReturnRequest} />
      }
    ]
  }
]);



ReactDOM.createRoot(document.getElementById('root')).render(


  <AuthProvider>

    <RouterProvider router={router} ></RouterProvider>
  </AuthProvider>

);
