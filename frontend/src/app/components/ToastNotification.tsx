'use client'

import React, { createContext, useContext } from 'react';
import { toast, ToastContainer, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define types for toast messages
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
}

// Create context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Default toast options
const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = (message: string, type: ToastType = 'success', options: ToastOptions = {}) => {
    const toastOptions = { ...defaultOptions, ...options };
    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      case 'warning':
        toast.warn(message, toastOptions);
        break;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <ToastContainer />
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};