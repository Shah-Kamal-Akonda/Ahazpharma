'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Define the Order interface consistent with original code
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
interface OrderPageProps {
  params: { id: string };
}

export default function OrderSummaryPage({ params }: OrderPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setError('Order data not available.');
      setIsLoading(false);
      return;
    }

    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder) {
      try {
        const parsedOrder: Order = JSON.parse(storedOrder);
        if (parsedOrder.id === params.id) {
          setOrder(parsedOrder);
          setError(null);
        } else {
          setError('Order not found.');
        }
      } catch (err) {
        console.error('Error parsing order:', err);
        setError('Invalid order data.');
      }
    } else {
      setError('Order not found.');
    }
    setIsLoading(false);
  }, [params.id]);

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
    return <div className="min-h-screen bg-gray-100 p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 p-6 text-red-600 text-center">{error}</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-100 p-6 text-center">Order not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Order Summary</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <p className="mb-2"><strong>Order ID:</strong> {order.id}</p>
        <p className="mb-2"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p className="mb-2"><strong>Status:</strong> {order.status}</p>
        <h2 className="text-xl font-semibold mt-4 mb-2">Items</h2>
        <ul className="divide-y divide-gray-200 mb-4">
          {order.items.map((item) => (
            <li key={item.productId} className="py-2">
              <p>
                {item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
        <p className="text-lg font-semibold">Total: ${order.total.toFixed(2)}</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">Shipping Address</h2>
        <p>{order.recipientName}</p>
        <p>{order.addressLine}</p>
        <p>
          {order.city}, {order.district}, {order.division}
        </p>
        <p>Phone: {order.phoneNumber}</p>
        <p>Email: {order.email}</p>
        <div className="mt-6 flex space-x-4">
          <Link
            href="/products"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            disabled={!order}
          >
            Download LaTeX
          </button>
        </div>
      </div>
    </div>
  );
}