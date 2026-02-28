import type { DrugProduct, RiskLevel } from '@/types';
import { ScoreRing, BadgeBAA, BadgeRisk } from '@/components/design-system';
import CountryFlag from './CountryFlag';

interface ProductCardProps {
  product: DrugProduct;
  miaScore: number;
  apiSourceCountry: string;
  apiSourceCountryCode: string;
  baaEligible: boolean;
  riskLevel: RiskLevel;
  onClick?: () => void;
  className?: string;
}

const ProductCard = ({
  product,
  miaScore,
  apiSourceCountry,
  apiSourceCountryCode,
  baaEligible,
  riskLevel,
  onClick,
  className = '',
}: ProductCardProps) => {
  return (
    <div
      className={`flex cursor-pointer items-center gap-4 rounded-xl border border-navy/10 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      data-testid="product-card"
    >
      <ScoreRing score={miaScore} size={48} />

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-navy">
          {product.name}
        </h3>
        <p className="text-xs text-navy/60">
          {product.strength} &middot; {product.manufacturer}
        </p>
        <div className="mt-1 flex items-center gap-1 text-xs text-navy/50">
          <CountryFlag countryCode={apiSourceCountryCode} size="sm" />
          <span>{apiSourceCountry}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <BadgeBAA eligible={baaEligible} />
        <BadgeRisk level={riskLevel} />
      </div>
    </div>
  );
};

export default ProductCard;
