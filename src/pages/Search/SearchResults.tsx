import type { DrugProduct } from '@/types';
import { ProductCard } from '@/components/shared';
import { scheduleToRiskLevel, computeMIAScore, extractCountry } from './IntelligenceBriefing';

interface SearchResultsProps {
  products: DrugProduct[];
  onSelectProduct: (product: DrugProduct) => void;
}

const SearchResults = ({ products, onSelectProduct }: SearchResultsProps) => {
  if (products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-xl border border-navy/10 bg-white px-6 py-16 text-center"
        data-testid="no-results"
      >
        <svg
          className="mb-4 h-16 w-16 text-navy/20"
          viewBox="0 0 64 64"
          fill="none"
        >
          <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="3" />
          <path
            d="M41 41L55 55"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M22 28H34M28 22V34"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <p className="text-lg font-semibold text-navy/70">No products found</p>
        <p className="mt-1 max-w-md text-sm text-navy/50">
          No products found. Try searching by name, NDC code, or therapeutic
          class.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="search-results">
      <p className="text-sm text-navy/60">
        {products.length} product{products.length !== 1 ? 's' : ''} found
      </p>
      {products.map((product) => {
        const riskLevel = scheduleToRiskLevel(product.schedule);
        const miaScore = computeMIAScore(product);
        const country = extractCountry(product.manufacturer);
        const baaEligible = product.requiresPrescription && product.isAvailable;

        return (
          <ProductCard
            key={product.id}
            product={product}
            miaScore={miaScore}
            apiSourceCountry={country.name}
            apiSourceCountryCode={country.code}
            baaEligible={baaEligible}
            riskLevel={riskLevel}
            onClick={() => onSelectProduct(product)}
          />
        );
      })}
    </div>
  );
};

export default SearchResults;
