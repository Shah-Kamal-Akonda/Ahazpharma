'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { useToast } from '../components/ToastNotification';

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
  const { showToast } = useToast();
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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Get token safely
  const getToken = () => {
    if (typeof window === 'undefined') return undefined;
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];
  };

  // Fetch user profile
  const fetchProfile = async () => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      showToast('No authentication token found', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
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
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching profile:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to load profile');
        showToast(err.response?.data?.message || 'Failed to load profile', 'error');
      } else {
        console.error('Error fetching profile:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get(`${API_URL}/users/divisions`);
        setDivisions(res.data);
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          console.error('Error fetching divisions:', err.message, err.response?.data);
          setError(err.response?.data?.message || 'Failed to load divisions');
          showToast(err.response?.data?.message || 'Failed to load divisions', 'error');
        } else {
          console.error('Error fetching divisions:', err);
          setError('An unexpected error occurred');
          showToast('An unexpected error occurred', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchDivisions();
  }, [router, API_URL]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      showToast('No authentication token found', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/users/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfile(); // Refetch profile to ensure state is up-to-date
      showToast('Profile updated successfully', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error updating profile:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to update profile');
        showToast(err.response?.data?.message || 'Failed to update profile', 'error');
      } else {
        console.error('Error updating profile:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/users/districts/${division}`);
      setDistricts(res.data);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching districts:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to load districts');
        showToast(err.response?.data?.message || 'Failed to load districts', 'error');
      } else {
        console.error('Error fetching districts:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async (division: string, district: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_URL}/users/cities/${division}/${district}`);
      setCities(res.data);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error fetching cities:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to load cities');
        showToast(err.response?.data?.message || 'Failed to load cities', 'error');
      } else {
        console.error('Error fetching cities:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      showToast('No authentication token found', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/users/address`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfile(); // Refetch profile to update addresses
      setNewAddress({
        division: '',
        district: '',
        city: '',
        addressLine: '',
        recipientName: '',
        phoneNumber: '',
        email: '',
      });
      showToast('Address created successfully', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error creating address:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to create address');
        showToast(err.response?.data?.message || 'Failed to create address', 'error');
      } else {
        console.error('Error creating address:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
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
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      showToast('No authentication token found', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      await axios.put(`${API_URL}/users/address/${editingAddress.id}`, newAddress, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfile(); // Refetch profile to update addresses
      setEditingAddress(null);
      setNewAddress({
        division: '',
        district: '',
        city: '',
        addressLine: '',
        recipientName: '',
        phoneNumber: '',
        email: '',
      });
      showToast('Address updated successfully', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error updating address:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to update address');
        showToast(err.response?.data?.message || 'Failed to update address', 'error');
      } else {
        console.error('Error updating address:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      showToast('No authentication token found', 'error');
      router.push('/login');
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${API_URL}/users/address/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProfile(); // Refetch profile to update addresses
      showToast('Address deleted successfully', 'success');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error deleting address:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to delete address');
        showToast(err.response?.data?.message || 'Failed to delete address', 'error');
      } else {
        console.error('Error deleting address:', err);
        setError('An unexpected error occurred');
        showToast('An unexpected error occurred', 'error');
      }
    } finally {
      setIsLoading(false);
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
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
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
                Updating...
              </span>
            ) : (
              'Update Profile'
            )}
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
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            disabled={isLoading}
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
                {editingAddress ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              editingAddress ? 'Update Address' : 'Create Address'
            )}
          </button>
          {editingAddress && (
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setNewAddress({
                  division: '',
                  district: '',
                  city: '',
                  addressLine: '',
                  recipientName: '',
                  phoneNumber: '',
                  email: '',
                });
              }}
              className="ms-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          )}
        </form>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Saved Addresses</h3>
          {user.addresses.length === 0 ? (
            <p className="text-gray-600">No addresses saved.</p>
          ) : (
            user.addresses.map((address) => (
              <div key={address.id} className="border p-4 mb-2 rounded">
                <p><strong>Recipient:</strong> {address.recipientName || 'N/A'}</p>
                <p><strong>Address:</strong> {address.addressLine || 'N/A'}, {address.city || 'N/A'}, {address.district || 'N/A'}, {address.division || 'N/A'}</p>
                <p><strong>Phone:</strong> {address.phoneNumber || 'N/A'}</p>
                <p><strong>Email:</strong> {address.email || 'N/A'}</p>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:bg-yellow-300 disabled:cursor-not-allowed"
                    disabled={isLoading}
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
                        Editing...
                      </span>
                    ) : (
                      'Edit'
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                    disabled={isLoading}
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
                        Deleting...
                      </span>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}