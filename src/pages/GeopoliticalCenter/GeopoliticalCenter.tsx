import { useMemo, useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { getCountryScore, isTAACountry } from '@/services/scoring';
import ChinaDependencyMap from './ChinaDependencyMap';
import type { CountryAggregation } from './ChinaDependencyMap';
import PoliticalDashboard from './PoliticalDashboard';
import type { ManufacturerPNS } from './PoliticalDashboard';

type TabId = 'dependency' | 'political';

const TABS: { id: TabId; label: string }[] = [
  { id: 'dependency', label: 'China Dependency Map' },
  { id: 'political', label: 'Political Dashboard' },
];

// Map well-known manufacturer keywords to country codes
const MANUFACTURER_COUNTRY_MAP: Record<string, { code: string; name: string }> = {
  china: { code: 'CN', name: 'China' },
  chinese: { code: 'CN', name: 'China' },
  beijing: { code: 'CN', name: 'China' },
  shanghai: { code: 'CN', name: 'China' },
  india: { code: 'IN', name: 'India' },
  indian: { code: 'IN', name: 'India' },
  mumbai: { code: 'IN', name: 'India' },
  hyderabad: { code: 'IN', name: 'India' },
  usa: { code: 'US', name: 'United States' },
  'united states': { code: 'US', name: 'United States' },
  american: { code: 'US', name: 'United States' },
  germany: { code: 'DE', name: 'Germany' },
  german: { code: 'DE', name: 'Germany' },
  japan: { code: 'JP', name: 'Japan' },
  japanese: { code: 'JP', name: 'Japan' },
  uk: { code: 'GB', name: 'United Kingdom' },
  british: { code: 'GB', name: 'United Kingdom' },
  france: { code: 'FR', name: 'France' },
  french: { code: 'FR', name: 'France' },
  ireland: { code: 'IE', name: 'Ireland' },
  irish: { code: 'IE', name: 'Ireland' },
  israel: { code: 'IL', name: 'Israel' },
  israeli: { code: 'IL', name: 'Israel' },
  switzerland: { code: 'CH', name: 'Switzerland' },
  swiss: { code: 'CH', name: 'Switzerland' },
  canada: { code: 'CA', name: 'Canada' },
  canadian: { code: 'CA', name: 'Canada' },
  korea: { code: 'KR', name: 'South Korea' },
  korean: { code: 'KR', name: 'South Korea' },
  italy: { code: 'IT', name: 'Italy' },
  italian: { code: 'IT', name: 'Italy' },
  australia: { code: 'AU', name: 'Australia' },
  australian: { code: 'AU', name: 'Australia' },
  brazil: { code: 'BR', name: 'Brazil' },
  brazilian: { code: 'BR', name: 'Brazil' },
  mexico: { code: 'MX', name: 'Mexico' },
  mexican: { code: 'MX', name: 'Mexico' },
  pakistan: { code: 'PK', name: 'Pakistan' },
  bangladesh: { code: 'BD', name: 'Bangladesh' },
  singapore: { code: 'SG', name: 'Singapore' },
  taiwan: { code: 'TW', name: 'Taiwan' },
};

function inferCountry(manufacturer: string): { code: string; name: string } {
  const lower = manufacturer.toLowerCase();
  for (const [keyword, info] of Object.entries(MANUFACTURER_COUNTRY_MAP)) {
    if (lower.includes(keyword)) return info;
  }
  return { code: 'US', name: 'United States' };
}

const GEOPOLITICAL_NOTES: Record<string, string> = {
  CN: 'Primary concern for pharmaceutical supply chain dependency. Active pharmaceutical ingredient (API) manufacturing hub. Subject to export controls and trade tensions.',
  IN: 'Major generic drug manufacturer and API supplier. TAA-designated country. Strategic partner for supply chain diversification from China.',
  US: 'Domestic manufacturing base. Highest BAA eligibility score. Priority for reshoring initiatives.',
  DE: 'Strong pharmaceutical manufacturing base. EU regulatory framework. NATO ally.',
  JP: 'Advanced pharmaceutical industry. Key innovation partner. Strong IP protections.',
  GB: 'Post-Brexit regulatory independence. Strong pharmaceutical R&D sector.',
  IE: 'Major pharmaceutical manufacturing hub for US companies. EU market access.',
  CH: 'Home to major pharmaceutical companies. Strong regulatory standards.',
  IL: 'Innovation-driven pharmaceutical sector. TAA-designated country.',
  KR: 'Growing biosimilar manufacturing capacity. TAA-designated country.',
  FR: 'Major European pharmaceutical market. EU regulatory framework.',
  IT: 'Significant generic drug manufacturing. EU member state.',
  CA: 'Integrated North American supply chain. Strong regulatory alignment with FDA.',
  TW: 'Growing pharmaceutical sector. Subject to cross-strait geopolitical risks.',
  AU: 'Aligned regulatory standards. TAA-designated country.',
  BR: 'Large domestic pharmaceutical market. Growing manufacturing base.',
  MX: 'USMCA partner. Growing pharmaceutical manufacturing sector.',
  SG: 'Regional pharmaceutical hub. Strong IP and regulatory framework.',
};

function getTradeStatus(countryCode: string): CountryAggregation['tradeStatus'] {
  if (countryCode === 'CN') return 'adversarial';
  if (['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'KR', 'AU', 'IT'].includes(countryCode))
    return 'allied';
  if (['TW'].includes(countryCode)) return 'neutral';
  return 'neutral';
}

const GeopoliticalCenter = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dependency');
  const { products } = useProducts();

  // Derive country aggregations from products
  const { countryAggregations, manufacturerPNS } = useMemo(() => {
    const countryBuckets = new Map<string, { code: string; name: string; count: number }>();
    const mfgBuckets = new Map<
      string,
      { name: string; count: number; country: { code: string; name: string }; baa: boolean }
    >();

    for (const product of products) {
      const country = inferCountry(product.manufacturer);
      const existing = countryBuckets.get(country.code);
      if (existing) {
        existing.count += 1;
      } else {
        countryBuckets.set(country.code, { ...country, count: 1 });
      }

      const mfgKey = product.manufacturer.toLowerCase().trim();
      const existingMfg = mfgBuckets.get(mfgKey);
      if (existingMfg) {
        existingMfg.count += 1;
      } else {
        const countryLower = product.manufacturer.toLowerCase();
        const baa =
          country.code === 'US' ||
          isTAACountry(countryLower) ||
          getCountryScore(countryLower) >= 30;
        mfgBuckets.set(mfgKey, {
          name: product.manufacturer,
          count: 1,
          country,
          baa,
        });
      }
    }

    const total = products.length || 1;

    const aggregations: CountryAggregation[] = Array.from(
      countryBuckets.entries(),
    ).map(([code, data]) => ({
      countryCode: code,
      countryName: data.name,
      productCount: data.count,
      dependencyRatio: data.count / total,
      tradeStatus: getTradeStatus(code),
      geopoliticalNotes: GEOPOLITICAL_NOTES[code] ?? '',
    }));

    const pns: ManufacturerPNS[] = Array.from(mfgBuckets.entries()).map(
      ([key, data]) => ({
        id: key,
        name: data.name,
        pnsScore: getCountryScore(data.country.name),
        productCount: data.count,
        primaryCountry: data.country.name,
        baaEligible: data.baa,
      }),
    );

    return { countryAggregations: aggregations, manufacturerPNS: pns };
  }, [products]);

  // Provide sample data when no products are tracked
  const displayAggregations =
    countryAggregations.length > 0 ? countryAggregations : SAMPLE_COUNTRY_DATA;
  const displayManufacturers =
    manufacturerPNS.length > 0 ? manufacturerPNS : SAMPLE_MANUFACTURERS;
  const displayTotal =
    products.length > 0
      ? products.length
      : SAMPLE_COUNTRY_DATA.reduce((s, c) => s + c.productCount, 0);

  return (
    <div className="p-8" data-testid="geopolitical-center">
      <h1 className="font-heading text-3xl font-bold text-navy">
        Geopolitical Intelligence Center
      </h1>
      <p className="mt-2 text-navy/70">
        Supply chain dependency analysis, country risk profiles, and political
        influence tracking for pharmaceutical products.
      </p>

      {/* Tab Navigation */}
      <div className="mt-6 flex gap-1 rounded-lg bg-navy/5 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/60 hover:text-navy'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dependency' && (
          <ChinaDependencyMap
            countryData={displayAggregations}
            totalProducts={displayTotal}
          />
        )}
        {activeTab === 'political' && (
          <PoliticalDashboard manufacturers={displayManufacturers} />
        )}
      </div>
    </div>
  );
};

