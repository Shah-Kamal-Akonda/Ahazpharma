'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  gender?: string;
  role: string;
}

export default function AdminProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  // Get token safely
  const getToken = () => {
    if (typeof window === 'undefined') return undefined;
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('accessToken='))
      ?.split('=')[1];
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        router.push('/login');
        return;
      }

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
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          console.error('Error fetching profile:', err.message, err.response?.data);
          setError(err.response?.data?.message || 'Failed to load profile');
        } else {
          console.error('Error fetching profile:', err);
          setError('An unexpected error occurred');
        }
        router.push('/login');
      }
    };

    fetchProfile();
  }, [router, API_URL]); // Added API_URL to dependencies

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUpdateData({ ...updateData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError('No authentication token found');
      router.push('/login');
      return;
    }

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
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        console.error('Error updating profile:', err.message, err.response?.data);
        setError(err.response?.data?.message || 'Failed to update profile');
      } else {
        console.error('Error updating profile:', err);
        setError('An unexpected error occurred');
      }
    }
  };

  const handleAdminPanelClick = () => {
    sessionStorage.setItem('adminAccess', 'true');
    router.push('/adminPannel');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4">Admin Profile</h2>
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
        <button
          onClick={handleAdminPanelClick}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Admin Panel
        </button>
      </div>
    </div>
  );
}