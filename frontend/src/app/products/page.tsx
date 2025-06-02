'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CartSlider from '../components/CartSlider';
import AddressForm from '../components/AddressForm';
import OrderPopup from '../components/OrderPopup';
// const router =useRouter();

interface Category {
  id: number;
  name: string;
  image?: string;
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: Category;
  categoryId?: number;
  quantity: number;
  quantityUnit: 'ML' | 'GM';
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Address {
  id: string;
  division: string;
  district: string;
  city: string;
  addressLine: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const ProductsPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uncategorizedProducts, setUncategorizedProducts] = useState<Product[]>([]);
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
    fetchCategories();
    fetchUncategorizedProducts();
    const token = getAccessToken();
    if (token) {
      fetchAddresses(token);
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrorMessage('Failed to fetch categories. Please try again.');
    }
  };

  const fetchUncategorizedProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      const products = response.data.filter((product: Product) => !product.categoryId);
      setUncategorizedProducts(products);
    } catch (error) {
      console.error('Error fetching uncategorized products:', error);
      setErrorMessage('Failed to fetch uncategorized products. Please try again.');
    }
  };

  const fetchAddresses = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/orders/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(response.data);
      if (response.data.length > 0) {
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
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
    if (addresses.length === 0) {
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
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Please log in to save an address.');
      router.push('/login');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/users/address`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data);
      setIsAddressModalOpen(false);
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error('Error saving address:', error);
      setErrorMessage('Failed to save address. Please try again.');
    }
  };

  const handleConfirmOrder = async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Please log in to confirm your order.');
      router.push('/login');
      return;
    }
    if (!selectedAddress) return;
    try {
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
      <h1 className="text-3xl font-bold text-center mb-8">Products</h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">{errorMessage}</div>
      )}

      {isLoginPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg text-center">For purchase, you should login first</p>
          </div>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/products/category/${category.id}`} className="block">
              <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {category.image && (
                  <Image
                    src={`${API_URL}${category.image}`}
                    alt={category.name}
                    width={200}
                    height={200}
                    className="mt-2 rounded-md object-cover"
                  />
                )}
                <p className="text-gray-600 mt-2">{category.products.length} products</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {uncategorizedProducts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">AhazPharma Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uncategorizedProducts.map((product) => {
              const cartItem = cart.find((item) => item.product.id === product.id);
              return (
                <div key={product.id} className="bg-white p-2 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="text-gray-600">{product.description}</p>
                  <p className="text-gray-600">Price: ${product.price}</p>
                  <p className="text-gray-600">
                    Quantity: {product.quantity} {product.quantityUnit}
                  </p>
                  {product.image && (
                    <Image
                      src={`${API_URL}${product.image}`}
                      alt={product.name}
                      width={200}
                      height={150}
                      className="mt-2 rounded-md object-cover"
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
                        <span className="bg-blue-500 text-white px-1 py-1 rounded-md">
                          {cartItem.quantity} in Cart
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
        </div>
      )}

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

export default ProductsPage;