// Sample data for demonstration when no products are tracked
const SAMPLE_COUNTRY_DATA: CountryAggregation[] = [
  {
    countryCode: 'CN',
    countryName: 'China',
    productCount: 42,
    dependencyRatio: 0.35,
    tradeStatus: 'adversarial',
    geopoliticalNotes: GEOPOLITICAL_NOTES['CN'],
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    productCount: 28,
    dependencyRatio: 0.23,
    tradeStatus: 'neutral',
    geopoliticalNotes: GEOPOLITICAL_NOTES['IN'],
  },
  {
    countryCode: 'US',
    countryName: 'United States',
    productCount: 30,
    dependencyRatio: 0.25,
    tradeStatus: 'allied',
    geopoliticalNotes: GEOPOLITICAL_NOTES['US'],
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    productCount: 8,
    dependencyRatio: 0.07,
    tradeStatus: 'allied',
    geopoliticalNotes: GEOPOLITICAL_NOTES['DE'],
  },
  {
    countryCode: 'IE',
    countryName: 'Ireland',
    productCount: 6,
    dependencyRatio: 0.05,
    tradeStatus: 'allied',
    geopoliticalNotes: GEOPOLITICAL_NOTES['IE'],
  },
  {
    countryCode: 'JP',
    countryName: 'Japan',
    productCount: 4,
    dependencyRatio: 0.03,
    tradeStatus: 'allied',
    geopoliticalNotes: GEOPOLITICAL_NOTES['JP'],
  },
  {
    countryCode: 'CH',
    countryName: 'Switzerland',
    productCount: 2,
    dependencyRatio: 0.02,
    tradeStatus: 'allied',
    geopoliticalNotes: GEOPOLITICAL_NOTES['CH'],
  },
];

