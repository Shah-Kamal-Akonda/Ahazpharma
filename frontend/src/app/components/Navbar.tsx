'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function Navbar() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const accessToken = typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('accessToken='))
          ?.split('=')[1]
      : undefined;

    setToken(accessToken);

    if (pathname === '/' || pathname === '/components/ContactUs' || pathname === '/components/AboutUs'  || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/products')) {
      if (accessToken) {
        const fetchUser = async () => {
          try {
            const res = await axios.get(`${API_URL}/users/me`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setUserEmail(res.data.email);
          } catch (err) {
            console.error('Failed to fetch user:', err);
            document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            setToken(undefined);
          } finally {
            setIsLoading(false);
          }
        };
        fetchUser();
      } else {
        setIsLoading(false);
      }
      return;
    }

    if (pathname === '/adminPannel') {
      const hasAdminAccess = sessionStorage.getItem('adminAccess') === 'true';
      if (!hasAdminAccess) {
        console.log('Navbar: Unauthorized access to /adminPannel, redirecting to /login');
        router.push('/login');
        return;
      }
    }

    if (!accessToken) {
      setIsLoading(false);
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUserEmail(res.data.email);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router, API_URL]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      sessionStorage.removeItem('adminAccess');
    }
    setUserEmail(null);
    setToken(undefined);
    router.push('/login');
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    if (userEmail === 'shahkamalakonda@gmail.com') {
      router.push('/profileAdmin');
    } else {
      router.push('/userProfile');
    }
  };

  const handleSignUpClick = () => {
    setIsProfileDropdownOpen(false);
    router.push('/signup');
  };

  const getInitials = (email: string | null) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    return parts
      .map((part) => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <nav className="bg-white text-gray-800 p-3 shadow-md mt-2 mx-2 rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="relative w-[120px] h-[50px]">
            <Image
              src="/Ahazpharma_logo.jpg"
              alt="Ahaz Pharma Logo"
              fill
              className="object-contain"
            />
          </Link>
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs">
            U
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-white text-gray-800 p-3 shadow-lg font-poppins">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="relative w-[120px] h-[50px]">
          <Image
            src="/Ahazpharma_logo.png"
            alt="Ahaz Pharma Logo"
            fill
            className="object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <Link href="/" className="text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-300 hover:scale-105">
              Home
            </Link>
            <Link href="/products" className="text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-300 hover:scale-105">
              Products
            </Link>
            <Link href="/components/ContactUs" className="text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-300 hover:scale-105">
              Contact
            </Link>
            <Link href="/components/AboutUs" className="text-base font-medium text-gray-700 hover:text-green-600 transition-colors duration-300 hover:scale-105">
              About
            </Link>
          </div>

          <div className="relative">
            <div
              className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-base font-bold cursor-pointer hover:bg-green-300 transition-all duration-300 shadow-sm"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              {getInitials(userEmail)}
            </div>
            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl transform transition-all duration-300 z-20"
                onMouseLeave={() => setIsProfileDropdownOpen(false)}
              >
                {token ? (
                  <>
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      className="block w-full text-left px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-green-100 hover:text-green-600 rounded-t-lg transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-green-100 hover:text-green-600 rounded-b-lg transition-colors duration-200 flex items-center"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignUpClick}
                    className="block w-full text-left px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors duration-200"
                  >
                    Sign Up
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3 md:hidden">
          <div className="relative">
            <div
              className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-xs font-bold cursor-pointer hover:bg-green-300 transition-all duration-300 shadow-sm"
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              {getInitials(userEmail)}
            </div>
            {isProfileDropdownOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-7 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-xl transform transition-all duration-300 z-20"
              >
                {token ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleProfileClick();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-green-100 hover:text-green-600 rounded-t-lg transition-colors duration-200"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-green-100 hover:text-green-600 rounded-b-lg transition-colors duration-200 flex items-center"
                    >
                      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      handleSignUpClick();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors duration-200"
                  >
                    Sign Up
                  </button>
                )}
              </div>
            )}
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700 hover:text-green-600 transition-colors duration-200" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700 hover:text-green-600 transition-colors duration-200" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-lg shadow-xl p-4">
          <Link
            href="/"
            className="block px-4 py-2 text-base font-semibold text-gray-700 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="block px-4 py-2 text-base font-semibold text-gray-700 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/components/ContactUs"
            className="block px-4 py-2 text-base font-semibold text-gray-700 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            href="/components/AboutUs"
            className="block px-4 py-2 text-base font-semibold text-gray-700 hover:bg-green-100 hover:text-green-600 rounded-lg transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
        </div>
      )}
    </nav>
  );
}