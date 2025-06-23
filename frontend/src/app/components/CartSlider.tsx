'use client';

import React from 'react';
import Image from 'next/image';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  quantityUnit: 'ML' | 'GM';
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartSliderProps {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updateCartQuantity: (productId: number, change: number) => void;
  onOrderNow: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CartSlider: React.FC<CartSliderProps> = ({
  cart,
  isOpen,
  setIsOpen,
  updateCartQuantity,
  onOrderNow,
}) => {
  const [isMobileCartModalOpen, setIsMobileCartModalOpen] = React.useState(false);
  const totalPrice = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      {/* Toggle Button for Larger Screens */}
      <button
        className="sm:block hidden fixed top-30 right-6 w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-xl  items-center justify-center hover:scale-110 hover:animate-pulse transition-all duration-200 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingBagIcon className="w-6 h-6 opacity-90" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Desktop Slider */}
      <div
        className={`hidden sm:block fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-green-700">Your Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-800 text-lg font-bold"
            >
              ✕
            </button>
          </div>
          {cart.length === 0 ? (
            <p className="text-gray-600">Your cart is empty.</p>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-4 border-b pb-2">
                  {item.product.image && (
                    <Image
                      src={`${API_URL}${item.product.image}`}
                      alt={item.product.name}
                      width={50}
                      height={50}
                      className="rounded-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-800">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm">
                      ${item.product.price} x {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {item.product.quantity} {item.product.quantityUnit}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300 transition-colors duration-200 text-base font-semibold"
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300 transition-colors duration-200 text-base font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 border-t pt-4">
                <p className="text-lg font-semibold text-green-700">Total: ${totalPrice.toFixed(2)}</p>
              </div>
            </div>
          )}
          {cart.length > 0 && (
            <button
              onClick={onOrderNow}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-all duration-200 w-full font-semibold"
            >
              Order Now
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Panel */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-between items-center z-50">
        <div>
          <p className="text-sm font-semibold">Cart: {totalItems} items</p>
          <p className="text-sm">Total: ${totalPrice.toFixed(2)}</p>
        </div>
        <button
          onClick={() => setIsMobileCartModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          View Cart
        </button>
      </div>

      {/* Mobile Cart Modal */}
      {isMobileCartModalOpen && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-700">Your Cart</h2>
              <button
                onClick={() => setIsMobileCartModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-gray-600">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center space-x-4 border-b pb-2">
                    {item.product.image && (
                      <Image
                        src={`${API_URL}${item.product.image}`}
                        alt={item.product.name}
                        width={50}
                        height={50}
                        className="rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold">{item.product.name}</h3>
                      <p className="text-gray-600 text-sm">
                        ${item.product.price} x {item.quantity} = ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {item.product.quantity} {item.product.quantityUnit}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                        className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                        className="bg-gray-300 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-400"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 border-t pt-4">
                  <p className="text-lg font-semibold text-green-700">Total: ${totalPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileCartModalOpen(false);
                    onOrderNow();
                  }}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 w-full"
                >
                  Order Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CartSlider;