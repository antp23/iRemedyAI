import { useState, useMemo } from 'react';
import { CountryFlag } from '@/components/shared';
import { Card } from '@/components/ui';

// Country coordinate data (equirectangular projection on 960x480 SVG)
const COUNTRY_DATA: Record<
  string,
  { coords: [number, number]; name: string; code: string; region: string }
> = {
  US: { coords: [219, 136], name: 'United States', code: 'US', region: 'North America' },
  CN: { coords: [757, 147], name: 'China', code: 'CN', region: 'East Asia' },
  IN: { coords: [691, 184], name: 'India', code: 'IN', region: 'South Asia' },
  DE: { coords: [507, 104], name: 'Germany', code: 'DE', region: 'Europe' },
  FR: { coords: [485, 115], name: 'France', code: 'FR', region: 'Europe' },
  GB: { coords: [472, 96], name: 'United Kingdom', code: 'GB', region: 'Europe' },
  IT: { coords: [512, 125], name: 'Italy', code: 'IT', region: 'Europe' },
  JP: { coords: [848, 144], name: 'Japan', code: 'JP', region: 'East Asia' },
  KR: { coords: [821, 144], name: 'South Korea', code: 'KR', region: 'East Asia' },
  IE: { coords: [459, 99], name: 'Ireland', code: 'IE', region: 'Europe' },
  IL: { coords: [543, 157], name: 'Israel', code: 'IL', region: 'Middle East' },
  CH: { coords: [501, 115], name: 'Switzerland', code: 'CH', region: 'Europe' },
  CA: { coords: [224, 91], name: 'Canada', code: 'CA', region: 'North America' },
  MX: { coords: [208, 179], name: 'Mexico', code: 'MX', region: 'North America' },
  BR: { coords: [341, 277], name: 'Brazil', code: 'BR', region: 'South America' },
  AU: { coords: [808, 307], name: 'Australia', code: 'AU', region: 'Oceania' },
  PK: { coords: [667, 160], name: 'Pakistan', code: 'PK', region: 'South Asia' },
  BD: { coords: [720, 176], name: 'Bangladesh', code: 'BD', region: 'South Asia' },
  SG: { coords: [730, 227], name: 'Singapore', code: 'SG', region: 'Southeast Asia' },
  TW: { coords: [803, 176], name: 'Taiwan', code: 'TW', region: 'East Asia' },
};

// Simplified continent outlines matching SupplyChainMap
const CONTINENTS = [
  'M130,65 L280,55 L310,80 L310,110 L295,125 L265,175 L230,185 L200,195 L185,185 L145,175 L130,135 Z',
  'M245,210 L290,200 L330,225 L345,265 L340,310 L320,350 L290,380 L265,370 L240,330 L235,280 L240,240 Z',
  'M445,60 L530,55 L560,75 L555,105 L530,125 L510,140 L475,140 L455,120 L445,100 Z',
  'M445,155 L510,145 L545,165 L555,200 L545,260 L520,310 L490,340 L460,330 L440,290 L430,240 L435,195 Z',
  'M555,55 L700,45 L790,55 L860,80 L870,120 L850,155 L800,180 L730,190 L680,175 L630,155 L580,140 L555,105 Z',
  'M650,145 L700,140 L740,165 L720,210 L690,225 L660,200 L650,170 Z',
  'M770,280 L830,270 L860,290 L855,320 L820,340 L775,330 L760,305 Z',
];

export interface CountryAggregation {
  countryCode: string;
  countryName: string;
  productCount: number;
  dependencyRatio: number;
  tradeStatus: 'allied' | 'neutral' | 'restricted' | 'adversarial';
  geopoliticalNotes: string;
}

interface ChinaDependencyMapProps {
  countryData: CountryAggregation[];
  totalProducts: number;
  className?: string;
  onCountryClick?: (country: CountryAggregation) => void;
}

const tradeStatusColors: Record<string, string> = {
  allied: '#22c55e',
  neutral: '#f59e0b',
  restricted: '#f97316',
  adversarial: '#ef4444',
};

function getDependencyColor(ratio: number): string {
  if (ratio >= 0.5) return '#ef4444';
  if (ratio >= 0.3) return '#f97316';
  if (ratio >= 0.15) return '#f59e0b';
  if (ratio > 0) return '#22c55e';
  return '#334155';
}

function getDependencyOpacity(ratio: number): number {
  if (ratio <= 0) return 0;
  return Math.max(0.2, Math.min(0.8, ratio));
}

