import { Suspense } from 'react';
import SearchResultsClient from './SearchResultsClient';
import type { NextPage } from 'next';

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SearchResultsPage: NextPage<SearchPageProps> = async ({ searchParams }) => {
  const resolvedParams = await searchParams;
  const query = (resolvedParams.query as string) || '';

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading...</div>}>
      <SearchResultsClient initialQuery={query} />
    </Suspense>
  );
};

export default SearchResultsPage;