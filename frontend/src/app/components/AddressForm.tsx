'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

interface AddressFormData {
  division: string;
  district: string;
  city: string;
  addressLine: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
}

interface AddressFormProps {
  onSubmit: (data: AddressFormData) => void;
  onClose: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, onClose }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AddressFormData>();
  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const division = watch('division');
  const district = watch('district');

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/divisions`);
        setDivisions(res.data);
      } catch (err) {
        console.error('Failed to load divisions', err);
      }
    };
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (division) {
      const fetchDistricts = async () => {
        try {
          const res = await axios.get(`${API_URL}/users/districts/${division}`);
          setDistricts(res.data);
          setValue('district', '');
          setValue('city', '');
          setCities([]);
        } catch (err) {
          console.error('Failed to load districts', err);
        }
      };
      fetchDistricts();
    }
  }, [division, setValue]);

  useEffect(() => {
    if (division && district) {
      const fetchCities = async () => {
        try {
          const res = await axios.get(`${API_URL}/users/cities/${division}/${district}`);
          setCities(res.data);
          setValue('city', '');
        } catch (err) {
          console.error('Failed to load cities', err);
        }
      };
      fetchCities();
    }
  }, [division, district, setValue]);

  return (
    <div className="relative bg-white rounded-lg w-full max-w-[85vw] sm:max-w-md max-h-[75vh] sm:max-h-[80vh] overflow-y-auto p-3 sm:p-6">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 z-10"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-center text-green-700">Enter Your Address</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Division</label>
          <select
            {...register('division', { required: 'Division is required' })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          >
            <option value="">Select Division</option>
            {divisions.map((division) => (
              <option key={division} value={division}>
                {division}
              </option>
            ))}
          </select>
          {errors.division && <p className="text-red-600 text-xs mt-1">{errors.division.message}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">District</label>
          <select
            {...register('district', { required: 'District is required' })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
            disabled={!division}
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.district && <p className="text-red-600 text-xs mt-1">{errors.district.message}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">City</label>
          <select
            {...register('city', { required: 'City is required' })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
            disabled={!district}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Address Line</label>
          <input
            {...register('addressLine', { required: 'Address Line is required' })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          />
          {errors.addressLine && <p className="text-red-600 text-xs mt-1">{errors.addressLine.message}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Recipient Name</label>
          <input
            {...register('recipientName', { required: 'Recipient Name is required' })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          />
          {errors.recipientName && <p className="text-red-600 text-xs mt-1">{errors.recipientName.message}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Phone Number</label>
          <input
            {...register('phoneNumber', { required: 'Phone Number is required' })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          />
          {errors.phoneNumber && <p className="text-red-600 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-800 mb-1">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            })}
            className="w-full p-1 sm:p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div className="flex justify-end space-x-2 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm hover:bg-blue-600"
          >
            Save Address
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;