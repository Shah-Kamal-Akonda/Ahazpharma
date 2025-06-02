// frontend/app/orders/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

const OrderSummaryPage = ({ params }: { params: { id: string } }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedOrder = localStorage.getItem('lastOrder');
    if (storedOrder) {
      const parsedOrder = JSON.parse(storedOrder);
      if (parsedOrder.id === params.id) {
        setOrder(parsedOrder);
      } else {
        setError('Order not found.');
      }
    } else {
      setError('Order not found.');
    }
  }, [params.id]);

  const handleDownloadPDF = () => {
    const latexContent = `
      \\documentclass{article}
      \\usepackage[utf8]{inputenc}
      \\usepackage{geometry}
      \\geometry{a4paper, margin=1in}
      
      \\begin{document}
      \\textbf{Ahaz Pharma Order Summary}\\\\
      \\textbf{Order ID:} ${order?.id}\\\\
      \\textbf{Date:} ${order?.createdAt}\\\\\
      \\textbf{Items:}\\\\
      ${order?.items.map(item => `${item.name} (x${item.quantity}) - \\$${item.price * item.quantity}`).join('\\\\')}
      \\textbf{Total:} \\$${order?.total.toFixed(2)}\\\\
      \\textbf{Shipping Address:}\\\\
      ${order?.recipientName}\\\\
      ${order?.addressLine}\\\\\
      ${order?.city}, ${order?.district}, ${order?.division}\\\\
      Phone: ${order?.phoneNumber}\\\\
      Email: ${order?.email}\\\\
      \\end{document}
    `;
    const blob = new Blob([latexContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_${order?.id}.tex`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return <div className="min-h-screen bg-gray-100 p-6 text-red-600">{error}</div>;
  }

  if (!order) {
    return <div className="min-h-screen bg-gray-100 p-6">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Order Summary</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <h2 className="text-xl font-semibold mt-4">Items:</h2>
        {order.items.map((item) => (
          <p key={item.productId}>
            {item.name} (x{item.quantity}) - ${(item.price * item.quantity).toFixed(2)}
          </p>
        ))}
        <p className="text-lg font-semibold mt-2">Total: ${order.total.toFixed(2)}</p>
        <h2 className="text-xl font-semibold mt-4">Shipping Address:</h2>
        <p>{order.recipientName}</p>
        <p>{order.addressLine}</p>
        <p>{order.city}, {order.district}, {order.division}</p>
        <p>Phone: {order.phoneNumber}</p>
        <p>Email: {order.email}</p>
        <div className="mt-6 flex space-x-4">
          <Link
            href="/products"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleDownloadPDF}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;