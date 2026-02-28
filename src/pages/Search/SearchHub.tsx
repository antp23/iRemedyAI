import { useState, useCallback } from 'react';
import { useSearch } from '@/hooks';
import { useProductStore } from '@/store';
import type { DrugProduct } from '@/types';
import { LoadingSpinner } from '@/components/ui';
import SearchResults from './SearchResults';
import IntelligenceBriefing from './IntelligenceBriefing';

const SearchHub = () => {
  const { query, setQuery, results, isSearching } = useSearch();
  const allProducts = useProductStore((s) => s.products);
  const [selectedProduct, setSelectedProduct] = useState<DrugProduct | null>(
    null,
  );

  const displayProducts = query.trim() ? results : allProducts;

  const handleSelectProduct = useCallback((product: DrugProduct) => {
    setSelectedProduct(product);
  }, []);

  const handleCloseBriefing = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Page Header */}
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold text-navy">
          Drug Intelligence <span className="text-gold">Search</span>
        </h1>
        <p className="mt-2 text-navy/60">
          Search products, NDC codes, and get real-time intelligence briefings
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
          <svg
            className="h-6 w-6 text-navy/40"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 16L21 21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search any drug, NDC code, or ask a question..."
          className="w-full rounded-2xl border-2 border-navy/10 bg-white py-4 pl-14 pr-6 text-lg text-navy shadow-sm transition-colors placeholder:text-navy/40 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/10"
          data-testid="search-input"
        />
        {isSearching && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-5">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Content Area */}
      <div
        className={`grid gap-8 ${selectedProduct ? 'lg:grid-cols-2' : 'grid-cols-1'}`}
      >
        {/* Results Column */}
        <div>
          <SearchResults
            products={displayProducts}
            onSelectProduct={handleSelectProduct}
          />
        </div>

        {/* Intelligence Briefing Column */}
        {selectedProduct && (
          <div className="lg:sticky lg:top-24 lg:self-start">
            <IntelligenceBriefing
              product={selectedProduct}
              onClose={handleCloseBriefing}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHub;
