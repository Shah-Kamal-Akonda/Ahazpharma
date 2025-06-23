'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  quantityUnit: 'ML' | 'GM';
  image?: string;
  description: string;
  category?: { id: number; name: string };
  categoryId?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SearchBox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setIsDropdownOpen(false);
        return;
      }

      try {
        console.log(`Searching for: ${searchTerm}`);
        const response = await axios.get(`${API_URL}/products/search/name`, {
          params: { name: searchTerm },
        });
        console.log('Search response:', response.data);
        setSearchResults(response.data);
        setIsDropdownOpen(true);
        setError(null);
      } catch (err: any) {
        console.error('Error searching products:', err.response?.data || err.message);
        setError('Failed to search products. Please try again.');
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProductClick = (productId: number) => {
    setIsDropdownOpen(false);
    setSearchTerm('');
    router.push(`/products/${productId}`);
  };

  return (
    <div className="relative w-full max-w-md mx-auto font-poppins">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-gray-800"
        />
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {isDropdownOpen && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50"
        >
          {searchResults.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="flex items-center space-x-4 p-3 hover:bg-green-50 hover:text-green-700 cursor-pointer transition-colors duration-200"
            >
              {product.image ? (
                <Image
                  src={`${API_URL}${product.image}`}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded-md object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800">{product.name}</h3>
                <p className="text-xs text-gray-600">${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;