const SAMPLE_MANUFACTURERS: ManufacturerPNS[] = [
  { id: '1', name: 'Zhejiang Pharma Co.', pnsScore: 0, productCount: 18, primaryCountry: 'China', baaEligible: false },
  { id: '2', name: 'Sun Pharmaceutical', pnsScore: 30, productCount: 14, primaryCountry: 'India', baaEligible: true },
  { id: '3', name: 'Pfizer Inc.', pnsScore: 100, productCount: 12, primaryCountry: 'United States', baaEligible: true },
  { id: '4', name: 'Shanghai Biochem', pnsScore: 0, productCount: 12, primaryCountry: 'China', baaEligible: false },
  { id: '5', name: 'Bayer AG', pnsScore: 30, productCount: 8, primaryCountry: 'Germany', baaEligible: true },
  { id: '6', name: 'Cipla Ltd.', pnsScore: 30, productCount: 14, primaryCountry: 'India', baaEligible: true },
  { id: '7', name: 'Shenyang Pharma', pnsScore: 0, productCount: 12, primaryCountry: 'China', baaEligible: false },
  { id: '8', name: 'Teva Pharmaceutical', pnsScore: 30, productCount: 6, primaryCountry: 'Israel', baaEligible: true },
];

export default GeopoliticalCenter;
