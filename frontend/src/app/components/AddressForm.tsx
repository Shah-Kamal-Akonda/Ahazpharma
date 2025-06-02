// frontend/components/AddressForm.tsx
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Enter Your Address</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Division</label>
            <select
              {...register('division', { required: 'Division is required' })}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
            {errors.division && <p className="text-red-600 text-sm">{errors.division.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">District</label>
            <select
              {...register('district', { required: 'District is required' })}
              className="w-full p-2 border rounded-md"
              disabled={!division}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && <p className="text-red-600 text-sm">{errors.district.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              {...register('city', { required: 'City is required' })}
              className="w-full p-2 border rounded-md"
              disabled={!district}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && <p className="text-red-600 text-sm">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Address Line</label>
            <input
              {...register('addressLine', { required: 'Address Line is required' })}
              className="w-full p-2 border rounded-md"
            />
            {errors.addressLine && <p className="text-red-600 text-sm">{errors.addressLine.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Recipient Name</label>
            <input
              {...register('recipientName', { required: 'Recipient Name is required' })}
              className="w-full p-2 border rounded-md"
            />
            {errors.recipientName && <p className="text-red-600 text-sm">{errors.recipientName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              {...register('phoneNumber', { required: 'Phone Number is required' })}
              className="w-full p-2 border rounded-md"
            />
            {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email address',
                },
              })}
              className="w-full p-2 border rounded-md"
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;