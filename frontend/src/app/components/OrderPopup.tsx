'use client';

import React, { useState } from 'react';
import { CartItem, Address } from '../types';

interface OrderPopupProps {
  cart: CartItem[];
  address: Address;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const OrderPopup: React.FC<OrderPopupProps> = ({ cart, address, onConfirm, onClose }) => {
  // START MODIFIED
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // END MODIFIED

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // START MODIFIED
const handleConfirm = async () => {
  try {
    setIsProcessing(true);
    await onConfirm();
    setIsSuccess(true);
  } catch (err: unknown) { // Use 'unknown' instead of 'any' or 'Error'
    // Narrow the type to Error
    const error = err as Error; // Type assertion
    setErrorMessage(error.message || 'Something went wrong');
  } finally {
    setIsProcessing(false);
  }
};
  // END MODIFIED

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Confirm Your Order</h2>
        <div className="mb-4">
          <h3 className="font-bold">Shipping Address:</h3>
          <p>{address.recipientName}</p>
          <p>{address.addressLine} </p>
            <p> {address.city}</p> 
           <p>{address.district}</p> 
            <p> {address.division}</p>
          <p>📞 {address.phoneNumber}</p>
          <p>📧 {address.email}</p>
        </div>

        <div className="mb-4">
          <h3 className="font-bold">Order Items:</h3>
          <ul className="list-disc ml-5">
            {cart.map(item => (
              <li key={item.product.id}>
                {item.product.name} x{item.quantity} - ${item.product.price * item.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4 font-bold">
          Total: ${total.toFixed(2)}
        </div>

        {/* START MODIFIED */}
        {errorMessage && <p className="text-red-600 mb-2">{errorMessage}</p>}
        {isSuccess ? (
          <div className="text-green-600 font-semibold mb-4">✅ Order placed successfully!</div>
        ) : (
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={isProcessing}
            >
              {isProcessing ? 'Placing...' : 'Confirm Order'}
            </button>
          </div>
        )}
        {/* END MODIFIED */}
      </div>
    </div>
  );
};

export default OrderPopup;