const ChinaDependencyMap = ({
  countryData,
  totalProducts,
  className = '',
  onCountryClick,
}: ChinaDependencyMapProps) => {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryAggregation | null>(null);

  const countryMap = useMemo(() => {
    const map = new Map<string, CountryAggregation>();
    for (const c of countryData) {
      map.set(c.countryCode, c);
    }
    return map;
  }, [countryData]);

  const chinaData = countryMap.get('CN');
  const indiaData = countryMap.get('IN');

  const handleCountryClick = (code: string) => {
    const data = countryMap.get(code);
    if (data) {
      setSelectedCountry(data);
      onCountryClick?.(data);
    }
  };

  const handleCountryKeyDown = (e: React.KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCountryClick(code);
    }
  };

  return (
    <div className={className} data-testid="china-dependency-map">
      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-navy/10 bg-[#0f172a]">
        <svg
          viewBox="0 0 960 480"
          className="w-full"
          role="img"
          aria-label="China dependency world map"
        >
          {/* Continent outlines */}
          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
          ))}

          {/* Country dependency circles */}
          {Object.entries(COUNTRY_DATA).map(([code, info]) => {
            const agg = countryMap.get(code);
            if (!agg) return null;

            const color = getDependencyColor(agg.dependencyRatio);
            const opacity = getDependencyOpacity(agg.dependencyRatio);
            const isHovered = hoveredCountry === code;
            const baseRadius = Math.max(12, Math.min(35, 12 + agg.productCount * 3));

            return (
              <g
                key={code}
                tabIndex={0}
                role="button"
                aria-label={`${info.name}: ${agg.productCount} products, ${(agg.dependencyRatio * 100).toFixed(0)}% dependency`}
                className="cursor-pointer outline-none"
                onClick={() => handleCountryClick(code)}
                onKeyDown={(e) => handleCountryKeyDown(e, code)}
                onMouseEnter={() => setHoveredCountry(code)}
                onMouseLeave={() => setHoveredCountry(null)}
                onFocus={() => setHoveredCountry(code)}
                onBlur={() => setHoveredCountry(null)}
              >
                {/* Dependency halo */}
                <circle
                  cx={info.coords[0]}
                  cy={info.coords[1]}
                  r={baseRadius}
                  fill={color}
                  opacity={opacity}
                  style={{ transition: 'r 0.2s ease' }}
                />
                {/* Center dot */}
                <circle
                  cx={info.coords[0]}
                  cy={info.coords[1]}
                  r={isHovered ? 7 : 5}
                  fill={color}
                  stroke="#e2e8f0"
                  strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
                />
                {/* Country label */}
                <text
                  x={info.coords[0]}
                  y={info.coords[1] - baseRadius - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#e2e8f0"
                >
                  {code}
                </text>
                {/* Product count */}
                {agg.productCount > 0 && (
                  <text
                    x={info.coords[0]}
                    y={info.coords[1] + baseRadius + 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#94a3b8"
                  >
                    {agg.productCount} product{agg.productCount !== 1 ? 's' : ''}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-white/10 px-4 py-2">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="font-medium text-gray-300">Dependency:</span>
            {[
              { label: 'Low (<15%)', color: '#22c55e' },
              { label: 'Moderate (15-30%)', color: '#f59e0b' },
              { label: 'High (30-50%)', color: '#f97316' },
              { label: 'Critical (>50%)', color: '#ef4444' },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards below the map */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          label="China Dependency"
          value={chinaData ? `${(chinaData.dependencyRatio * 100).toFixed(0)}%` : '0%'}
          count={chinaData?.productCount ?? 0}
          total={totalProducts}
          color="#ef4444"
        />
        <SummaryCard
          label="India Dependency"
          value={indiaData ? `${(indiaData.dependencyRatio * 100).toFixed(0)}%` : '0%'}
          count={indiaData?.productCount ?? 0}
          total={totalProducts}
          color="#f59e0b"
        />
        <SummaryCard
          label="Total Tracked"
          value={String(totalProducts)}
          count={countryData.length}
          total={countryData.length}
          color="#C9A227"
          subLabel="countries"
        />
      </div>

      {/* Country Risk Profile Panel */}
      {selectedCountry && (
        <CountryRiskProfile
          country={selectedCountry}
          totalProducts={totalProducts}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </div>
  );
};

// --- Sub-components ---

function SummaryCard({
  label,
  value,
  count,
  total,
  color,
  subLabel = 'products',
}: {
  label: string;
  value: string;
  count: number;
  total: number;
  color: string;
  subLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-navy/70">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-navy">{value}</p>
      <p className="mt-0.5 text-xs text-navy/50">
        {count} of {total} {subLabel}
      </p>
    </div>
  );
}

function CountryRiskProfile({
  country,
  totalProducts,
  onClose,
}: {
  country: CountryAggregation;
  totalProducts: number;
  onClose: () => void;
}) {
  const countryInfo = COUNTRY_DATA[country.countryCode];

  return (
    <Card className="mt-4" data-testid="country-risk-profile">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <CountryFlag countryCode={country.countryCode} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-navy">{country.countryName}</h3>
            <p className="text-sm text-navy/60">
              {countryInfo?.region ?? 'Unknown Region'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-navy/40 transition-colors hover:bg-navy/5 hover:text-navy"
          aria-label="Close risk profile"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5l10 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <RiskStat label="Products" value={String(country.productCount)} />
        <RiskStat
          label="Dependency Ratio"
          value={`${(country.dependencyRatio * 100).toFixed(1)}%`}
        />
        <RiskStat
          label="Trade Status"
          value={country.tradeStatus.charAt(0).toUpperCase() + country.tradeStatus.slice(1)}
          color={tradeStatusColors[country.tradeStatus]}
        />
        <RiskStat
          label="Share of Total"
          value={
            totalProducts > 0
              ? `${((country.productCount / totalProducts) * 100).toFixed(1)}%`
              : '0%'
          }
        />
      </div>

      {country.geopoliticalNotes && (
        <div className="mt-4 rounded-lg bg-navy/5 p-3">
          <p className="text-xs font-medium text-navy/70">Geopolitical Notes</p>
          <p className="mt-1 text-sm text-navy/80">{country.geopoliticalNotes}</p>
        </div>
      )}
    </Card>
  );
}

function RiskStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-xs text-navy/50">{label}</p>
      <p className="mt-0.5 text-lg font-bold" style={color ? { color } : undefined}>
        <span className={color ? '' : 'text-navy'}>{value}</span>
      </p>
    </div>
  );
}

export default ChinaDependencyMap;
