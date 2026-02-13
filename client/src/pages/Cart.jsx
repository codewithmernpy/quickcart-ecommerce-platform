import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

function Cart() {
  const [cart, setCart] = useState(null);
  const [primaryAddress, setPrimaryAddress] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState({
    name: '',
    phone: '',
    pincode: '',
    street: '',
    city: '',
    state: '',
    country: '',
  });

  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image';

  useEffect(() => {

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }

    const fetchCart = async () => {
      if (!user || !token) {
        setError('Please log in to view your cart.');
        setCart({ items: [] });
        return;
      }

      try {
        const res = await api.get('/api/cart', {
          headers: { Authorization: `Bearer ${token}` },

        });


        setCart(res.data && res.data.items ? res.data : { items: [] });

        setError(null);
      } catch (err) {
        setError('Failed to load cart. Please try again.');
        setCart({ items: [] });
      }
    };

    const checkPrimary = async () => {
      try {
        const res = await api.post(
          '/api/profile/checkprimaryAddress',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data && res.data.primaryAddress?.length > 0) {
          setPrimaryAddress(res.data.primaryAddress);
          setSelectedAddressIndex(0);
        }
      } catch (err) {
        console.error('Check primary address error:', err.message);
      }
    };

    fetchCart();
    checkPrimary();
  }, [user, token]);

  const handleUpdateQuantity = async (productId, quantity) => {
    try {

      if (quantity < 0) {
        setError('Quantity cannot be negative.');
        return;
      }
      const res = await api.put(
        `/api/cart/${productId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(res.data && res.data.items ? res.data : { items: [] });
      setError(null);
    } catch (err) {
      setError('Failed to update quantity. Please try again.');
    }
  };

  async function handleRemoveItem(index, productId) {
    try {
      const res = await api.delete(`/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCart(res.data && res.data.items ? res.data : { items: [] });
    } catch (err) {
      console.error('Remove item error:', err);
      setError('Failed to remove item from cart. Please try again.');
    }
  }

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = selectedAddressIndex !== null ? primaryAddress[selectedAddressIndex] : null;
    const currentAddress = selectedAddress || address;
    const isAddressValid = Object.values(currentAddress).every((val) => val.trim());

    if (!isAddressValid) {
      setError('Please fill out all address fields.');
      return;
    }

    try {
      await api.post(
        '/api/orders',
        { address: currentAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCart({ items: [] });
      setShowAddressForm(false);
      setError(null);
      navigate('/orders');
    } catch (err) {
      setError('Failed to place order. Please try again.');
    }
  };

  const addaddress = async () => {
    const isValid = Object.values(address).every((val) => val.trim());
    if (!isValid) {
      setError('Please fill all address fields before saving.');
      return;
    }

    try {
      await api.post(
        '/api/profile/updateAddress',
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedRes = await api.post(
        '/api/profile/checkprimaryAddress',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (updatedRes.data && updatedRes.data.primaryAddress) {
        setPrimaryAddress(updatedRes.data.primaryAddress);
        setSelectedAddressIndex(updatedRes.data.primaryAddress.length - 1);
      }
      setShowAddressForm(false);
      setAddress({
        name: '',
        phone: '',
        pincode: '',
        street: '',
        city: '',
        state: '',
        country: '',
      });
      setError(null);
    } catch (err) {
      setError('Failed to save address.');
    }
  };

  const total = cart?.items?.reduce((acc, item) => {
    if (!item.product || typeof item.product.price !== 'number') return acc;
    return acc + item.quantity * item.product.price;
  }, 0)

  if (cart === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Loading cart...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-gray-800 dark:text-white animate-fade-in">
        Shopping Cart
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 p-4 rounded-lg mb-6 animate-slide-in">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center animate-slide-in">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Your cart is empty
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 animate-slide-in">
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
              </h2>
            </div>

            {cart.items.map((item, index) => {
              if (!item.product) return null;
              return (
                <div
                  key={`${item.product._id}-${index}`}
                  className="flex items-center border-b border-gray-200 dark:border-gray-700 py-4 last:border-b-0"
                >
                  <img
                    src={item.product.images?.[0] || fallbackImage}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-md mr-4 bg-gray-100 dark:bg-gray-700"
                    onError={(e) => (e.target.src = fallbackImage)}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ${Number(item.product.price).toFixed(2)}

                    </p>
                    <div className="flex items-center mt-3 gap-4">
                      <select
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(item.product._id, Number(e.target.value))
                        }
                        className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {[...Array(item.product.stock).keys()].map((i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleRemoveItem(index, item.product._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-3 mb-6 text-gray-800 dark:text-white">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-gray-700 pt-3 text-gray-800 dark:text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {primaryAddress?.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                  Select Address
                </h3>
                {primaryAddress.map((addr, index) => (
                  <label
                    key={index}
                    className={`block border rounded-lg p-4 cursor-pointer transition-colors duration-200 ${selectedAddressIndex === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressIndex === index}
                      onChange={() => setSelectedAddressIndex(index)}
                      className="mr-3 accent-blue-500"
                    />
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium">{addr.name} - {addr.phone}</p>
                      <p>{addr.street}, {addr.city}, {addr.state}, {addr.country} - {addr.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm && (
              <div className="mt-6 animate-slide-in">
                <h3 className="text-base font-semibold mb-4 text-gray-800 dark:text-white">
                  Add New Address
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={address.name}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={address.phone}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={address.pincode}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="street"
                    placeholder="Street Address"
                    value={address.street}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full border

 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={address.state}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={address.country}
                    onChange={handleAddressChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button
                      onClick={addaddress}
                      className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
                    >
                      Set as Primary
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4 transition-colors duration-200"
              >
                Add New Address
              </button>
            )}

            <button
              onClick={handlePlaceOrder}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-md mt-6 hover:bg-blue-700 transition-colors duration-200"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;