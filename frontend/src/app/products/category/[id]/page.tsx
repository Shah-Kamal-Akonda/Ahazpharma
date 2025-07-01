'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import CartSlider from '@/app/components/CartSlider';
import AddressForm from '@/app/components/AddressForm';
import OrderPopup from '@/app/components/OrderPopup';
import { useToast } from '@/app/components/ToastNotification';
import { Product, CartItem, Address } from '@/app/types';

interface LoginForm {
  email: string;
  password: string;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface VerifyForm {
  code: string;
}

interface ForgotPasswordForm {
  email: string;
}

interface ResetPasswordForm {
  newPassword: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const [isSignupPopupOpen, setIsSignupPopupOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [loginStep, setLoginStep] = useState<'login' | 'forgot' | 'verify' | 'reset'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
  } = useForm<LoginForm>();
  const {
    register: registerSignup,
    handleSubmit: handleSubmitSignup,
    formState: { errors: signupErrors },
    setValue: setSignupValue,
  } = useForm<SignupForm>({ defaultValues: { name: '', email: '', password: '', phoneNumber: '+88' } });
  const {
    register: registerVerify,
    handleSubmit: handleSubmitVerify,
    formState: { errors: verifyErrors },
  } = useForm<VerifyForm>({ defaultValues: { code: '' } });
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordForm>();
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>();

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
      const fetchedAddresses = response.data;
      setAddresses(fetchedAddresses);
      return fetchedAddresses; // Return fetched addresses for use in handleAddressSubmit
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching addresses:', err.message, err.response?.data);
        setAddresses([]);
      } else {
        console.error('Error fetching addresses:', err);
        setAddresses([]);
      }
      return [];
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
        fetchAddresses().then((fetchedAddresses) => {
          if (fetchedAddresses.length > 0 && !selectedAddress) {
            setSelectedAddress(fetchedAddresses[0]);
          }
        });
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

