'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SearchBox: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch suggestions with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setError(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(`${API_URL}/products/search/name?name=${encodeURIComponent(searchTerm)}`);
        setSuggestions(response.data.slice(0, 5)); // Limit to 5 suggestions
        setError(null);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          console.error('Error fetching suggestions:', err.message, err.response?.data);
          setError('Failed to fetch suggestions.');
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  // Handle click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setTimeout(() => setIsFocused(false), 200);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError('Please enter a product name.');
      return;
    }
    setIsFocused(false);
    router.push(`/products/search?query=${encodeURIComponent(searchTerm)}`);
  };

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.name);
    setSuggestions([]);
    setIsFocused(false);
    router.push(`/products/search?query=${encodeURIComponent(product.name)}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md mx-auto mb-6 font-poppins">
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search products by name..."
          className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
        >
          Search
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((product) => (
            <li
              key={product.id}
              onClick={() => handleSuggestionClick(product)}
              className="px-4 py-2 text-gray-700 hover:bg-blue-100 cursor-pointer flex items-center"
            >
              {product.image ? (
                <img
                  src={`${API_URL}${product.image}`}
                  alt={product.name}
                  className="w-8 h-8 object-cover rounded mr-2"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded mr-2 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Img</span>
                </div>
              )}
              <span>{product.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;