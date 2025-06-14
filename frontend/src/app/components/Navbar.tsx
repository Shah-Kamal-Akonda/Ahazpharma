'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const router = useRouter();
  const pathname = usePathname();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  useEffect(() => {
    const accessToken = typeof window !== 'undefined'
      ? document.cookie
          .split('; ')
          .find((row) => row.startsWith('accessToken='))
          ?.split('=')[1]
      : undefined;

    setToken(accessToken);

    if (pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname.startsWith('/products')) {
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
      <nav className="bg-white text-gray-800 p-4 shadow-md mt-4 mx-4 rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/products" className="text-2xl font-bold text-blue-600">
            Ahaz Pharma
          </Link>
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
            U
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white text-black p-4 shadow-md mt-4 rounded-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Ahaz Pharma
        </Link>

        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            HOME
          </Link>
          <div className="relative group">
            <button className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
              PRODUCTS
            </button>
            <div className="absolute left-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-10">
              <Link
                href="/products/powder"
                className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsProductsDropdownOpen(false)}
              >
                POWDER PRODUCT
              </Link>
              <Link
                href="/products/liquid"
                className="block px-4 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsProductsDropdownOpen(false)}
              >
                LIQUID PRODUCT
              </Link>
            </div>
          </div>
          <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            CONTACT
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium">
            ABOUT
          </Link>
        </div>

        <div className="relative group">
          <div
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold cursor-pointer hover:bg-blue-200 transition-colors duration-200"
            onMouseEnter={() => setIsProfileDropdownOpen(true)}
          >
            {getInitials(userEmail)}
          </div>
          {isProfileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transform group-hover:translate-y-0 translate-y-2 transition-all duration-200 z-10"
              onMouseEnter={() => setIsProfileDropdownOpen(true)}
              onMouseLeave={() => setIsProfileDropdownOpen(false)}
            >
              {token ? (
                <>
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 inline mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignUpClick}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md"
                >
                  Sign Up
                </button>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="focus:outline-none">
            {isMobileMenuOpen ? (
              <XMarkIcon className="h-8 w-8 text-gray-600" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-md shadow-lg p-4">
          <Link
            href="/"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            HOME
          </Link>
          <div className="relative">
            <button
              onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
              className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              PRODUCTS
            </button>
            {isProductsDropdownOpen && (
              <div className="pl-4">
                <Link
                  href="/products/powder"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setIsProductsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  POWDER PRODUCT
                </Link>
                <Link
                  href="/products/liquid"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    setIsProductsDropdownOpen(false);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  LIQUID PRODUCT
                </Link>
              </div>
            )}
          </div>
          <Link
            href="/contact"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            CONTACT
          </Link>
          <Link
            href="/about"
            className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ABOUT
          </Link>
        </div>
      )}
    </nav>
  );
}