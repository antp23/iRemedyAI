import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useScoring } from '@/hooks';
import { ProductCard } from '@/components/shared';
import { isBAAEligible } from '@/services/scoring';
import type { DrugProduct, ProductCategory, RiskLevel } from '@/types';
import ProductFilters from './ProductFilters';
import type { ProductFilterValues, SortField } from './ProductFilters';

interface ProductWithOrigin extends DrugProduct {
  apiCountry?: string;
  fgCountry?: string;
}

const countryToCode: Record<string, string> = {
  US: 'US',
  'United States': 'US',
  USA: 'US',
  India: 'IN',
  China: 'CN',
  'Puerto Rico': 'PR',
  Israel: 'IL',
  Ireland: 'IE',
  Germany: 'DE',
  Switzerland: 'CH',
  Japan: 'JP',
  Canada: 'CA',
  'United Kingdom': 'GB',
  UK: 'GB',
  Unknown: 'UN',
};

function extractCountryFromManufacturer(manufacturer: string): string {
  const lower = manufacturer.toLowerCase();
  if (lower.includes('usa') || lower.includes('u.s.') || lower.includes('united states')) return 'US';
  if (lower.includes('india') || lower.includes('hyderabad') || lower.includes('mumbai')) return 'India';
  if (lower.includes('china') || lower.includes('shanghai') || lower.includes('beijing')) return 'China';
  if (lower.includes('puerto rico')) return 'Puerto Rico';
  if (lower.includes('israel')) return 'Israel';
  if (lower.includes('ireland')) return 'Ireland';
  if (lower.includes('germany')) return 'Germany';
  if (lower.includes('switzerland')) return 'Switzerland';
  if (lower.includes('japan')) return 'Japan';
  if (lower.includes('canada')) return 'Canada';
  if (lower.includes('uk') || lower.includes('united kingdom')) return 'United Kingdom';
  return 'Unknown';
}

function getCountryCode(country: string): string {
  return countryToCode[country] ?? country.slice(0, 2).toUpperCase();
}

const riskOrder: Record<RiskLevel, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

const INITIAL_FILTERS: ProductFilterValues = {
  search: '',
  riskLevel: '',
  baaEligibility: '',
  apiSourceCountry: '',
  therapeuticClass: '',
  sortField: 'name',
  sortOrder: 'asc',
};

const ROW_HEIGHT = 80;

const ProductList = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { calculateMIA, calculateCOORS, calculateQRS, calculateOverallRisk } = useScoring();
  const [filters, setFilters] = useState<ProductFilterValues>(INITIAL_FILTERS);

  // Pre-compute scores and derived data for each product
  const enrichedProducts = useMemo(() => {
    return products.map((product) => {
      const p = product as ProductWithOrigin;
      const apiCountry = p.apiCountry ?? extractCountryFromManufacturer(p.manufacturer);
      const fgCountry = p.fgCountry ?? extractCountryFromManufacturer(p.manufacturer);

      const mia = calculateMIA(apiCountry, fgCountry);
      const coors = calculateCOORS(product);
      const qrs = calculateQRS(product);
      const overallRisk = calculateOverallRisk(mia, coors, qrs);
      const baa = isBAAEligible(mia.overallScore, fgCountry);

      return {
        product,
        apiCountry,
        fgCountry,
        apiCountryCode: getCountryCode(apiCountry),
        miaScore: mia.overallScore,
        riskLevel: overallRisk,
        baaEligible: baa,
      };
    });
  }, [products, calculateMIA, calculateCOORS, calculateQRS, calculateOverallRisk]);

  // Extract unique countries and categories for filter dropdowns
  const countries = useMemo(() => {
    const set = new Set(enrichedProducts.map((ep) => ep.apiCountry));
    return Array.from(set).sort();
  }, [enrichedProducts]);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set).sort() as ProductCategory[];
  }, [products]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = enrichedProducts;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (ep) =>
          ep.product.name.toLowerCase().includes(q) ||
          ep.product.brandName.toLowerCase().includes(q) ||
          ep.product.genericName.toLowerCase().includes(q) ||
          ep.product.manufacturer.toLowerCase().includes(q) ||
          ep.product.ndc.includes(q),
      );
    }

    if (filters.riskLevel) {
      result = result.filter((ep) => ep.riskLevel === filters.riskLevel);
    }

    if (filters.baaEligibility === 'eligible') {
      result = result.filter((ep) => ep.baaEligible);
    } else if (filters.baaEligibility === 'not-eligible') {
      result = result.filter((ep) => !ep.baaEligible);
    }

    if (filters.apiSourceCountry) {
      result = result.filter((ep) => ep.apiCountry === filters.apiSourceCountry);
    }

    if (filters.therapeuticClass) {
      result = result.filter((ep) => ep.product.category === filters.therapeuticClass);
    }

    return result;
  }, [enrichedProducts, filters]);

  // Apply sort
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    const dir = filters.sortOrder === 'asc' ? 1 : -1;

    const comparators: Record<SortField, (a: typeof sorted[0], b: typeof sorted[0]) => number> = {
      name: (a, b) => a.product.name.localeCompare(b.product.name) * dir,
      miaScore: (a, b) => (a.miaScore - b.miaScore) * dir,
      riskLevel: (a, b) => (riskOrder[a.riskLevel] - riskOrder[b.riskLevel]) * dir,
    };

    sorted.sort(comparators[filters.sortField]);
    return sorted;
  }, [filteredProducts, filters.sortField, filters.sortOrder]);

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4" data-testid="product-list-empty">
        <p className="text-lg font-medium text-navy/60">No products tracked yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="product-list">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Product Database</h1>
        <span className="text-sm text-navy/60" data-testid="product-count">
          {sortedProducts.length} of {products.length} products
        </span>
      </div>

      <ProductFilters
        filters={filters}
        onFilterChange={setFilters}
        countries={countries}
        categories={categories}
      />

      {sortedProducts.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center" data-testid="no-results">
          <p className="text-navy/60">No products match the current filters</p>
        </div>
      ) : (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: `${ROW_HEIGHT * 8}px` }}
          data-testid="product-list-scroll"
        >
          <div className="space-y-2">
            {sortedProducts.map((ep) => (
              <ProductCard
                key={ep.product.id}
                product={ep.product}
                miaScore={ep.miaScore}
                apiSourceCountry={ep.apiCountry}
                apiSourceCountryCode={ep.apiCountryCode}
                baaEligible={ep.baaEligible}
                riskLevel={ep.riskLevel}
                onClick={() => navigate(`/product/${ep.product.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
