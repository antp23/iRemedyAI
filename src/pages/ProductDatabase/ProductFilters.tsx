import type { ProductCategory, RiskLevel } from '@/types';

export type SortField = 'name' | 'miaScore' | 'riskLevel';
export type SortOrder = 'asc' | 'desc';

export interface ProductFilterValues {
  search: string;
  riskLevel: RiskLevel | '';
  baaEligibility: '' | 'eligible' | 'not-eligible';
  apiSourceCountry: string;
  therapeuticClass: ProductCategory | '';
  sortField: SortField;
  sortOrder: SortOrder;
}

interface ProductFiltersProps {
  filters: ProductFilterValues;
  onFilterChange: (filters: ProductFilterValues) => void;
  countries: string[];
  categories: ProductCategory[];
}

const riskOptions: { value: RiskLevel | ''; label: string }[] = [
  { value: '', label: 'All Risk Levels' },
  { value: 'low', label: 'Low' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const baaOptions = [
  { value: '', label: 'All BAA Status' },
  { value: 'eligible', label: 'BAA Eligible' },
  { value: 'not-eligible', label: 'Not BAA Eligible' },
] as const;

const sortOptions: { value: SortField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'miaScore', label: 'MIA Score' },
  { value: 'riskLevel', label: 'Risk Level' },
];

const categoryLabels: Record<ProductCategory, string> = {
  analgesic: 'Analgesic',
  antibiotic: 'Antibiotic',
  antiviral: 'Antiviral',
  antifungal: 'Antifungal',
  cardiovascular: 'Cardiovascular',
  dermatological: 'Dermatological',
  endocrine: 'Endocrine',
  gastrointestinal: 'Gastrointestinal',
  immunological: 'Immunological',
  neurological: 'Neurological',
  oncological: 'Oncological',
  ophthalmic: 'Ophthalmic',
  psychiatric: 'Psychiatric',
  respiratory: 'Respiratory',
  musculoskeletal: 'Musculoskeletal',
  other: 'Other',
};

const ProductFilters = ({
  filters,
  onFilterChange,
  countries,
  categories,
}: ProductFiltersProps) => {
  const update = (patch: Partial<ProductFilterValues>) => {
    onFilterChange({ ...filters, ...patch });
  };

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-navy/10 bg-white p-4 shadow-sm"
      data-testid="product-filters"
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Search products..."
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="rounded-lg border border-navy/20 bg-white px-4 py-2 text-navy transition-colors placeholder:text-navy/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
        data-testid="search-input"
      />

      {/* Filter row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Risk Level */}
        <select
          value={filters.riskLevel}
          onChange={(e) => update({ riskLevel: e.target.value as RiskLevel | '' })}
          className="rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          data-testid="filter-risk"
        >
          {riskOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* BAA Eligibility */}
        <select
          value={filters.baaEligibility}
          onChange={(e) =>
            update({ baaEligibility: e.target.value as '' | 'eligible' | 'not-eligible' })
          }
          className="rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          data-testid="filter-baa"
        >
          {baaOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* API Source Country */}
        <select
          value={filters.apiSourceCountry}
          onChange={(e) => update({ apiSourceCountry: e.target.value })}
          className="rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          data-testid="filter-country"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Therapeutic Class */}
        <select
          value={filters.therapeuticClass}
          onChange={(e) => update({ therapeuticClass: e.target.value as ProductCategory | '' })}
          className="rounded-lg border border-navy/20 bg-white px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          data-testid="filter-class"
        >
          <option value="">All Classes</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-navy/60">Sort by:</span>
        <select
          value={filters.sortField}
          onChange={(e) => update({ sortField: e.target.value as SortField })}
          className="rounded-lg border border-navy/20 bg-white px-3 py-1.5 text-sm text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
          data-testid="sort-field"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={() =>
            update({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
          }
          className="rounded-lg border border-navy/20 px-3 py-1.5 text-sm text-navy transition-colors hover:bg-navy/5 focus:outline-none focus:ring-2 focus:ring-gold/20"
          data-testid="sort-order"
          aria-label={`Sort ${filters.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
        >
          {filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
