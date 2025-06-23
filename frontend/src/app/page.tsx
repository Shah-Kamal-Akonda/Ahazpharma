import { Suspense } from 'react';
import HeroSection from './components/heroSection';
import ProductsPage from './products/page';

export default function Home() {
  return (

    
    <Suspense
      fallback={
        <div className="container mx-auto p-4">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      }
    >
      <main className="container mx-auto p-4">
       <HeroSection/>
       <ProductsPage/>
      </main>
    </Suspense>
  );
}