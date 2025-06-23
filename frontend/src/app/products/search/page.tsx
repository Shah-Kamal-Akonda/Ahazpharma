import { Suspense } from 'react';
import SearchResultsClient from './SearchResultsClient';
import type { NextPage } from 'next';
import type { AppProps } from 'next/app';

interface SearchPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const SearchResultsPage: NextPage<SearchPageProps> = ({ searchParams }) => {
  const query = (searchParams.query as string) || '';

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <SearchResultsClient initialQuery={query} />
    </Suspense>
  );
};

export default SearchResultsPage;