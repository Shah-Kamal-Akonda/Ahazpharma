// pages/profile.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';



interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  role: string;
  addresses: Address[];
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

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    gender: '',
  });
  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState({
    division: '',
    district: '',
    city: '',
    addressLine: '',
    recipientName: '',
    phoneNumber: '',
    email: '',
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('accessToken='))
    ?.split('=')[1];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setUpdateData({
          name: res.data.name,
          email: res.data.email,
          phoneNumber: res.data.phoneNumber || '',
          password: '',
          gender: res.data.gender || '',
        });
      } catch (err) {
        setError('Failed to load profile');
        router.push('/login');
      }
    };

    const fetchDivisions = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/divisions`);
        setDivisions(res.data);
      } catch (err) {
        setError('Failed to load divisions');
      }
    };

    fetchProfile();
    fetchDivisions();
  }, [router, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      setUpdateData({
        name: res.data.name,
        email: res.data.email,
        phoneNumber: res.data.phoneNumber || '',
        password: '',
        gender: res.data.gender || '',
      });
      alert('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile');
      console.error('Update error:', err);
    }
  };

  const handleAddressInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });

    if (name === 'division') {
      fetchDistricts(value);
      setNewAddress((prev) => ({ ...prev, district: '', city: '' }));
      setCities([]);
    }
    if (name === 'district') {
      fetchCities(newAddress.division, value);
      setNewAddress((prev) => ({ ...prev, city: '' }));
    }
  };

  const fetchDistricts = async (division: string) => {
    try {
      const res = await axios.get(`${API_URL}/users/districts/${division}`);
      setDistricts(res.data);
    } catch (err) {
      setError('Failed to load districts');
    }
  };

  const fetchCities = async (division: string, district: string) => {
    try {
      const res = await axios.get(`${API_URL}/users/cities/${division}/${district}`);
      setCities(res.data);
    } catch (err) {
      setError('Failed to load cities');
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/users/address`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Address created successfully');
      window.location.reload();
    } catch (err) {
      setError('Failed to create address');
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress(address);
    fetchDistricts(address.division);
    fetchCities(address.division, address.district);
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    try {
      await axios.put(`${API_URL}/users/address/${editingAddress.id}`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Address updated successfully');
      setEditingAddress(null);
      window.location.reload();
    } catch (err) {
      setError('Failed to update address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await axios.delete(`${API_URL}/users/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Address deleted successfully');
      window.location.reload();
    } catch (err) {
      setError('Failed to delete address');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8">
      <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={updateData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={updateData.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={updateData.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={updateData.password}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Gender</label>
            <select
              name="gender"
              value={updateData.gender}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Update Profile
          </button>
        </form>
      </div>
      <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Address Book</h2>
        <form onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Division</label>
            <select
              name="division"
              value={newAddress.division}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Division</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">District</label>
            <select
              name="district"
              value={newAddress.district}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
              disabled={!newAddress.division}
            >
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              name="city"
              value={newAddress.city}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
              disabled={!newAddress.district}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Address Line</label>
            <input
              type="text"
              name="addressLine"
              value={newAddress.addressLine}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Recipient Name</label>
            <input
              type="text"
              name="recipientName"
              value={newAddress.recipientName}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={newAddress.phoneNumber}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={newAddress.email}
              onChange={handleAddressInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingAddress ? 'Update Address' : 'Add Address'}
          </button>
          {editingAddress && (
            <button
              type="button"
              onClick={() => setEditingAddress(null)}
              className="ml-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </form>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Saved Addresses</h3>
          {user.addresses.map((address) => (
            <div key={address.id} className="border p-4 mb-2 rounded">
              <p><strong>Recipient:</strong> {address.recipientName}</p>
              <p><strong>Address:</strong> {address.addressLine}, {address.city}, {address.district}, {address.division}</p>
              <p><strong>Phone:</strong> {address.phoneNumber}</p>
              <p><strong>Email:</strong> {address.email}</p>
              <div className="mt-2">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}