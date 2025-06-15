'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import CartSlider from '@/app/components/CartSlider';
import AddressForm from '@/app/components/AddressForm';
import OrderPopup from '@/app/components/OrderPopup';
import { Product, CartItem, Address } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const CategoryProductsPage = () => {
  const { id } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const router = useRouter();

  // Get accessToken from cookies
  const getAccessToken = () => {
    return typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('accessToken='))
          ?.split('=')[1]
      : undefined;
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;
      const response = await axios.get(`${API_URL}/orders/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched addresses:', response.data);
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching addresses:', err.message, err.response?.data);
        setAddresses([]);
      } else {
        console.error('Error fetching addresses:', err);
        setAddresses([]);
      }
    }
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage on update
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Fetch category products, name, and addresses
  useEffect(() => {
    if (id) {
      fetchCategoryProducts(Number(id));
      fetchCategoryName(Number(id));
      const token = getAccessToken();
      if (token) {
        fetchAddresses();
      }
    }
  }, [id]);

  const fetchCategoryProducts = async (categoryId: number) => {
    try {
      const response = await axios.get(`${API_URL}/products/category/${categoryId}`);
      setProducts(response.data);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching category products:', err.message, err.response?.data);
        setErrorMessage('Failed to fetch products. Please try again.');
      } else {
        console.error('Error fetching category products:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const fetchCategoryName = async (categoryId: number) => {
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}`);
      setCategoryName(response.data.name);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching category name:', err.message, err.response?.data);
        setErrorMessage('Failed to fetch category details. Please try again.');
      } else {
        console.error('Error fetching category name:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      setIsCartOpen(true);
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (productId: number, change: number) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.product.id === productId);
      if (!existingItem) return prevCart;

      const newQuantity = existingItem.quantity + change;
      if (newQuantity <= 0) {
        return prevCart.filter((item) => item.product.id !== productId);
      }
      return prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleOrderNow = () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoginPopupOpen(true);
      setTimeout(() => {
        setIsLoginPopupOpen(false);
        router.push('/login');
      }, 2000);
      return;
    }
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }
    if (!selectedAddress) {
      alert('You should fill up the address form first.');
      router.push('/userProfile');
    } else {
      setIsOrderModalOpen(true);
    }
  };

  const handleAddressSubmit = async (addressData: {
    division: string;
    district: string;
    city: string;
    addressLine: string;
    recipientName: string;
    phoneNumber: string;
    email: string;
  }) => {
    try {
      const token = getAccessToken();
      if (!token) {
        setErrorMessage('Please log in to save address.');
        router.push('/login');
        return;
      }
      const response = await axios.post(`${API_URL}/users/address`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data);
      setIsAddressModalOpen(false);
      setIsOrderModalOpen(true);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error saving address:', err.message, err.response?.data);
        setErrorMessage('Failed to save address. Please try again.');
      } else {
        console.error('Error saving address:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      setErrorMessage('No address selected.');
      return;
    }
    try {
      const token = getAccessToken();
      if (!token) {
        setErrorMessage('Please log in to place an order.');
        router.push('/login');
        return;
      }
      const items = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      }));
      const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const response = await axios.post(
        `${API_URL}/orders`,
        { items, total, addressId: selectedAddress.id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCart([]);
      setIsOrderModalOpen(false);
      localStorage.setItem('lastOrder', JSON.stringify(response.data));
      localStorage.removeItem('cart');
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push(`/orders/${response.data.id}`);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error creating order:', err.message, err.response?.data);
        setErrorMessage(err.response?.data?.message || 'Failed to create order. Please try again.');
      } else {
        console.error('Error creating order:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white p-8 transition-all duration-300 ${isCartOpen ? 'sm:pr-80' : ''} font-poppins`}>
      <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-10">{categoryName} Products</h1>

      {errorMessage && (
        <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg shadow-md">{errorMessage}</div>
      )}

      {isLoginPopupOpen && (
       <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
  <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-sm w-full">
    {/* Icon for Visual Appeal */}
    <div className="flex justify-center mb-6">
      <svg className="w-16 h-16 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.761 0-5 2.239-5 5h10c0-2.761-2.239-5-5-5z" />
      </svg>
    </div>

    {/* Message */}
    <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">Login Required</h2>
    <p className="text-gray-500 text-center text-lg leading-relaxed">Please sign in to complete your purchase.</p>
  </div>
</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const cartItem = cart.find((item) => item.product.id === product.id);
          return (
            <div
              key={product.id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {product.image ? (
                <div className="relative w-full h-48 mb-4">
                  <Image
                    src={`${API_URL}${product.image}`}
                    alt={product.name}
                    fill
                    className="object-cover rounded-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="w-full h-48 mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
              <p className="text-lg font-semibold text-blue-600 mb-2">${product.price.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mb-4">
                Quantity: {product.quantity} {product.quantityUnit}
              </p>
              <div className="flex items-center space-x-3">
                {cartItem ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(product.id, -1)}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-full hover:bg-gray-300 transition-colors duration-200"
                    >
                      -
                    </button>
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
                      {cartItem.quantity} in Cart
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-full hover:bg-gray-300 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CartSlider
        cart={cart}
        isOpen={isCartOpen}
        setIsOpen={setIsCartOpen}
        updateCartQuantity={updateCartQuantity}
        onOrderNow={handleOrderNow}
      />

      {isAddressModalOpen && (
        <AddressForm onSubmit={handleAddressSubmit} onClose={() => setIsAddressModalOpen(false)} />
      )}

      {isOrderModalOpen && selectedAddress && (
        <OrderPopup
          cart={cart}
          address={selectedAddress}
          onConfirm={handleConfirmOrder}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CategoryProductsPage;