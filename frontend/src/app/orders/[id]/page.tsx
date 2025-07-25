'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define the Order interface
interface Order {
  id: string;
  items: { productId: number; name: string; quantity: number; price: number }[];
  total: number;
  division: string;
  district: string;
  city: string;
  addressLine: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
  status: string;
  createdAt: string;
}

// Define props type for dynamic route
type OrderPageProps = {
  params: Promise<{ id: string }>; // Align with Next.js expectation
};

export default function OrderSummaryPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Resolve params Promise
    params
      .then((resolvedParams) => {
        if (typeof window === 'undefined') {
          setError('Order data not available.');
          setIsLoading(false);
          return;
        }

        const storedOrder = localStorage.getItem('lastOrder');
        if (storedOrder) {
          try {
            const parsedOrder: Order = JSON.parse(storedOrder);
            if (parsedOrder.id === resolvedParams.id) {
              setOrder(parsedOrder);
              setError(null);
            } else {
              setError('Order not found.');
            }
          } catch (err) {
            setError('Invalid order data.');
          }
        } else {
          setError('Order not found.');
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load order data.');
        setIsLoading(false);
      });
  }, [params]);

  const handleDownloadPDF = () => {
    if (!order || typeof window === 'undefined') return;

    const latexContent = `
      \\documentclass{article}
      \\usepackage[utf8]{inputenc}
      \\usepackage{geometry}
      \\geometry{a4paper, margin=1in}
      
      \\begin{document}
      \\textbf{Ahaz Pharma Order Summary}\\\\
      \\textbf{Order ID:} ${order.id}\\\\
      \\textbf{Date:} ${new Date(order.createdAt).toLocaleDateString()}\\\\\
      \\textbf{Items:}\\\\
      ${order.items
        .map((item) => `${item.name} (x${item.quantity}) - \\$${item.price * item.quantity}`)
        .join('\\\\')}
      \\textbf{Total:} \\$${order.total.toFixed(2)}\\\\
      \\textbf{Shipping Address:}\\\\
      ${order.recipientName}\\\\
      ${order.addressLine}\\\\
      ${order.city}, ${order.district}, ${order.division}\\\\
      Phone: ${order.phoneNumber}\\\\
      Email: ${order.email}\\\\
      \\end{document}
    `;
    const blob = new Blob([latexContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_${order.id}.tex`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 p-4 text-center text-sm sm:text-base">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 p-4 text-red-600 text-center text-sm sm:text-base">{error}</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-100 p-4 text-center text-sm sm:text-base">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Order Summary</h1>
      <div className="max-w-[90vw] sm:max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-md max-h-[80vh] overflow-y-auto">
        <p className="mb-2 text-sm sm:text-base"><strong>Order ID:</strong> {order.id}</p>
        <p className="mb-2 text-sm sm:text-base"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p className="mb-2 text-sm sm:text-base"><strong>Status:</strong> {order.status}</p>
        <h2 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2">Items</h2>
        <ul className="divide-y divide-gray-200 mb-4 space-y-2 sm:space-y-4">
          {order.items.map((item) => (
            <li key={item.productId} className="py-2 text-sm sm:text-base">
              <p>
                {item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Total: ${order.total.toFixed(2)}</p>
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Shipping Address</h2>
        <div className="space-y-1 text-sm sm:text-base">
          <p>{order.recipientName}</p>
          <p>{order.addressLine}</p>
          <p>
            {order.city}, {order.district}, {order.division}
          </p>
          <p>Phone: {order.phoneNumber}</p>
          <p>Email: {order.email}</p>
        </div>
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
          <Link
            href="/"
            className="bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 transition shadow-sm hover:shadow-md text-sm sm:text-base text-center"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-green-600 transition shadow-sm hover:shadow-md text-sm sm:text-base disabled:bg-green-300 disabled:cursor-not-allowed"
            disabled={!order}
          >
            Download LaTeX
          </button>
        </div>
      </div>
    </div>
  );
}