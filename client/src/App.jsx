import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from './context/AuthContext';
import api from './utils/api';
import { Moon, Sun, Menu, X, Search, ShoppingCart, Heart, Package, User, LogOut, LogIn, UserPlus, Home } from 'lucide-react';
import ScrollToTop from './pages/Scrolltotop';
import Notifications from './components/Notifications';
import CurrencySelector from './components/CurrencySelector';
function App() {
  const { user, logout, loading } = useContext(AuthContext);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();





  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    setSearchInput(query);
  }, [location.search]);


  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);


  const fetchProducts = async (search = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { search };
      const res = await api.get('/api/products', {
        params,
      });
      setProducts(res.data);
    } catch (err) {
      console.error('App.jsx - Fetch error:', err.message);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === '/') {
      const query = new URLSearchParams(location.search).get('q') || '';
      fetchProducts(query);
    }
  }, [location.pathname, location.search]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      const keyword = searchRef.current.value.trim();
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }




      setSearchInput(keyword);
      navigate(`/?q=${encodeURIComponent(keyword)}`);
      setIsMenuOpen(false);

    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };



  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 font-sans">

      <ScrollToTop />
      <button
        onClick={toggleDarkMode}
        className="fixed z-50 bottom-6 right-6 p-3 rounded-full bg-white dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun size={22} className="text-yellow-300" />
        ) : (
          <Moon size={22} className="text-indigo-600" />
        )}
      </button>


      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-40 transition-colors duration-300">
        <div className="px-4">
          <div className="flex justify-between h-16 items-center">

            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center text-2xl font-bold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
                onClick={handleNavClick}
              >
                <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                  QuickCart
                </span>
              </Link>
            </div>


            <div className="hidden md:flex flex-1 max-w-xl mx-6">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search
                    className="h-5 w-5 text-gray-400 cursor-pointer"

                  />

                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className={`block w-300 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200 `}
                  ref={searchRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                />
              </div>
            </div>


            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
              >
                <Home className="h-5 w-5 mr-1" />
                Home
              </Link>

              <Link
                to="/cart"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/cart' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
              >
                <ShoppingCart className="h-5 w-5 mr-1" />
                Cart
              </Link>

              <Link
                to="/wishlist"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/wishlist' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
              >
                <Heart className="h-5 w-5 mr-1" />
                Wishlist
              </Link>

              {user && (
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/orders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                >
                  <Package className="h-5 w-5 mr-1" />
                  Orders
                </Link>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/admin' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/manageProducts"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/manageProducts' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Manage Products
                  </Link>
                  <Link
                    to="/manageOrders"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/manageOrders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Manage Orders
                  </Link>
                  <Link
                    to="/Users"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/Users' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Users
                  </Link>
                  <Link
                    to="/seller-verification"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/seller-verification' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Verify Sellers
                  </Link>
                </>
              )}

              {user?.role === 'seller' && (
                <>
                  <Link
                    to="/seller-dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/seller-dashboard' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/seller-products"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/seller-products' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    My Products
                  </Link>
                  <Link
                    to="/seller-orders"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/seller-orders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/seller-returns"
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/seller-returns' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    Returns
                  </Link>
                </>
              )}
            </div>


            <div className="hidden md:flex items-center space-x-3 ml-4">
              <CurrencySelector />
              {user && <Notifications />}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 transition-colors duration-200"
                    title="Profile"
                  >
                    <User className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={() => logout(navigate)}
                    className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <LogOut className="h-5 w-5 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${location.pathname === '/login' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    <LogIn className="h-5 w-5 mr-1" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${location.pathname === '/register' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  >
                    <UserPlus className="h-5 w-5 mr-1" />
                    Register
                  </Link>
                </>
              )}
            </div>


            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors duration-200"

              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>


        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">

            <div className="px-2 mb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className=" w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all duration-200"
                  ref={searchRef}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                />
              </div>
            </div>

            <Link
              to="/"
              className={` px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
              onClick={handleNavClick}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>

            <Link
              to="/cart"
              className={` px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/cart' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
              onClick={handleNavClick}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Cart
            </Link>

            <Link
              to="/wishlist"
              className={` px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/wishlist' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
              onClick={handleNavClick}
            >
              <Heart className="h-5 w-5 mr-2" />
              Wishlist
            </Link>

            {user && (
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/orders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                onClick={handleNavClick}
              >
                <Package className="h-5 w-5 mr-2" />
                Orders
              </Link>
            )}

            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${location.pathname === '/admin' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  onClick={handleNavClick}
                >
                  Admin Dashboard
                </Link>
                <Link
                  to="/manageProducts"
                  onClick={handleNavClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/manageProducts' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                >
                  Manage Products
                </Link>
                <Link
                  to="/manageOrders"
                  onClick={handleNavClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/manageOrders' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                >
                  Manage Orders
                </Link>
                <Link
                  to="/Users"
                  onClick={handleNavClick}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${location.pathname === '/Users' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                >
                  Users
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/profile' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  onClick={handleNavClick}
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout(navigate);
                    handleNavClick();
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center transition-colors duration-200"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={` px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/login' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  onClick={handleNavClick}
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className={` px-3 py-2 rounded-md text-base font-medium flex items-center ${location.pathname === '/register' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'} transition-colors duration-200`}
                  onClick={handleNavClick}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="flex items-center text-red-800 dark:text-red-200">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-indigo-500 dark:bg-indigo-400 rounded-full animate-ping"></div>
              </div>
            </div>
            <span className="mt-4 text-lg font-medium text-gray-700 dark:text-gray-300">
              Loading products...
            </span>
          </div>
        )}

        <Outlet context={{ products }} />
      </main>

      {
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">QuickCart</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your one-stop shop for all your needs. Fast delivery, great prices, and excellent customer service.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shop</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                      All Products
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                      Your Cart
                    </Link>
                  </li>
                  <li>
                    <Link to="/wishlist" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                      Wishlist
                    </Link>
                  </li>
                  {user && (
                    <li>
                      <Link to="/orders" className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200">
                        Your Orders
                      </Link>
                    </li>
                  )}
                </ul>
              </div>


            </div>

          </div>
        </footer>}
    </div>
  );
}

export default App;