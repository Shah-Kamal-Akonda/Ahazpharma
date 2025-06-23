import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ahaz Pharma',
  description: 'Online Pharmacy Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense
          fallback={
            <nav className="bg-white p-4 shadow-lg font-poppins">
              <div className="container mx-auto flex items-center justify-between">
                <div className="w-[120px] h-[50px] bg-gray-200 rounded animate-pulse" />
                <div className="w-full max-w-sm h-10 bg-gray-200 rounded-lg animate-pulse md:block hidden" />
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse hidden md:block" />
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse md:hidden" />
                  <div className="w-6 h-6 bg-gray-200 rounded animate-pulse md:hidden" />
                </div>
              </div>
            </nav>
          }
        >
          <Navbar />
        </Suspense>
        {children}
        <Footer />
      </body>
    </html>
  );
}