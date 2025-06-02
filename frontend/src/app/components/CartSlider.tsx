'use client';

import React from 'react';
import Image from 'next/image';

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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
      {/* Desktop Slider */}
      <div
        className={`hidden sm:block fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } z-50`}
      >
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Cart</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-600 hover:text-gray-800"
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
                <p className="text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</p>
              </div>
            </div>
          )}
          {cart.length > 0 && (
            <button
              onClick={onOrderNow}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
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
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          View Cart
        </button>
      </div>

      {/* Mobile Cart Modal */}
      {isMobileCartModalOpen && (
        <div className="sm:hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Cart</h2>
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
                  <p className="text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => {
                    setIsMobileCartModalOpen(false);
                    onOrderNow();
                  }}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
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