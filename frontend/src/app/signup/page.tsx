'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface VerifyForm {
  code: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

const SignupPage = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signupForm = useForm<SignupForm>({
    defaultValues: { name: '', email: '', password: '', phoneNumber: '+88' },
  });
  const verifyForm = useForm<VerifyForm>({ defaultValues: { code: '' } });

  const onSignupSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      console.log('SignupPage: Sending signup request:', data);
      await axios.post(`${API_URL}/users/signup`, data);
      setEmail(data.email);
      setIsVerifying(true);
      setErrorMessage(null);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('SignupPage: Error:', err.response?.data || err.message);
        setErrorMessage(err.response?.data?.message || 'Failed to sign up. Please try again.');
      } else {
        console.error('SignupPage: Error:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    try {
      console.log('SignupPage: Verifying email:', email, 'code:', data.code);
      const response = await axios.post(`${API_URL}/users/verify-email`, {
        email,
        code: data.code,
      });
      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Strict`;
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('SignupPage: Verify error:', err.response?.data || err.message);
        setErrorMessage(err.response?.data?.message || 'Invalid verification code.');
      } else {
        console.error('SignupPage: Verify error:', err);
        setErrorMessage('An unexpected error occurred.');
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
    signupForm.setValue('phoneNumber', value, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-[url('/signup_img_2.png')] bg-cover bg-center bg-fixed flex items-center justify-center p-4 sm:p-6 relative">
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="relative w-full max-w-lg bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-blue-700 tracking-tight">
          {isVerifying ? 'Verify Your Email' : 'Create Your Account'}
        </h1>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 animate-pulse">
            {errorMessage}
          </div>
        )}

        {!isVerifying ? (
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                {...signupForm.register('name', { required: 'Name is required' })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Enter your full name"
              />
              {signupForm.formState.errors.name && (
                <span className="text-red-500 text-sm mt-1">
                  {signupForm.formState.errors.name.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                {...signupForm.register('email', { required: 'Email is required' })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Enter your email"
              />
              {signupForm.formState.errors.email && (
                <span className="text-red-500 text-sm mt-1">
                  {signupForm.formState.errors.email.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                {...signupForm.register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="Enter your password"
              />
              {signupForm.formState.errors.password && (
                <span className="text-red-500 text-sm mt-1">
                  {signupForm.formState.errors.password.message}
                </span>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                autoComplete="tel"
                {...signupForm.register('phoneNumber', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+88\d{11}$/,
                    message: 'Phone number must be +88 followed by 11 digits',
                  },
                })}
                onChange={handlePhoneNumberChange}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                placeholder="+8801234567890"
              />
              {signupForm.formState.errors.phoneNumber && (
                <span className="text-red-500 text-sm mt-1">
                  {signupForm.formState.errors.phoneNumber.message}
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-semibold flex items-center justify-center cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
          <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="Enter your verification code"
                autoComplete="off"
                {...verifyForm.register('code', { required: 'Verification code is required' })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-gray-50 text-gray-800 placeholder-gray-400"
                maxLength={6}
              />
              {verifyForm.formState.errors.code && (
                <span className="text-red-500 text-sm mt-1">
                  {verifyForm.formState.errors.code.message}
                </span>
              )}
              <p className="text-sm text-gray-500 mt-2">
                We’ve sent a 6-digit code to <span className="font-medium">{email}</span>. Please check your inbox or spam folder.
              </p>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 font-semibold flex items-center justify-center cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Log in
          </Link>
        </p>
      </div>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-green-50 p-8 rounded-2xl shadow-2xl max-w-sm w-full animate-[bounce_0.6s_ease-in-out] border border-green-200">
            <div className="flex justify-center mb-4">
              <svg
                className="h-12 w-12 text-green-600"
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
            <h2 className="text-2xl font-semibold text-green-700 text-center font-sans">
              Sign Up Successful!
            </h2>
            <p className="text-gray-600 text-center mt-4 font-sans text-base">
              Redirecting to login in 3 seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;