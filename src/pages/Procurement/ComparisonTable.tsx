import { useState, useMemo } from 'react';
import { ScoreRing, BadgeBAA, BadgeRisk } from '@/components/design-system';
import type { RiskLevel, ProductCategory } from '@/types';

export interface ProcurementProduct {
  id: string;
  name: string;
  manufacturer: string;
  therapeuticClass: ProductCategory;
  miaScore: number;
  coorsScore: number;
  qrsScore: number;
  baaEligible: boolean;
  awpPrice: number;
  fssPrice: number;
  riskLevel: RiskLevel;
  sourceCountry: string;
}

type SortField = keyof Pick<
  ProcurementProduct,
  | 'name'
  | 'manufacturer'
  | 'miaScore'
  | 'coorsScore'
  | 'qrsScore'
  | 'awpPrice'
  | 'fssPrice'
  | 'riskLevel'
  | 'sourceCountry'
>;

type SortDirection = 'asc' | 'desc';

interface ComparisonTableProps {
  products: ProcurementProduct[];
}

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  critical: 3,
};

function getBestProductId(products: ProcurementProduct[]): string | null {
  if (products.length === 0) return null;
  let best = products[0];
  for (const p of products) {
    const pComposite =
      p.miaScore * 0.3 + p.coorsScore * 0.3 + p.qrsScore * 0.2 + (100 - RISK_ORDER[p.riskLevel] * 33) * 0.2;
    const bestComposite =
      best.miaScore * 0.3 + best.coorsScore * 0.3 + best.qrsScore * 0.2 + (100 - RISK_ORDER[best.riskLevel] * 33) * 0.2;
    if (pComposite > bestComposite) best = p;
  }
  return best.id;
}

const COLUMNS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Product' },
  { field: 'manufacturer', label: 'Manufacturer' },
  { field: 'miaScore', label: 'MIA Score' },
  { field: 'coorsScore', label: 'COORS' },
  { field: 'qrsScore', label: 'QRS' },
  { field: 'awpPrice', label: 'AWP Price' },
  { field: 'fssPrice', label: 'FSS Price' },
  { field: 'riskLevel', label: 'Risk Level' },
  { field: 'sourceCountry', label: 'Source Country' },
];

const ComparisonTable = ({ products }: ComparisonTableProps) => {
  const [sortField, setSortField] = useState<SortField>('miaScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' || field === 'manufacturer' || field === 'sourceCountry' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      let cmp: number;
      if (sortField === 'riskLevel') {
        cmp = RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
      } else {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          cmp = aVal.localeCompare(bVal);
        } else {
          cmp = (aVal as number) - (bVal as number);
        }
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [products, sortField, sortDirection]);

  const bestId = useMemo(() => getBestProductId(products), [products]);

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-navy/10 bg-white p-12 text-center">
        <p className="text-lg text-navy/60">No products tracked in this category</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white shadow-sm">
      <table className="w-full text-left text-sm" data-testid="comparison-table">
        <thead>
          <tr className="border-b border-navy/10 bg-navy/[0.03]">
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                className="cursor-pointer whitespace-nowrap px-4 py-3 font-semibold text-navy transition-colors hover:text-gold"
                onClick={() => handleSort(col.field)}
                aria-sort={
                  sortField === col.field
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortField === col.field && (
                    <span aria-hidden="true" className="text-gold">
                      {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
                    </span>
                  )}
                </span>
              </th>
            ))}
            <th className="whitespace-nowrap px-4 py-3 font-semibold text-navy">
              BAA
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((product) => {
            const isBest = product.id === bestId;
            return (
              <tr
                key={product.id}
                data-testid={`product-row-${product.id}`}
                className={`border-b border-navy/5 transition-colors hover:bg-gold/5 ${
                  isBest ? 'bg-gold/10 font-medium' : ''
                }`}
              >
                <td className="whitespace-nowrap px-4 py-3 text-navy">
                  <span className="flex items-center gap-2">
                    {product.name}
                    {isBest && (
                      <span
                        className="inline-flex items-center rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold"
                        data-testid="best-badge"
                      >
                        Best
                      </span>
                    )}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-navy/80">
                  {product.manufacturer}
                </td>
                <td className="px-4 py-3">
                  <ScoreRing score={product.miaScore} size={40} />
                </td>
                <td className="px-4 py-3">
                  <ScoreRing score={product.coorsScore} size={40} />
                </td>
                <td className="px-4 py-3">
                  <ScoreRing score={product.qrsScore} size={40} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-navy/80">
                  ${product.awpPrice.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-navy/80">
                  ${product.fssPrice.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <BadgeRisk level={product.riskLevel} />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-navy/80">
                  {product.sourceCountry}
                </td>
                <td className="px-4 py-3">
                  <BadgeBAA eligible={product.baaEligible} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;
