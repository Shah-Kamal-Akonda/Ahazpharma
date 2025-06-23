import { Suspense } from 'react';
import SearchResultsClient from './SearchResultsClient';

export default function SearchResultsPage({ searchParams }: { searchParams: { query?: string } }) {
  const query = searchParams.query || '';

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <SearchResultsClient initialQuery={query} />
    </Suspense>
  );
}