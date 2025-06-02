'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
    } catch (error: any) {
      console.error('Error fetching category products:', error.message, error.response?.data);
      setErrorMessage('Failed to fetch products. Please try again.');
    }
  };

  const fetchCategoryName = async (categoryId: number) => {
    try {
      const response = await axios.get(`${API_URL}/categories/${categoryId}`);
      setCategoryName(response.data.name);
    } catch (error: any) {
      console.error('Error fetching category name:', error.message, error.response?.data);
      setErrorMessage('Failed to fetch category details. Please try again.');
    }
  };

  const fetchAddresses = async () => {
    try {
      const token = getAccessToken();
      if (!token) return;
      const response = await axios.get(`${API_URL}/orders/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched addresses:', response.data); // Debug log
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching addresses:', error.message, error.response?.data);
      setAddresses([]);
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
    console.log('handleOrderNow: token=', token); // Debug log
    if (!token) {
      console.log('Showing login popup for non-authenticated user'); // Debug log
      setIsLoginPopupOpen(true);
      setTimeout(() => {
        setIsLoginPopupOpen(false);
        console.log('Redirecting to /login'); // Debug log
        router.push('/login');
      }, 2000);
      return;
    }
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }
    if (!selectedAddress) {
    //   setIsAddressModalOpen(true);
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
      console.log('Saved address:', response.data); // Debug log
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data);
      setIsAddressModalOpen(false);
      setIsOrderModalOpen(true);
    } catch (error: any) {
      console.error('Error saving address:', error.message, error.response?.data);
      setErrorMessage('Failed to save address. Please try again.');
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
      console.log('Order created:', { id: response.data.id, response: response.data }); // Debug log
      setCart([]);
      setIsOrderModalOpen(false);
      localStorage.setItem('lastOrder', JSON.stringify(response.data));
      localStorage.removeItem('cart');
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for backend sync
      router.push(`/orders/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating order:', error.message, error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Failed to create order. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 p-6 transition-all duration-300 ${isCartOpen ? 'sm:pr-80' : ''}`}>
      <h1 className="text-3xl font-bold text-center mb-8">{categoryName} Products</h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>
      )}

      {isLoginPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-center">For purchase product you should login first</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => {
          const cartItem = cart.find((item) => item.product.id === product.id);
          return (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-gray-600">Price: ${product.price.toFixed(2)}</p>
              <p className="text-gray-600">
                Quantity: ${product.quantity} ${product.quantityUnit}
              </p>
              {product.image && (
                <Image
                  src={`${API_URL}${product.image}`}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="mt-2 rounded-md"
                />
              )}
              <div className="mt-4 flex items-center space-x-2">
                {cartItem ? (
                  <>
                    <button
                      onClick={() => updateCartQuantity(product.id, -1)}
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-md">
                      ${cartItem.quantity} in Cart
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
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