  const onLoginSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      const response = await axios.post<{ accessToken: string }>(`${API_URL}/users/login`, {
        email: data.email,
        password: data.password,
      });
      const { accessToken } = response.data;
      if (!accessToken) {
        throw new Error('No access token received');
      }
      localStorage.setItem('accessToken', accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Strict`;
      setIsLoginPopupOpen(false);
      setLoginStep('login');
      await fetchAddresses();
      setIsAddressModalOpen(true);
      showToast('Login successful!', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || 'Login failed. Please try again.';
        setErrorMessage(message);
        showToast(message, 'error');
      } else {
        setErrorMessage('An unexpected error occurred.');
        showToast('An unexpected error occurred.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      await axios.post(`${API_URL}/users/send-reset-code`, { email: data.email });
      setForgotEmail(data.email);
      setLoginStep('verify');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setErrorMessage(err.response?.data?.message || 'Failed to send verification code. Please try again.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyResetSubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      await axios.post(`${API_URL}/users/verify-reset-code`, {
        email: forgotEmail,
        code: data.code,
      });
      setResetCode(data.code);
      setLoginStep('reset');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setErrorMessage(err.response?.data?.message || 'Invalid or expired verification code.');
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      await axios.post(`${API_URL}/users/reset-password`, {
        code: resetCode,
        newPassword: data.newPassword,
      });
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        setLoginStep('login');
        setForgotEmail('');
        setResetCode('');
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Reset password error:', err.response?.data || err.message);
        setErrorMessage(err.response?.data?.message || 'Failed to reset password. Please try again.');
      } else {
        console.error('Reset password error:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/users/signup`, data);
      setSignupEmail(data.email);
      setIsVerifying(true);
      setErrorMessage(null);
      showToast('Signup successful! Please verify your email.', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || 'Failed to sign up. Please try again.';
        setErrorMessage(message);
        showToast(message, 'error');
      } else {
        setErrorMessage('An unexpected error occurred.');
        showToast('An unexpected error occurred.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/users/verify-email`, {
        email: signupEmail,
        code: data.code,
      });
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Strict`;
      setIsSignupPopupOpen(false);
      setIsVerifying(false);
      setIsLoginPopupOpen(true);
      showToast('Email verified successfully!', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.message || 'Invalid verification code.';
        setErrorMessage(message);
        showToast(message, 'error');
      } else {
        setErrorMessage('An unexpected error occurred.');
        showToast('An unexpected error occurred.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('+88')) {
      value = '+88' + value.replace(/^\+88/, '');
    }
    setSignupValue('phoneNumber', value, { shouldValidate: true });
  };

  const handleOrderNow = () => {
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }
    const token = getAccessToken();
    if (!token) {
      setIsSignupPopupOpen(true);
      return;
    }
    if (addresses.length === 0 || !selectedAddress) {
      setIsAddressModalOpen(true);
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
      setIsLoading(true);
      setErrorMessage(null);
      const token = getAccessToken();
      if (!token) {
        setErrorMessage('Please log in to save address.');
        setIsAddressModalOpen(false);
        setIsLoginPopupOpen(true);
        return;
      }
      const response = await axios.post(`${API_URL}/users/address`, addressData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newAddress = response.data;
      // Fetch updated addresses and ensure the new address is included
      const updatedAddresses = await fetchAddresses();
      // Find the newly saved address in the updated list (match by unique fields)
      const savedAddress = updatedAddresses.find(
        (addr: Address) =>
          addr.division === addressData.division &&
          addr.district === addressData.district &&
          addr.city === addressData.city &&
          addr.addressLine === addressData.addressLine &&
          addr.recipientName === addressData.recipientName &&
          addr.phoneNumber === addressData.phoneNumber &&
          addr.email === addressData.email
      ) || newAddress;
      setSelectedAddress(savedAddress); // Set the newly saved address as selected
      setIsAddressModalOpen(false);
      setIsOrderModalOpen(true);
      showToast('Address saved successfully!', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error saving address:', err.message, err.response?.data);
        setErrorMessage('Failed to save address. Please try again.');
        showToast('Failed to save address. Please try again.', 'error');
      } else {
        console.error('Error saving address:', err);
        setErrorMessage('An unexpected error occurred.');
        showToast('An unexpected error occurred.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!selectedAddress) {
      setErrorMessage('No address selected.');
      return;
    }
    try {
      setIsLoading(true); // Add this line for show loading sign
      const token = getAccessToken();
      if (!token) {
        setErrorMessage('Please log in to place an order.');
        setIsOrderModalOpen(false);
        setIsLoginPopupOpen(true);
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
    finally {
    setIsLoading(false); // for loading sign false
  }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 sm:p-8 transition-all duration-300 ${isCartOpen ? 'sm:pr-80' : ''} font-poppins`}>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-8 sm:mb-10">{categoryName} Products</h1>

      {errorMessage && !isLoginPopupOpen && !isSignupPopupOpen && !isAddressModalOpen && !isOrderModalOpen && (
        <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg shadow-md text-sm sm:text-base">{errorMessage}</div>
      )}

      {isLoginPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white/95 rounded-xl shadow-xl p-3 sm:p-6 w-full max-w-[90vw] sm:max-w-sm max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsLoginPopupOpen(false);
                setLoginStep('login');
                setErrorMessage(null);
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-10"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {loginStep === 'login' && (
              <>
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-700">Welcome Back</h2>
                {errorMessage && (
                  <div className="mb-2 sm:mb-3 p-2 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                )}
                <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Email Address</label>
                    <input
                      type="email"
                      autoComplete="email"
                      {...registerLogin('email', { required: 'Email is required' })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                      placeholder="Enter your email"
                    />
                    {loginErrors.email && (
                      <span className="text-red-600 text-xs mt-1">{loginErrors.email.message}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Password</label>
                    <input
                      type="password"
                      autoComplete="current-password"
                      {...registerLogin('password', { required: 'Password is required' })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                      placeholder="Enter your password"
                    />
                    {loginErrors.password && (
                      <span className="text-red-600 text-xs mt-1">{loginErrors.password.message}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging In...
                      </span>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>
                <p className="mt-2 sm:mt-3 text-center text-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginStep('forgot')}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </p>
                <p className="mt-1 sm:mt-2 text-center text-gray-700 text-xs">
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginPopupOpen(false);
                      setIsSignupPopupOpen(true);
                    }}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {loginStep === 'forgot' && (
              <>
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-700">Forgot Password</h2>
                {errorMessage && (
                  <div className="mb-2 sm:mb-3 p-2 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                )}
                <p className="text-gray-700 text-center mb-2 sm:mb-3 text-xs">
                  Enter your email to receive a 6-digit verification code.
                </p>
                <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Email Address</label>
                    <input
                      type="email"
                      autoComplete="email"
                      {...registerForgot('email', { required: 'Email is required' })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                      placeholder="Enter your email"
                    />
                    {forgotErrors.email && (
                      <span className="text-red-600 text-xs mt-1">{forgotErrors.email.message}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending Code...
                      </span>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                </form>
                <p className="mt-2 sm:mt-3 text-center text-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginStep('login')}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Back to Login
                  </button>
                </p>
              </>
            )}
            {loginStep === 'verify' && (
              <>
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-700">Enter Verification Code</h2>
                {errorMessage && (
                  <div className="mb-2 sm:mb-3 p-2 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                )}
                <p className="text-gray-700 text-center mb-2 sm:mb-3 text-xs">
                  We’ve sent a 6-digit code to <span className="font-medium">{forgotEmail}</span>. Please check your inbox or spam folder.
                </p>
                <form onSubmit={handleSubmitVerify(onVerifyResetSubmit)} className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">6-Digit Verification Code</label>
                    <input
                      type="text"
                      placeholder="Enter your 6-digit code"
                      autoComplete="off"
                      {...registerVerify('code', {
                        required: 'Verification code is required',
                        pattern: {
                          value: /^\d{6}$/,
                          message: 'Code must be a 6-digit number',
                        },
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                      maxLength={6}
                    />
                    {verifyErrors.code && (
                      <span className="text-red-600 text-xs mt-1">{verifyErrors.code.message}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                </form>
                <p className="mt-2 sm:mt-3 text-center text-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginStep('forgot')}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Resend Code
                  </button>
                </p>
                <p className="mt-1 sm:mt-2 text-center text-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginStep('login')}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Back to Login
                  </button>
                </p>
              </>
            )}
            {loginStep === 'reset' && (
              <>
                <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-700">Reset Password</h2>
                {errorMessage && (
                  <div className="mb-2 sm:mb-3 p-2 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse text-xs sm:text-sm">
                    {errorMessage}
                  </div>
                )}
                <p className="text-gray-700 text-center mb-2 sm:mb-3 text-xs">Enter your new password.</p>
                <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">New Password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      {...registerReset('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                      placeholder="Enter your new password"
                    />
                    {resetErrors.newPassword && (
                      <span className="text-red-600 text-xs mt-1">{resetErrors.newPassword.message}</span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
                <p className="mt-2 sm:mt-3 text-center text-gray-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setLoginStep('login')}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Back to Login
                  </button>
                </p>
              </>
            )}
            {showSuccessPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-white p-3 sm:p-6 rounded-xl shadow-xl w-full max-w-[90vw] sm:max-w-xs animate-[bounce_0.6s_ease-in-out] border border-green-300">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    <svg
                      className="h-5 w-5 sm:h-8 sm:w-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="text-base sm:text-lg font-semibold text-green-700 text-center">
                    Password Reset Successful!
                  </h2>
                  <p className="text-gray-700 text-center mt-1 sm:mt-2 text-xs sm:text-sm">
                    Redirecting to login in 3 seconds...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isSignupPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white/95 rounded-xl shadow-xl p-3 sm:p-6 w-full max-w-[90vw] sm:max-w-sm max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsSignupPopupOpen(false);
                setIsVerifying(false);
                setErrorMessage(null);
              }}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-10"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h1 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-green-700">
              {isVerifying ? 'Verify Your Email' : 'Create Your Account'}
            </h1>
            {errorMessage && (
              <div className="mb-2 sm:mb-3 p-2 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse text-xs sm:text-sm">
                {errorMessage}
              </div>
            )}
            {!isVerifying ? (
              <form onSubmit={handleSubmitSignup(onSignupSubmit)} className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    autoComplete="name"
                    {...registerSignup('name', { required: 'Name is required' })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                    placeholder="Enter your full name"
                  />
                  {signupErrors.name && (
                    <span className="text-red-600 text-xs mt-1">{signupErrors.name.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Email Address</label>
                  <input
                    type="email"
                    autoComplete="email"
                    {...registerSignup('email', { required: 'Email is required' })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                    placeholder="Enter your email"
                  />
                  {signupErrors.email && (
                    <span className="text-red-600 text-xs mt-1">{signupErrors.email.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    {...registerSignup('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                    placeholder="Enter your password"
                  />
                  {signupErrors.password && (
                    <span className="text-red-600 text-xs mt-1">{signupErrors.password.message}</span>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    autoComplete="tel"
                    {...registerSignup('phoneNumber', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\+88\d{11}$/,
                        message: 'Phone number must be +88 followed by 11 digits',
                      },
                    })}
                    onChange={handlePhoneNumberChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                    placeholder="+8801234567890"
                  />
                  {signupErrors.phoneNumber && (
                    <span className="text-red-600 text-xs mt-1">{signupErrors.phoneNumber.message}</span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending Code...
                    </span>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitVerify(onVerifySubmit)} className="space-y-2 sm:space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter your verification code"
                    autoComplete="off"
                    {...registerVerify('code', { required: 'Verification code is required' })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-xs sm:text-sm"
                    maxLength={6}
                  />
                  {verifyErrors.code && (
                    <span className="text-red-600 text-xs mt-1">{verifyErrors.code.message}</span>
                  )}
                  <p className="text-xs text-gray-600 mt-1 sm:mt-2">
                    We’ve sent a 6-digit code to <span className="font-medium">{signupEmail}</span>. Please check your inbox or spam folder.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin h-3 w-3 sm:h-4 sm:w-4 mr-2 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Email'
                  )}
                </button>
              </form>
            )}
            <p className="mt-2 sm:mt-3 text-center text-gray-700 text-xs">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignupPopupOpen(false);
                  setIsVerifying(false);
                  setIsLoginPopupOpen(true);
                  setLoginStep('login');
                }}
                className="text-green-600 hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      )}

      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white/95 rounded-xl shadow-xl p-3 sm:p-6 w-full max-w-[90vw] sm:max-w-sm max-h-[80vh] overflow-y-auto">
            <AddressForm
              onSubmit={handleAddressSubmit}
              onClose={() => setIsAddressModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isOrderModalOpen && selectedAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white/95 rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-[90vw] sm:max-w-md max-h-[70vh] overflow-y-auto">
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-10"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-center text-gray-800 mb-3 sm:mb-4">Order Summary</h2>
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Items</h3>
              <ul className="divide-y divide-gray-200 text-sm sm:text-base">
                {cart.map((item) => (
                  <li key={item.product.id} className="py-2">
                    <p>
                      {item.product.name} (x{item.quantity}) - ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-base sm:text-lg font-semibold text-gray-800 mt-2">
                Total: ${cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
              <div className="text-sm sm:text-base space-y-1">
                <p>{selectedAddress.recipientName}</p>
                <p>{selectedAddress.addressLine}</p>
                <p>{selectedAddress.city}, {selectedAddress.district}, {selectedAddress.division}</p>
                <p>Phone: {selectedAddress.phoneNumber}</p>
                <p>Email: {selectedAddress.email}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
              <button
                onClick={handleConfirmOrder}
                className="w-full bg-green-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-green-700 transition-all duration-200 font-medium text-sm sm:text-base disabled:bg-green-400 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-4 w-4 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Confirming...
                  </span>
                ) : (
                  'Confirm Order'
                )}
              </button>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="w-full bg-gray-300 text-gray-800 px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-400 transition-all duration-200 font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        {products.map((product) => {
          const cartItem = cart.find((item) => item.product.id === product.id);
          return (
            <div
              key={product.id}
              className="bg-white p-3 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-poppins min-h-[240px] max-h-[240px] sm:min-h-0 sm:max-h-none flex flex-col"
            >
              {product.image ? (
                <div className="relative w-full h-28 sm:h-48 mb-2 sm:mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={`${API_URL}${product.image}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="w-full h-28 sm:h-48 mb-2 sm:mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 text-[10px] sm:text-base">No Image</span>
                </div>
              )}
              <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-none">{product.name}</h3>
              <p className="text-gray-600 text-[10px] sm:text-sm mb-1 sm:mb-3 line-clamp-2">{product.description}</p>
              <p className="text-sm sm:text-lg font-semibold text-blue-600 mb-1">${product.price.toFixed(2)}</p>
              <p className="text-gray-500 text-[10px] sm:text-sm mb-1 sm:mb-4">
                Quantity: {product.quantity} {product.quantityUnit}
              </p>
              <div className="flex items-center space-x-2 sm:space-x-3 mt-auto">
                {cartItem ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(product.id, -1)}
                      className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-base"
                    >
                      -
                    </button>
                    <span className="bg-blue-100 text-blue-700 px-3 sm:px-4 py-1 sm:py-2 rounded-full font-semibold text-xs sm:text-sm">
                      {cartItem.quantity} in Cart
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, 1)}
                      className="bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full hover:bg-gray-300 transition-colors duration-200 text-xs sm:text-base"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold text-xs sm:text-base"
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
    </div>
  );
};

export default CategoryProductsPage;