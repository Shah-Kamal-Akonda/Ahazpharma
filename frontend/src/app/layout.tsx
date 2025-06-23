import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';
import Footer from './components/footer';
import SearchBox from './components/searchBox';


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
        <Navbar />
       
       <SearchBox/>
        {children}
         <Footer />
      </body>
    </html>
  );
}