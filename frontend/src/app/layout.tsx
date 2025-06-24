import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/footer';
import { ToastProvider } from './components/ToastNotification';

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
        <ToastProvider>
          <Navbar />
          {children}
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}