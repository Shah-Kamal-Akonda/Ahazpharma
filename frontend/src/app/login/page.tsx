'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import Link from 'next/link';

interface LoginForm {
  email: string;
  password: string;
}

interface ForgotPasswordForm {
  email: string;
}

interface VerifyForm {
  code: string;
}

interface ResetPasswordForm {
  newPassword: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();
  const {
    register: registerForgot,
    handleSubmit: handleSubmitForgot,
    formState: { errors: forgotErrors },
  } = useForm<ForgotPasswordForm>();
  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors },
  } = useForm<VerifyForm>({ defaultValues: { code: '' } });
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordForm>();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'forgot' | 'verify' | 'reset'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
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
      if (typeof window !== 'undefined') {
        document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Strict`;
      }
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setErrorMessage(err.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setErrorMessage('An unexpected error occurred.');
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
      setStep('verify');
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

  const onVerifySubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    try {
      setErrorMessage(null);
      await axios.post(`${API_URL}/users/verify-reset-code`, {
        email: forgotEmail,
        code: data.code,
      });
      setResetCode(data.code);
      setStep('reset');
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
      // await axios.post(`${API_URL}/users/reset-password`, {
      //   code: resetCode,
      //   newPassword: data.newPassword,
      // });
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        setStep('login');
        setForgotEmail('');
        setResetCode('');
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('LoginPage: Reset password error:', err.response?.data || err.message);
        setErrorMessage(err.response?.data?.message || 'Failed to reset password. Please try again.');
      } else {
        console.error('LoginPage: Reset password error:', err);
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/signup_bg_img.jpg')] bg-cover bg-center bg-fixed flex items-center justify-center p-2 sm:p-4 relative">
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="relative w-full max-w-xs sm:max-w-md bg-white/95 rounded-xl shadow-xl p-3 sm:p-6">
        {errorMessage && (
          <div className="mb-3 p-2 bg-red-100 text-red-700 rounded-md border border-red-300 animate-pulse text-sm">
            {errorMessage}
          </div>
        )}

        {step === 'login' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-green-700 tracking-tight">
              Welcome Back
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">Email Address</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="text-red-600 text-xs mt-1">{errors.email.message}</span>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <span className="text-red-600 text-xs mt-1">{errors.password.message}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center">
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
                    Logging In...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>
            <p className="mt-3 text-center text-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setStep('forgot')}
                className="text-green-600 hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </p>
            <p className="mt-2 text-center text-gray-700 text-xs">
              Don’t have an account?{' '}
              <Link href="/signup" className="text-green-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </>
        )}

        {step === 'forgot' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-green-700 tracking-tight">
              Forgot Password
            </h2>
            <p className="text-gray-700 text-center mb-3 text-xs">
              Enter your email to receive a 6-digit verification code.
            </p>
            <form onSubmit={handleSubmitForgot(onForgotSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">Email Address</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...registerForgot('email', { required: 'Email is required' })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Enter your email"
                />
                {forgotErrors.email && (
                  <span className="text-red-600 text-xs mt-1">{forgotErrors.email.message}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center">
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
                    Sending Code...
                  </span>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
            <p className="mt-3 text-center text-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-green-600 hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
          </>
        )}

        {step === 'verify' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-green-700 tracking-tight">
              Enter Verification Code
            </h2>
            <p className="text-gray-700 text-center mb-3 text-xs">
              We’ve sent a 6-digit code to <span className="font-medium">{forgotEmail}</span>. Please check your inbox or spam folder.
            </p>
            <form onSubmit={handleSubmitCode(onVerifySubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  placeholder="Enter your 6-digit code"
                  autoComplete="off"
                  {...registerCode('code', {
                    required: 'Verification code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Code must be a 6-digit number',
                    },
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-sm"
                  maxLength={6}
                />
                {codeErrors.code && (
                  <span className="text-red-600 text-xs mt-1">{codeErrors.code.message}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center">
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
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
            <p className="mt-3 text-center text-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setStep('forgot')}
                className="text-green-600 hover:underline font-medium"
              >
                Resend Code
              </button>
            </p>
            <p className="mt-2 text-center text-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-green-600 hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
          </>
        )}

        {step === 'reset' && (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-green-700 tracking-tight">
              Reset Password
            </h2>
            <p className="text-gray-700 text-center mb-3 text-xs">Enter your new password.</p>
            <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-800 mb-1">New Password</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  {...registerReset('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 text-sm"
                  placeholder="Enter your new password"
                />
                {resetErrors.newPassword && (
                  <span className="text-red-600 text-xs mt-1">{resetErrors.newPassword.message}</span>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-all duration-200 transform hover:scale-105 font-medium flex items-center justify-center cursor-pointer disabled:bg-green-400 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <span className="flex items-center">
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
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
            <p className="mt-3 text-center text-gray-700 text-xs">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-green-600 hover:underline font-medium"
              >
                Back to Login
              </button>
            </p>
          </>
        )}

        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-xs w-full animate-[bounce_0.6s_ease-in-out] border border-green-300">
              <div className="flex justify-center mb-3">
                <svg
                  className="h-8 w-8 text-green-600"
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
              <h2 className="text-lg font-semibold text-green-700 text-center">
                Password Reset Successful!
              </h2>
              <p className="text-gray-700 text-center mt-2 text-sm">
                Redirecting to login in 3 seconds...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  ); 
}